// Tipologías en EspoCRM (entidad CTipologia, ligada a CPropiedad por `proyecto`). Único archivo que la conoce.
import { slugDe } from "../../core.mjs";

export const campos = ["nombre", "tipo", "habMin", "habMax", "banosMin", "banosMax", "areaMin", "areaMax", "precioMin", "precioMax", "moneda", "entrega"];
const BASE = (process.env.ESPO_URL || "http://espocrm").replace(/\/$/, "") + "/api/v1";
const KEY = process.env.ESPO_API_KEY || "";
const EQUIPO = process.env.ESPO_TEAM_ID || "";
const ATRIBUTO = { nombre: "name", tipo: "tipo", habMin: "habMin", habMax: "habMax", banosMin: "banosMin", banosMax: "banosMax", areaMin: "areaMin", areaMax: "areaMax", precioMin: "precioMin", precioMax: "precioMax", moneda: "moneda", entrega: "entrega" };
const NUM = ["habMin", "habMax", "banosMin", "banosMax", "areaMin", "areaMax", "precioMin", "precioMax"];

async function llamar(metodo, ruta, cuerpo) {
  const r = await fetch(BASE + "/" + ruta, { method: metodo, headers: { "X-Api-Key": KEY, "Content-Type": "application/json" }, body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo), signal: AbortSignal.timeout(15000) });
  if (!r.ok) throw new Error(`EspoCRM ${metodo} ${ruta} -> ${r.status} ${r.headers.get("x-status-reason") ?? ""}`);
  return r.status === 204 ? null : r.json();
}
const ms = (s) => (s ? Date.parse(String(s).replace(" ", "T") + "Z") : 0);
const aCuerpo = (parcial) => Object.fromEntries(Object.entries(parcial).filter(([c]) => ATRIBUTO[c]).map(([c, v]) => [ATRIBUTO[c], v ?? (NUM.includes(c) ? null : "")]));

export async function listar() {
  const lista = [];
  const sel = "id,name,codigo,proyectoId," + Object.values(ATRIBUTO).filter((a) => a !== "name").join(",") + ",modifiedAt";
  for (let off = 0; ; off += 200) {
    const r = await llamar("GET", `CTipologia?select=${sel}&maxSize=200&offset=${off}`);
    lista.push(...(r.list ?? []));
    if ((r.list ?? []).length < 200) break;
  }
  return lista.map((x) => ({
    id: x.id, slug: x.codigo || slugDe(x.name), padreId: x.proyectoId ?? null, actualizadoEn: ms(x.modifiedAt),
    datos: Object.fromEntries(Object.entries(ATRIBUTO).map(([c, a]) => [c, x[a]])),
  }));
}
export async function actualizar(id, parcial) { await llamar("PUT", `CTipologia/${id}`, aCuerpo(parcial)); return []; }
export async function crear({ slug, padreId, datos }) {
  const r = await llamar("POST", "CTipologia", { ...aCuerpo(datos), codigo: slug, proyectoId: padreId, ...(EQUIPO ? { teamsIds: [EQUIPO] } : {}) });
  return { id: r.id, avisos: [] };
}
export async function health() { try { await llamar("GET", "App/user"); return true; } catch { return false; } }
