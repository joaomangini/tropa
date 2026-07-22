"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";

export default function CartButton() {
  const { items } = useCart();

  return (
    <Link
      href="/carrito"
      aria-label="Carrito"
      className="relative grid h-9 w-9 place-items-center rounded-md text-xl transition-colors hover:bg-crema-2"
    >
      🛒
      {items.length > 0 && (
        <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-tierra px-1 text-[11px] font-bold text-white tabular-nums">
          {items.length}
        </span>
      )}
    </Link>
  );
}
