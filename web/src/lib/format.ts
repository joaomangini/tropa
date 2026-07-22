export const MONEDA: Record<string, string> = { USD: "USD", BRL: "R$", PYG: "Gs" };

export const UNIDAD: Record<string, string> = {
  por_cabeca: "/ cabeza",
  por_kg: "/ kg",
  por_arroba: "/ arroba",
};

/** Formata o preço no padrão paraguaio, ex: "Gs 4.200.000 / cabeza". */
export function precioTexto(price: number, tipo: string, moneda: string): string {
  const n = new Intl.NumberFormat("es-PY").format(Number(price));
  return `${MONEDA[moneda] ?? moneda} ${n} ${UNIDAD[tipo] ?? ""}`.trim();
}

const CAT: Record<string, { emoji: string; band: string }> = {
  boi: { emoji: "🐂", band: "bg-[#4c7a4f]" },
  vaca: { emoji: "🐄", band: "bg-[#8a6a3c]" },
  novilha: { emoji: "🐮", band: "bg-[#5b7488]" },
  bezerro: { emoji: "🐮", band: "bg-[#6f8a45]" },
  touro: { emoji: "🐃", band: "bg-[#5b6f88]" },
  matriz: { emoji: "🐄", band: "bg-[#a06a3a]" },
};

/** Emoji + cor da faixa de acordo com a categoria (slug do banco). */
export function catStyle(slug: string): { emoji: string; band: string } {
  return CAT[slug] ?? { emoji: "🐄", band: "bg-pasto" };
}

/** URL pública de uma foto no Storage (bucket "listing-photos"). */
export function photoUrl(storagePath: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listing-photos/${storagePath}`;
}
