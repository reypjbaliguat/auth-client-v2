'use client';

import ProtectedRoute from '@/core/components/ProtectedRoute';
import { setUnauthenticated } from '@/core/store/authSlice';
import { useAppDispatch } from '@/core/store/hooks';
import { Button } from '@mui/material';

export default function DashboardPage() {
	const dispatch = useAppDispatch();

	return (
		<ProtectedRoute>
			<main style={{ padding: 24 }}>
				<h1>Dashboard</h1>
				<p>Only visible to authenticated users.</p>

				<Button variant="contained" onClick={() => dispatch(setUnauthenticated())}>
					Logout
				</Button>
			</main>
		</ProtectedRoute>
	);
}
