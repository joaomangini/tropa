import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import LogoutButton from "./LogoutButton";

const nav = [
  { label: "Animales", href: "/#animales" },
  { label: "Cómo funciona", href: "/#como-funciona" },
  { label: "Razas", href: "/#razas" },
];

export default async function Header() {
  let logged = false;
  if (isSupabaseConfigured()) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    logged = Boolean(user);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-crema-2 bg-crema/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span
            aria-hidden
            className="grid h-8 w-8 place-items-center rounded bg-pasto text-base"
          >
            🐂
          </span>
          <span className="font-display text-2xl font-bold tracking-tight text-pasto-hondo">
            TROPA
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-tinta/80 transition-colors hover:text-pasto"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {logged ? (
            <>
              <Link
                href="/mis-avisos"
                className="hidden text-sm font-medium text-tinta/80 transition-colors hover:text-pasto sm:inline"
              >
                Mis avisos
              </Link>
              <LogoutButton />
            </>
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium text-tinta/80 transition-colors hover:text-pasto"
            >
              Entrar
            </Link>
          )}
          <Link
            href="/publicar"
            className="rounded-md bg-pasto px-4 py-2 text-sm font-semibold text-crema transition-colors hover:bg-pasto-hondo"
          >
            Anunciar
          </Link>
        </div>
      </div>
    </header>
  );
}
