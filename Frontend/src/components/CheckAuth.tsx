import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

interface CheckAuthProps {
  isAuthenticated: boolean;
  children: ReactNode;
}

function CheckAuth({ isAuthenticated, children }: CheckAuthProps) {
  const location = useLocation();

  if (location.pathname === "/" && !isAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }
  if (location.pathname === "/candidate-registration-page" && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default CheckAuth;
