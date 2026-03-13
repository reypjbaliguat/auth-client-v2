'use client';

import { useGoogleLoginMutation, useLoginMutation } from '@/core/store/api/authApi';
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
import { Alert, Box, Button, Divider, TextField } from '@mui/material';
import { GoogleLogin } from '@react-oauth/google';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { AuthFormContainer, OtpForm } from '../components';
import PasswordField from '../components/PasswordField';
import schema, { SignInFormData } from './schema';

export default function SignInPage() {
	const dispatch = useAppDispatch();
	const isAuthenticated = useAppSelector(selectIsAuthenticated);
	const step = useAppSelector(selectOtpStep);
	const persistedEmail = useAppSelector(selectOtpEmail);
	const [customError, setCustomError] = useState<string>('');
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
		} else {
			setCustomError(result.error || GOOGLE_ERROR_MESSAGE);
		}
	};

	const handleGoogleFailure = () => {
		setCustomError(GOOGLE_ERROR_MESSAGE);
	};

	return (
		<AuthFormContainer label={step === 'Login' ? 'Login' : step}>
			{step === 'Login' ? (
				<>
					<Box component="form" onSubmit={handleSubmit(onRequestOtp)}>
						<div className="flex flex-col gap-y-2 my-4">
							<Controller
								name="email"
								control={control}
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
								render={({ field, fieldState: { error } }) => (
									<PasswordField field={field} error={error} label="Password" />
								)}
							/>
						</div>
						{customError && (
							<div className="basis-full mb-4">
								<Alert severity="error">{customError}</Alert>
							</div>
						)}
						<Button
							data-testid="login-button"
							loading={isSubmitting || isLoading}
							fullWidth
							variant="contained"
							type="submit"
						>
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
				<OtpForm email={persistedEmail || getValues('email')} />
			)}
		</AuthFormContainer>
	);
}
