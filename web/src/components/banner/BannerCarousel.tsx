"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { photoUrl } from "@/lib/format";
import type { Banner } from "@/lib/banners";

export default function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [idx, setIdx] = useState(0);
  const [touchX, setTouchX] = useState<number | null>(null);
  const logged = useRef<Set<string>>(new Set());
  const total = banners.length;

  // Conta 1 impressão por banner (a primeira vez que ele aparece).
  useEffect(() => {
    if (total === 0) return;
    const b = banners[idx];
    if (b && !logged.current.has(b.id)) {
      logged.current.add(b.id);
      const supabase = createClient();
      supabase
        .from("banner_events")
        .insert({ campaign_id: b.id, event_type: "impression" })
        .then(() => {});
    }
  }, [idx, banners, total]);

  // Troca automática a cada 5s (respeita "reduzir movimento").
  useEffect(() => {
    if (total <= 1) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const t = setInterval(() => setIdx((i) => (i + 1) % total), 5000);
    return () => clearInterval(t);
  }, [total]);

  if (total === 0) return null;

  const prev = () => setIdx((i) => (i - 1 + total) % total);
  const next = () => setIdx((i) => (i + 1) % total);

  async function onClick(b: Banner) {
    const supabase = createClient();
    await supabase
      .from("banner_events")
      .insert({ campaign_id: b.id, event_type: "click" });
  }

  const b = banners[idx];
  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={photoUrl(b.image_path)}
      alt="Publicidad"
      className="h-40 w-full select-none object-cover sm:h-56"
    />
  );

  return (
    <div className="my-8">
      <div className="mb-1 text-[10px] uppercase tracking-widest text-humo">
        Publicidad
      </div>
      <div
        className="relative overflow-hidden rounded-xl bg-crema-2"
        onTouchStart={(e) => setTouchX(e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX === null) return;
          const dx = e.changedTouches[0].clientX - touchX;
          if (dx > 40) prev();
          else if (dx < -40) next();
          setTouchX(null);
        }}
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

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Anterior"
              className="absolute left-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-lg text-tinta shadow transition hover:bg-white"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Siguiente"
              className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-lg text-tinta shadow transition hover:bg-white"
            >
              ›
            </button>
            <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5">
              {banners.map((bn, i) => (
                <button
                  key={bn.id}
                  type="button"
                  aria-label={`Ir al banner ${i + 1}`}
                  onClick={() => setIdx(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === idx ? "w-5 bg-white" : "w-2 bg-white/60"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
