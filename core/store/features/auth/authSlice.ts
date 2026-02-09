import type { User } from '@/core/types/user';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface AuthState {
	isAuthenticated: boolean;
	loading: boolean;
	user: User | null;
	step: 'Register' | 'Login' | 'OTP Verification';
	otpEmail: string | null;
}

const initialState: AuthState = {
	isAuthenticated: false,
	loading: false, // Changed to false to prevent hydration mismatches
	user: null,
	step: 'Login',
	otpEmail: null,
};

const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		setAuthenticated(state, action: PayloadAction<{ user?: User } | undefined>) {
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
		setOtpStep(
			state,
			action: PayloadAction<{ step: 'Login' | 'Register' | 'OTP Verification'; email?: string }>
		) {
			state.step = action.payload.step;
			if (action.payload.email) {
				state.otpEmail = action.payload.email;
			}
		},
		resetOtpStep(state) {
			state.step = 'Register';
			state.otpEmail = null;
		},
	},
});

export const {
	setAuthenticated,
	setUnauthenticated,
	startAuthCheck,
	finishAuthCheck,
	setOtpStep,
	resetOtpStep,
} = authSlice.actions;

export default authSlice.reducer;
