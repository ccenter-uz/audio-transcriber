import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./auth.tsx";
import { UserRole } from "./auth";

interface RequireAuthProps {
  children: React.ReactNode;
  role?: UserRole | UserRole[];
}

/**
 * Route guard that only allows access to authenticated users with required roles
 * Redirects to login page if not authenticated
 */
export const RequireAuth = ({ children, role }: RequireAuthProps) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Allow access if no role is required
  if (!role) {
    return <>{children}</>;
  }

  // At this point we know user exists since isAuthenticated is true
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has the required role
  const hasRequiredRole = Array.isArray(role)
    ? role.includes(user.role)
    : user.role === role;

  if (!hasRequiredRole) {
    // Redirect to default page based on user's role
    const redirectPath = user.role === "admin" ? "/dashboard" : "/transcribe";
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};
