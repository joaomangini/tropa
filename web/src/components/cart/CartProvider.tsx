"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type CartItem = {
  id: string; // id do anúncio
  title: string;
  precio: string; // texto já formatado, ex: "USD 55 / cabeza"
  sellerName: string;
  sellerWhatsapp: string;
};

type CartCtx = {
  items: CartItem[];
  add: (item: CartItem) => void;
  remove: (id: string) => void;
  clear: () => void;
  has: (id: string) => boolean;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "tropa_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Carrega do navegador na primeira renderização.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignora
    }
    setLoaded(true);
  }, []);

  // Salva sempre que muda.
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      // ignora
    }
  }, [items, loaded]);

  function add(item: CartItem) {
    setItems((prev) =>
      prev.some((p) => p.id === item.id) ? prev : [...prev, item]
    );
  }
  function remove(id: string) {
    setItems((prev) => prev.filter((p) => p.id !== id));
  }
  function clear() {
    setItems([]);
  }
  function has(id: string) {
    return items.some((p) => p.id === id);
  }

  return (
    <Ctx.Provider value={{ items, add, remove, clear, has }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart precisa estar dentro de CartProvider");
  return c;
}
