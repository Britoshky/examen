import { useState } from "react";
import ProductList from "../components/ProductList";
import type { ProductItem } from "../components/ProductList";
import CartClass from "../components/CartClass";

interface CartItem {
  id: string;
  name: string;
  quantity: number;
}

export default function Home() {
  const [cart, setCart] = useState<CartItem[]>([]);

  const handleAddToCart = (product: ProductItem) => {
    setCart((prev) => {
      const idx = prev.findIndex((item) => item.id === product.id);
      if (idx !== -1) {
        // Sumar cantidad si ya existe
        return prev.map((item, i) =>
          i === idx ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      // Agregar nuevo producto
      return [...prev, { id: product.id, name: product.name, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
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
