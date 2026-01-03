'use client';

import { selectAuthLoading, selectIsAuthenticated } from '@/core/store/features/auth';
import { useAppSelector } from '@/core/store/hooks';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useEffect, useEffectEvent, useState } from 'react';

interface ProtectedRouteProps {
	children: ReactNode;
}

/**
 * Client-side UI guard.
 * Middleware already guards URL access; this prevents flicker & protects UI.
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
	const router = useRouter();
	const loading = useAppSelector(selectAuthLoading);
	const isAuthenticated = useAppSelector(selectIsAuthenticated);
	const authState = useAppSelector((state) => state.auth);
	const [isMounted, setIsMounted] = useState(false);
	console.log(authState);
	const mount = useEffectEvent(() => {
		setIsMounted(true);
	});

	useEffect(() => {
		mount();
	}, []);

	// Don't render anything until client-side mount to prevent hydration issues
	if (!isMounted) {
		return <div>Loading...</div>;
	}

	if (loading) {
		return <div>Checking auth…</div>;
	}

	if (!isAuthenticated) {
		// In practice middleware should have redirected already,
		// but this covers edge cases.
		router.replace('/sign-in');
		return null;
	}

	return <>{children}</>;
}
