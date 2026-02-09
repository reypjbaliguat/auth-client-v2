'use client';

import {
	useGetOtpStatusQuery,
	useResendOtpMutation,
	useVerifyOtpMutation,
} from '@/core/store/api/authApi';
import {
	resetOtpStep,
	setAuthenticated,
	setOtpStep,
	setOtpTimer,
	updateOtpTimer,
} from '@/core/store/features/auth';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import { AuthErrorHandler } from '@/core/utils/errorHandler';
import { Alert, Box, Button, Typography } from '@mui/material';
import Cookies from 'js-cookie';
import { MuiOtpInput } from 'mui-one-time-password-input';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

interface Props {
	email: string;
}
function OtpForm({ email }: Props) {
	const [otp, setOtp] = useState('');
	const [error, setError] = useState<string>('');
	const [resendSuccess, setResendSuccess] = useState<string>('');
	const dispatch = useAppDispatch();
	const router = useRouter();
	const pathname = usePathname();
	const otpTimer = useAppSelector((state) => state.auth.otpTimer);

	// API hooks
	const [verifyOtp, { isLoading }] = useVerifyOtpMutation();
	const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();
	const { data: otpStatus } = useGetOtpStatusQuery(
		{ email },
		{
			pollingInterval: 1000, // Poll every second to keep timer in sync
			skip: !email,
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
		if (!otpTimer.canResend) return;

		setError('');
		setResendSuccess('');

		try {
			const response = await resendOtp({ email }).unwrap();
			setResendSuccess(response.message || 'OTP resent successfully!');

			// Update timer state
			dispatch(
				setOtpTimer({
					canResend: false,
					remainingTime: Math.floor(response.canResendAt - Date.now() / 1000),
					canResendAt: response.canResendAt,
				})
			);
		} catch (error) {
			setError(AuthErrorHandler.extractMessage(error));
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
		setError(''); // Clear any existing errors

		if (!otp || otp.length !== 6) {
			setError('Please enter a valid 6-digit OTP');
			return;
		}

		try {
			const response = await verifyOtp({ email, otp }).unwrap();

			// Extract token from response (adjust based on your API response structure)
			const token = response?.accessToken;

			if (!token) {
				throw new Error('No token received from server');
			}

			// Store token in secure cookie
			Cookies.set('token', token, {
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'strict',
				httpOnly: false, // Set to true for max security if using /me pattern
				expires: 7, // 7 days
				path: '/', // Available across entire app
			});

			// Store refresh token if provided
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
			console.log('setauthenticated');
			dispatch(
				setAuthenticated({
					user: response.user || null,
				})
			);

			// Reset OTP step on successful verification
			dispatch(resetOtpStep());

			// Redirect to dashboard
			router.replace('/dashboard'); // Use replace to prevent back navigation to OTP
		} catch (error) {
			setError(AuthErrorHandler.extractMessage(error));
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
					loading={isLoading}
					variant="contained"
					color="primary"
					disabled={!otp || otp.length !== 6}
				>
					Verify OTP
				</Button>

				{/* Resend OTP Button */}
				<Button
					variant="text"
					color="primary"
					onClick={handleResendOtp}
					disabled={!otpTimer.canResend || isResending || isLoading}
					size="small"
				>
					{isResending ? 'Resending...' : 'Resend OTP'}
				</Button>

				<Button variant="outlined" onClick={handleBack} disabled={isLoading}>
					Back to {pathname.includes('sign-up') ? 'Register' : 'Login'}
				</Button>
			</div>
		</form>
	);
}

export default OtpForm;
