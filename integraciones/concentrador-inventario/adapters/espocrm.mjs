// Adaptador de EspoCRM para el inventario (entidad CPropiedad, un registro por proyecto). Único archivo que la conoce.
import { slugDe } from "../core.mjs";

export const nombre = "espocrm";
// habMin/habMax NO se sincronizan aquí: este sistema guarda habitaciones como entero y el portal admite medias (p. ej. 3,5); redondear perdería datos.
export const campos = ["nombre", "zona", "clase", "areaMin", "areaMax", "precioMin", "precioMax", "moneda", "entrega", "disponibilidad", "ubicacion"];

const BASE = (process.env.ESPO_URL || "http://espocrm").replace(/\/$/, "") + "/api/v1";
const KEY = process.env.ESPO_API_KEY || "";
const EQUIPO = process.env.ESPO_TEAM_ID || "";

async function llamar(metodo, ruta, cuerpo) {
  const r = await fetch(BASE + "/" + ruta, { method: metodo, headers: { "X-Api-Key": KEY, "Content-Type": "application/json" }, body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo), signal: AbortSignal.timeout(15000) });
  if (!r.ok) { const e = new Error(`EspoCRM ${metodo} ${ruta} -> ${r.status} ${r.headers.get("x-status-reason") ?? ""}`); e.status = r.status; throw e; }
  return r.status === 204 ? null : r.json();
}
const ms = (s) => (s ? Date.parse(String(s).replace(" ", "T") + "Z") : 0);
const CAMPOS = "id,name,idExterno,zona,tipoUnidad,habitacionesMin,habitaciones,areaConstruida,areaMax,precio,precioCurrency,precioHasta,entrega,disponibilidadTexto,ubicacion,modifiedAt";

// campo canónico -> atributo de CPropiedad
const ATRIBUTO = { nombre: "name", zona: "zona", clase: "tipoUnidad", habMin: "habitacionesMin", habMax: "habitaciones", areaMin: "areaConstruida", areaMax: "areaMax", precioMin: "precio", precioMax: "precioHasta", entrega: "entrega", disponibilidad: "disponibilidadTexto", ubicacion: "ubicacion" };

function aCuerpo(parcial) {
  const b = {};
  for (const [campo, v] of Object.entries(parcial)) {
    if (campo === "moneda") { b.precioCurrency = v || "USD"; b.precioHastaCurrency = v || "USD"; }
    else if (ATRIBUTO[campo]) b[ATRIBUTO[campo]] = v ?? (["habMin", "habMax", "areaMin", "areaMax", "precioMin", "precioMax"].includes(campo) ? null : "");
  }
  return b;
}

export async function listar() {
  const lista = [];
  for (let off = 0; ; off += 200) {
    const r = await llamar("GET", `CPropiedad?select=${CAMPOS}&maxSize=200&offset=${off}`);
    lista.push(...(r.list ?? []));
    if ((r.list ?? []).length < 200) break;
  }
  return lista.map((x) => ({
    id: x.id, slug: slugDe(x.name), codigo: x.idExterno || null, actualizadoEn: ms(x.modifiedAt),
    datos: { nombre: x.name, zona: x.zona, clase: x.tipoUnidad, habMin: x.habitacionesMin, habMax: x.habitaciones, areaMin: x.areaConstruida, areaMax: x.areaMax, precioMin: x.precio, precioMax: x.precioHasta, moneda: x.precioCurrency, entrega: x.entrega, disponibilidad: x.disponibilidadTexto, ubicacion: x.ubicacion },
  }));
}

export async function actualizar(id, parcial) { await llamar("PUT", `CPropiedad/${id}`, aCuerpo(parcial)); return []; }

export async function crear({ slug, codigo, datos }) {
  const r = await llamar("POST", "CPropiedad", { ...aCuerpo(datos), codigoUnidad: codigo || `HUB-${slug}`.slice(0, 60), idExterno: codigo || `HUB-${slug}`.slice(0, 60), estado: "disponible", operacion: "venta", ...(EQUIPO ? { teamsIds: [EQUIPO] } : {}) });
  return { id: r.id, avisos: [] };
}

export async function health() { try { await llamar("GET", "App/user"); return true; } catch { return false; } }
