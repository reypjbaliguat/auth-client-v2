'use client';

import AppShell from '@/core/components/AppShell';
import { persistor, store } from '@/core/store';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<Provider store={store}>
			<PersistGate loading={<div>Loading...</div>} persistor={persistor}>
				<AppShell>{children}</AppShell>
			</PersistGate>
		</Provider>
	);
}
