'use client';

import { useGoogleLoginMutation, useLoginMutation } from '@/core/store/api/authApi';
import { setAuthenticated } from '@/core/store/authSlice';
import { useAppDispatch } from '@/core/store/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Box, Button, Divider, TextField } from '@mui/material';
import { GoogleLogin } from '@react-oauth/google';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { AuthFormContainer, OtpForm } from '../components';
import schema, { SignInFormData } from './schema';

export default function SignInPage() {
	const [step, setStep] = useState<'Login' | 'OTP Verification'>('Login');
	const dispatch = useAppDispatch();
	const router = useRouter();
	const {
		handleSubmit,
		control,
		formState: { isSubmitting },
		getValues,
		//to be updated
	} = useForm<SignInFormData>({ resolver: zodResolver(schema) });

	const [login, { isLoading, error }] = useLoginMutation();
	const [googleLogin, { isLoading: isGoogleLoading, error: googleError }] =
		useGoogleLoginMutation();

	//to be updated
	const onRequestOtp = async (formData: SignInFormData) => {
		try {
			const payload = await login(formData).unwrap();
			if (payload.message.includes('OTP sent')) {
				setStep('OTP Verification');
			}
		} catch (err) {
			console.error(err);
		}
	};

	const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
		try {
			if (!credentialResponse.credential) {
				console.error('No credential received from Google');
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

			// Redirect to dashboard
			router.replace('/dashboard');
		} catch (error) {
			console.error('Google login failed:', error);
		}
	};

	const handleGoogleFailure = () => {
		console.error('Google login failed');
	};

	return (
		<AuthFormContainer label={step}>
			{step === 'Login' ? (
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
						</div>
						{(error || googleError) && (
							<div className="basis-full mb-4">
								<Alert severity="error">
									{error && 'data' in error
										? (error.data as { message?: string })?.message || 'An error occurred'
										: googleError && 'data' in googleError
											? (googleError.data as { message?: string })?.message || 'Google login failed'
											: 'An error occurred'}
								</Alert>
							</div>
						)}
						<Button loading={isSubmitting || isLoading} fullWidth variant="contained" type="submit">
							Login
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
				<OtpForm email={getValues('email')} />
			)}
		</AuthFormContainer>
	);
}
