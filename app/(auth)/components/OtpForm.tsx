'use client';

import { useVerifyOtpMutation } from '@/core/store/api/authApi';
import { resetOtpStep, setAuthenticated, setOtpStep } from '@/core/store/features/auth';
import { useAppDispatch } from '@/core/store/hooks';
import { Alert, Button } from '@mui/material';
import Cookies from 'js-cookie';
import { MuiOtpInput } from 'mui-one-time-password-input';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

interface Props {
	email: string;
}
function OtpForm({ email }: Props) {
	const [otp, setOtp] = useState('');
	const [error, setError] = useState<string>('');
	const dispatch = useAppDispatch();
	const router = useRouter();
	const pathname = usePathname();
	const [verifyOtp, { isLoading }] = useVerifyOtpMutation();

	const handleBack = () => {
		// Determine which step to go back to based on current route
		const backStep = pathname.includes('sign-up') ? 'Register' : 'Login';
		dispatch(setOtpStep({ step: backStep }));
	};
	const handleChange = (newValue: string) => {
		setOtp(newValue);
		setError(''); // Clear error when user types
	};
	const handleSubmit = async (event: React.FormEvent) => {
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
			setError('OTP verification failed. Please check your code and try again.');
		}
	};
	return (
		<div className="flex flex-col gap-y-4">
			<MuiOtpInput value={otp} length={6} display={'flex'} gap={'5px'} onChange={handleChange} />
			{error && <Alert severity="error">{error}</Alert>}
			<div className="flex flex-col gap-y-2">
				<Button loading={isLoading} variant="contained" color="primary" onClick={handleSubmit}>
					Verify OTP
				</Button>
				<Button variant="outlined" onClick={handleBack} disabled={isLoading}>
					Back to {pathname.includes('sign-up') ? 'Register' : 'Login'}
				</Button>
			</div>
		</div>
	);
}

export default OtpForm;
