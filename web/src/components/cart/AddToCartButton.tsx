"use client";

import { useCart, type CartItem } from "./CartProvider";

export default function AddToCartButton({ item }: { item: CartItem }) {
  const { add, remove, has } = useCart();
  const enCarrito = has(item.id);

  return (
    <button
      type="button"
      onClick={() => (enCarrito ? remove(item.id) : add(item))}
      className={`w-full rounded-md px-6 py-3 font-semibold transition-colors ${
        enCarrito
          ? "border border-pasto bg-white text-pasto hover:bg-crema"
          : "bg-ambar text-pasto-hondo hover:brightness-95"
      }`}
    >
      {enCarrito ? "✓ En el carrito — quitar" : "🛒 Agregar al carrito"}
    </button>
  );
}
