import type { User } from '@/core/types/user';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface AuthState {
	isAuthenticated: boolean;
	loading: boolean;
	user: User | null;
}

const initialState: AuthState = {
	isAuthenticated: false,
	loading: false, // Changed to false to prevent hydration mismatches
	user: null,
};

const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		setAuthenticated(state, action: PayloadAction<{ user?: User } | undefined>) {
			console.log(action.payload, 'here motha fucker');
			state.isAuthenticated = true;
			state.loading = false;
			state.user = action.payload?.user ?? null;
		},
		setUnauthenticated(state) {
			state.isAuthenticated = false;
			state.loading = false;
			state.user = null;
		},
		startAuthCheck(state) {
			state.loading = true;
		},
		finishAuthCheck(state) {
			state.loading = false;
		},
	},
});

export const { setAuthenticated, setUnauthenticated, startAuthCheck, finishAuthCheck } =
	authSlice.actions;

export default authSlice.reducer;
