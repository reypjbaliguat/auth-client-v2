import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type UserRole = "user" | "admin";

/**
 * LocalStorage shim (always valid).
 * Prevents tests and SSR from crashing.
 */
const storageShim = {
  getItem: (_key: string): string | null => null,
  setItem: (_key: string, _value: string) => {},
  removeItem: (_key: string) => {},
};

const safeLocalStorage =
  typeof window !== "undefined" && window.localStorage
    ? window.localStorage
    : storageShim;

type AuthState = {
  isAuthenticated: boolean;
  token: string | null;
  role: UserRole | null;
  loading: boolean;
};

const savedToken = safeLocalStorage.getItem("token");
const savedRole = safeLocalStorage.getItem("role") as UserRole | null;

const initialState: AuthState = {
  isAuthenticated: !!savedToken,
  token: savedToken,
  role: savedRole,
  loading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    startLoading(state) {
      state.loading = true;
    },
    stopLoading(state) {
      state.loading = false;
    },
    login(state, action: PayloadAction<{ token: string; role: UserRole }>) {
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.role = action.payload.role;

      safeLocalStorage.setItem("token", action.payload.token);
      safeLocalStorage.setItem("role", action.payload.role);
    },
    logout(state) {
      state.isAuthenticated = false;
      state.token = null;
      state.role = null;

      safeLocalStorage.removeItem("token");
      safeLocalStorage.removeItem("role");
    },
  },
});

export const { login, logout, startLoading, stopLoading } = authSlice.actions;

export default authSlice.reducer;
