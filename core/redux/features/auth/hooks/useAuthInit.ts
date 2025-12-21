'use client';

import { setAuthenticated, setUnauthenticated, startAuthCheck } from '@/core/store/authSlice';
import { useAppDispatch } from '@/core/store/hooks';
import Cookies from 'js-cookie';
import { useEffect } from 'react';

/**
 * Hydrates Redux auth state from the "token" cookie.
 * This runs on the client once on app startup.
 */
export function useAuthInit() {
	const dispatch = useAppDispatch();

	useEffect(() => {
		dispatch(startAuthCheck());

		const token = Cookies.get('token');

		if (token) {
			// Optional: decode token / fetch /me to get user info
			dispatch(setAuthenticated(undefined));
		} else {
			dispatch(setUnauthenticated());
		}
	}, [dispatch]);
}
