'use client';

import ProtectedRoute from '@/core/components/ProtectedRoute';
import { resetOtpStep, setUnauthenticated } from '@/core/store/features';
import { useAppDispatch } from '@/core/store/hooks';
import { Button } from '@mui/material';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
	const dispatch = useAppDispatch();
	const router = useRouter();

	const handleLogout = () => {
		// Clear authentication cookies
		Cookies.remove('token', { path: '/' });
		Cookies.remove('refreshToken', { path: '/' });

		// Clear Redux auth state
		dispatch(setUnauthenticated());

		// Reset OTP step for fresh login flow
		dispatch(resetOtpStep());

		// Redirect to login page
		router.push('/sign-in');
	};

	return (
		<ProtectedRoute>
			<main style={{ padding: 24 }}>
				<h1>Dashboard</h1>
				<p>Only visible to authenticated users.</p>

				<Button variant="contained" onClick={handleLogout}>
					Logout
				</Button>
			</main>
		</ProtectedRoute>
	);
}
