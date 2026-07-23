"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const btn =
  "rounded-md px-3 py-1.5 text-sm font-semibold transition-colors disabled:opacity-50";

export default function ModerationActions({
  id,
  sellerId,
}: {
  id: string;
  sellerId: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function moderar(valor: "aprovado" | "reprovado") {
    setBusy(true);
    const supabase = createClient();
    await supabase.from("listings").update({ moderation: valor }).eq("id", id);
    setBusy(false);
    router.refresh();
  }

  async function banir() {
    if (!confirm("¿Banear a este vendedor? No podrá publicar más avisos."))
      return;
    setBusy(true);
    const supabase = createClient();
    await supabase
      .from("profiles")
      .update({ is_banned: true })
      .eq("id", sellerId);
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => moderar("aprovado")}
        disabled={busy}
        className={`${btn} bg-pasto text-crema hover:bg-pasto-hondo`}
      >
        Aprobar
      </button>
      <button
        onClick={() => moderar("reprovado")}
        disabled={busy}
        className={`${btn} border border-crema-2 text-tinta hover:bg-crema-2`}
      >
        Rechazar
      </button>
      <button
        onClick={banir}
        disabled={busy}
        className={`${btn} border border-crema-2 text-tierra hover:bg-tierra/10`}
      >
        Banear vendedor
      </button>
    </div>
  );
}
