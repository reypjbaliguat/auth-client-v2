'use client';

import type { RootState } from '@/core/store';
import { hydrateAuthFromCookie } from '@/core/utils/hydrateAuthFromCookie';
import { useEffect } from 'react';
import { useDispatch, useStore } from 'react-redux';

export default function AppShell({ children }: { children: React.ReactNode }) {
	const dispatch = useDispatch();
	const store = useStore<RootState>();

	useEffect(() => {
		hydrateAuthFromCookie(dispatch, () => store.getState());
	}, [dispatch, store]);

	return (
		<>
			<main>{children}</main>
		</>
	);
}
