import { persistedReducer, type RootState } from '@/core/store';
import { type AuthState } from '@/core/store/features/auth';
import rootMiddleware from '@/core/store/rootMiddleware';
import { configureStore } from '@reduxjs/toolkit';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { Provider } from 'react-redux';

type PartialRootState = Partial<RootState> & {
	auth?: Partial<AuthState>;
};

export function renderWithProviders(ui: ReactElement, preloadedState?: PartialRootState) {
	const store = configureStore({
		reducer: {
			...persistedReducer,
		},
		preloadedState: {
			...preloadedState,
		},
		middleware: (getDefaultMiddleware) =>
			getDefaultMiddleware({ serializableCheck: false }).concat(rootMiddleware),
		devTools: process.env.NODE_ENV !== 'production',
	});

	return {
		store,
		...render(<Provider store={store}>{ui}</Provider>),
	};
}
