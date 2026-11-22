// Concentrador de inventario: sincroniza en todas direcciones los datos PÚBLICOS de proyectos, tipologías y unidades entre el
// portal (CMS) y los CRM. Un adaptador por sistema y tipo (ver ./recursos.mjs); la fusión es pura (./core.mjs).
// Si algún sistema de un tipo no responde, ese tipo se omite completo en el ciclo: nunca se fusiona con datos parciales
// (evita que un sistema desactualizado pise a los demás al volver). Los tipos con padre se procesan después del padre.
import http from "node:http";
import { timingSafeEqual } from "node:crypto";
import { existsSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { fusionar } from "./core.mjs";
import { RECURSOS } from "./recursos.mjs";

const ORDEN = (process.env.HUB_RESOURCES || "proyectos,tipologias,unidades").split(",").map((s) => s.trim()).filter((k) => RECURSOS[k]);
const INTERVALO_MS = Number(process.env.HUB_INTERVAL_S || 30) * 1000;
const TOKEN = process.env.HUB_TOKEN || "";
const ARCHIVO = process.env.HUB_STATE || "/data/estado-inventario.json";
const PORT = Number(process.env.PORT || 8081);

const adaptadores = {}; // recurso -> sistema -> módulo
for (const k of ORDEN) {
  adaptadores[k] = {};
  for (const s of RECURSOS[k].sistemas) {
    if (!/^[a-z0-9_]+$/.test(s)) throw new Error("sistema inválido: " + s);
    adaptadores[k][s] = await import(`./${RECURSOS[k].dir}/${s}.mjs`);
  }
}
const sistemasUnicos = [...new Set(ORDEN.flatMap((k) => RECURSOS[k].sistemas))];

// --- estado persistente --------------------------------------------------------
const nuevoRecurso = () => ({ mapa: {}, base: {}, codigos: {}, padres: {} });
const vacio = () => ({ recursos: {}, bitacora: [], conflictos: [], ultimoCiclo: null });
let estado = existsSync(ARCHIVO) ? { ...vacio(), ...JSON.parse(readFileSync(ARCHIVO, "utf8")) } : vacio();
// Migración desde la versión de un solo recurso (estado en la raíz): eso eran los proyectos.
if (estado.base && !estado.recursos.proyectos) { estado.recursos.proyectos = { ...nuevoRecurso(), mapa: estado.mapa ?? {}, base: estado.base, codigos: estado.codigos ?? {} }; delete estado.base; delete estado.mapa; delete estado.codigos; }
for (const k of ORDEN) estado.recursos[k] ??= nuevoRecurso();
function guardar() { const tmp = ARCHIVO + ".tmp"; writeFileSync(tmp, JSON.stringify(estado)); renameSync(tmp, ARCHIVO); }
const anotar = (e) => { estado.bitacora.push({ t: new Date().toISOString(), ...e }); if (estado.bitacora.length > 400) estado.bitacora.splice(0, estado.bitacora.length - 400); };

// --- ciclo ---------------------------------------------------------------------
let enCurso = Promise.resolve();
export function sincronizar(opciones = {}) {
  const p = enCurso.then(() => ciclo(opciones));
  enCurso = p.catch(() => {});
  return p;
}

async function cicloRecurso(kind, simulacro) {
  const def = RECURSOS[kind];
  const SIS = def.sistemas;
  const ad = adaptadores[kind];
  const st = estado.recursos[kind];
  const res = { ok: true, omitido: null, elementos: 0, actualizados: 0, creados: 0, conflictos: 0, sinCambios: 0, sinPadre: 0, errores: [], acciones: [] };

  const listas = {};
  const resultados = await Promise.allSettled(SIS.map((s) => ad[s].listar()));
  const caidos = [];
  resultados.forEach((r, i) => (r.status === "fulfilled" ? (listas[SIS[i]] = r.value) : caidos.push(`${SIS[i]}: ${r.reason?.message ?? "error"}`)));
  if (caidos.length) { res.ok = false; res.omitido = "sistema no disponible: " + caidos.join("; "); return res; }

  // Traducción id nativo del padre -> slug canónico del padre (mapa del recurso padre, ya actualizado en este ciclo).
  const padreSt = def.padre ? estado.recursos[def.padre] : null;
  const indicePadre = {};
  if (padreSt) for (const [slug, ids] of Object.entries(padreSt.mapa)) for (const [s, id] of Object.entries(ids)) (indicePadre[s] ??= {})[String(id)] = slug;

  // Identidad: id nativo -> clave canónica (mapa persistido; luego código de catálogo; luego clave natural).
  const indice = Object.fromEntries(SIS.map((s) => [s, {}]));
  for (const [clave, ids] of Object.entries(st.mapa)) for (const [s, id] of Object.entries(ids)) if (indice[s]) indice[s][String(id)] = clave;
  const porClave = {};
  const codigos = { ...st.codigos };
  const padres = { ...st.padres };
  const mapaNuevo = {};
  for (const s of SIS) {
    for (const it of listas[s]) {
      let clave;
      if (padreSt) {
        const padreSlug = indicePadre[s]?.[String(it.padreId)];
        if (!padreSlug) { res.sinPadre++; continue; }
        const natural = `${padreSlug}/${it.slug}`;
        clave = indice[s][String(it.id)] ?? natural;
        padres[clave] = clave.split("/")[0];
      } else {
        clave = indice[s][String(it.id)] ?? (it.codigo && codigos[it.codigo]) ?? it.slug;
      }
      if (!clave) continue;
      if (porClave[clave]?.[s]) { anotar({ recurso: kind, aviso: "duplicado", sistema: s, clave, id: it.id }); continue; }
      (porClave[clave] ??= {})[s] = { id: it.id, datos: it.datos, actualizadoEn: it.actualizadoEn };
      if (!padreSt && it.codigo) codigos[it.codigo] = codigos[it.codigo] ?? clave;
      (mapaNuevo[clave] ??= {})[s] = it.id;
    }
  }
  const soportados = Object.fromEntries(SIS.map((s) => [s, ad[s].campos]));
  let creaciones = 0;
  for (const [clave, actuales] of Object.entries(porClave)) {
    res.elementos++;
    const base = st.base[clave] ?? null;
    const r = fusionar({ base, actuales, soportados, prioridad: SIS, campos: def.campos });
    const faltantes = SIS.filter((s) => !actuales[s]);
    const hayCreacion = faltantes.length > 0 && (def.requerido ? r.nuevo[def.requerido] : true);
    if (!Object.keys(r.cambios).length && !hayCreacion) { res.sinCambios++; if (!simulacro) st.base[clave] = r.nuevo; continue; }
    if (r.conflictos.length) res.conflictos += r.conflictos.length;
    const codigo = padreSt ? null : (Object.entries(codigos).find(([, v]) => v === clave)?.[0] ?? null);
    const padreSlug = padreSt ? clave.split("/")[0] : null;
    const claveLocal = padreSt ? clave.split("/").slice(1).join("/") : clave;
    let fallo = false;
    const nuevosIds = {};
    for (const [s, parcial] of Object.entries(r.cambios)) {
      res.acciones.push({ clave, sistema: s, accion: "actualizar", campos: Object.keys(parcial) });
      if (simulacro) continue;
      try { const avisos = await ad[s].actualizar(actuales[s].id, parcial); anotar({ recurso: kind, clave, sistema: s, accion: "actualizar", campos: parcial, avisos: avisos?.length ? avisos : undefined }); }
      catch (e) { fallo = true; res.errores.push({ clave, sistema: s, error: e.message }); }
    }
    if (hayCreacion) {
      for (const s of faltantes) {
        const padreNativo = padreSt ? (padreSt.mapa[padreSlug]?.[s] ?? null) : null;
        if (padreSt && padreNativo === null) { res.errores.push({ clave, sistema: s, error: `el proyecto «${padreSlug}» no existe todavía en ${s}` }); fallo = true; continue; }
        if (creaciones >= def.maxCrear) { res.errores.push({ clave, sistema: s, error: "tope de creaciones por ciclo" }); fallo = true; continue; }
        const datos = Object.fromEntries(ad[s].campos.map((c) => [c, r.nuevo[c] ?? null]));
        res.acciones.push({ clave, sistema: s, accion: "crear" });
        creaciones++;
        if (simulacro) continue;
        try { const c = await ad[s].crear({ slug: claveLocal, codigo, padreId: padreNativo, datos }); nuevosIds[s] = c.id; anotar({ recurso: kind, clave, sistema: s, accion: "crear", avisos: c.avisos?.length ? c.avisos : undefined }); res.creados++; }
        catch (e) { fallo = true; res.errores.push({ clave, sistema: s, error: e.message }); }
      }
    }
    if (simulacro) continue;
    for (const c of r.conflictos) { estado.conflictos.push({ t: new Date().toISOString(), recurso: kind, clave, ...c }); anotar({ recurso: kind, clave, aviso: "conflicto", campo: c.campo, ganador: c.ganador }); }
    if (estado.conflictos.length > 300) estado.conflictos.splice(0, estado.conflictos.length - 300);
    Object.assign((mapaNuevo[clave] ??= {}), nuevosIds);
    if (Object.keys(r.cambios).length) res.actualizados += Object.keys(r.cambios).length;
    // La base solo avanza si todo se aplicó: si algo falló, el siguiente ciclo repite lo pendiente (todo es idempotente).
    if (!fallo) st.base[clave] = r.nuevo;
  }
  if (!simulacro) {
    // Lo que ya no existe en NINGÚN sistema deja de ocupar estado (los borrados no se propagan: solo se olvida lo huérfano).
    for (const clave of Object.keys(st.base)) if (!porClave[clave]) { delete st.base[clave]; delete st.mapa[clave]; delete padres[clave]; }
    st.mapa = { ...st.mapa, ...mapaNuevo };
    st.codigos = codigos;
    st.padres = padres;
  }
  res.ok = res.errores.length === 0;
  return res;
}

async function ciclo({ simulacro = false } = {}) {
  const inicio = Date.now();
  const total = { simulacro, ok: true, omitido: null, proyectos: 0, actualizados: 0, creados: 0, conflictos: 0, sinCambios: 0, errores: [], acciones: [], porRecurso: {} };
  for (const kind of ORDEN) {
    const padre = RECURSOS[kind].padre;
    if (padre && total.porRecurso[padre] && !total.porRecurso[padre].ok && total.porRecurso[padre].omitido) {
      total.porRecurso[kind] = { ok: false, omitido: `omitido: el padre «${padre}» no se pudo sincronizar` };
      total.ok = false;
      continue;
    }
    const r = await cicloRecurso(kind, simulacro);
    total.porRecurso[kind] = { ...r, acciones: undefined };
    if (kind === "proyectos") total.proyectos = r.elementos;
    total.actualizados += r.actualizados; total.creados += r.creados; total.conflictos += r.conflictos; total.sinCambios += r.sinCambios;
    total.errores.push(...r.errores.map((e) => ({ recurso: kind, ...e })));
    total.acciones.push(...r.acciones.map((a) => ({ recurso: kind, ...a })));
    if (!r.ok) { total.ok = false; total.omitido = total.omitido ?? (r.omitido ? `${kind}: ${r.omitido}` : null); }
    if (!simulacro) guardar();
  }
  estado.ultimoCiclo = { ...total, acciones: total.acciones.slice(0, 40), en: new Date().toISOString(), ms: Date.now() - inicio };
  if (!simulacro) guardar();
  return total;
}

// --- servidor ------------------------------------------------------------------
const iguales = (a, b) => { const x = Buffer.from(String(a)), y = Buffer.from(String(b)); return x.length === y.length && timingSafeEqual(x, y); };
const json = (res, code, obj) => { res.writeHead(code, { "Content-Type": "application/json" }); res.end(JSON.stringify(obj)); };
const autorizado = (req) => TOKEN && iguales(req.headers["x-hub-token"] || "", TOKEN);

http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://x");
    if (req.method === "GET" && url.pathname === "/health") {
      const salud = {};
      for (const k of ORDEN) for (const s of RECURSOS[k].sistemas) { const v = await adaptadores[k][s].health().catch(() => false); salud[s] = (salud[s] ?? true) && v; }
      const ok = Object.values(salud).every(Boolean);
      return json(res, ok ? 200 : 503, { ok, sistemas: salud, recursos: ORDEN, ultimoCiclo: estado.ultimoCiclo && { en: estado.ultimoCiclo.en, ok: estado.ultimoCiclo.ok, omitido: estado.ultimoCiclo.omitido } });
    }
    if (!autorizado(req)) return json(res, 401, { error: "token inválido" });
    if (req.method === "POST" && url.pathname === "/api/inventario/sincronizar") return json(res, 200, await sincronizar({ simulacro: url.searchParams.get("simulacro") === "1" }));
    if (req.method === "GET" && url.pathname === "/api/inventario/estado") {
      return json(res, 200, {
        sistemas: sistemasUnicos, recursos: Object.fromEntries(ORDEN.map((k) => [k, { sistemas: RECURSOS[k].sistemas, campos: Object.keys(RECURSOS[k].campos), elementos: Object.keys(estado.recursos[k].base).length }])),
        proyectos: Object.keys(estado.recursos.proyectos?.base ?? {}).length, ultimoCiclo: estado.ultimoCiclo, bitacora: estado.bitacora.slice(-80), conflictos: estado.conflictos.slice(-40),
      });
    }
    json(res, 404, { error: "no encontrado" });
  } catch (e) { json(res, 500, { error: "error interno", detalle: e.message }); }
}).listen(PORT, () => console.log("concentrador de inventario escuchando en " + PORT + " · recursos: " + ORDEN.join(", ")));

if (INTERVALO_MS > 0 && process.env.HUB_AUTO !== "0") {
  const vuelta = () => sincronizar().catch((e) => console.error("[concentrador] ciclo falló:", e.message)).finally(() => setTimeout(vuelta, INTERVALO_MS));
  setTimeout(vuelta, 5000);
}
