"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Opcion = { id: number; nombre: string };

export type ListingInitial = {
  id?: string;
  title?: string;
  category_id?: number | string;
  breed_id?: number | string | null;
  head_count?: number | string;
  avg_weight_kg?: number | string | null;
  avg_age_months?: number | string | null;
  price?: number | string;
  price_type?: string;
  currency?: string;
  city?: string | null;
  department?: string | null;
  description?: string | null;
};

const inputCls =
  "rounded-md border border-crema-2 bg-white px-3 py-2 text-base w-full";

function str(v: unknown): string {
  return v === null || v === undefined ? "" : String(v);
}

// Redimensiona a imagem no navegador (máx 1280px, JPEG) para subir mais leve.
async function compressImage(file: File): Promise<Blob> {
  const img = await createImageBitmap(file);
  const maxW = 1280;
  const scale = Math.min(1, maxW / img.width);
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("sin contexto");
  ctx.drawImage(img, 0, 0, w, h);
  return await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("sin blob"))),
      "image/jpeg",
      0.8
    )
  );
}

// Retorna null em caso de sucesso, ou a mensagem do primeiro erro.
async function uploadPhotos(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  listingId: string,
  files: File[]
): Promise<string | null> {
  for (let i = 0; i < files.length; i++) {
    let blob: Blob = files[i];
    let ext = "jpg";
    try {
      blob = await compressImage(files[i]);
    } catch {
      blob = files[i];
      ext = files[i].name.split(".").pop() || "jpg";
    }
    const path = `${userId}/${listingId}/${Date.now()}-${i}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("listing-photos")
      .upload(path, blob, { contentType: blob.type || "image/jpeg" });
    if (upErr) return upErr.message;
    const { error: dbErr } = await supabase
      .from("listing_photos")
      .insert({ listing_id: listingId, storage_path: path, sort_order: i });
    if (dbErr) return dbErr.message;
  }
  return null;
}

export default function ListingForm({
  categorias,
  razas,
  mode,
  initial,
}: {
  categorias: Opcion[];
  razas: Opcion[];
  mode: "create" | "edit";
  initial?: ListingInitial;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const [form, setForm] = useState({
    title: str(initial?.title),
    category_id: str(initial?.category_id),
    breed_id: str(initial?.breed_id),
    head_count: str(initial?.head_count),
    avg_weight_kg: str(initial?.avg_weight_kg),
    avg_age_months: str(initial?.avg_age_months),
    price: str(initial?.price),
    price_type: initial?.price_type ?? "por_cabeca",
    currency: initial?.currency ?? "PYG",
    city: str(initial?.city),
    department: str(initial?.department),
    description: str(initial?.description),
  });

  function set(campo: string, valor: string) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      router.push("/login");
      return;
    }

    const campos = {
      title: form.title,
      category_id: Number(form.category_id),
      breed_id: form.breed_id ? Number(form.breed_id) : null,
      head_count: Number(form.head_count),
      avg_weight_kg: form.avg_weight_kg ? Number(form.avg_weight_kg) : null,
      avg_age_months: form.avg_age_months ? Number(form.avg_age_months) : null,
      price: Number(form.price),
      price_type: form.price_type,
      currency: form.currency,
      city: form.city || null,
      department: form.department || null,
      description: form.description || null,
    };

    if (mode === "edit" && initial?.id) {
      const { error } = await supabase
        .from("listings")
        .update(campos)
        .eq("id", initial.id);
      if (error) {
        setLoading(false);
        setError("No se pudieron guardar los cambios.");
        return;
      }
      if (files.length) {
        const upErr = await uploadPhotos(supabase, user.id, initial.id, files);
        if (upErr) {
          setLoading(false);
          setError(`Se guardaron los cambios, pero las fotos fallaron: ${upErr}`);
          return;
        }
      }
      setLoading(false);
      router.push(`/animal/${initial.id}`);
      router.refresh();
      return;
    }

    const ahora = new Date();
    const expira = new Date(ahora.getTime() + 30 * 24 * 60 * 60 * 1000);
    const { data, error } = await supabase
      .from("listings")
      .insert({
        ...campos,
        seller_id: user.id,
        status: "ativo",
        moderation: "pendente",
        published_at: ahora.toISOString(),
        expires_at: expira.toISOString(),
      })
      .select("id")
      .single();
    if (error || !data) {
      setLoading(false);
      setError(
        "No se pudo publicar. Revisá que completaste tu perfil y los campos obligatorios."
      );
      return;
    }
    if (files.length) {
      const upErr = await uploadPhotos(supabase, user.id, data.id, files);
      if (upErr) {
        setLoading(false);
        setError(
          `El aviso se publicó (lo ves en Mis avisos), pero las fotos fallaron: ${upErr}`
        );
        return;
      }
    }
    setLoading(false);
    router.push(`/animal/${data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
      <label className="flex flex-col gap-1 text-sm font-medium text-tinta">
        Título del aviso
        <input
          required
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="Ej: Lote de 50 novillos Nelore"
          className={inputCls}
        />
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm font-medium text-tinta">
          Categoría
          <select
            required
            value={form.category_id}
            onChange={(e) => set("category_id", e.target.value)}
            className={inputCls}
          >
            <option value="">Elegí…</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-tinta">
          Raza (opcional)
          <select
            value={form.breed_id}
            onChange={(e) => set("breed_id", e.target.value)}
            className={inputCls}
          >
            <option value="">Mestizo / sin especificar</option>
            {razas.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nombre}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm font-medium text-tinta">
          Cabezas
          <input
            required
            type="number"
            min={1}
            value={form.head_count}
            onChange={(e) => set("head_count", e.target.value)}
            className={inputCls}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-tinta">
          Peso medio (kg)
          <input
            type="number"
            min={0}
            value={form.avg_weight_kg}
            onChange={(e) => set("avg_weight_kg", e.target.value)}
            className={inputCls}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-tinta">
          Edad media (meses)
          <input
            type="number"
            min={0}
            value={form.avg_age_months}
            onChange={(e) => set("avg_age_months", e.target.value)}
            className={inputCls}
          />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm font-medium text-tinta">
          Precio
          <input
            required
            type="number"
            min={0}
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
            className={inputCls}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-tinta">
          Forma
          <select
            value={form.price_type}
            onChange={(e) => set("price_type", e.target.value)}
            className={inputCls}
          >
            <option value="por_cabeca">Por cabeza</option>
            <option value="por_kg">Por kg</option>
            <option value="por_arroba">Por arroba</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-tinta">
          Moneda
          <select
            value={form.currency}
            onChange={(e) => set("currency", e.target.value)}
            className={inputCls}
          >
            <option value="PYG">Guaraní (Gs)</option>
            <option value="USD">Dólar (USD)</option>
            <option value="BRL">Real (R$)</option>
          </select>
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm font-medium text-tinta">
          Ciudad
          <input
            value={form.city}
            onChange={(e) => set("city", e.target.value)}
            className={inputCls}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-tinta">
          Departamento
          <input
            value={form.department}
            onChange={(e) => set("department", e.target.value)}
            className={inputCls}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm font-medium text-tinta">
        Descripción
        <textarea
          rows={4}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          className={inputCls}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-tinta">
        Fotos (hasta 8)
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) =>
            setFiles(Array.from(e.target.files ?? []).slice(0, 8))
          }
          className="text-sm text-humo file:mr-3 file:rounded-md file:border-0 file:bg-pasto file:px-4 file:py-2 file:text-sm file:font-semibold file:text-crema"
        />
        {files.length > 0 && (
          <span className="text-xs text-humo">
            {files.length} foto(s) seleccionada(s)
          </span>
        )}
        {mode === "edit" && (
          <span className="text-xs text-humo">
            Las fotos nuevas se agregan a las que ya tiene.
          </span>
        )}
      </label>

      {error && <p className="text-sm text-tierra">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-pasto px-6 py-3 font-semibold text-crema transition-colors hover:bg-pasto-hondo disabled:opacity-60"
      >
        {loading
          ? "Guardando…"
          : mode === "edit"
            ? "Guardar cambios"
            : "Publicar aviso"}
      </button>
    </form>
  );
}
