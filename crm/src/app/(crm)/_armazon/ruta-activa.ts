/** ¿La ruta actual pertenece a esta entrada? (la propia base o una subruta suya). Sin dependencias: viaja al navegador. */
export function estaActiva(rutaActual: string, rutaBase: string): boolean {
  return rutaActual === rutaBase || rutaActual.startsWith(`${rutaBase}/`);
}
