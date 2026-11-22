// Tipologías en Odoo (modelo x_tipologia, ligado a x_propiedad). Único archivo que lo conoce.
import { slugDe } from "../../core.mjs";

export const campos = ["nombre", "tipo", "habMin", "habMax", "banosMin", "banosMax", "areaMin", "areaMax", "precioMin", "precioMax", "moneda", "entrega"];
const URL_RPC = (process.env.ODOO_URL || "http://odoo-crm:8069").replace(/\/$/, "") + "/jsonrpc";
const DB = process.env.ODOO_DB || "crm";
const LOGIN = process.env.ODOO_API_LOGIN || "";
const PASS = process.env.ODOO_API_PASSWORD || "";
let uid = null;
const ATRIBUTO = { nombre: "x_name", tipo: "x_tipo", habMin: "x_hab_min", habMax: "x_hab_max", banosMin: "x_banos_min", banosMax: "x_banos_max", areaMin: "x_area_min", areaMax: "x_area_max", precioMin: "x_precio_min", precioMax: "x_precio_max", moneda: "x_moneda", entrega: "x_entrega" };
const NUM = ["habMin", "habMax", "banosMin", "banosMax", "areaMin", "areaMax", "precioMin", "precioMax"];

async function rpc(service, method, args) {
  const r = await fetch(URL_RPC, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", method: "call", params: { service, method, args }, id: 1 }), signal: AbortSignal.timeout(20000) });
  const j = await r.json();
  if (j.error) throw new Error("Odoo: " + (j.error.data?.message || j.error.message));
  return j.result;
}
async function call(model, method, args, kwargs = {}) {
  if (!uid) { uid = await rpc("common", "login", [DB, LOGIN, PASS]); if (!uid) throw new Error("Odoo: credenciales rechazadas"); }
  return rpc("object", "execute_kw", [DB, uid, PASS, model, method, args, kwargs]);
}
const ms = (s) => (s ? Date.parse(String(s).replace(" ", "T") + "Z") : 0);
const vacio = (v) => (v === false || v === undefined ? null : v);
const aValores = (parcial) => Object.fromEntries(Object.entries(parcial).filter(([c]) => ATRIBUTO[c]).map(([c, v]) => [ATRIBUTO[c], v ?? (NUM.includes(c) ? 0 : false)]));

export async function listar() {
  const filas = await call("x_tipologia", "search_read", [[]], { fields: ["x_codigo", "x_propiedad_id", ...Object.values(ATRIBUTO), "write_date"], limit: 2000, context: { active_test: false } });
  return filas.map((x) => ({
    id: String(x.id), slug: vacio(x.x_codigo) || slugDe(x.x_name), padreId: x.x_propiedad_id ? String(x.x_propiedad_id[0]) : null, actualizadoEn: ms(x.write_date),
    datos: Object.fromEntries(Object.entries(ATRIBUTO).map(([c, f]) => [c, vacio(x[f])])),
  }));
}
export async function actualizar(id, parcial) { const v = aValores(parcial); if (Object.keys(v).length) await call("x_tipologia", "write", [[Number(id)], v]); return []; }
export async function crear({ slug, padreId, datos }) {
  const id = await call("x_tipologia", "create", [{ ...aValores(datos), x_codigo: slug, x_propiedad_id: Number(padreId) }]);
  return { id: String(id), avisos: [] };
}
export async function health() { try { await call("x_tipologia", "search_count", [[]]); return true; } catch { return false; } }
