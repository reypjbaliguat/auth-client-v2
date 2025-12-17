"use client";

import AppShell from "@/core/components/AppShell";
import { store } from "@/core/store";
import { Provider } from "react-redux";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AppShell>{children}</AppShell>
    </Provider>
  );
}
