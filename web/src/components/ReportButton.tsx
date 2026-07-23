"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ReportButton({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [estado, setEstado] = useState<"idle" | "enviado">("idle");
  const [busy, setBusy] = useState(false);

  async function denunciar() {
    const motivo = window.prompt(
      "¿Por qué querés denunciar este aviso? (ej: precio falso, estafa, contenido inapropiado)"
    );
    if (!motivo) return;

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
    const { error } = await supabase.from("reports").insert({
      listing_id: listingId,
      reporter_id: user.id,
      reason: motivo,
    });
    setBusy(false);
    if (!error) setEstado("enviado");
  }

  if (estado === "enviado") {
    return (
      <span className="text-xs text-humo">Denuncia enviada. ¡Gracias!</span>
    );
  }

  return (
    <button
      onClick={denunciar}
      disabled={busy}
      className="text-xs text-humo underline transition-colors hover:text-tierra disabled:opacity-50"
    >
      🚩 Denunciar aviso
    </button>
  );
}
