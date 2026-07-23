import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export type Banner = {
  id: string;
  image_path: string;
  link_url: string | null;
};

/** Busca uma campanha ativa e vigente para a posição indicada. */
export async function getActiveBanner(position: string): Promise<Banner | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = createClient();
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("banner_campaigns")
      .select("id, image_path, link_url")
      .eq("position", position)
      .eq("is_active", true)
      .lte("starts_at", now)
      .or(`ends_at.is.null,ends_at.gt.${now}`)
      .order("created_at", { ascending: false })
      .limit(1);
    if (error || !data || !data[0]) return null;
    return data[0] as Banner;
  } catch {
    return null;
  }
}

/** Busca todas as campanhas ativas e vigentes de uma posição (para carrossel). */
export async function getActiveBanners(
  position: string,
  limit = 8
): Promise<Banner[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = createClient();
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("banner_campaigns")
      .select("id, image_path, link_url")
      .eq("position", position)
      .eq("is_active", true)
      .lte("starts_at", now)
      .or(`ends_at.is.null,ends_at.gt.${now}`)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error || !data) return [];
    return data as Banner[];
  } catch {
    return [];
  }
}
