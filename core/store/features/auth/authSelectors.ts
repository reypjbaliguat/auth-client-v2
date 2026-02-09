import type { RootState } from '../../index';

export const selectAuth = (state: RootState) => state.auth;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: RootState) => state.auth.loading;
export const selectAuthUser = (state: RootState) => state.auth.user;
export const selectOtpStep = (state: RootState) => state.auth.step;
export const selectOtpEmail = (state: RootState) => state.auth.otpEmail;
