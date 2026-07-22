"use client";

import { useState } from "react";
import { photoUrl } from "@/lib/format";

export default function Gallery({
  fotos,
  alt,
}: {
  fotos: string[];
  alt: string;
}) {
  const [idx, setIdx] = useState(0);
  const [touchX, setTouchX] = useState<number | null>(null);
  const total = fotos.length;

  function prev() {
    setIdx((i) => (i - 1 + total) % total);
  }
  function next() {
    setIdx((i) => (i + 1) % total);
  }

  return (
    <div>
      <div
        className="relative overflow-hidden rounded-xl"
        onTouchStart={(e) => setTouchX(e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX === null) return;
          const dx = e.changedTouches[0].clientX - touchX;
          if (dx > 40) prev();
          else if (dx < -40) next();
          setTouchX(null);
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photoUrl(fotos[idx])}
          alt={alt}
          className="h-72 w-full select-none object-cover"
        />

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Foto anterior"
              className="absolute left-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-lg text-white transition-colors hover:bg-black/65"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Foto siguiente"
              className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-lg text-white transition-colors hover:bg-black/65"
            >
              ›
            </button>
            <div className="absolute bottom-2 right-2 rounded bg-black/55 px-2 py-0.5 text-xs font-medium text-white tabular-nums">
              {idx + 1}/{total}
            </div>
          </>
        )}
      </div>

      {total > 1 && (
        <div className="mt-2 grid grid-cols-5 gap-2">
          {fotos.map((p, i) => (
            <button
              key={p}
              type="button"
              onClick={() => setIdx(i)}
              className={`overflow-hidden rounded-lg border-2 transition-colors ${
                i === idx ? "border-pasto" : "border-transparent"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoUrl(p)}
                alt=""
                className="h-16 w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
