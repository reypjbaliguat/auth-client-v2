'use client';

import { useOtpStrategy } from '@/core/hooks/useOtpStrategy';
import { useGetOtpStatusQuery } from '@/core/store/api/authApi';
import { setOtpStep, setOtpTimer, updateOtpTimer } from '@/core/store/features/auth';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import { OtpType } from '@/core/types/otp';
import { AuthErrorHandler, handleAsyncOperation } from '@/core/utils/errorHandler';
import { Alert, Box, Button, Typography } from '@mui/material';
import { MuiOtpInput } from 'mui-one-time-password-input';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

interface Props {
	otpConfig: OtpType; // Single configuration object containing all OTP data
}

function OtpForm({ otpConfig }: Props) {
	const [otp, setOtp] = useState('');
	const [error, setError] = useState<string>('');
	const [resendSuccess, setResendSuccess] = useState<string>('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isResending, setIsResending] = useState(false);

	const dispatch = useAppDispatch();
	const pathname = usePathname();
	const otpTimer = useAppSelector((state) => state.auth.otpTimer);

	// Get strategy based on OTP type
	const strategy = useOtpStrategy(otpConfig);

	// API hooks
	const { data: otpStatus } = useGetOtpStatusQuery(
		{ email: otpConfig.email },
		{
			skip: !otpConfig.email,
		}
	);

	// Update timer state when OTP status changes
	useEffect(() => {
		if (otpStatus) {
			dispatch(
				setOtpTimer({
					canResend: otpStatus.canResend,
					remainingTime: otpStatus.remainingTime,
					canResendAt: otpStatus.canResendAt,
				})
			);
		}
	}, [otpStatus, dispatch]);

	// Update countdown timer every second
	useEffect(() => {
		if (!otpTimer.canResend && otpTimer.canResendAt) {
			const interval = setInterval(() => {
				dispatch(updateOtpTimer());
			}, 1000);

			return () => clearInterval(interval);
		}
	}, [otpTimer.canResend, otpTimer.canResendAt, dispatch]);

	const handleBack = () => {
		// Determine which step to go back to based on current route
		const backStep = pathname.includes('sign-up') ? 'Register' : 'Login';
		dispatch(setOtpStep({ step: backStep }));
	};

	const handleResendOtp = async () => {
		if (!otpTimer.canResend || isResending) return;

		setError('');
		setResendSuccess('');
		setIsResending(true);

		try {
			const result = await handleAsyncOperation(
				() => strategy.resend(),
				'Failed to resend OTP. Please try again.'
			);

			if (result.success) {
				setResendSuccess('OTP resent successfully!');

				// Update timer state if response contains timing info
				if (result.data?.canResendAt) {
					dispatch(
						setOtpTimer({
							canResend: false,
							remainingTime: Math.floor(result.data.canResendAt - Date.now() / 1000),
							canResendAt: result.data.canResendAt,
						})
					);
				}
			} else {
				setError(result.error || 'Failed to resend OTP');
			}
		} catch (error) {
			setError(AuthErrorHandler.extractMessage(error));
		} finally {
			setIsResending(false);
		}
	};

	// Format remaining time as MM:SS
	const formatTime = useCallback((seconds: number): string => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	}, []);

	const handleChange = (newValue: string) => {
		setOtp(newValue);
		setError(''); // Clear error when user types
	};

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError('');

		if (!otp || otp.length !== 6) {
			setError('Please enter a valid 6-digit OTP');
			return;
		}

		setIsSubmitting(true);

		try {
			const result = await handleAsyncOperation(
				() => strategy.verify(otp),
				strategy.getErrorMessage()
			);

			if (result.success && result.data) {
				await strategy.handleSuccess(result.data);
			} else {
				setError(result.error || strategy.getErrorMessage());
			}
		} catch (error) {
			setError(AuthErrorHandler.extractMessage(error));
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-y-4">
			<MuiOtpInput value={otp} length={6} display={'flex'} gap={'5px'} onChange={handleChange} />

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

			<div className="flex flex-col gap-y-2">
				<Button
					type="submit"
					loading={isSubmitting}
					variant="contained"
					color="primary"
					disabled={!otp || otp.length !== 6 || isSubmitting}
				>
					{strategy.getButtonText()}
				</Button>

				{/* Resend OTP Button */}
				<Button
					variant="text"
					color="primary"
					onClick={handleResendOtp}
					disabled={!otpTimer.canResend || isResending || isSubmitting}
					size="small"
				>
					{isResending ? 'Resending...' : 'Resend OTP'}
				</Button>

				<Button variant="outlined" onClick={handleBack} disabled={isSubmitting}>
					Back to {pathname.includes('sign-up') ? 'Register' : 'Login'}
				</Button>
			</div>
		</form>
	);
}

export default OtpForm;
