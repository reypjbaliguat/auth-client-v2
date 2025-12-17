import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface User {
  id: string;
  email: string;
  // add fields as needed
}

export interface AuthState {
  isAuthenticated: boolean;
  loading: boolean;
  user: User | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  loading: true, // start "checking"
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthenticated(
      state,
      action: PayloadAction<{ user?: User } | undefined>
    ) {
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

export const {
  setAuthenticated,
  setUnauthenticated,
  startAuthCheck,
  finishAuthCheck,
} = authSlice.actions;

export default authSlice.reducer;
