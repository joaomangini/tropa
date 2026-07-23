import Link from "next/link";
import { catStyle, photoUrl } from "@/lib/format";

export type CardData = {
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

export default function ListingCard({ l }: { l: CardData }) {
  const c = catStyle(l.slug);
  return (
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
          <div className={`flex h-24 items-center justify-end ${c.band}`}>
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
        <h3 className="font-semibold leading-tight text-tinta">{l.title}</h3>
        {l.raza && <div className="text-xs text-humo">Raza {l.raza}</div>}
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
  );
}
