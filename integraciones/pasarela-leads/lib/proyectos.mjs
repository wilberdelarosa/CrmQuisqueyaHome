// Emparejado de proyectos (sin conocer a ningún CRM): el portal envía el nombre o el slug del proyecto
// y cada adaptador lo convierte en el id del proyecto real dentro de su CRM.
export const normalizar = (s) =>
  String(s ?? "")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/** lista: [{ id, nombre }]. Devuelve el id o null. Coincidencia exacta normalizada; si no, contención única. */
export function buscarProyecto(texto, lista) {
  const t = normalizar(texto);
  if (!t) return null;
  const exacto = lista.find((p) => normalizar(p.nombre) === t);
  if (exacto) return exacto.id;
  const parecidos = lista.filter((p) => { const n = normalizar(p.nombre); return n.length >= 4 && (t.includes(n) || n.includes(t)); });
  return parecidos.length === 1 ? parecidos[0].id : null;
}

/** Caché simple con vencimiento para listas de proyectos. */
export function conCache(fn, ms = 300000) {
  let valor = null, hasta = 0;
  return async () => {
    if (valor && Date.now() < hasta) return valor;
    valor = await fn(); hasta = Date.now() + ms;
    return valor;
  };
}
