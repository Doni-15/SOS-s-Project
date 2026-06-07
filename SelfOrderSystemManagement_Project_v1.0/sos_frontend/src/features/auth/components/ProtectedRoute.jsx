import { Navigate, useLocation } from "react-router";

import { ROUTES } from "../../../shared/constants/appConfig";
import { PageLoader } from "../../../shared/components/PageLoader";
import { useAuth } from "../hooks/useAuth";

export function ProtectedRoute({ children, allowedRoles }) {
  const location = useLocation();
  const { user, isAuthenticated, isCheckingSession } = useAuth();

  if (isCheckingSession) {
    return <PageLoader />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={ROUTES.login} replace state={{ from: location }} />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROUTES.unauthorized} replace />;
  }

  return children;
}
