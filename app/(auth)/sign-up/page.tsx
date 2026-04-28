'use client';

import {
	useGoogleLoginMutation,
	useLinkGoogleAccountMutation,
	useLinkPasswordMutation,
	useRegisterMutation,
} from '@/core/store/api/authApi';
import {
	resetOtpStep,
	selectIsAuthenticated,
	selectIsPasswordToGoogleLinking,
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
import schema, { SignUpFormData } from './schema';

export default function SignUpPage() {
	const dispatch = useAppDispatch();
	const isAuthenticated = useAppSelector(selectIsAuthenticated);
	const step = useAppSelector(selectOtpStep);
	const isPasswordToGoogleLinking = useAppSelector(selectIsPasswordToGoogleLinking);
	const persistedEmail = useAppSelector(selectOtpEmail);
	const [customError, setCustomError] = useState<string>('');
	const [customSuccess, setCustomSuccess] = useState<string>('');
	// ACCOUNT LINKING
	const [openAccountLinkingModal, setOpenAccountLinkingModal] = useState(false);

	// PASSWORD TO GOOGLE LINKING
	const [accountLinkingPassword, setAccountLinkingPassword] = useState<string>('');

	// GOOGLE TO PASSWORD LINKING
	const [passwordAccountLinking, setPasswordAccountLinking] = useState<PasswordLinking>({
		show: false,
		credential: null,
		email: null,
	});

	const router = useRouter();
	const {
		handleSubmit,
		control,
		formState: { isSubmitting },
		getValues,
		//to be updated
	} = useForm<SignUpFormData>({
		resolver: zodResolver(schema),
		defaultValues: {
			email: '',
			password: '',
			confirmPassword: '',
		},
	});

	const [register, { isLoading }] = useRegisterMutation();
	const [googleLogin, { isLoading: isGoogleLoading }] = useGoogleLoginMutation();
	const [linkPassword, { isLoading: isLinkingPassword }] = useLinkPasswordMutation();
	const [linkGoogleAccount, { isLoading: isLinkingGoogle }] = useLinkGoogleAccountMutation();

	const GOOGLE_ERROR_MESSAGE = 'Google registration failed. Please try again.';

	// Set Register step when component mounts (if not already in OTP verification)
	useEffect(() => {
		if (step !== 'OTP Verification') {
			dispatch(setOtpStep({ step: 'Register' }));
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

	useEffect(() => {
		return () => {
			dispatch(resetOtpStep());
			dispatch(setPasswordToGoogleLinkingMode(false)); // Reset account linking mode on unmount
			setAccountLinkingPassword(''); // Clear on unmount
		};
	}, []);

	//to be updated
	const onRequestOtp = async (formData: SignUpFormData) => {
		setCustomError(''); // Clear any existing errors
		const result = await handleAsyncOperation(
			() => register(formData).unwrap(),
			'Registration failed. Please check your details and try again.'
		);
		if (result.success && result.data) {
			if (result.data.message.includes('OTP sent')) {
				dispatch(setOtpStep({ step: 'OTP Verification', email: formData.email }));
			} else {
				setCustomSuccess(result.data.message);
				router.push('/sign-in');
			}
		} else {
			// Handle account linking scenario
			if (result.error?.includes('HAS_GOOGLE_ACCOUNT')) {
				// Adjust based on your backend message
				setOpenAccountLinkingModal(true);
				setCustomError(''); // Clear error since this isn't really an error
			} else if (result.error?.includes('Email already exists with password login')) {
				setCustomSuccess(result.error);
				setTimeout(() => {
					router.push('/sign-in');
				}, 3000);
				return;
			} else {
				setCustomError(result.error || 'An unexpected error occurred');
			}
		}
	};

	const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
		setCustomError(''); // Clear any existing errors

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
		}
	};

	const handleGoogleFailure = () => {
		setCustomError(GOOGLE_ERROR_MESSAGE);
	};

	const handleAccountLinking = async () => {
		setCustomError('');
		setOpenAccountLinkingModal(false); // Hide the confirmation dialog

		if (openAccountLinkingModal) {
			const formData = getValues(); // Get current form values
			// Store password for OTP verification
			setAccountLinkingPassword(formData.password);

			const result = await handleAsyncOperation(
				() => linkPassword(formData).unwrap(),
				'Failed to send OTP for account linking. Please try again.'
			);

			if (result.success && result.data) {
				if (result.data.message.includes('OTP sent')) {
					// Reuse existing OTP flow but mark it as account linking
					dispatch(
						setOtpStep({
							step: 'OTP Verification',
							email: formData.email,
						})
					);
					// You might want to add a flag to Redux to track this is account linking
					dispatch(setPasswordToGoogleLinkingMode(true));
				}
			} else {
				setCustomError(result.error || 'Failed to initiate account linking');
			}
		} else {
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
		}
	};

	const handleAccountLinkingModalClose = () => {
		setOpenAccountLinkingModal(false);
		setPasswordAccountLinking({
			show: false,
			credential: null,
			email: null,
		});
	};

	// Helper function to get the correct OTP configuration
	const getOtpConfig = (): OtpType => {
		const email = persistedEmail || getValues('email');

		if (isPasswordToGoogleLinking && accountLinkingPassword) {
			return {
				type: 'PASSWORD_TO_GOOGLE_LINKING',
				email,
				password: accountLinkingPassword,
			};
		}

		if (passwordAccountLinking.credential && passwordAccountLinking.email) {
			return {
				type: 'GOOGLE_TO_PASSWORD_LINKING',
				email: passwordAccountLinking.email,
				credential: passwordAccountLinking.credential,
			};
		}

		// Default registration OTP
		return {
			type: 'REGISTRATION',
			email,
		};
	};

	const isRegistering = step === 'Register';
	return (
		<AuthForm>
			<AuthForm.GoogleProvider>
				<AuthForm.AuthFormImage />
				<AuthForm.AuthFormHeader header={isRegistering ? 'Register' : 'OTP Verification'} />
				<AuthForm.AuthFormLabel
					label={
						isRegistering
							? 'Please enter your registration info'
							: 'Please enter the OTP sent to your email'
					}
				/>
				{step === 'Register' ? (
					<>
						<AuthForm.Form handleSubmit={handleSubmit(onRequestOtp)}>
							<AuthForm.FormFieldContainer>
								<Controller
									name="email"
									control={control}
									rules={{ required: 'Email is required' }}
									render={({ field, fieldState: { error } }) => (
										<AuthFormFields.Email field={field} error={error} />
									)}
								/>
								<Controller
									name="password"
									control={control}
									rules={{ required: 'Password is required' }}
									render={({ field, fieldState: { error } }) => (
										<AuthFormFields.Password label="Password" field={field} error={error} />
									)}
								/>
								<Controller
									name="confirmPassword"
									control={control}
									rules={{ required: 'Confirm Password is required' }}
									render={({ field, fieldState: { error } }) => (
										<AuthFormFields.Password label="Confirm Password" field={field} error={error} />
									)}
								/>
							</AuthForm.FormFieldContainer>
							{customError && <AuthForm.ErrorMessage customError={customError} />}
							{customSuccess && <AuthForm.SuccessMessage customSuccess={customSuccess} />}
							<Button
								disabled={isSubmitting || isLoading}
								loading={isSubmitting || isLoading}
								fullWidth
								variant="contained"
								type="submit"
							>
								Register
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
							<Link href={`/sign-in`} className="mx-auto mt-5 text-blue-500">
								Already have an account?
							</Link>
						</AuthForm.AuthFooter>
					</>
				) : (
					<OtpForm otpConfig={getOtpConfig()} />
				)}
				{(openAccountLinkingModal || passwordAccountLinking.show) && (
					<AccountLinkingModal
						open={openAccountLinkingModal || passwordAccountLinking.show}
						type={passwordAccountLinking.show ? 'google-to-password' : 'password-to-google'}
						handleClose={handleAccountLinkingModalClose}
						isLinkingPassword={isLinkingPassword || isLinkingGoogle}
						handleAccountLinking={handleAccountLinking}
						passwordAccountLinkingEmail={passwordAccountLinking.email}
					/>
				)}
			</AuthForm.GoogleProvider>
		</AuthForm>
	);
}
