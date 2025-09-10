import { useEffect, useState } from "react";
import { auth } from "../firebase";

export default function useAuthUser() {
  const [user, setUser] = useState(() => auth.currentUser);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(u => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);
  if (loading) return undefined;
  return user;
}
