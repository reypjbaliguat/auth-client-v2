'use client';

import { setAuthenticated } from '@/core/store/authSlice';
import { useAppDispatch } from '@/core/store/hooks';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
	const dispatch = useAppDispatch();
	const router = useRouter();

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

	return (
		<main style={{ padding: 24 }}>
			<h1>Sign In</h1>
			{/* Replace with real form */}
			<button onClick={handleLogin}>Fake Login</button>
		</main>
	);
}
