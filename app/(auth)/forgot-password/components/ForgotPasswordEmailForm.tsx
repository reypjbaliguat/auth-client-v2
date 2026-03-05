'use client';

import { useForgotPasswordMutation } from '@/core/store/api/authApi';
import {
	selectForgotPasswordEmail,
	selectForgotPasswordStep,
} from '@/core/store/features/auth/authSelectors';
import { setForgotPasswordStep } from '@/core/store/features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Box, Button, TextField } from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import schema, { RequestResetPasswordFormData } from '../schema';

function ForgotPasswordEmailForm() {
	const dispatch = useAppDispatch();
	const router = useRouter();
	const forgotPasswordStep = useAppSelector(selectForgotPasswordStep);
	const forgotPasswordEmail = useAppSelector(selectForgotPasswordEmail);
	const {
		handleSubmit,
		control,
		formState: { isSubmitting },
		//to be updated
	} = useForm<RequestResetPasswordFormData>({
		resolver: zodResolver(schema),
		defaultValues: { email: '' },
	});

	const [forgotPassword, { isLoading, error }] = useForgotPasswordMutation();
	const onRequestOtp = async (data: RequestResetPasswordFormData) => {
		// Implement forgot password logic here, e.g., call the forgotPassword mutation
		console.log('Forgot Password Request Data:', data);
		forgotPassword(data)
			.unwrap()
			.then(() => {
				// update step to verify and store email in state for verification step
				dispatch(setForgotPasswordStep({ step: 'Verify', email: data.email }));
			});
	};
	const handleBackButtonClick = () => {
		dispatch(setForgotPasswordStep({ step: 'Request' }));
		router.push('/sign-in'); // Navigate back to the sign-in page
	};

	return (
		<>
			<Image src={'/assets/logo.png'} width={50} height={50} className="mb-5" alt="logo" />
			<Box component="form" onSubmit={handleSubmit(onRequestOtp)}>
				<h6 className="text-3xl mb-5"> Forgot Password </h6>
				<span className="text-lg">Please enter your email.</span>
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
				</div>
				{error && (
					<div className="basis-full mb-4">
						<Alert severity="error">
							{(error && 'data' in error && (error.data as { message?: string })?.message) ||
								'An error occurred'}
						</Alert>
					</div>
				)}
				<div className="flex flex-col gap-y-2">
					<Button
						data-testid="forgot-password-button"
						loading={isSubmitting || isLoading}
						fullWidth
						variant="contained"
						type="submit"
					>
						Submit
					</Button>
					<Button variant="outlined" fullWidth onClick={handleBackButtonClick} disabled={isLoading}>
						Back to Login
					</Button>
				</div>
			</Box>
		</>
	);
}

export default ForgotPasswordEmailForm;
