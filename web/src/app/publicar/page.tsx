import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import PublishForm from "@/components/PublishForm";

export default async function Publicar() {
  if (!isSupabaseConfigured()) redirect("/");

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [catRes, razRes] = await Promise.all([
    supabase.from("categories").select("id,name_es").order("sort_order"),
    supabase.from("breeds").select("id,name").order("sort_order"),
  ]);

  const categorias = (catRes.data ?? []).map(
    (c: { id: number; name_es: string }) => ({ id: c.id, nombre: c.name_es })
  );
  const razas = (razRes.data ?? []).map((r: { id: number; name: string }) => ({
    id: r.id,
    nombre: r.name,
  }));

  return (
    <section className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="font-display text-4xl font-bold text-pasto-hondo">
        Anunciá tu lote
      </h1>
      <p className="mt-2 text-humo">
        Completá los datos del ganado. Tu aviso aparece al instante en el
        mercado.
      </p>
      <PublishForm categorias={categorias} razas={razas} />
    </section>
  );
}
