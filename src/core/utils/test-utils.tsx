import { configureStore } from "@reduxjs/toolkit";
import { type ReactNode } from "react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { rootReducer, type RootState } from "../store/store";

export function renderWithStore(
  ui: ReactNode,
  preloadedState?: Partial<RootState>
) {
  const store = configureStore({
    reducer: rootReducer, // <-- Use your root reducer
    preloadedState,
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
