import { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Navigate } from "react-router-dom";

export const ProtectedRoute = ({
  children,
  allowedRoles,
}: {
  children: ReactNode;
  allowedRoles?: string[];
}) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/auth" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <div>Unauthorized</div>;

  return <>{children}</>;
};
