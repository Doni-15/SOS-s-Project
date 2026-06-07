import { Navigate } from "react-router";

import { PageLoader } from "../../../shared/components/PageLoader";
import { getDashboardPathByRole } from "../utils";
import { useAuth } from "../hooks/useAuth";

export function GuestRoute({ children }) {
  const { user, isAuthenticated, isCheckingSession } = useAuth();

  if (isCheckingSession) {
    return <PageLoader />;
  }

  if (isAuthenticated && user) {
    return <Navigate to={getDashboardPathByRole(user.role)} replace />;
  }

  return children;
}
