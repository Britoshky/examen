import { Navigate } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const user = useAuthUser();
  if (user === undefined) return null; // loading
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
