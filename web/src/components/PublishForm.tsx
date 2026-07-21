"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Opcion = { id: number; nombre: string };

const inputCls =
  "rounded-md border border-crema-2 bg-white px-3 py-2 text-base w-full";

export default function PublishForm({
  categorias,
  razas,
}: {
  categorias: Opcion[];
  razas: Opcion[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    category_id: "",
    breed_id: "",
    head_count: "",
    avg_weight_kg: "",
    avg_age_months: "",
    price: "",
    price_type: "por_cabeca",
    currency: "PYG",
    city: "",
    department: "",
    description: "",
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

    const ahora = new Date();
    const expira = new Date(ahora.getTime() + 30 * 24 * 60 * 60 * 1000);

    const { data, error } = await supabase
      .from("listings")
      .insert({
        seller_id: user.id,
        title: form.title,
        category_id: Number(form.category_id),
        breed_id: form.breed_id ? Number(form.breed_id) : null,
        head_count: Number(form.head_count),
        avg_weight_kg: form.avg_weight_kg ? Number(form.avg_weight_kg) : null,
        avg_age_months: form.avg_age_months
          ? Number(form.avg_age_months)
          : null,
        price: Number(form.price),
        price_type: form.price_type,
        currency: form.currency,
        city: form.city || null,
        department: form.department || null,
        description: form.description || null,
        status: "ativo",
        moderation: "aprovado", // auto-aprovado por enquanto (moderação real = Etapa 8)
        published_at: ahora.toISOString(),
        expires_at: expira.toISOString(),
      })
      .select("id")
      .single();

    setLoading(false);

    if (error || !data) {
      setError(
        "No se pudo publicar. Revisá que completaste tu perfil y los campos obligatorios."
      );
      return;
    }

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

      {error && <p className="text-sm text-tierra">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-pasto px-6 py-3 font-semibold text-crema transition-colors hover:bg-pasto-hondo disabled:opacity-60"
      >
        {loading ? "Publicando…" : "Publicar aviso"}
      </button>
    </form>
  );
}
