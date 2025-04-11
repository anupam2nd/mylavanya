
import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // While checking authentication status, show nothing or a loading indicator
  if (loading) {
    return <div className="p-8 flex justify-center items-center">Loading...</div>;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location.pathname }} replace />;
  }

  // If roles are specified and user's role is not included, redirect to their appropriate dashboard
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect based on specific role
    if (user.role === 'superadmin' || user.role === 'controller') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user.role === 'artist') {
      return <Navigate to="/artist/dashboard" replace />;
    } else {
      return <Navigate to="/user/dashboard" replace />;
    }
  }

  // If authenticated and authorized (or no specific roles required), render the children
  return <>{children}</>;
};

export default ProtectedRoute;
