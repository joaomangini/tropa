import { redirect, notFound } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import ListingForm from "@/components/ListingForm";

export default async function EditarAviso({
  params,
}: {
  params: { id: string };
}) {
  if (!isSupabaseConfigured()) redirect("/");

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: listing } = await supabase
    .from("listings")
    .select(
      "id, seller_id, title, category_id, breed_id, head_count, avg_weight_kg, avg_age_months, price, price_type, currency, city, department, description"
    )
    .eq("id", params.id)
    .maybeSingle();

  const l = listing as any;
  if (!l || l.seller_id !== user.id) notFound();

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
        Editar aviso
      </h1>
      <p className="mt-2 text-humo">Corregí lo que necesites y guardá.</p>
      <ListingForm
        mode="edit"
        categorias={categorias}
        razas={razas}
        initial={{
          id: l.id,
          title: l.title,
          category_id: l.category_id,
          breed_id: l.breed_id,
          head_count: l.head_count,
          avg_weight_kg: l.avg_weight_kg,
          avg_age_months: l.avg_age_months,
          price: l.price,
          price_type: l.price_type,
          currency: l.currency,
          city: l.city,
          department: l.department,
          description: l.description,
        }}
      />
    </section>
  );
}
