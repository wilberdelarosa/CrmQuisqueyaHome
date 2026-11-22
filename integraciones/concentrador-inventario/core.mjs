// Núcleo del concentrador de inventario: lógica pura, sin conocer a ningún sistema (principio P1).
// Modelo canónico = solo datos PÚBLICOS del catálogo. Precios reales, notas internas y estado de publicación
// editorial NO viajan por aquí: la publicación en el portal sigue siendo una decisión editorial del portal.
//
// Fusión de tres vías por campo: «base» (último acuerdo) contra el valor actual de cada sistema.
//  - ningún sistema cambió el campo  -> se conserva la base;
//  - cambió uno (o varios al mismo valor) -> ese valor gana y se propaga a los demás;
//  - cambiaron varios a valores distintos -> gana el cambio más reciente (marca de tiempo del sistema);
//    si empatan, manda el orden de prioridad. Cada conflicto queda registrado.
// Como después de aplicar todos los sistemas coinciden con la nueva base, un cambio nunca rebota (sin bucles).

export const CAMPOS = {
  nombre: "texto",
  zona: "texto",
  clase: "texto",
  habMin: "num",
  habMax: "num",
  areaMin: "num",
  areaMax: "num",
  precioMin: "num",
  precioMax: "num",
  moneda: "moneda",
  entrega: "texto",
  disponibilidad: "texto",
  ubicacion: "texto",
  descripcion: "texto",
};
export const CAMPOS_PROYECTO = CAMPOS;
export const NOMBRES_CAMPOS = Object.keys(CAMPOS);

/** Valor comparable: vacío, 0 en numéricos y NaN significan «sin dato» (null). */
export function normalizar(campo, v, campos = CAMPOS) {
  const tipo = campos[campo];
  if (v === undefined || v === null) return null;
  if (tipo === "entero") {
    // Para sistemas que guardan enteros (habitaciones, piso): se compara redondeado y 0 = sin dato, así nunca se reescribe en bucle.
    const n = Math.round(Number(v));
    return Number.isFinite(n) && n !== 0 ? n : null;
  }
  if (tipo === "num") {
    const n = Number(v);
    return Number.isFinite(n) && n !== 0 ? Math.round(n * 1e4) / 1e4 : null;
  }
  const t = String(v).replace(/\s+/g, " ").trim();
  if (t === "") return null;
  return tipo === "moneda" ? t.toUpperCase() : t;
}
export const iguales = (campo, a, b, campos = CAMPOS) => normalizar(campo, a, campos) === normalizar(campo, b, campos);

/**
 * @param base       datos canónicos del último acuerdo, o null si es la primera vez que se ve el proyecto
 * @param actuales   { sistema: { datos, actualizadoEn } }  (solo sistemas donde el proyecto existe)
 * @param soportados { sistema: [campos que ese sistema puede guardar] }
 * @param prioridad  [sistemas] de mayor a menor autoridad (desempate y primera carga)
 * @returns { nuevo, cambios: { sistema: parcial }, conflictos: [{campo, valores:[{sistema,valor}], ganador}] }
 */
export function fusionar({ base, actuales, soportados, prioridad, campos = CAMPOS }) {
  const presentes = prioridad.filter((s) => actuales[s]);
  const nuevo = {};
  const conflictos = [];
  const normalizarC = (c, v) => normalizar(c, v, campos);
  for (const campo of Object.keys(campos)) {
    const quienes = presentes.filter((s) => (soportados[s] ?? []).includes(campo));
    if (!quienes.length) { nuevo[campo] = base ? normalizarC(campo, base[campo]) : null; continue; }
    const valor = (s) => normalizarC(campo, actuales[s].datos[campo]);
    let candidatos;
    if (!base) candidatos = quienes; // primera carga: todos cuentan, manda la prioridad
    else candidatos = quienes.filter((s) => valor(s) !== normalizarC(campo, base[campo]));
    if (!candidatos.length) { nuevo[campo] = normalizarC(campo, base[campo]); continue; }
    const distintos = [...new Set(candidatos.map(valor))];
    if (!base) {
      // Primera carga: el primer sistema con dato (por prioridad); si ninguno tiene, null.
      const conDato = candidatos.find((s) => valor(s) !== null);
      nuevo[campo] = conDato ? valor(conDato) : null;
      if (new Set(candidatos.map(valor).filter((x) => x !== null)).size > 1) {
        conflictos.push({ campo, valores: candidatos.map((s) => ({ sistema: s, valor: valor(s) })), ganador: conDato });
      }
      continue;
    }
    if (distintos.length === 1) { nuevo[campo] = distintos[0]; continue; }
    // Conflicto: gana el cambio más reciente; empate -> prioridad.
    const ordenados = [...candidatos].sort((a, b) => (actuales[b].actualizadoEn ?? 0) - (actuales[a].actualizadoEn ?? 0) || prioridad.indexOf(a) - prioridad.indexOf(b));
    const ganador = ordenados[0];
    nuevo[campo] = valor(ganador);
    conflictos.push({ campo, valores: candidatos.map((s) => ({ sistema: s, valor: valor(s) })), ganador });
  }
  const cambios = {};
  for (const s of presentes) {
    const parcial = {};
    for (const campo of soportados[s] ?? []) {
      if (!iguales(campo, actuales[s].datos[campo], nuevo[campo], campos)) parcial[campo] = nuevo[campo];
    }
    if (Object.keys(parcial).length) cambios[s] = parcial;
  }
  return { nuevo, cambios, conflictos };
}

/** slug a partir de un nombre (mismo criterio que el portal: sin tildes, minúsculas, guiones). */
export const slugDe = (nombre) =>
  String(nombre ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
