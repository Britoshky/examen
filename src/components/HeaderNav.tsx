import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";

export default function HeaderNav() {
  const [user, setUser] = useState(auth.currentUser);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(u => setUser(u));
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <nav className="mb-4 navbar navbar-expand navbar-light bg-light rounded justify-content-center">
      <ul className="navbar-nav flex-row gap-3 align-items-center">
        <li className="nav-item d-flex align-items-center"><Link className="nav-link" to="/">Inicio</Link></li>
        {user && (
          <li className="nav-item d-flex align-items-center"><Link className="nav-link" to="/nuevo-producto">Nuevo Producto</Link></li>
        )}
        {user ? (
          <li className="nav-item d-flex align-items-center">
            <button className="nav-link btn btn-link text-danger m-0 p-0" style={{fontWeight: 500, height: '100%'}} onClick={handleLogout}>
              Cerrar sesión
            </button>
          </li>
        ) : (
          <li className="nav-item d-flex align-items-center"><Link className="nav-link" to="/login">Login</Link></li>
        )}
      </ul>
    </nav>
  );
}
