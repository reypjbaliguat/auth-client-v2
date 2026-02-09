import type { User } from '@/core/types/user';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface AuthState {
	isAuthenticated: boolean;
	loading: boolean;
	user: User | null;
	step: 'Register' | 'Login' | 'OTP Verification';
	otpEmail: string | null;
	otpTimer: {
		canResend: boolean;
		remainingTime: number; // seconds
		canResendAt: number | null; // Unix timestamp
	};
}

const initialState: AuthState = {
	isAuthenticated: false,
	loading: false, // Changed to false to prevent hydration mismatches
	user: null,
	step: 'Login',
	otpEmail: null,
	otpTimer: {
		canResend: true,
		remainingTime: 0,
		canResendAt: null,
	},
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
			state.otpTimer = {
				canResend: true,
				remainingTime: 0,
				canResendAt: null,
			};
		},
		// Set OTP timer state from server
		setOtpTimer(
			state,
			action: PayloadAction<{ canResend: boolean; remainingTime?: number; canResendAt?: number }>
		) {
			state.otpTimer.canResend = action.payload.canResend;
			state.otpTimer.remainingTime = action.payload.remainingTime || 0;
			state.otpTimer.canResendAt = action.payload.canResendAt || null;
		},
		// Update timer countdown (called by interval)
		updateOtpTimer(state) {
			if (!state.otpTimer.canResend && state.otpTimer.canResendAt) {
				const now = Math.floor(Date.now() / 1000);
				const remaining = state.otpTimer.canResendAt - now;

				if (remaining <= 0) {
					state.otpTimer.canResend = true;
					state.otpTimer.remainingTime = 0;
					state.otpTimer.canResendAt = null;
				} else {
					state.otpTimer.remainingTime = remaining;
				}
			}
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
	setOtpTimer,
	updateOtpTimer,
} = authSlice.actions;

export default authSlice.reducer;
