'use client';

import { useLoginMutation } from '@/core/store/api/authApi';
import { useAppDispatch } from '@/core/store/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Box, Button, Divider, TextField } from '@mui/material';
import { GoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { AuthFormContainer, OtpForm } from '../components';
import schema, { SignInFormData } from './schema';

export default function SignInPage() {
	const dispatch = useAppDispatch();
	const router = useRouter();
	const [step, setStep] = useState<'Login' | 'OTP Verification'>('Login');
	const {
		handleSubmit,
		control,
		formState: { isSubmitting },
		getValues,
		setError,
		//to be updated
	} = useForm<SignInFormData>({ resolver: zodResolver(schema) });

	const [login, { isLoading, error }] = useLoginMutation();

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

	const handleGoogleSuccess = () => {};
	const handleGoogleFailure = () => {};

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
						{error && 'data' in error && (
							<div className="basis-full mb-4">
								<Alert severity="error">
									{(error.data as { message?: string })?.message || 'An error occurred'}
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
						<GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleFailure} />
					</div>
				</>
			) : (
				<OtpForm email={getValues('email')} />
			)}
		</AuthFormContainer>
	);
}
