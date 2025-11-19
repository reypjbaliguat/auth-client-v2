import { configureStore } from "@reduxjs/toolkit";
import { type ReactNode } from "react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import authReducer from "../features/auth/authSlice";

export function renderWithStore(
  ui: ReactNode,
  preloadedState?: Partial<ReturnType<typeof authReducer>>
) {
  const store = configureStore({
    reducer: authReducer,
    preloadedState: preloadedState as ReturnType<typeof authReducer>,
  });

  return {
    store,
    ui: (
      <Provider store={store}>
        <MemoryRouter>{ui}</MemoryRouter>
      </Provider>
    ),
  };
}
