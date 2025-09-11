
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";

import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ProductDetail from "./pages/ProductDetail";
import HeaderNav from "./components/HeaderNav";
import RequireAuth from "./components/RequireAuth";
import ProductForm from "./components/ProductForm";

// Componente principal de la aplicación
function App() {
  return (
    <div className="container-fluid p-0 min-vh-100 d-flex flex-column" style={{minHeight: '100vh', padding: 0}}>
  <ToastContainer position="bottom-right" theme="colored" />
      <HeaderNav />
          <main className="flex-grow-1 d-flex flex-column align-items-center justify-content-center w-100 h-100" style={{width: '100vw', height: '100vh', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Routes>
          <Route path="/" element={
            <RequireAuth>
              <Home />
            </RequireAuth>
          } />
          <Route path="/nuevo-producto" element={
            <RequireAuth>
              <div className="d-flex flex-column align-items-center justify-content-center w-100" style={{minHeight: '80vh'}}>
                <h2>Nuevo producto</h2>
                <div className="w-100" style={{maxWidth: 500}}>
                  <ProductForm />
                </div>
              </div>
            </RequireAuth>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/producto/:id" element={<ProductDetail />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
