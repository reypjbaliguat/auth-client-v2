'use client';

import { Loader } from '@/core/components/Loader';
import {
	useGoogleLoginMutation,
	useLinkGoogleAccountMutation,
	useLoginMutation,
} from '@/core/store/api/authApi';
import {
	resetOtpStep,
	selectIsAuthenticated,
	selectOtpEmail,
	selectOtpStep,
	setAuthenticated,
	setOtpStep,
	setPasswordToGoogleLinkingMode,
} from '@/core/store/features/auth';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import { OtpType, PasswordLinking } from '@/core/types';
import { handleAsyncOperation } from '@/core/utils/errorHandler';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Divider } from '@mui/material';
import { GoogleLogin } from '@react-oauth/google';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { OtpForm } from '../components';
import AccountLinkingModal from '../components/AccountLinkingModal';
import AuthForm from '../components/AuthForm';
import { AuthFormFields } from '../components/AuthFormFields';
import schema, { SignInFormData } from './schema';

export default function SignInPage() {
	const dispatch = useAppDispatch();
	const isAuthenticated = useAppSelector(selectIsAuthenticated);
	const step = useAppSelector(selectOtpStep);
	const persistedEmail = useAppSelector(selectOtpEmail);
	const [customError, setCustomError] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(false);
	const [passwordAccountLinking, setPasswordAccountLinking] = useState<PasswordLinking>({
		show: false,
		credential: null,
		email: null,
	});
	const router = useRouter();
	const GOOGLE_ERROR_MESSAGE = 'Google login failed. Please try again.';
	const {
		handleSubmit,
		control,
		formState: { isSubmitting },
		getValues,
		//to be updated
	} = useForm<SignInFormData>({
		resolver: zodResolver(schema),
		defaultValues: { email: '', password: '' },
	});

	const [login, { isLoading }] = useLoginMutation();
	const [googleLogin, { isLoading: isGoogleLoading }] = useGoogleLoginMutation();
	const [linkGoogleAccount, { isLoading: isLinkingGoogle }] = useLinkGoogleAccountMutation();

	// Set Login step when component mounts (if not already in OTP verification)
	useEffect(() => {
		if (step !== 'OTP Verification') {
			dispatch(setOtpStep({ step: 'Login' }));
		}
	}, [dispatch, step]);

	// Redirect if already authenticated
	useEffect(() => {
		if (isAuthenticated) {
			// Reset OTP step when authenticated
			dispatch(resetOtpStep());
			router.push('/dashboard');
		}
	}, [isAuthenticated, router, dispatch]);

	//clean up OTP step on unmount
	useEffect(() => {
		return () => {
			dispatch(resetOtpStep());
		};
	}, []);

	//to be updated
	const onRequestOtp = async (formData: SignInFormData) => {
		setCustomError(''); // Clear any existing errors
		const result = await handleAsyncOperation(
			() => login(formData).unwrap(),
			'Login failed. Please try again.'
		);
		if (result.success && result.data) {
			if (result.data.message.includes('OTP sent')) {
				dispatch(setOtpStep({ step: 'OTP Verification', email: formData.email }));
			}
		} else {
			setCustomError(result.error || 'An unexpected error occurred');
		}
	};

	const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
		setCustomError(''); // Clear any existing errors
		setLoading(true);
		if (!credentialResponse.credential) {
			setCustomError('No credential received from Google. Please try again.');
			return;
		}
		const result = await handleAsyncOperation(
			() =>
				googleLogin({
					credential: credentialResponse.credential!,
				}).unwrap(),
			GOOGLE_ERROR_MESSAGE
		);

		if (result.success && result.data) {
			// Successful login handled in the same way as email/password login
			// Store tokens in secure cookies
			Cookies.set('token', result.data.accessToken, {
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'strict',
				httpOnly: false,
				expires: 7, // 7 days
				path: '/',
			});

			if (result.data.refreshToken) {
				Cookies.set('refreshToken', result.data.refreshToken, {
					secure: process.env.NODE_ENV === 'production',
					sameSite: 'strict',
					httpOnly: false,
					expires: 30, // 30 days
					path: '/',
				});
			}

			// Update Redux auth state
			dispatch(
				setAuthenticated({
					user: result.data.user,
				})
			);

			// Reset OTP step on successful authentication
			dispatch(resetOtpStep());

			// Redirect to dashboard
			router.replace('/dashboard');
			setLoading(false);
		} else {
			// Handle account linking for Google → Password
			if (result.error?.includes('EMAIL_EXISTS_PASSWORD')) {
				// Extract email from Google credential (you'd need to decode JWT)
				// For now, you could ask user to enter email or get it from form
				setPasswordAccountLinking({
					show: true,
					credential: credentialResponse.credential,
					email: result.email!, // Use form email or extract from JWT
				});
				setCustomError(''); // Clear error since this is account linking
			} else {
				setCustomError(result.error || GOOGLE_ERROR_MESSAGE);
			}
			setLoading(false);
		}
	};

	const handleGoogleFailure = () => {
		setCustomError(GOOGLE_ERROR_MESSAGE);
		setLoading(false);
	};

	// Helper function to get the correct OTP configuration for sign-in
	const getOtpConfig = (): OtpType => {
		const email = persistedEmail || getValues('email');

		if (passwordAccountLinking.credential && passwordAccountLinking.email) {
			return {
				type: 'GOOGLE_TO_PASSWORD_LINKING',
				email: passwordAccountLinking.email,
				credential: passwordAccountLinking.credential,
			};
		}

		// Default login OTP
		return {
			type: 'LOGIN',
			email,
		};
	};

	if (loading) {
		return <Loader />;
	}

	const handleAccountLinkingModalClose = () => {
		setPasswordAccountLinking({
			show: false,
			credential: null,
			email: null,
		});
	};

	const handleAccountLinking = async () => {
		setCustomError('');

		if (!passwordAccountLinking.credential) {
			setCustomError('Google credential missing. Please try again.');
			return;
		}

		setPasswordAccountLinking((prev) => ({ ...prev, show: false }));

		// You'll need a new API endpoint for this
		const result = await handleAsyncOperation(
			() =>
				linkGoogleAccount({
					credential: passwordAccountLinking.credential!,
					email: passwordAccountLinking.email!,
				}).unwrap(),
			'Failed to send OTP for Google account linking.'
		);

		if (result.success && result.data) {
			if (result.data.message.includes('OTP sent')) {
				dispatch(setPasswordToGoogleLinkingMode(true));
				dispatch(
					setOtpStep({
						step: 'OTP Verification',
						email: passwordAccountLinking.email!,
					})
				);
			}
		} else {
			setCustomError(result.error || 'Failed to initiate Google account linking');
		}
	};

	return (
		<AuthForm>
			<AuthForm.GoogleProvider>
				<AuthForm.AuthFormImage />
				<AuthForm.AuthFormHeader header={'Login'} />
				<AuthForm.AuthFormLabel label={'Please enter your login info'} />
				{step === 'Login' ? (
					<>
						<AuthForm.Form handleSubmit={handleSubmit(onRequestOtp)}>
							<AuthForm.FormFieldContainer>
								<Controller
									name="email"
									control={control}
									render={({ field, fieldState: { error } }) => (
										<AuthFormFields.Email field={field} error={error} />
									)}
								/>
								<Controller
									name="password"
									control={control}
									render={({ field, fieldState: { error } }) => (
										<AuthFormFields.Password label="Password" field={field} error={error} />
									)}
								/>
							</AuthForm.FormFieldContainer>
							{customError && <AuthForm.ErrorMessage customError={customError} />}
							<Button
								data-testid="login-button"
								loading={isSubmitting || isLoading}
								fullWidth
								variant="contained"
								type="submit"
							>
								Login
							</Button>
						</AuthForm.Form>
						<Divider className="text-gray-500 py-4">OR</Divider>
						{/* Google Login Button */}
						<div className="google-button-container">
							{isGoogleLoading ? (
								<Button fullWidth variant="outlined" disabled>
									Signing in with Google...
								</Button>
							) : (
								<GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleFailure} />
							)}
						</div>
						<AuthForm.AuthFooter>
							<Link href={`/sign-up`} className="mx-auto mt-5 text-blue-500">
								Do you need an account?
							</Link>
							<Link href={`/forgot-password`} className="mx-auto mt-5 text-blue-500">
								Forgot your password?
							</Link>
						</AuthForm.AuthFooter>
					</>
				) : (
					<OtpForm otpConfig={getOtpConfig()} />
				)}
				{passwordAccountLinking.show && (
					<AccountLinkingModal
						open={passwordAccountLinking.show}
						type={'google-to-password'}
						handleClose={handleAccountLinkingModalClose}
						isLinkingPassword={isLinkingGoogle}
						handleAccountLinking={handleAccountLinking}
						passwordAccountLinkingEmail={passwordAccountLinking.email}
					/>
				)}
			</AuthForm.GoogleProvider>
		</AuthForm>
	);
}
