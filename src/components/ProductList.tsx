import React, { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, doc, deleteDoc, where } from "firebase/firestore";
import { db, storage } from "../firebase";
import { ref as storageRef, deleteObject } from "firebase/storage";
import useAuthUser from "../hooks/useAuthUser";
import { toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";

export interface ProductItem {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  createdAt?: any;
}

interface ProductListProps {
  onAddToCart?: (product: ProductItem) => void;
}

const ProductList: React.FC<ProductListProps> = ({ onAddToCart }) => {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const user = useAuthUser();

  useEffect(() => {
    if (!user) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const q = query(collection(db, "products"), where("uid", "==", user.uid), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const prods = snap.docs.map((d) => ({ id: d.id, ...d.data() } as ProductItem));
      setProducts(prods);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    toast.info("Eliminando producto...", { autoClose: 1200, toastId: "deleting-product" });
    try {
      // Buscar el producto para obtener la imageUrl
      const prod = products.find((p) => p.id === id);
      if (prod && prod.imageUrl) {
        try {
          // Extraer la ruta relativa de Storage desde la URL
          const url = new URL(prod.imageUrl);
          const pathMatch = url.pathname.match(/\/o\/(.+)$/);
          if (pathMatch && pathMatch[1]) {
            const path = decodeURIComponent(pathMatch[1]);
            const imgRef = storageRef(storage, path);
            await deleteObject(imgRef);
          }
        } catch (e) {
          // Si falla la eliminación de la imagen, continuar con el producto
        }
      }
      await deleteDoc(doc(db, "products", id));
      toast.success("Producto eliminado", { autoClose: 2000 });
    } catch {
      toast.error("Error al eliminar el producto", { autoClose: 2000 });
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <div className="text-center">Cargando productos...</div>;
  if (products.length === 0) return <div className="alert alert-info">No hay productos.</div>;

  return (
    <div className="row g-4 mb-3">
      {products.map((p) => (
        <div key={p.id} className="col-12 col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm border-0">
            {p.imageUrl && (
              <img src={p.imageUrl} alt={p.name} className="card-img-top" style={{height: 180, objectFit: 'cover', borderTopLeftRadius: '0.5rem', borderTopRightRadius: '0.5rem'}} />
            )}
            <div className="card-body d-flex flex-column">
              <h5 className="card-title mb-1 text-primary">{p.name}</h5>
              <p className="card-text text-muted small flex-grow-1">{p.description}</p>
              <div className="d-flex gap-2 mt-2">
                {onAddToCart && (
                  <button className="btn btn-outline-success btn-sm flex-fill" onClick={() => onAddToCart(p)}>
                    <i className="bi bi-cart-plus me-1"></i>Agregar al carrito
                  </button>
                )}
                <button className="btn btn-outline-danger btn-sm flex-fill" onClick={() => handleDelete(p.id)} disabled={deletingId === p.id}>
                  {deletingId === p.id ? <span className="spinner-border spinner-border-sm me-1"></span> : <i className="bi bi-trash me-1"></i>}
                  {deletingId === p.id ? "Eliminando..." : "Eliminar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductList;
