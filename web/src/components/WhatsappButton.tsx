"use client";

import { createClient } from "@/lib/supabase/client";

export default function WhatsappButton({
  whatsapp,
  listingId,
  title,
}: {
  whatsapp: string;
  listingId: string;
  title: string;
}) {
  const numero = whatsapp.replace(/\D/g, "");
  const msg = encodeURIComponent(
    `Hola, vi tu aviso "${title}" en Tropa. ¿Sigue disponible?`
  );
  const url = `https://wa.me/${numero}?text=${msg}`;

  async function handleClick() {
    // Registra a métrica de contato (não bloqueia a abertura do WhatsApp).
    try {
      const supabase = createClient();
      await supabase
        .from("contact_events")
        .insert({ listing_id: listingId, event_type: "whatsapp_click" });
    } catch {
      // ignora falha de métrica
    }
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <button
      onClick={handleClick}
      className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#25D366] px-6 py-3 font-semibold text-white transition-transform hover:-translate-y-0.5"
    >
      <span aria-hidden>💬</span> Hablar por WhatsApp
    </button>
  );
}
