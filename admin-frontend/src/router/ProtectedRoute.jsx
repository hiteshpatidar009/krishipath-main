import { Navigate } from "react-router-dom";
import useAuth from "../context/AuthContext";

export default function ProtectedRoute({ children, role }) {
  const { admin, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  if (!admin) return <Navigate to="/login" />;

  // Role check (superadmin or admin)
  if (role && admin.role !== role) {
    return <Navigate to="/login" />;
  }

  return children;
}
