import { ReactNode } from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { RootState } from "../store/store";

interface CheckAuthProps {
  children: ReactNode;
}

function CheckAuth({ children }: CheckAuthProps) {
  const user = useSelector((state: RootState) => state.user);
  const location = useLocation();

  if (location.pathname === "/" && !user.token) {
    return <Navigate to="/sign-in" replace />;
  }
  if (location.pathname === "/candidate-registration-page" && user.token) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default CheckAuth;
