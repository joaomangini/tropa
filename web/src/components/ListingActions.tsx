"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const btn =
  "rounded-md border border-crema-2 px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50";

export default function ListingActions({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function cambiarEstado(nuevo: string) {
    setBusy(true);
    const supabase = createClient();
    await supabase.from("listings").update({ status: nuevo }).eq("id", id);
    setBusy(false);
    router.refresh();
  }

  async function eliminar() {
    if (!confirm("¿Eliminar este aviso? No se puede deshacer.")) return;
    setBusy(true);
    const supabase = createClient();
    await supabase.from("listings").delete().eq("id", id);
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href={`/animal/${id}/editar`}
        className={`${btn} text-tinta hover:bg-crema-2`}
      >
        Editar
      </Link>

      {status === "ativo" && (
        <button
          onClick={() => cambiarEstado("pausado")}
          disabled={busy}
          className={`${btn} text-tinta hover:bg-crema-2`}
        >
          Pausar
        </button>
      )}

      {(status === "pausado" || status === "vendido") && (
        <button
          onClick={() => cambiarEstado("ativo")}
          disabled={busy}
          className={`${btn} text-pasto hover:bg-crema-2`}
        >
          Reactivar
        </button>
      )}

      {status !== "vendido" && (
        <button
          onClick={() => cambiarEstado("vendido")}
          disabled={busy}
          className={`${btn} text-tinta hover:bg-crema-2`}
        >
          Marcar vendido
        </button>
      )}

      <button
        onClick={eliminar}
        disabled={busy}
        className={`${btn} text-tierra hover:bg-tierra/10`}
      >
        Eliminar
      </button>
    </div>
  );
}
