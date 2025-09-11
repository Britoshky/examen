
import { Link } from "react-router-dom";

import { collection, deleteDoc, doc, onSnapshot, orderBy, query, where, getDocs, updateDoc, type Timestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import useAuthUser from "../hooks/useAuthUser";
import { db } from "../firebase";
import { deleteObject, ref as storageRef } from "firebase/storage";
import { storage } from "../firebase";
import { toast } from "react-toastify";

// Estructura de un producto
export interface ProductItem {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  createdAt?: Timestamp;
}

// Props del componente
interface ProductListProps {
  onAddToCart?: (product: ProductItem) => void;
}

// Componente para listar productos
const ProductList: React.FC<ProductListProps> = ({ onAddToCart }) => {
  // Estado de productos, carga y eliminación
  const [products, setProducts] = useState<ProductItem[]>([]);
  // Estado de carga
  const [loading, setLoading] = useState(true);
  // Estado de eliminación
  const [deletingId, setDeletingId] = useState<string | null>(null);
  // Usuario autenticado
  const user = useAuthUser();

  // Cargar productos del usuario en tiempo real
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

  // Manejar eliminación de producto
  const handleDelete = async (id: string) => {
    setDeletingId(id);
    toast.info("Eliminando producto...", { autoClose: 1200, toastId: "deleting-product" });
    try {
      const prod = products.find((p: ProductItem) => p.id === id);
      if (prod && prod.imageUrl) {
        try {
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

      // Eliminar el producto de todos los carritos (carts)
      const cartsSnapshot = await getDocs(collection(db, "carts"));
      const updatePromises: Promise<any>[] = [];
      cartsSnapshot.forEach((cartDoc) => {
        const items = cartDoc.data().items || [];
        const filtered = items.filter((item: { id: string }) => item.id !== id);
        if (filtered.length !== items.length) {
          updatePromises.push(updateDoc(doc(db, "carts", cartDoc.id), { items: filtered }));
        }
      });
      await Promise.all(updatePromises);

      toast.success("Producto eliminado", { autoClose: 2000 });
    } catch {
      toast.error("Error al eliminar el producto", { autoClose: 2000 });
    } finally {
      setDeletingId(null);
    }
  };

  // Renderizar lista de productos
  if (loading) return <div className="text-center">Cargando productos...</div>;
  // Manejar estado vacío
  if (products.length === 0) return <div className="alert alert-info">No hay productos.</div>;

  // Ajustar diseño según número de productos
  const isSingle = products.length === 1;
  // Manejar caso de dos o tres productos
  const isDoubleOrTriple = products.length === 2 || products.length === 3;
  // Renderizar productos
  return (
    <div className="row g-4 mb-3 justify-content-center">
      {products.map((p: ProductItem) => (
        <div
          key={p.id}
          className={isSingle ? "col-12 d-flex align-items-stretch justify-content-center" : "col-12 col-sm-6 col-lg-4 d-flex align-items-stretch justify-content-center"}
        >
          <div
            className="card h-100 shadow-sm border-0 w-100"
            style={{
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              maxWidth: isSingle ? '100%' : isDoubleOrTriple ? '1100px' : '900px',
              width: '100%',
            }}
          >
            {p.imageUrl && (
              <Link to={`/producto/${p.id}`} style={{ textDecoration: 'none' }}>
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="card-img-top"
                  style={{
                    height: 220,
                    objectFit: 'cover',
                    borderTopLeftRadius: '0.5rem',
                    borderTopRightRadius: '0.5rem',
                    width: '100%',
                    maxHeight: '35vw',
                  }}
                />
              </Link>
            )}
            <div className="card-body d-flex flex-column" style={{ minHeight: 0, flex: 1 }}>
              <h5
                className="card-title mb-2 text-primary text-truncate"
                style={{ fontSize: 'clamp(1.1rem, 2vw, 1.4rem)', maxWidth: '100%' }}
                title={p.name}
              >
                <Link to={`/producto/${p.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                  {p.name}
                </Link>
              </h5>
              <p
                className="card-text text-muted flex-grow-1"
                style={{
                  fontSize: 'clamp(0.95rem, 1.5vw, 1.1rem)',
                  maxHeight: 80,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-line',
                }}
                title={p.description}
              >
                {p.description}
              </p>
              <div className="d-flex gap-2 mt-2 flex-wrap">
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
