'use client';

import type { RootState } from '@/core/store';
import { hydrateAuthFromCookie } from '@/core/utils/hydrateAuthFromCookie';
import { useState } from 'react';
import { useDispatch, useStore } from 'react-redux';

export default function AppShell({ children }: { children: React.ReactNode }) {
	const dispatch = useDispatch();
	const store = useStore<RootState>();
	const [hydrated, setHydrated] = useState(false);

	if (!hydrated) {
		hydrateAuthFromCookie(dispatch, () => store.getState());
		setHydrated(true);
	}

	return (
		<>
			<main>{children}</main>
		</>
	);
}
