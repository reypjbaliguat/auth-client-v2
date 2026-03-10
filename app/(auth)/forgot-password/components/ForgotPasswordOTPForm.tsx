import { useResetPasswordMutation } from '@/core/store/api/authApi';
import { setForgotPasswordStep } from '@/core/store/features';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Box, Button, TextField, Typography } from '@mui/material';
import { MuiOtpInput } from 'mui-one-time-password-input';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import schema, { ConfirmResetPasswordFormData } from '../resetPasswordSchema';

const ForgotPasswordOTPForm = ({ email }: { email?: string | null }) => {
	const [otp, setOtp] = useState('');
	const [error, setError] = useState<string>('');
	const [resendSuccess, setResendSuccess] = useState<string>('');
	const [resetPassword, { isLoading }] = useResetPasswordMutation();
	const dispatch = useAppDispatch();
	const router = useRouter();
	const otpTimer = useAppSelector((state) => state.auth.otpTimer);

	const {
		handleSubmit,
		control,
		formState: { isSubmitting },
		//to be updated
	} = useForm<ConfirmResetPasswordFormData>({
		resolver: zodResolver(schema),
		defaultValues: { otp: '', password: '', confirmPassword: '' },
	});

	const handleChange = (newValue: string) => {
		setOtp(newValue);
		setError(''); // Clear error when user types
	};

	const formatTime = useCallback((seconds: number): string => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	}, []);

	const handleResendOtp = async () => {
		try {
			// Implement resend OTP logic here
			// e.g., dispatch(resendResetPasswordOtp({ email }))
			setResendSuccess('OTP sent successfully!');
			setTimeout(() => setResendSuccess(''), 5000);
		} catch {
			setError('Failed to resend OTP. Please try again.');
		}
	};

	const onResetPassword = async (data: ConfirmResetPasswordFormData) => {
		console.log(data);
		if (!email) return;
		try {
			const res = await resetPassword({ email, otp: data.otp, password: data.password }).unwrap();
			console.log('Reset Password Response:', res);
			// Handle success, e.g., navigate to login page
			router.push('/sign-in');
		} catch {
			setError('Failed to reset password. Please try again.');
		}
	};

	const handleBackButtonClick = () => {
		router.push('/sign-in'); // Navigate back to the sign-in page
		dispatch(setForgotPasswordStep({ step: 'Request', email: null }));
	};
	return (
		<>
			<Image src={'/assets/logo.png'} width={50} height={50} className="mb-5" alt="logo" />
			<Box component="form" onSubmit={handleSubmit(onResetPassword)} className="space-y-4">
				<h6 className="text-3xl mb-5"> Reset Password </h6>
				<span className="text-lg">
					Please enter the OTP sent to your email and create a new password.
				</span>

				<div className="space-y-2">
					<Typography variant="body2" color="text.secondary" className="font-medium">
						Enter OTP Code
					</Typography>
					<Controller
						name="otp"
						control={control}
						render={({ field, fieldState: { error } }) => (
							<>
								<MuiOtpInput
									{...field}
									value={otp}
									length={6}
									display={'flex'}
									gap={'5px'}
									onChange={(value) => {
										handleChange(value);
										field.onChange(value);
									}}
								/>
								{error && (
									<Typography variant="caption" color="error">
										{error.message}
									</Typography>
								)}
							</>
						)}
					/>
				</div>

				{/* new password and confirm password fields */}
				<div className="space-y-4">
					<Typography variant="body2" color="text.secondary" className="font-medium">
						Create New Password
					</Typography>

					<Controller
						name="password"
						control={control}
						rules={{ required: 'Password is required' }}
						render={({ field, fieldState: { error } }) => (
							<TextField
								{...field}
								label="New Password"
								type="password"
								variant="outlined"
								error={!!error}
								value={field.value || ''}
								helperText={error ? error.message : 'Minimum 8 characters'}
								fullWidth
								className="mb-3"
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
								label="Confirm New Password"
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

				{/* Error Messages */}
				{error && <Alert severity="error">{error}</Alert>}

				{/* Success Messages */}
				{resendSuccess && <Alert severity="success">{resendSuccess}</Alert>}

				{/* Timer Display */}
				<Box className="text-center">
					{!otpTimer.canResend ? (
						<Typography variant="body2" color="text.secondary">
							Resend OTP in {formatTime(otpTimer.remainingTime)}
						</Typography>
					) : (
						<Typography variant="body2" color="primary.main">
							You can resend OTP now
						</Typography>
					)}
				</Box>

				<div className="flex flex-col gap-y-3 mt-6">
					<Button
						type="submit"
						variant="contained"
						loading={isSubmitting || isLoading}
						color="primary"
						disabled={!otp || otp.length !== 6 || isSubmitting}
						fullWidth
						size="large"
					>
						{isSubmitting ? 'Resetting Password...' : 'Reset Password'}
					</Button>

					<Button
						variant="text"
						color="primary"
						onClick={handleResendOtp}
						disabled={!otpTimer.canResend}
						size="small"
					>
						Resend OTP
					</Button>

					<Button
						variant="outlined"
						onClick={handleBackButtonClick}
						disabled={isSubmitting}
						fullWidth
					>
						Back to Login
					</Button>
				</div>
			</Box>
		</>
	);
};

export default ForgotPasswordOTPForm;
