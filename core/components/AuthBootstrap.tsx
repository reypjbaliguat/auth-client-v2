'use client';

import { useLazyGetCurrentUserQuery } from '@/core/store/api/authApi';
import {
	finishAuthCheck,
	setAuthenticated,
	setUnauthenticated,
	startAuthCheck,
} from '@/core/store/features/auth';
import { useAppDispatch } from '@/core/store/hooks';
import Cookies from 'js-cookie';
import { useEffect, useRef } from 'react';

export default function AuthBootstrap() {
	const dispatch = useAppDispatch();
	const initializedRef = useRef(false);
	const [triggerGetCurrentUser] = useLazyGetCurrentUserQuery();

	useEffect(() => {
		if (initializedRef.current) {
			return;
		}
		initializedRef.current = true;

		let isMounted = true;

		const bootstrapAuth = async () => {
			dispatch(startAuthCheck());

			const hasToken = Boolean(Cookies.get('token'));
			const hasRefreshToken = Boolean(Cookies.get('refreshToken'));

			if (!hasToken && !hasRefreshToken) {
				dispatch(setUnauthenticated());
				dispatch(finishAuthCheck());
				return;
			}

			try {
				const user = await triggerGetCurrentUser().unwrap();
				if (!isMounted) {
					return;
				}
				dispatch(setAuthenticated({ user }));
			} catch {
				if (!isMounted) {
					return;
				}
				Cookies.remove('token', { path: '/' });
				Cookies.remove('refreshToken', { path: '/' });
				dispatch(setUnauthenticated());
			} finally {
				if (isMounted) {
					dispatch(finishAuthCheck());
				}
			}
		};

		void bootstrapAuth();

		return () => {
			isMounted = false;
		};
	}, [dispatch, triggerGetCurrentUser]);

	return null;
}
