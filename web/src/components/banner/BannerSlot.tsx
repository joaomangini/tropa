"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { photoUrl } from "@/lib/format";
import type { Banner } from "@/lib/banners";

export default function BannerSlot({ campaign }: { campaign: Banner }) {
  const registrado = useRef(false);

  // Conta 1 impressão quando o banner aparece.
  useEffect(() => {
    if (registrado.current) return;
    registrado.current = true;
    const supabase = createClient();
    supabase
      .from("banner_events")
      .insert({ campaign_id: campaign.id, event_type: "impression" })
      .then(() => {});
  }, [campaign.id]);

  async function onClick() {
    const supabase = createClient();
    await supabase
      .from("banner_events")
      .insert({ campaign_id: campaign.id, event_type: "click" });
  }

  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={photoUrl(campaign.image_path)}
      alt="Publicidad"
      className="w-full rounded-lg object-cover"
    />
  );

  return (
    <div className="my-8">
      <div className="mb-1 text-[10px] uppercase tracking-widest text-humo">
        Publicidad
      </div>
      {campaign.link_url ? (
        <a
          href={campaign.link_url}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={onClick}
        >
          {img}
        </a>
      ) : (
        img
      )}
    </div>
  );
}
