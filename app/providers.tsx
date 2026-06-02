'use client';

import AuthBootstrap from '@/core/components/AuthBootstrap';
import { Loader } from '@/core/components/Loader';
import { persistor, store } from '@/core/store';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<Provider store={store}>
			<PersistGate loading={<Loader />} persistor={persistor}>
				<AuthBootstrap />
				{children}
			</PersistGate>
		</Provider>
	);
}
