import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import ListingActions from "@/components/ListingActions";
import { precioTexto } from "@/lib/format";

const ESTADO: Record<string, { label: string; cls: string }> = {
  rascunho: { label: "Borrador", cls: "bg-crema-2 text-humo" },
  ativo: { label: "Activo", cls: "bg-pasto/15 text-pasto" },
  pausado: { label: "Pausado", cls: "bg-ambar/20 text-ambar" },
  vendido: { label: "Vendido", cls: "bg-tierra/15 text-tierra" },
  expirado: { label: "Expirado", cls: "bg-crema-2 text-humo" },
};

export default async function MisAvisos() {
  if (!isSupabaseConfigured()) redirect("/");

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("listings")
    .select("id, title, head_count, price, price_type, currency, status, moderation")
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });

  const avisos = (data ?? []) as any[];

  return (
    <section className="mx-auto max-w-4xl px-5 py-12">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-4xl font-bold text-pasto-hondo">
          Mis avisos
        </h1>
        <Link
          href="/publicar"
          className="rounded-md bg-pasto px-4 py-2 text-sm font-semibold text-crema hover:bg-pasto-hondo"
        >
          + Nuevo aviso
        </Link>
      </div>

      {avisos.length === 0 ? (
        <p className="mt-8 text-humo">
          Todavía no publicaste ningún aviso.{" "}
          <Link href="/publicar" className="font-semibold text-pasto">
            Publicá el primero
          </Link>
          .
        </p>
      ) : (
        <div className="mt-8 flex flex-col gap-4">
          {avisos.map((a) => {
            const st = ESTADO[a.status] ?? ESTADO.rascunho;
            return (
              <div
                key={a.id}
                className="rounded-lg border border-crema-2 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/animal/${a.id}`}
                        className="font-semibold text-tinta hover:text-pasto"
                      >
                        {a.title}
                      </Link>
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-semibold ${st.cls}`}
                      >
                        {st.label}
                      </span>
                      {a.moderation === "pendente" && (
                        <span className="rounded bg-ambar/20 px-2 py-0.5 text-xs font-semibold text-ambar">
                          Pendiente de aprobación
                        </span>
                      )}
                      {a.moderation === "reprovado" && (
                        <span className="rounded bg-tierra/15 px-2 py-0.5 text-xs font-semibold text-tierra">
                          Rechazado
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-sm text-humo">
                      {a.head_count} cabezas ·{" "}
                      {precioTexto(a.price, a.price_type, a.currency)}
                    </div>
                  </div>
                </div>
                <div className="mt-3 border-t border-crema-2 pt-3">
                  <ListingActions id={a.id} status={a.status} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
