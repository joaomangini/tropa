import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { precioTexto, catStyle } from "@/lib/format";
import WhatsappButton from "@/components/WhatsappButton";
import RegisterSaleForm from "@/components/RegisterSaleForm";
import Gallery from "@/components/Gallery";
import AddToCartButton from "@/components/cart/AddToCartButton";
import ReportButton from "@/components/ReportButton";
import { getActiveBanners } from "@/lib/banners";
import BannerCarousel from "@/components/banner/BannerCarousel";

export default async function AnimalPage({
  params,
}: {
  params: { id: string };
}) {
  if (!isSupabaseConfigured()) notFound();

  const supabase = createClient();
  const { data } = await supabase
    .from("listings")
    .select(
      "id, seller_id, title, description, head_count, avg_weight_kg, avg_age_months, price, price_type, currency, city, department, created_at, categories(slug,name_es), breeds(name), listing_photos(storage_path,sort_order), profiles!listings_seller_id_fkey(full_name,whatsapp,city,department)"
    )
    .eq("id", params.id)
    .maybeSingle();

  if (!data) notFound();

  const l = data as any;
  const cat = Array.isArray(l.categories) ? l.categories[0] : l.categories;
  const br = Array.isArray(l.breeds) ? l.breeds[0] : l.breeds;
  const seller = Array.isArray(l.profiles) ? l.profiles[0] : l.profiles;
  const c = catStyle(cat?.slug ?? "");

  const fotos: string[] = (
    Array.isArray(l.listing_photos) ? l.listing_photos : []
  )
    .slice()
    .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((p: any) => p.storage_path as string);

  // Painel de vendas — só para o dono do anúncio.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwner = Boolean(user && user.id === l.seller_id);

  let ventas: any[] | null = null;
  if (isOwner) {
    const { data: sData, error: sErr } = await supabase
      .from("sales")
      .select("id, quantity, buyer_name, buyer_phone, sold_at")
      .eq("listing_id", l.id)
      .order("sold_at", { ascending: false });
    // sErr acontece se a tabela "sales" ainda não foi criada (migração 0003).
    ventas = sErr ? null : ((sData ?? []) as any[]);
  }

  const totalVendido = (ventas ?? []).reduce(
    (soma, v) => soma + Number(v.quantity),
    0
  );
  const restante = Number(l.head_count) - totalVendido;

  const banners = await getActiveBanners("detail_footer");

  const specs = [
    { k: "Categoría", v: cat?.name_es ?? "—" },
    { k: "Raza", v: br?.name ?? "Mestizo" },
    { k: "Cantidad", v: `${l.head_count} cabezas` },
    {
      k: "Peso medio",
      v: l.avg_weight_kg != null ? `${Number(l.avg_weight_kg)} kg` : "—",
    },
    {
      k: "Edad media",
      v: l.avg_age_months != null ? `${l.avg_age_months} meses` : "—",
    },
    {
      k: "Ubicación",
      v: [l.city, l.department].filter(Boolean).join(" · ") || "—",
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-5 py-8">
      <Link href="/#animales" className="text-sm text-humo hover:text-pasto">
        ← Volver a los animales
      </Link>

      <div className="mt-4 grid gap-8 md:grid-cols-[1.2fr_1fr]">
        {/* Coluna esquerda: "foto" + dados */}
        <div>
          {fotos.length > 0 ? (
            <Gallery fotos={fotos} alt={l.title} />
          ) : (
            <div
              className={`relative flex h-56 items-end overflow-hidden rounded-xl p-5 ${c.band}`}
            >
              <span
                aria-hidden
                className="absolute -right-4 -top-6 text-[10rem] leading-none opacity-30"
              >
                {c.emoji}
              </span>
              <span className="relative z-10 rounded bg-black/35 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                {cat?.name_es ?? "Ganado"}
              </span>
            </div>
          )}

          <h1 className="mt-6 font-display text-4xl font-bold leading-tight text-pasto-hondo">
            {l.title}
          </h1>
          <div className="mt-2 font-display text-2xl font-bold text-pasto tabular-nums">
            {precioTexto(l.price, l.price_type, l.currency)}
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-crema-2 bg-crema-2 sm:grid-cols-3">
            {specs.map((s) => (
              <div key={s.k} className="bg-white px-4 py-3">
                <dt className="text-xs uppercase tracking-wide text-humo">
                  {s.k}
                </dt>
                <dd className="mt-0.5 text-sm font-semibold text-tinta">
                  {s.v}
                </dd>
              </div>
            ))}
          </dl>

          {l.description && (
            <div className="mt-6">
              <h2 className="font-display text-lg font-bold text-pasto-hondo">
                Descripción
              </h2>
              <p className="mt-2 whitespace-pre-line text-tinta/90">
                {l.description}
              </p>
            </div>
          )}
        </div>

        {/* Coluna direita: vendedor + contato */}
        <aside className="md:pt-2">
          <div className="rounded-xl border border-crema-2 bg-white p-6">
            <div className="text-xs font-semibold uppercase tracking-widest text-tierra">
              Vendedor
            </div>
            <div className="mt-2 text-lg font-semibold text-tinta">
              {seller?.full_name ?? "Vendedor"}
            </div>
            {(seller?.city || seller?.department) && (
              <div className="mt-1 text-sm text-humo">
                📍 {[seller?.city, seller?.department].filter(Boolean).join(" · ")}
              </div>
            )}

            <div className="mt-5">
              {seller?.whatsapp ? (
                <WhatsappButton
                  whatsapp={seller.whatsapp}
                  listingId={l.id}
                  title={l.title}
                />
              ) : (
                <p className="text-sm text-humo">
                  Este vendedor todavía no cargó su WhatsApp.
                </p>
              )}
            </div>

            <div className="mt-3">
              <AddToCartButton
                item={{
                  id: l.id,
                  title: l.title,
                  precio: precioTexto(l.price, l.price_type, l.currency),
                  sellerName: seller?.full_name ?? "Vendedor",
                  sellerWhatsapp: seller?.whatsapp ?? "",
                }}
              />
            </div>

            <p className="mt-3 text-center text-xs text-humo">
              El contacto es directo entre comprador y vendedor.
            </p>
            <div className="mt-3 text-center">
              <ReportButton listingId={l.id} />
            </div>
          </div>
        </aside>
      </div>

      {/* Painel de vendas — só o dono vê */}
      {isOwner && ventas !== null && (
        <div className="mt-10 rounded-xl border border-crema-2 bg-white p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-display text-xl font-bold text-pasto-hondo">
              Ventas
            </h2>
            <div className="text-sm text-humo">
              Vendidos{" "}
              <b className="text-tinta tabular-nums">{totalVendido}</b> de{" "}
              <b className="text-tinta tabular-nums">{l.head_count}</b> ·
              quedan{" "}
              <b className="text-pasto tabular-nums">
                {restante > 0 ? restante : 0}
              </b>
            </div>
          </div>

          {ventas.length > 0 && (
            <ul className="mt-4 divide-y divide-crema-2 border-y border-crema-2">
              {ventas.map((v) => (
                <li
                  key={v.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm"
                >
                  <span className="font-semibold text-tinta tabular-nums">
                    {v.quantity} cabezas
                  </span>
                  <span className="text-humo">
                    {v.buyer_name || "Comprador"}
                    {v.buyer_phone ? ` · ${v.buyer_phone}` : ""}
                  </span>
                  <span className="text-xs text-humo">
                    {new Date(v.sold_at).toLocaleDateString("es-PY")}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {restante > 0 ? (
            <RegisterSaleForm listingId={l.id} maxRemaining={restante} />
          ) : (
            <p className="mt-4 text-sm font-semibold text-tierra">
              Lote vendido por completo. 🐂
            </p>
          )}
        </div>
      )}

      {banners.length > 0 && (
        <div className="mt-4">
          <BannerCarousel banners={banners} />
        </div>
      )}
    </div>
  );
}
