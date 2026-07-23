"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { photoUrl } from "@/lib/format";
import type { Banner } from "@/lib/banners";

export default function SponsorRow({ banners }: { banners: Banner[] }) {
  const logged = useRef(false);

  // Conta 1 impressão por card (na primeira vez que a fileira aparece).
  useEffect(() => {
    if (logged.current || banners.length === 0) return;
    logged.current = true;
    const supabase = createClient();
    banners.forEach((b) => {
      supabase
        .from("banner_events")
        .insert({ campaign_id: b.id, event_type: "impression" })
        .then(() => {});
    });
  }, [banners]);

  if (banners.length === 0) return null;

  async function onClick(b: Banner) {
    const supabase = createClient();
    await supabase
      .from("banner_events")
      .insert({ campaign_id: b.id, event_type: "click" });
  }

  return (
    <section className="mx-auto max-w-6xl px-5 py-10">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="font-display text-xl font-bold text-pasto-hondo">
          Patrocinadores
        </h2>
        <span className="text-[10px] uppercase tracking-widest text-humo">
          Publicidad
        </span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {banners.map((b) => {
          const img = (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoUrl(b.image_path)}
              alt="Patrocinador"
              className="h-40 w-full object-cover"
            />
          );
          return (
            <div
              key={b.id}
              className="overflow-hidden rounded-xl border border-crema-2 bg-white transition-shadow hover:shadow-md"
            >
              {b.link_url ? (
                <a
                  href={b.link_url}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  onClick={() => onClick(b)}
                >
                  {img}
                </a>
              ) : (
                img
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
