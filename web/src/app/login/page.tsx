"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      setError("Email o contraseña incorrectos.");
      return;
    }
    router.push("/publicar");
    router.refresh();
  }

  return (
    <section className="mx-auto max-w-md px-5 py-16">
      <h1 className="font-display text-3xl font-bold text-pasto-hondo">
        Iniciar sesión
      </h1>
      <p className="mt-1 text-humo">Entrá para anunciar tu ganado.</p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
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
          Contraseña
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-md border border-crema-2 bg-white px-3 py-2 text-base"
          />
        </label>

        {error && <p className="text-sm text-tierra">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-md bg-pasto px-6 py-3 font-semibold text-crema transition-colors hover:bg-pasto-hondo disabled:opacity-60"
        >
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>

      <p className="mt-6 text-sm text-humo">
        ¿No tenés cuenta?{" "}
        <Link href="/registro" className="font-semibold text-pasto">
          Creá una acá
        </Link>
      </p>
    </section>
  );
}
