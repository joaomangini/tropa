"use client";

import Link from "next/link";
import { useCart, type CartItem } from "@/components/cart/CartProvider";

function whatsappLink(whatsapp: string, lotes: CartItem[]): string {
  const lineas = lotes.map((l) => `• ${l.title} (${l.precio})`).join("\n");
  const texto = encodeURIComponent(
    `Hola, me interesan estos lotes en Tropa:\n${lineas}\n\n¿Siguen disponibles?`
  );
  return `https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${texto}`;
}

export default function Carrito() {
  const { items, remove, clear } = useCart();

  // Agrupa por vendedor (chave = whatsapp + nome).
  const grupos = new Map<
    string,
    { sellerName: string; sellerWhatsapp: string; lotes: CartItem[] }
  >();
  for (const it of items) {
    const key = `${it.sellerWhatsapp}|${it.sellerName}`;
    if (!grupos.has(key)) {
      grupos.set(key, {
        sellerName: it.sellerName,
        sellerWhatsapp: it.sellerWhatsapp,
        lotes: [],
      });
    }
    grupos.get(key)!.lotes.push(it);
  }

  return (
    <section className="mx-auto max-w-3xl px-5 py-12">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-4xl font-bold text-pasto-hondo">
          Tu carrito
        </h1>
        {items.length > 0 && (
          <button
            onClick={clear}
            className="text-sm font-medium text-humo hover:text-tierra"
          >
            Vaciar
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <p className="mt-8 text-humo">
          Tu carrito está vacío.{" "}
          <Link href="/#animales" className="font-semibold text-pasto">
            Mirá los animales
          </Link>
          .
        </p>
      ) : (
        <div className="mt-8 flex flex-col gap-6">
          <p className="text-sm text-humo">
            El contacto con el vendedor es por WhatsApp. Si sumaste lotes de
            varios vendedores, vas a ver un botón para cada uno.
          </p>

          {Array.from(grupos.values()).map((g) => (
            <div
              key={g.sellerWhatsapp + g.sellerName}
              className="rounded-xl border border-crema-2 bg-white p-5"
            >
              <div className="text-xs font-semibold uppercase tracking-widest text-tierra">
                Vendedor
              </div>
              <div className="text-lg font-semibold text-tinta">
                {g.sellerName || "Vendedor"}
              </div>

              <ul className="mt-4 divide-y divide-crema-2 border-y border-crema-2">
                {g.lotes.map((l) => (
                  <li
                    key={l.id}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div>
                      <Link
                        href={`/animal/${l.id}`}
                        className="font-medium text-tinta hover:text-pasto"
                      >
                        {l.title}
                      </Link>
                      <div className="text-sm text-humo">{l.precio}</div>
                    </div>
                    <button
                      onClick={() => remove(l.id)}
                      aria-label="Quitar"
                      className="text-sm text-humo hover:text-tierra"
                    >
                      Quitar
                    </button>
                  </li>
                ))}
              </ul>

              {g.sellerWhatsapp ? (
                <a
                  href={whatsappLink(g.sellerWhatsapp, g.lotes)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#25D366] px-6 py-3 font-semibold text-white transition-transform hover:-translate-y-0.5"
                >
                  💬 Finalizar por WhatsApp ({g.lotes.length}{" "}
                  {g.lotes.length === 1 ? "lote" : "lotes"})
                </a>
              ) : (
                <p className="mt-4 text-sm text-humo">
                  Este vendedor no tiene WhatsApp cargado.
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
