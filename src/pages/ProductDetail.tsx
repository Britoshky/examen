import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import type { ProductItem } from "../components/ProductList";
import { Timestamp } from "firebase/firestore";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductItem | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      setLoading(true);
      const ref = doc(db, "products", id);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        setProduct(null);
      } else {
        setProduct({ id: snap.id, ...snap.data() } as ProductItem);
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="text-center mt-5">Cargando...</div>;
  if (!product) return <div className="alert alert-danger mt-5">Producto no encontrado</div>;

  return (
    <div className="d-flex flex-column align-items-center justify-content-center w-100" style={{ minHeight: '80vh' }}>
      <h2>Detalle del producto</h2>
      <div className="card mx-auto" style={{ maxWidth: 500 }}>
        {product.imageUrl && (
          <img src={product.imageUrl} alt={product.name} className="card-img-top" style={{ objectFit: 'cover', maxHeight: 260 }} />
        )}
        <div className="card-body">
          <h4 className="card-title text-primary">{product.name}</h4>
          <p className="card-text text-muted">{product.description}</p>
          {product.createdAt && (
            <div className="text-end text-secondary small">
              Creado: {product.createdAt instanceof Timestamp ? product.createdAt.toDate().toLocaleString() : String(product.createdAt)}
            </div>
          )}
          <button className="btn btn-outline-secondary mt-3" onClick={() => navigate(-1)}>
            Volver
          </button>
        </div>
      </div>
    </div>
  );
}
