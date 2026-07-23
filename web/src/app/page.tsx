import { Fragment } from "react";
import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { precioTexto, catStyle, photoUrl } from "@/lib/format";
import { getActiveBanners } from "@/lib/banners";
import BannerCarousel from "@/components/banner/BannerCarousel";
import SponsorRow from "@/components/banner/SponsorRow";

type Card = {
  id: string;
  title: string;
  categoria: string;
  slug: string;
  raza: string | null;
  cabezas: number;
  peso: number | null;
  edad: number | null;
  precio: string;
  ciudad: string | null;
  departamento: string | null;
  foto: string | null;
};

type HomeData = {
  configured: boolean;
  anuncios: number | null;
  categorias: string[];
  razas: number | null;
  listings: Card[];
};

async function getHomeData(): Promise<HomeData> {
  const vazio: HomeData = {
    configured: false,
    anuncios: null,
    categorias: [],
    razas: null,
    listings: [],
  };
  if (!isSupabaseConfigured()) return vazio;

  try {
    const supabase = createClient();

    const [anunciosRes, categoriasRes, razasRes, listRes] = await Promise.all([
      supabase
        .from("listings")
        .select("*", { count: "exact", head: true })
        .eq("status", "ativo")
        .eq("moderation", "aprovado"),
      supabase.from("categories").select("name_es").order("sort_order"),
      supabase.from("breeds").select("*", { count: "exact", head: true }),
      supabase
        .from("listings")
        .select(
          "id, title, head_count, avg_weight_kg, avg_age_months, price, price_type, currency, city, department, categories(slug,name_es), breeds(name), listing_photos(storage_path,sort_order)"
        )
        .eq("status", "ativo")
        .eq("moderation", "aprovado")
        .order("created_at", { ascending: false })
        .limit(12),
    ]);

    const raw = (listRes.data ?? []) as any[];
    const listings: Card[] = raw.map((l) => {
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

    return {
      configured: true,
      anuncios: anunciosRes.count ?? 0,
      categorias: (categoriasRes.data ?? []).map(
        (c: { name_es: string }) => c.name_es
      ),
      razas: razasRes.count ?? 0,
      listings,
    };
  } catch {
    return vazio;
  }
}

export default async function Home() {
  const data = await getHomeData();
  const bannersTop = await getActiveBanners("home_top");
  const bannersFeed = await getActiveBanners("feed_inline");
  const sponsors = await getActiveBanners("home_showcase");

  return (
    <>
      {/* HERO */}
      <section className="bg-pasto-hondo text-crema">
        <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-ambar">
            Mercado de ganado · Paraguay
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-5xl font-bold leading-[0.95] tracking-tight md:text-7xl">
            Comprá y vendé ganado en un solo lugar
          </h1>
          <p className="mt-5 max-w-xl text-lg text-crema/80">
            Publicá tu lote o encontrá animales por raza, departamento y precio.
            El contacto es directo, por WhatsApp.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#animales"
              className="rounded-md bg-ambar px-6 py-3 font-semibold text-pasto-hondo transition-transform hover:-translate-y-0.5"
            >
              Ver animales
            </a>
            <Link
              href="/publicar"
              className="rounded-md border border-crema/30 px-6 py-3 font-semibold text-crema transition-colors hover:bg-crema/10"
            >
              Anunciar mi lote
            </Link>
          </div>
        </div>
      </section>

      {/* FAIXA DE NÚMEROS — dados reais do banco */}
      <section className="border-b border-crema-2 bg-crema">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-px overflow-hidden bg-crema-2 sm:grid-cols-3">
          <Stat
            valor={data.configured ? String(data.anuncios) : "—"}
            label="Animales publicados"
          />
          <Stat
            valor={data.configured ? String(data.categorias.length) : "—"}
            label="Categorías"
          />
          <Stat
            valor={data.configured ? String(data.razas) : "—"}
            label="Razas"
          />
        </div>
        {!data.configured && (
          <p className="mx-auto max-w-6xl px-5 py-3 text-center text-xs text-humo">
            (Conectá las claves del Supabase en Vercel para ver los datos en
            vivo.)
          </p>
        )}
      </section>

      {bannersTop.length > 0 && (
        <div className="mx-auto max-w-6xl px-5">
          <BannerCarousel banners={bannersTop} />
        </div>
      )}

      {/* ANIMALES — cards reais do banco */}
      <section id="animales" className="mx-auto max-w-6xl px-5 py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-bold text-pasto-hondo">
              Animales en venta
            </h2>
            <p className="mt-1 text-humo">Lotes publicados en el mercado.</p>
          </div>
          <Link
            href="/publicar"
            className="hidden rounded-md bg-pasto px-4 py-2 text-sm font-semibold text-crema hover:bg-pasto-hondo sm:inline-block"
          >
            Anunciar
          </Link>
        </div>

        {data.listings.length === 0 ? (
          <p className="mt-8 max-w-lg text-humo">
            Todavía no hay animales para mostrar. Si conectaste el banco y no
            aparecen, revisá las variables de entorno en Vercel. 🐂
          </p>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.listings.map((l, i) => {
              const c = catStyle(l.slug);
              return (
                <Fragment key={l.id}>
                <Link
                  href={`/animal/${l.id}`}
                  className="flex flex-col overflow-hidden rounded-lg border border-crema-2 bg-white transition-shadow hover:shadow-md"
                >
                  <div className="relative h-24">
                    {l.foto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={photoUrl(l.foto)}
                        alt={l.title}
                        className="h-24 w-full object-cover"
                      />
                    ) : (
                      <div
                        className={`flex h-24 items-center justify-end ${c.band}`}
                      >
                        <span aria-hidden className="mr-2 text-6xl opacity-30">
                          {c.emoji}
                        </span>
                      </div>
                    )}
                    <span className="absolute bottom-2 left-2 z-10 rounded bg-black/45 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                      {l.categoria}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-4">
                    <h3 className="font-semibold leading-tight text-tinta">
                      {l.title}
                    </h3>
                    {l.raza && (
                      <div className="text-xs text-humo">Raza {l.raza}</div>
                    )}
                    <div className="flex gap-4 border-t border-dashed border-crema-2 pt-2 text-xs tabular-nums text-humo">
                      <span>
                        <b className="block text-tinta">{l.cabezas}</b>cabezas
                      </span>
                      {l.peso != null && (
                        <span>
                          <b className="block text-tinta">{l.peso} kg</b>peso
                        </span>
                      )}
                      {l.edad != null && (
                        <span>
                          <b className="block text-tinta">{l.edad} m</b>edad
                        </span>
                      )}
                    </div>
                    <div className="mt-auto pt-2 font-display text-xl font-bold tabular-nums text-pasto">
                      {l.precio}
                    </div>
                    {(l.ciudad || l.departamento) && (
                      <div className="text-xs text-humo">
                        📍 {[l.ciudad, l.departamento].filter(Boolean).join(" · ")}
                      </div>
                    )}
                  </div>
                </Link>
                {bannersFeed.length > 0 && (i + 1) % 6 === 0 && (
                  <div className="col-span-full">
                    <BannerCarousel banners={bannersFeed} />
                  </div>
                )}
                </Fragment>
              );
            })}
          </div>
        )}
      </section>

      {sponsors.length > 0 && <SponsorRow banners={sponsors} />}

      {/* CÓMO FUNCIONA */}
      <section id="como-funciona" className="bg-crema-2/50">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="font-display text-3xl font-bold text-pasto-hondo">
            Cómo funciona
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {[
              {
                n: "01",
                t: "Publicá tu lote",
                d: "Cargá fotos, precio y todos los datos del ganado.",
              },
              {
                n: "02",
                t: "El comprador busca",
                d: "Filtra por raza, precio, peso y departamento.",
              },
              {
                n: "03",
                t: "Hablan por WhatsApp",
                d: "Un toque abre la conversación directa con el vendedor.",
              },
            ].map((p) => (
              <div
                key={p.n}
                className="rounded-lg border border-crema-2 bg-white p-6"
              >
                <div className="font-display text-sm font-bold tracking-widest text-pasto">
                  {p.n}
                </div>
                <h3 className="mt-2 text-lg font-semibold text-tinta">{p.t}</h3>
                <p className="mt-1 text-sm text-humo">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORÍAS */}
      <section id="razas" className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="font-display text-3xl font-bold text-pasto-hondo">
          Categorías de animal
        </h2>
        <p className="mt-1 text-humo">Elegí lo que buscás.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {(data.categorias.length > 0
            ? data.categorias
            : ["Novillo", "Vaca", "Vaquillona", "Ternero", "Toro", "Matriz"]
          ).map((cat) => (
            <span
              key={cat}
              className="rounded border border-crema-2 bg-white px-4 py-2 text-sm font-medium text-tinta"
            >
              {cat}
            </span>
          ))}
        </div>
      </section>
    </>
  );
}

function Stat({ valor, label }: { valor: string; label: string }) {
  return (
    <div className="bg-crema px-6 py-8 text-center">
      <div className="font-display text-4xl font-bold tabular-nums text-pasto">
        {valor}
      </div>
      <div className="mt-1 text-sm text-humo">{label}</div>
    </div>
  );
}
