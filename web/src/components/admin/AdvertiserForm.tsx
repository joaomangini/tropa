"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const inputCls =
  "rounded-md border border-crema-2 bg-white px-3 py-2 text-base w-full";

export default function AdvertiserForm() {
  const router = useRouter();
  const [f, setF] = useState({
    name: "",
    contact_email: "",
    contact_phone: "",
    website: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(k: string, v: string) {
    setF((s) => ({ ...s, [k]: v }));
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.from("advertisers").insert({
      name: f.name,
      contact_email: f.contact_email || null,
      contact_phone: f.contact_phone || null,
      website: f.website || null,
    });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setF({ name: "", contact_email: "", contact_phone: "", website: "" });
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-3 flex flex-col gap-3">
      <input
        required
        placeholder="Nombre de la empresa"
        value={f.name}
        onChange={(e) => set("name", e.target.value)}
        className={inputCls}
      />
      <input
        type="email"
        placeholder="Email de contacto"
        value={f.contact_email}
        onChange={(e) => set("contact_email", e.target.value)}
        className={inputCls}
      />
      <input
        placeholder="Teléfono"
        value={f.contact_phone}
        onChange={(e) => set("contact_phone", e.target.value)}
        className={inputCls}
      />
      <input
        placeholder="Sitio web (https://…)"
        value={f.website}
        onChange={(e) => set("website", e.target.value)}
        className={inputCls}
      />
      {error && <p className="text-sm text-tierra">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="rounded-md bg-pasto px-5 py-2 font-semibold text-crema hover:bg-pasto-hondo disabled:opacity-60"
      >
        {busy ? "Guardando…" : "Agregar anunciante"}
      </button>
    </form>
  );
}
