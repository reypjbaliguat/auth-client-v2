import type { RootState } from '@/core/store';
import { baseApi } from '@/core/store/api';
import { authReducer, type AuthState } from '@/core/store/features/auth';
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
			auth: authReducer,
			[baseApi.reducerPath]: baseApi.reducer,
		},
		middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
		preloadedState: preloadedState as RootState,
	});

	return {
		store,
		...render(<Provider store={store}>{ui}</Provider>),
	};
}
