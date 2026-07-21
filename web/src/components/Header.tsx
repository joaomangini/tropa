import Link from "next/link";

const nav = [
  { label: "Animales", href: "/#animales" },
  { label: "Cómo funciona", href: "/#como-funciona" },
  { label: "Razas", href: "/#razas" },
];

export default function Header() {
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

        <Link
          href="/#publicar"
          className="rounded-md bg-pasto px-4 py-2 text-sm font-semibold text-crema transition-colors hover:bg-pasto-hondo"
        >
          Anunciar
        </Link>
      </div>
    </header>
  );
}
