/**
 * Vínculo de un lead con su proyecto real a partir del texto de interés (M41).
 *
 * El portal y otros canales envían el nombre o el slug del proyecto como texto
 * (`projectInterestText`), no el id interno del CRM. Función pura: el caso de
 * uso le pasa el catálogo vivo de proyectos y aquí solo se decide cuál es.
 *
 * Regla: coincidencia exacta (nombre o slug, sin tildes, mayúsculas ni signos)
 * o, en su defecto, contención en un único proyecto. Si hay ambigüedad no se
 * vincula: un vínculo equivocado es peor que ninguno (el texto se conserva).
 */

export type ProyectoVinculable = { id: number; name: string; slug: string };

/** Longitud mínima del texto normalizado para aceptar una coincidencia por contención. */
const MINIMO_CONTENCION = 4;

export function normalizarNombreProyecto(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

export function resolverProyecto(
  texto: string | null | undefined,
  proyectos: readonly ProyectoVinculable[],
): number | null {
  const buscado = normalizarNombreProyecto(texto ?? "");
  if (!buscado) return null;

  const claves = proyectos.map((proyecto) => ({
    id: proyecto.id,
    nombres: [normalizarNombreProyecto(proyecto.name), normalizarNombreProyecto(proyecto.slug)].filter(Boolean),
  }));

  const exactos = new Set(claves.filter((clave) => clave.nombres.includes(buscado)).map((clave) => clave.id));
  if (exactos.size === 1) return [...exactos][0]!;
  if (exactos.size > 1 || buscado.length < MINIMO_CONTENCION) return null;

  const contenidos = new Set(
    claves
      .filter((clave) =>
        clave.nombres.some(
          (nombre) => nombre.length >= MINIMO_CONTENCION && (nombre.includes(buscado) || buscado.includes(nombre)),
        ),
      )
      .map((clave) => clave.id),
  );
  return contenidos.size === 1 ? [...contenidos][0]! : null;
}
