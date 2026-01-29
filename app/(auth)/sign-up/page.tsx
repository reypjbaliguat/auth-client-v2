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
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Box, Button, Divider, TextField } from '@mui/material';
import { GoogleLogin } from '@react-oauth/google';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { AuthFormContainer, OtpForm } from '../components';
import schema, { SignUpFormData } from './schema';

export default function SignUpPage() {
	const dispatch = useAppDispatch();
	const isAuthenticated = useAppSelector(selectIsAuthenticated);
	const step = useAppSelector(selectOtpStep);
	const persistedEmail = useAppSelector(selectOtpEmail);
	const [customError, setCustomError] = useState<string>('');

	const router = useRouter();
	const {
		handleSubmit,
		control,
		formState: { isSubmitting },
		getValues,
		//to be updated
	} = useForm<SignUpFormData>({ resolver: zodResolver(schema) });

	const [register, { isLoading, error }] = useRegisterMutation();
	const [googleLogin, { isLoading: isGoogleLoading, error: googleError }] =
		useGoogleLoginMutation();

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

	//to be updated
	const onRequestOtp = async (formData: SignUpFormData) => {
		setCustomError(''); // Clear any existing errors
		try {
			const payload = await register(formData).unwrap();
			if (payload.message.includes('OTP sent')) {
				dispatch(setOtpStep({ step: 'OTP Verification', email: formData.email }));
			}
		} catch (err) {
			setCustomError('Registration failed. Please check your details and try again.');
		}
	};

	const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
		setCustomError(''); // Clear any existing errors
		try {
			if (!credentialResponse.credential) {
				setCustomError('No credential received from Google. Please try again.');
				return;
			}

			const response = await googleLogin({
				credential: credentialResponse.credential,
			}).unwrap();

			// Store tokens in secure cookies
			Cookies.set('token', response.accessToken, {
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'strict',
				httpOnly: false,
				expires: 7, // 7 days
				path: '/',
			});

			if (response.refreshToken) {
				Cookies.set('refreshToken', response.refreshToken, {
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
					user: response.user,
				})
			);

			// Reset OTP step on successful authentication
			dispatch(resetOtpStep());

			// Redirect to dashboard
			router.replace('/dashboard');
		} catch (error) {
			setCustomError('Google registration failed. Please try again.');
		}
	};

	const handleGoogleFailure = () => {
		setCustomError('Google registration failed. Please try again.');
	};

	return (
		<AuthFormContainer label={step === 'Register' ? 'Register' : step}>
			{step === 'Register' ? (
				<>
					<Box component="form" onSubmit={handleSubmit(onRequestOtp)}>
						<div className="flex flex-col gap-y-2 my-4">
							<Controller
								name="email"
								control={control}
								rules={{ required: 'Email is required' }}
								render={({ field, fieldState: { error } }) => (
									<TextField
										{...field}
										label="Email"
										variant="outlined"
										value={field.value || ''}
										error={!!error}
										helperText={error ? error.message : null}
										fullWidth
									/>
								)}
							/>
							<Controller
								name="password"
								control={control}
								rules={{ required: 'Password is required' }}
								render={({ field, fieldState: { error } }) => (
									<TextField
										{...field}
										label="Password"
										type="password"
										variant="outlined"
										error={!!error}
										value={field.value || ''}
										helperText={error ? error.message : null}
										fullWidth
									/>
								)}
							/>
							<Controller
								name="confirmPassword"
								control={control}
								rules={{ required: 'Confirm Password is required' }}
								render={({ field, fieldState: { error } }) => (
									<TextField
										{...field}
										label="Confirm Password"
										type="password"
										variant="outlined"
										error={!!error}
										value={field.value || ''}
										helperText={error ? error.message : null}
										fullWidth
									/>
								)}
							/>
						</div>
						{(error || googleError || customError) && (
							<div className="basis-full mb-4">
								<Alert severity="error">
									{customError ||
										(error && 'data' in error
											? (error.data as { message?: string })?.message || 'An error occurred'
											: googleError && 'data' in googleError
												? (googleError.data as { message?: string })?.message ||
													'Google registration failed'
												: 'An error occurred')}
								</Alert>
							</div>
						)}
						<Button loading={isSubmitting || isLoading} fullWidth variant="contained" type="submit">
							Register
						</Button>
					</Box>

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
				</>
			) : (
				<OtpForm email={persistedEmail || getValues('email')} />
			)}
		</AuthFormContainer>
	);
}
