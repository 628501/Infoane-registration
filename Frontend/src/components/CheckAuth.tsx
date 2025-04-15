import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/GlobalContext"; 

interface CheckAuthProps {
  children: ReactNode;
}

function CheckAuth({ children }: CheckAuthProps) {
  const location = useLocation();
  const { authorized } = useAuth();
  const isAuthenticated = !!authorized;
  if (location.pathname === "/candidate-list" && !isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  if (location.pathname === "/candidate-registration-page" && isAuthenticated) {
    return <Navigate to="/candidate-list" replace />;
  }
  if (location.pathname === "/" && isAuthenticated) {
    return <Navigate to="/candidate-list" replace />;
  }
  return <>{children}</>;
}

export default CheckAuth;
