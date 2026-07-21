import Link from "next/link";

export default function Publicar() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-20 text-center">
      <div className="text-5xl">🐂</div>
      <h1 className="mt-4 font-display text-4xl font-bold text-pasto-hondo">
        Anunciá tu lote
      </h1>
      <p className="mx-auto mt-4 max-w-lg text-humo">
        Acá vas a poder cargar tu ganado: fotos, categoría, raza, peso, precio y
        ubicación. Estamos construyendo esta parte.
      </p>

      <div className="mx-auto mt-8 max-w-md rounded-lg border border-crema-2 bg-white p-6 text-left">
        <div className="text-xs font-semibold uppercase tracking-widest text-tierra">
          Próximamente
        </div>
        <ul className="mt-3 space-y-2 text-sm text-tinta">
          <li>• Crear una cuenta e iniciar sesión</li>
          <li>• Cargar el lote con hasta 8 fotos</li>
          <li>• Publicar y recibir contactos por WhatsApp</li>
        </ul>
      </div>

      <Link
        href="/"
        className="mt-8 inline-block rounded-md bg-pasto px-6 py-3 font-semibold text-crema transition-colors hover:bg-pasto-hondo"
      >
        ← Volver al inicio
      </Link>
    </section>
  );
}
