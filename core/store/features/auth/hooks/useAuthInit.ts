'use client';

import Cookies from 'js-cookie';
import { useEffect } from 'react';
import { useAppDispatch } from '../../../hooks';
import { setAuthenticated, setUnauthenticated, startAuthCheck } from '../../auth/authSlice';

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
			console.log('Token found in cookie:', token);
			// Optional: decode token / fetch /me to get user info
			dispatch(setAuthenticated(undefined));
		} else {
			dispatch(setUnauthenticated());
		}
	}, [dispatch]);
}
