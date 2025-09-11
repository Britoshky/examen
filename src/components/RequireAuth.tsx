import { Navigate } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";

// Componente para proteger rutas que requieren autenticación
export default function RequireAuth({ children }: { children: React.ReactNode }) {
  // Usuario autenticado
  const user = useAuthUser();
  // Si el estado de autenticación es indefinido, mostramos nada (loading)
  if (user === undefined) return null;
  // Si no hay usuario, redirigimos al login
  if (!user) return <Navigate to="/login" replace />;
  // Si hay usuario, renderizamos los hijos
  return <>{children}</>;
}
