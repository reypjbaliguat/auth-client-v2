'use client';

import { selectAuthLoading, selectIsAuthenticated } from '@/core/store/features/auth';
import { useAppSelector } from '@/core/store/hooks';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { Loader } from './Loader';

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

	useEffect(() => {
		if (!isAuthenticated) {
			// In practice middleware should have redirected already,
			// but this covers edge cases.
			router.replace('/sign-in');
		}
	}, [isAuthenticated, router]);

	if (loading) {
		return <Loader />;
	}

	return <>{children}</>;
}
