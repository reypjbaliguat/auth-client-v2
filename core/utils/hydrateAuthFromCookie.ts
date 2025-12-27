import { Dispatch } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';
import type { RootState } from '../store';
import { finishAuthCheck, setAuthenticated, setUnauthenticated } from '../store/authSlice';

export const hydrateAuthFromCookie = (dispatch: Dispatch, getState?: () => RootState) => {
	// Only hydrate if we don't have persisted user data
	// This prevents overriding redux-persist restored state
	const currentState = getState?.();
	const hasPersistedAuth = currentState?.auth?.user !== null;

	if (hasPersistedAuth) {
		// We already have persisted auth data, don't override it
		// But ensure loading is set to false
		dispatch(finishAuthCheck());
		return;
	}

	const token = Cookies.get('token');

	if (token) {
		dispatch(setAuthenticated());
	} else {
		dispatch(setUnauthenticated());
	}
};
