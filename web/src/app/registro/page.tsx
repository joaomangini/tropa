"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function RegistroPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setAviso(null);
    setLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setLoading(false);
      setError(
        error.message.includes("already")
          ? "Ese email ya está registrado."
          : "No se pudo crear la cuenta. Revisá los datos."
      );
      return;
    }

    // Cria/atualiza o perfil quando já veio sessão (confirmação de email desligada).
    if (data.session && data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        full_name: fullName,
        whatsapp: whatsapp.replace(/\D/g, ""),
        user_type: "vendedor",
      });
      setLoading(false);
      router.push("/publicar");
      router.refresh();
      return;
    }

    // Confirmação de email ligada: precisa confirmar antes de entrar.
    setLoading(false);
    setAviso(
      "Cuenta creada. Revisá tu email para confirmarla y después iniciá sesión."
    );
  }

  return (
    <section className="mx-auto max-w-md px-5 py-16">
      <h1 className="font-display text-3xl font-bold text-pasto-hondo">
        Crear cuenta
      </h1>
      <p className="mt-1 text-humo">Para publicar tu ganado.</p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium text-tinta">
          Nombre completo
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="rounded-md border border-crema-2 bg-white px-3 py-2 text-base"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-tinta">
          WhatsApp (con código de país)
          <input
            type="tel"
            required
            placeholder="595981234567"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className="rounded-md border border-crema-2 bg-white px-3 py-2 text-base"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-tinta">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-md border border-crema-2 bg-white px-3 py-2 text-base"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-tinta">
          Contraseña (mínimo 6 caracteres)
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-md border border-crema-2 bg-white px-3 py-2 text-base"
          />
        </label>

        {error && <p className="text-sm text-tierra">{error}</p>}
        {aviso && <p className="text-sm text-pasto">{aviso}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-md bg-pasto px-6 py-3 font-semibold text-crema transition-colors hover:bg-pasto-hondo disabled:opacity-60"
        >
          {loading ? "Creando…" : "Crear cuenta"}
        </button>
      </form>

      <p className="mt-6 text-sm text-humo">
        ¿Ya tenés cuenta?{" "}
        <Link href="/login" className="font-semibold text-pasto">
          Iniciá sesión
        </Link>
      </p>
    </section>
  );
}
