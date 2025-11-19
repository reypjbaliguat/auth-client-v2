import { type RootState } from "./store";

export const selectAuth = (state: RootState) => state.auth;
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.isAuthenticated;
export const selectRole = (state: RootState) => state.auth.role;
export const selectAuthLoading = (state: RootState) => state.auth.loading;
