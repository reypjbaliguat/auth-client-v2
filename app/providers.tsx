'use client';

import AppShell from '@/core/components/AppShell';
import { persistor, store } from '@/core/store';
import { useState } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

export function Providers({ children }: { children: React.ReactNode }) {
	const [isClient] = useState(() => false);

	// Prevent hydration mismatch by not rendering redux-persist until client-side
	if (!isClient) {
		return (
			<Provider store={store}>
				<div suppressHydrationWarning={true}>
					<AppShell>{children}</AppShell>
				</div>
			</Provider>
		);
	}

	return (
		<Provider store={store}>
			<PersistGate loading={<div>Loading...</div>} persistor={persistor}>
				<AppShell>{children}</AppShell>
			</PersistGate>
		</Provider>
	);
}
