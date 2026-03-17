'use client';

import { useGoogleLoginMutation, useRegisterMutation } from '@/core/store/api/authApi';
import {
	resetOtpStep,
	selectIsAuthenticated,
	selectOtpEmail,
	selectOtpStep,
	setAuthenticated,
	setOtpStep,
} from '@/core/store/features/auth';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
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
import AuthForm from '../components/AuthForm';
import { AuthFormFields } from '../components/AuthFormFields';
import schema, { SignUpFormData } from './schema';

export default function SignUpPage() {
	const dispatch = useAppDispatch();
	const isAuthenticated = useAppSelector(selectIsAuthenticated);
	const step = useAppSelector(selectOtpStep);
	const persistedEmail = useAppSelector(selectOtpEmail);
	const [customError, setCustomError] = useState<string>('');
	const [customSuccess, setCustomSuccess] = useState<string>('');

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
			}
		} else {
			if (result.error?.includes('Email already exists with password login')) {
				setCustomSuccess(result.error);
				// wait for 3 seconds before redirecting to login page
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
			setCustomError(result.error || GOOGLE_ERROR_MESSAGE);
		}
	};

	const handleGoogleFailure = () => {
		setCustomError(GOOGLE_ERROR_MESSAGE);
	};

	return (
		<AuthForm>
			<AuthForm.GoogleProvider>
				<AuthForm.AuthFormImage />
				<AuthForm.AuthFormHeader header={'Register'} />
				<AuthForm.AuthFormLabel label={'Please enter your registration info'} />
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
					<OtpForm email={persistedEmail || getValues('email')} />
				)}
			</AuthForm.GoogleProvider>
		</AuthForm>
	);
}
