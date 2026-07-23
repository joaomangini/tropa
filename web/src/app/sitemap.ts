import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

const SITE = "https://tropa-joaomanginis-projects.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base: MetadataRoute.Sitemap = [
    { url: SITE, lastModified: new Date(), priority: 1 },
    { url: `${SITE}/buscar`, lastModified: new Date(), priority: 0.8 },
  ];

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return base;

  try {
    const supabase = createClient(url, key);
    const { data } = await supabase
      .from("listings")
      .select("id, updated_at")
      .eq("status", "ativo")
      .eq("moderation", "aprovado")
      .limit(1000);

    const items: MetadataRoute.Sitemap = (data ?? []).map((l: any) => ({
      url: `${SITE}/animal/${l.id}`,
      lastModified: l.updated_at ? new Date(l.updated_at) : new Date(),
      priority: 0.6,
    }));

    return [...base, ...items];
  } catch {
    return base;
  }
}
