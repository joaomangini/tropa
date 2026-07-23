"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Adv = { id: string; name: string };

const inputCls =
  "rounded-md border border-crema-2 bg-white px-3 py-2 text-base w-full";

const POSICIONES = [
  { v: "home_top", l: "Topo da home" },
  { v: "home_showcase", l: "Fila de patrocinadores (home)" },
  { v: "feed_inline", l: "Dentro do feed" },
  { v: "search_sidebar", l: "Lateral da busca" },
  { v: "detail_footer", l: "Rodapé do detalhe" },
];

export default function CampaignForm({ advertisers }: { advertisers: Adv[] }) {
  const router = useRouter();
  const [f, setF] = useState({
    advertiser_id: "",
    name: "",
    position: "home_top",
    link_url: "",
    starts_at: "",
    ends_at: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(k: string, v: string) {
    setF((s) => ({ ...s, [k]: v }));
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!file) {
      setError("Subí la imagen del banner.");
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

    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/banners/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("listing-photos")
      .upload(path, file, { contentType: file.type || "image/jpeg" });
    if (upErr) {
      setBusy(false);
      setError(`No se pudo subir la imagen: ${upErr.message}`);
      return;
    }

    const { error: dbErr } = await supabase.from("banner_campaigns").insert({
      advertiser_id: f.advertiser_id,
      name: f.name,
      position: f.position,
      image_path: path,
      link_url: f.link_url || null,
      starts_at: f.starts_at ? new Date(f.starts_at).toISOString() : new Date().toISOString(),
      ends_at: f.ends_at ? new Date(f.ends_at).toISOString() : null,
      is_active: true,
    });
    setBusy(false);
    if (dbErr) {
      setError(dbErr.message);
      return;
    }
    setF({
      advertiser_id: "",
      name: "",
      position: "home_top",
      link_url: "",
      starts_at: "",
      ends_at: "",
    });
    setFile(null);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-3 flex flex-col gap-3">
      <select
        required
        value={f.advertiser_id}
        onChange={(e) => set("advertiser_id", e.target.value)}
        className={inputCls}
      >
        <option value="">Elegí el anunciante…</option>
        {advertisers.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </select>

      <input
        required
        placeholder="Nombre de la campaña"
        value={f.name}
        onChange={(e) => set("name", e.target.value)}
        className={inputCls}
      />

      <select
        value={f.position}
        onChange={(e) => set("position", e.target.value)}
        className={inputCls}
      >
        {POSICIONES.map((p) => (
          <option key={p.v} value={p.v}>
            {p.l}
          </option>
        ))}
      </select>

      <input
        placeholder="Link de destino (https://…)"
        value={f.link_url}
        onChange={(e) => set("link_url", e.target.value)}
        className={inputCls}
      />

      <label className="flex flex-col gap-1 text-sm text-humo">
        Imagen del banner
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="text-sm"
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-xs text-humo">
          Inicio
          <input
            type="date"
            value={f.starts_at}
            onChange={(e) => set("starts_at", e.target.value)}
            className={inputCls}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-humo">
          Fin (opcional)
          <input
            type="date"
            value={f.ends_at}
            onChange={(e) => set("ends_at", e.target.value)}
            className={inputCls}
          />
        </label>
      </div>

      {error && <p className="text-sm text-tierra">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className="rounded-md bg-pasto px-5 py-2 font-semibold text-crema hover:bg-pasto-hondo disabled:opacity-60"
      >
        {busy ? "Publicando…" : "Crear campaña"}
      </button>
    </form>
  );
}
