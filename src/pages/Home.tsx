
import { useEffect, useState, useCallback } from "react";
import ProductList from "../components/ProductList";
import type { ProductItem } from "../components/ProductList";
import CartClass from "../components/CartClass";
import useAuthUser from "../hooks/useAuthUser";
import { db } from "../firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";

interface CartItem {
  id: string;
  name: string;
  quantity: number;
}

export default function Home() {
  const user = useAuthUser();
  const [cart, setCart] = useState<CartItem[]>([]);

  // Sincronizar carrito en tiempo real desde Firestore
  useEffect(() => {
    if (!user) return;
    const cartRef = doc(db, "carts", user.uid);
    const unsub = onSnapshot(cartRef, (snap) => {
      const data = snap.data();
      setCart(data?.items || []);
    });
    return () => unsub();
  }, [user]);

  // Guardar carrito en Firestore
  const saveCart = useCallback(
    async (newCart: CartItem[]) => {
      if (!user) return;
      const cartRef = doc(db, "carts", user.uid);
      await setDoc(cartRef, { items: newCart }, { merge: true });
    },
    [user]
  );

  const handleAddToCart = (product: ProductItem) => {
    setCart((prev) => {
      const idx = prev.findIndex((item) => item.id === product.id);
      let updated;
      if (idx !== -1) {
        updated = prev.map((item, i) =>
          i === idx ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        updated = [...prev, { id: product.id, name: product.name, quantity: 1 }];
      }
      saveCart(updated);
      return updated;
    });
  };

  const handleRemoveFromCart = (id: string) => {
    setCart((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      saveCart(updated);
      return updated;
    });
  };

  return (
    <div className="d-flex flex-column align-items-center justify-content-center w-100 h-100" style={{minHeight: '80vh', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <h2 className="text-center w-100">Inicio</h2>
      <div className="d-flex flex-column align-items-center w-100">
        <div className="mx-auto" style={{maxWidth: 600}}>
          <ProductList onAddToCart={handleAddToCart} />
        </div>
        <div className="mx-auto mt-3" style={{maxWidth: 500}}>
          <CartClass items={cart} onRemove={handleRemoveFromCart} />
        </div>
      </div>
    </div>
  );
}
