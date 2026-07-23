import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { precioTexto } from "@/lib/format";
import { getActiveBanners } from "@/lib/banners";
import BannerCarousel from "@/components/banner/BannerCarousel";
import ListingCard, { type CardData } from "@/components/ListingCard";

const inputCls =
  "rounded-md border border-crema-2 bg-white px-3 py-2 text-sm w-full";

export default async function Buscar({
  searchParams,
}: {
  searchParams: { [k: string]: string | undefined };
}) {
  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-12 text-humo">
        Conectá el Supabase para buscar.
      </div>
    );
  }

  const supabase = createClient();

  const categoria = searchParams.categoria ?? "";
  const raza = searchParams.raza ?? "";
  const departamento = searchParams.departamento ?? "";
  const precioMin = searchParams.precio_min ?? "";
  const precioMax = searchParams.precio_max ?? "";
  const orden = searchParams.orden ?? "recientes";

  const [catRes, brRes] = await Promise.all([
    supabase.from("categories").select("id,name_es").order("sort_order"),
    supabase.from("breeds").select("id,name").order("sort_order"),
  ]);
  const categorias = (catRes.data ?? []) as any[];
  const razas = (brRes.data ?? []) as any[];

  let q = supabase
    .from("listings")
    .select(
      "id, title, head_count, avg_weight_kg, avg_age_months, price, price_type, currency, city, department, categories(slug,name_es), breeds(name), listing_photos(storage_path,sort_order)"
    )
    .eq("status", "ativo")
    .eq("moderation", "aprovado");

  if (categoria) q = q.eq("category_id", Number(categoria));
  if (raza) q = q.eq("breed_id", Number(raza));
  if (departamento) q = q.ilike("department", `%${departamento}%`);
  if (precioMin) q = q.gte("price", Number(precioMin));
  if (precioMax) q = q.lte("price", Number(precioMax));

  if (orden === "precio_asc") q = q.order("price", { ascending: true });
  else if (orden === "precio_desc") q = q.order("price", { ascending: false });
  else q = q.order("created_at", { ascending: false });

  const { data } = await q.limit(30);
  const raw = (data ?? []) as any[];

  const resultados: CardData[] = raw.map((l) => {
    const cat = Array.isArray(l.categories) ? l.categories[0] : l.categories;
    const br = Array.isArray(l.breeds) ? l.breeds[0] : l.breeds;
    const fotos = Array.isArray(l.listing_photos) ? l.listing_photos : [];
    const primera = [...fotos].sort(
      (a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
    )[0];
    return {
      id: String(l.id),
      title: String(l.title),
      categoria: cat?.name_es ?? "",
      slug: cat?.slug ?? "",
      raza: br?.name ?? null,
      cabezas: Number(l.head_count),
      peso: l.avg_weight_kg == null ? null : Number(l.avg_weight_kg),
      edad: l.avg_age_months == null ? null : Number(l.avg_age_months),
      precio: precioTexto(l.price, l.price_type, l.currency),
      ciudad: l.city ?? null,
      departamento: l.department ?? null,
      foto: primera ? (primera.storage_path as string) : null,
    };
  });

  const sidebar = await getActiveBanners("search_sidebar");

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <h1 className="font-display text-3xl font-bold text-pasto-hondo">
        Buscar animales
      </h1>

      <div className="mt-6 grid gap-8 md:grid-cols-[260px_1fr]">
        {/* Barra lateral: filtros + publicidad */}
        <aside>
          <form
            method="get"
            className="flex flex-col gap-3 rounded-xl border border-crema-2 bg-white p-4"
          >
            <div className="font-semibold text-tinta">Filtros</div>

            <label className="flex flex-col gap-1 text-xs text-humo">
              Categoría
              <select
                name="categoria"
                defaultValue={categoria}
                className={inputCls}
              >
                <option value="">Todas</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name_es}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-xs text-humo">
              Raza
              <select name="raza" defaultValue={raza} className={inputCls}>
                <option value="">Todas</option>
                {razas.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-xs text-humo">
              Departamento
              <input
                name="departamento"
                defaultValue={departamento}
                placeholder="Ej: Central"
                className={inputCls}
              />
            </label>

            <div className="grid grid-cols-2 gap-2">
              <label className="flex flex-col gap-1 text-xs text-humo">
                Precio mín
                <input
                  name="precio_min"
                  type="number"
                  defaultValue={precioMin}
                  className={inputCls}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-humo">
                Precio máx
                <input
                  name="precio_max"
                  type="number"
                  defaultValue={precioMax}
                  className={inputCls}
                />
              </label>
            </div>

            <label className="flex flex-col gap-1 text-xs text-humo">
              Ordenar
              <select name="orden" defaultValue={orden} className={inputCls}>
                <option value="recientes">Más recientes</option>
                <option value="precio_asc">Menor precio</option>
                <option value="precio_desc">Mayor precio</option>
              </select>
            </label>

            <button
              type="submit"
              className="mt-1 rounded-md bg-pasto px-4 py-2 text-sm font-semibold text-crema hover:bg-pasto-hondo"
            >
              Aplicar filtros
            </button>
            <Link
              href="/buscar"
              className="text-center text-xs text-humo hover:text-pasto"
            >
              Limpiar
            </Link>
          </form>

          {sidebar.length > 0 && (
            <div className="mt-6">
              <BannerCarousel banners={sidebar} />
            </div>
          )}
        </aside>

        {/* Resultados */}
        <div>
          <p className="mb-4 text-sm text-humo">
            {resultados.length} resultado(s)
          </p>
          {resultados.length === 0 ? (
            <p className="text-humo">
              No se encontraron animales con esos filtros.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {resultados.map((l) => (
                <ListingCard key={l.id} l={l} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
