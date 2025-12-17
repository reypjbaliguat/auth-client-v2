"use client";

import { setUnauthenticated } from "@/core/store/authSlice";
import { useAppDispatch } from "@/core/store/hooks";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export function useLogout() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  return () => {
    Cookies.remove("token");
    dispatch(setUnauthenticated());
    router.replace("/sign-in");
  };
}
