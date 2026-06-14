import { Loader2 } from "lucide-react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

function ProtectedRoute({ allowedRoles, children }) {
  const location = useLocation();
  const { loading, role, user } = useAuth();

  if (loading) {
    return (
      <div className="page-container flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
          Loading your workspace...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(role)) {
    return <Navigate to={role === "customer" ? "/customer" : "/dashboard"} replace />;
  }

  return children;
}

export default ProtectedRoute;
