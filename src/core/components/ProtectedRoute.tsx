import type { JSX } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import {
  selectAuthLoading,
  selectIsAuthenticated,
  selectRole,
} from "../store/authSelectors";

type Props = {
  children: JSX.Element;
  role?: "user" | "admin"; // required role for this route
};

export default function ProtectedRoute({ children, role }: Props) {
  const isAuth = useSelector(selectIsAuthenticated);
  const userRole = useSelector(selectRole);
  const loading = useSelector(selectAuthLoading);

  // Show loading screen if auth is being restored
  if (loading) {
    return <div>Loading authentication...</div>;
  }

  // Not logged in → send to login
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but doesn't have required role → deny access
  if (role && userRole !== role) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
