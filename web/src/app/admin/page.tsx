import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import AdvertiserForm from "@/components/admin/AdvertiserForm";
import CampaignForm from "@/components/admin/CampaignForm";
import CampaignActions from "@/components/admin/CampaignActions";
import ModerationActions from "@/components/admin/ModerationActions";
import ReportActions from "@/components/admin/ReportActions";

const POS_LABEL: Record<string, string> = {
  home_top: "Topo da home",
  home_showcase: "Fila de patrocinadores",
  feed_inline: "Dentro do feed",
  search_sidebar: "Lateral da busca",
  detail_footer: "Rodapé do detalhe",
};

export default async function Admin() {
  if (!isSupabaseConfigured()) redirect("/");

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (!(perfil as any)?.is_admin) {
    return (
      <section className="mx-auto max-w-3xl px-5 py-20 text-center">
        <h1 className="font-display text-3xl font-bold text-pasto-hondo">
          Acceso restringido
        </h1>
        <p className="mt-2 text-humo">Esta página es solo para administradores.</p>
      </section>
    );
  }

  const [advRes, campRes, evRes] = await Promise.all([
    supabase
      .from("advertisers")
      .select("id, name")
      .order("created_at", { ascending: false }),
    supabase
      .from("banner_campaigns")
      .select("id, name, position, is_active, advertisers(name)")
      .order("created_at", { ascending: false }),
    supabase.from("banner_events").select("campaign_id, event_type"),
  ]);

  const advertisers = (advRes.data ?? []) as any[];
  const campaigns = (campRes.data ?? []) as any[];
  const eventos = (evRes.data ?? []) as any[];

  function metricas(id: string) {
    let imp = 0;
    let clk = 0;
    for (const e of eventos) {
      if (e.campaign_id !== id) continue;
      if (e.event_type === "impression") imp++;
      else if (e.event_type === "click") clk++;
    }
    return { imp, clk };
  }

  const [pendRes, repRes, activosRes, usuariosRes, contactosRes] =
    await Promise.all([
      supabase
        .from("listings")
        .select(
          "id, title, seller_id, created_at, profiles!listings_seller_id_fkey(full_name)"
        )
        .eq("moderation", "pendente")
        .order("created_at", { ascending: false }),
      supabase
        .from("reports")
        .select("id, reason, description, listing_id, listings(title)")
        .eq("status", "pendente")
        .order("created_at", { ascending: false }),
      supabase
        .from("listings")
        .select("*", { count: "exact", head: true })
        .eq("status", "ativo")
        .eq("moderation", "aprovado"),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("contact_events").select("*", { count: "exact", head: true }),
    ]);

  const pendientes = (pendRes.data ?? []) as any[];
  const denuncias = (repRes.data ?? []) as any[];
  const totalActivos = activosRes.count ?? 0;
  const totalUsuarios = usuariosRes.count ?? 0;
  const totalContactos = contactosRes.count ?? 0;

  return (
    <section className="mx-auto max-w-5xl px-5 py-12">
      <h1 className="font-display text-4xl font-bold text-pasto-hondo">
        Panel de administración
      </h1>

      {/* Dashboard */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatBox n={totalActivos} label="Avisos activos" />
        <StatBox n={pendientes.length} label="Pendientes" />
        <StatBox n={totalUsuarios} label="Usuarios" />
        <StatBox n={totalContactos} label="Clics de contacto" />
      </div>

      {/* Moderación de avisos */}
      <h2 className="mt-12 font-display text-2xl font-bold text-pasto-hondo">
        Avisos pendientes de aprobación
      </h2>
      {pendientes.length === 0 ? (
        <p className="mt-2 text-humo">No hay avisos pendientes. 🎉</p>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {pendientes.map((p) => {
            const sel = Array.isArray(p.profiles) ? p.profiles[0] : p.profiles;
            return (
              <div
                key={p.id}
                className="rounded-lg border border-crema-2 bg-white p-4"
              >
                <Link
                  href={`/animal/${p.id}`}
                  className="font-semibold text-tinta hover:text-pasto"
                >
                  {p.title}
                </Link>
                <div className="text-xs text-humo">
                  Vendedor: {sel?.full_name ?? "—"}
                </div>
                <div className="mt-3 border-t border-crema-2 pt-3">
                  <ModerationActions id={p.id} sellerId={p.seller_id} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Denuncias */}
      <h2 className="mt-12 font-display text-2xl font-bold text-pasto-hondo">
        Denuncias
      </h2>
      {denuncias.length === 0 ? (
        <p className="mt-2 text-humo">No hay denuncias pendientes.</p>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {denuncias.map((d) => {
            const lst = Array.isArray(d.listings) ? d.listings[0] : d.listings;
            return (
              <div
                key={d.id}
                className="rounded-lg border border-crema-2 bg-white p-4"
              >
                <Link
                  href={`/animal/${d.listing_id}`}
                  className="font-semibold text-tinta hover:text-pasto"
                >
                  {lst?.title ?? "Aviso"}
                </Link>
                <div className="text-sm text-tinta">Motivo: {d.reason}</div>
                {d.description && (
                  <div className="text-xs text-humo">{d.description}</div>
                )}
                <div className="mt-3 border-t border-crema-2 pt-3">
                  <ReportActions id={d.id} listingId={d.listing_id} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Publicidad */}
      <h2 className="mt-14 font-display text-2xl font-bold text-pasto-hondo">
        Anuncios pagos
      </h2>
      <p className="mt-1 text-humo">
        Registrá anunciantes, subí banners y mirá las métricas.
      </p>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="font-display text-xl font-bold text-tinta">
            Nuevo anunciante
          </h2>
          <AdvertiserForm />
          <h3 className="mt-6 text-sm font-semibold text-humo">
            Anunciantes ({advertisers.length})
          </h3>
          <ul className="mt-2 flex flex-col gap-1 text-sm">
            {advertisers.map((a) => (
              <li
                key={a.id}
                className="rounded border border-crema-2 bg-white px-3 py-2 text-tinta"
              >
                {a.name}
              </li>
            ))}
            {advertisers.length === 0 && (
              <li className="text-humo">Todavía no hay anunciantes.</li>
            )}
          </ul>
        </div>

        <div>
          <h2 className="font-display text-xl font-bold text-tinta">
            Nueva campaña
          </h2>
          {advertisers.length === 0 ? (
            <p className="mt-3 text-sm text-humo">
              Primero agregá un anunciante.
            </p>
          ) : (
            <CampaignForm advertisers={advertisers} />
          )}
        </div>
      </div>

      <h2 className="mt-12 font-display text-xl font-bold text-tinta">
        Campañas y métricas
      </h2>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-crema-2 text-left text-humo">
              <th className="py-2 pr-3">Campaña</th>
              <th className="pr-3">Anunciante</th>
              <th className="pr-3">Posición</th>
              <th className="pr-3">Estado</th>
              <th className="pr-3 text-right">Impresiones</th>
              <th className="pr-3 text-right">Clics</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => {
              const m = metricas(c.id);
              const adv = Array.isArray(c.advertisers)
                ? c.advertisers[0]
                : c.advertisers;
              return (
                <tr key={c.id} className="border-b border-crema-2">
                  <td className="py-2 pr-3 font-medium text-tinta">{c.name}</td>
                  <td className="pr-3">{adv?.name ?? "—"}</td>
                  <td className="pr-3">{POS_LABEL[c.position] ?? c.position}</td>
                  <td className="pr-3">{c.is_active ? "Activa" : "Inactiva"}</td>
                  <td className="pr-3 text-right tabular-nums">{m.imp}</td>
                  <td className="pr-3 text-right tabular-nums">{m.clk}</td>
                  <td className="py-2">
                    <CampaignActions id={c.id} isActive={c.is_active} />
                  </td>
                </tr>
              );
            })}
            {campaigns.length === 0 && (
              <tr>
                <td colSpan={7} className="py-4 text-humo">
                  Todavía no hay campañas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function StatBox({ n, label }: { n: number; label: string }) {
  return (
    <div className="rounded-lg border border-crema-2 bg-white px-4 py-4 text-center">
      <div className="font-display text-3xl font-bold tabular-nums text-pasto">
        {n}
      </div>
      <div className="mt-1 text-xs text-humo">{label}</div>
    </div>
  );
}
