'use client';

import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '../../../hooks';
import { setUnauthenticated } from '../../auth/authSlice';

export function useLogout() {
	const dispatch = useAppDispatch();
	const router = useRouter();

	return () => {
		Cookies.remove('token');
		Cookies.remove('refreshToken');
		dispatch(setUnauthenticated());
		router.replace('/sign-in');
	};
}
