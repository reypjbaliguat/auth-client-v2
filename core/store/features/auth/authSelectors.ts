import type { RootState } from '../../index';

export const selectAuth = (state: RootState) => state.auth;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: RootState) => state.auth.loading;
export const selectAuthUser = (state: RootState) => state.auth.user;
export const selectOtpStep = (state: RootState) => state.auth.step;
export const selectOtpEmail = (state: RootState) => state.auth.otpEmail;
export const selectOtpTimer = (state: RootState) => state.auth.otpTimer;
export const selectCanResendOtp = (state: RootState) => state.auth.otpTimer.canResend;
export const selectOtpRemainingTime = (state: RootState) => state.auth.otpTimer.remainingTime;
export const selectForgotPasswordEmail = (state: RootState) => state.auth.forgotPasswordEmail;
export const selectForgotPasswordStep = (state: RootState) => state.auth.forgotPasswordStep;
export const selectIsPasswordToGoogleLinking = (state: RootState) =>
	state.auth.isPasswordToGoogleLinking;
export const selectIsGoogleToPasswordLinking = (state: RootState) =>
	state.auth.isGoogleToPasswordLinking;
