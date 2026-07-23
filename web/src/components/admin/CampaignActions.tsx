"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const btn =
  "rounded-md border border-crema-2 px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50";

export default function CampaignActions({
  id,
  isActive,
}: {
  id: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function cambiarImagen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setBusy(false);
      router.push("/login");
      return;
    }
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/banners/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("listing-photos")
      .upload(path, file, { contentType: file.type || "image/jpeg" });
    if (upErr) {
      setBusy(false);
      alert("No se pudo subir la imagen: " + upErr.message);
      return;
    }
    await supabase
      .from("banner_campaigns")
      .update({ image_path: path })
      .eq("id", id);
    setBusy(false);
    if (fileRef.current) fileRef.current.value = "";
    router.refresh();
  }

  async function toggle() {
    setBusy(true);
    const supabase = createClient();
    await supabase
      .from("banner_campaigns")
      .update({ is_active: !isActive })
      .eq("id", id);
    setBusy(false);
    router.refresh();
  }

  async function eliminar() {
    if (!confirm("¿Eliminar esta campaña? No se puede deshacer.")) return;
    setBusy(true);
    const supabase = createClient();
    await supabase.from("banner_campaigns").delete().eq("id", id);
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={busy}
        className={`${btn} text-tinta hover:bg-crema-2`}
      >
        Cambiar imagen
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={cambiarImagen}
        className="hidden"
      />
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        className={`${btn} text-tinta hover:bg-crema-2`}
      >
        {isActive ? "Pausar" : "Activar"}
      </button>
      <button
        type="button"
        onClick={eliminar}
        disabled={busy}
        className={`${btn} text-tierra hover:bg-tierra/10`}
      >
        Eliminar
      </button>
    </div>
  );
}
