import { useEffect, useState } from "react";
import { auth } from "../firebase";

export default function useAuthUser() {
  // Estado del usuario y carga inicial
  const [user, setUser] = useState(() => auth.currentUser);
  // Manejar estado de carga para evitar flicker
  const [loading, setLoading] = useState(true);
  // Escuchar cambios en el estado de autenticación
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(u => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);
  // Retornar usuario o undefined si está cargando
  if (loading) return undefined;
  // Retornar usuario autenticado o null si no hay sesión
  return user;
}
