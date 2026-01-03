'use client';

import { useVerifyOtpMutation } from '@/core/store/api/authApi';
import { setAuthenticated } from '@/core/store/features/auth';
import { useAppDispatch } from '@/core/store/hooks';
import { Button } from '@mui/material';
import Cookies from 'js-cookie';
import { MuiOtpInput } from 'mui-one-time-password-input';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface Props {
	email: string;
}
function OtpForm({ email }: Props) {
	const [otp, setOtp] = useState('');
	const dispatch = useAppDispatch();
	const router = useRouter();
	const [verifyOtp, { isLoading }] = useVerifyOtpMutation();
	const handleChange = (newValue: string) => {
		setOtp(newValue);
	};
	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();

		if (!otp || otp.length !== 6) {
			console.error('Please enter a valid 6-digit OTP');
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

			// Redirect to dashboard
			//router.replace('/dashboard'); // Use replace to prevent back navigation to OTP
		} catch (error) {
			console.error('OTP verification failed:', error);
			// Handle error appropriately - could set error state here
			throw error;
		}
	};
	return (
		<div className="flex flex-col gap-y-4">
			<MuiOtpInput value={otp} length={6} display={'flex'} gap={'5px'} onChange={handleChange} />
			<Button loading={isLoading} variant="contained" color="primary" onClick={handleSubmit}>
				Verify OTP
			</Button>
		</div>
	);
}

export default OtpForm;
