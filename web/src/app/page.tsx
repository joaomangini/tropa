import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

type HomeData = {
  configured: boolean;
  anuncios: number | null;
  categorias: string[];
  razas: number | null;
};

async function getHomeData(): Promise<HomeData> {
  if (!isSupabaseConfigured()) {
    return { configured: false, anuncios: null, categorias: [], razas: null };
  }

  try {
    const supabase = createClient();

    const [anunciosRes, categoriasRes, razasRes] = await Promise.all([
      supabase
        .from("listings")
        .select("*", { count: "exact", head: true })
        .eq("status", "ativo")
        .eq("moderation", "aprovado"),
      supabase.from("categories").select("name_es").order("sort_order"),
      supabase.from("breeds").select("*", { count: "exact", head: true }),
    ]);

    return {
      configured: true,
      anuncios: anunciosRes.count ?? 0,
      categorias: (categoriasRes.data ?? []).map(
        (c: { name_es: string }) => c.name_es
      ),
      razas: razasRes.count ?? 0,
    };
  } catch {
    return { configured: false, anuncios: null, categorias: [], razas: null };
  }
}

export default async function Home() {
  const data = await getHomeData();

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
            <a
              href="#publicar"
              className="rounded-md border border-crema/30 px-6 py-3 font-semibold text-crema transition-colors hover:bg-crema/10"
            >
              Anunciar mi lote
            </a>
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
            (Conectá las claves del Supabase para ver los números en vivo.)
          </p>
        )}
      </section>

      {/* CATEGORÍAS — chips do banco */}
      <section id="razas" className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="font-display text-3xl font-bold text-pasto-hondo">
          Categorías de animal
        </h2>
        <p className="mt-1 text-humo">Elegí lo que buscás.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {(data.categorias.length > 0
            ? data.categorias
            : ["Buey", "Vaca", "Vaquillona", "Ternero", "Toro", "Matriz"]
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

      {/* PLACEHOLDER dos anúncios (Etapa 5) */}
      <section id="animales" className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="font-display text-3xl font-bold text-pasto-hondo">
          Animales en venta
        </h2>
        <p className="mt-2 max-w-lg text-humo">
          La lista de anuncios con búsqueda y filtros llega en el próximo paso.
          El motor (la base de datos) ya está conectado. 🐂
        </p>
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
