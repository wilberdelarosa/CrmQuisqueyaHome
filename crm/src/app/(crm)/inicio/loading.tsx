/** Estado de carga de Inicio: la misma estructura que la página, sin datos. */
export default function CargandoInicio() {
  const bloque = "animate-pulse rounded-panel bg-brand-100/70";
  return (
    <div className="space-y-6 lg:space-y-8" role="status" aria-label="Cargando Inicio">
      <div className="space-y-2">
        <div className={`${bloque} h-9 w-64 max-w-full`} />
        <div className={`${bloque} h-5 w-44`} />
      </div>
      <div className={`${bloque} h-52`} />
      <div className={`${bloque} h-24`} />
      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        <div className={`${bloque} h-56`} />
        <div className={`${bloque} h-56`} />
      </div>
    </div>
  );
}
