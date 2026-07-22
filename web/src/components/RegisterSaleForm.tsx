"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const inputCls =
  "rounded-md border border-crema-2 bg-white px-3 py-2 text-base w-full";

export default function RegisterSaleForm({
  listingId,
  maxRemaining,
}: {
  listingId: string;
  maxRemaining: number;
}) {
  const router = useRouter();
  const [quantity, setQuantity] = useState("");
  const [buyer, setBuyer] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const q = Number(quantity);
    if (!q || q < 1) {
      setError("Poné una cantidad válida.");
      return;
    }
    if (q > maxRemaining) {
      setError(`Solo quedan ${maxRemaining} cabezas en este lote.`);
      return;
    }

    setBusy(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setBusy(false);
      router.push("/login");
      return;
    }

    const { error } = await supabase.from("sales").insert({
      listing_id: listingId,
      seller_id: user.id,
      quantity: q,
      buyer_name: buyer || null,
      buyer_phone: phone || null,
    });
    setBusy(false);

    if (error) {
      setError("No se pudo registrar la venta.");
      return;
    }

    setQuantity("");
    setBuyer("");
    setPhone("");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-5 rounded-lg border border-crema-2 bg-crema/40 p-4"
    >
      <div className="text-sm font-semibold text-tinta">Registrar una venta</div>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-xs font-medium text-humo">
          Cantidad
          <input
            type="number"
            min={1}
            max={maxRemaining}
            required
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className={inputCls}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-humo">
          Comprador
          <input
            type="text"
            placeholder="Nombre"
            value={buyer}
            onChange={(e) => setBuyer(e.target.value)}
            className={inputCls}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-humo">
          Teléfono (opcional)
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputCls}
          />
        </label>
      </div>

      {error && <p className="mt-2 text-sm text-tierra">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className="mt-3 rounded-md bg-pasto px-5 py-2 text-sm font-semibold text-crema transition-colors hover:bg-pasto-hondo disabled:opacity-60"
      >
        {busy ? "Guardando…" : "Registrar venta"}
      </button>
    </form>
  );
}
