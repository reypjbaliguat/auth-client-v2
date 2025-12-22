'use client';

import { setAuthenticated } from '@/core/store/authSlice';
import { useAppDispatch } from '@/core/store/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Box, Button, Divider, TextField } from '@mui/material';
import { GoogleLogin } from '@react-oauth/google';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { AuthFormContainer } from '../components';
import schema, { SignInFormData } from './schema';

export default function SignInPage() {
	const dispatch = useAppDispatch();
	const router = useRouter();
	const error = {};
	const isLoading = false;
	const {
		handleSubmit,
		control,
		formState: { isSubmitting },
		setError,
		//to be updated
	} = useForm<SignInFormData>({ resolver: zodResolver(schema) });

	const handleLogin = async () => {
		// TODO: call your real backend
		const fakeToken = 'fake-jwt-token';

		// 1. Put token in cookie (middleware & client can read)
		Cookies.set('token', fakeToken, {
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			// NOT httpOnly so client JS can read; for max security use httpOnly + /me pattern
			expires: 7,
		});

		// 2. Update Redux auth state (no token stored here)
		dispatch(setAuthenticated(undefined));

		// 3. Redirect to dashboard
		router.replace('/dashboard');
	};

	//to be updated
	const onSubmit = async (formData: SignInFormData) => {
		try {
		} catch (err) {}
	};

	const handleGoogleSuccess = () => {};
	const handleGoogleFailure = () => {};

	return (
		<AuthFormContainer label="Login">
			<Box component="form" onSubmit={handleSubmit(onSubmit)}>
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
		</AuthFormContainer>
	);
}
