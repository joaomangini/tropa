export default function Footer() {
  return (
    <footer className="mt-20 border-t border-crema-2 bg-pasto-hondo text-crema">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xs">
            <div className="font-display text-2xl font-bold tracking-tight">
              TROPA
            </div>
            <p className="mt-2 text-sm text-crema/70">
              Compra y venta de ganado en Paraguay. Publicá tu lote y hablá
              directo con el comprador.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
            <div>
              <div className="mb-3 font-semibold text-ambar">Mercado</div>
              <ul className="space-y-2 text-crema/75">
                <li>Animales</li>
                <li>Razas</li>
                <li>Departamentos</li>
              </ul>
            </div>
            <div>
              <div className="mb-3 font-semibold text-ambar">Vendé</div>
              <ul className="space-y-2 text-crema/75">
                <li>Anunciar lote</li>
                <li>Cómo funciona</li>
                <li>Precios</li>
              </ul>
            </div>
            <div>
              <div className="mb-3 font-semibold text-ambar">Contacto</div>
              <ul className="space-y-2 text-crema/75">
                <li>WhatsApp</li>
                <li>Ayuda</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-crema/15 pt-6 text-xs text-crema/50">
          © {new Date().getFullYear()} Tropa · Mercado de ganado — Paraguay
        </div>
      </div>
    </footer>
  );
}
