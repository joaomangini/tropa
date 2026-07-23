"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const btn =
  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50";

export default function ReportActions({
  id,
  listingId,
}: {
  id: string;
  listingId: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function revisar() {
    setBusy(true);
    const supabase = createClient();
    await supabase.from("reports").update({ status: "revisado" }).eq("id", id);
    setBusy(false);
    router.refresh();
  }

  async function quitarAviso() {
    if (!confirm("¿Quitar el aviso denunciado del sitio?")) return;
    setBusy(true);
    const supabase = createClient();
    await supabase
      .from("listings")
      .update({ moderation: "reprovado" })
      .eq("id", listingId);
    await supabase.from("reports").update({ status: "removido" }).eq("id", id);
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={revisar}
        disabled={busy}
        className={`${btn} border border-crema-2 text-tinta hover:bg-crema-2`}
      >
        Marcar revisado
      </button>
      <button
        onClick={quitarAviso}
        disabled={busy}
        className={`${btn} border border-crema-2 text-tierra hover:bg-tierra/10`}
      >
        Quitar aviso
      </button>
    </div>
  );
}
