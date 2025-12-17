import { Dispatch } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import { setAuthenticated, setUnauthenticated } from "../store/authSlice";

export const hydrateAuthFromCookie = (dispatch: Dispatch) => {
  const token = Cookies.get("token");

  if (token) {
    dispatch(setAuthenticated());
  } else {
    dispatch(setUnauthenticated());
  }
};
