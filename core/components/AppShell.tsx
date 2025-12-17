"use client";

import { hydrateAuthFromCookie } from "@/core/utils/hydrateAuthFromCookie";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();

  useEffect(() => {
    hydrateAuthFromCookie(dispatch);
  }, [dispatch]);

  return (
    <>
      <main>{children}</main>
    </>
  );
}
