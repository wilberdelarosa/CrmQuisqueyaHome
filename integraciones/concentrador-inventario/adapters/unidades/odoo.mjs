// Unidades en Odoo (modelo x_unidad, ligado a x_propiedad). Único archivo que lo conoce.
export const campos = ["tipo", "hab", "banos", "area", "patio", "nivel", "torre", "estado", "precioMin", "precioMax", "moneda"];
const URL_RPC = (process.env.ODOO_URL || "http://odoo-crm:8069").replace(/\/$/, "") + "/jsonrpc";
const DB = process.env.ODOO_DB || "crm";
const LOGIN = process.env.ODOO_API_LOGIN || "";
const PASS = process.env.ODOO_API_PASSWORD || "";
let uid = null;
const ATRIBUTO = { tipo: "x_tipo", hab: "x_hab", banos: "x_banos", area: "x_area", patio: "x_patio", nivel: "x_nivel", torre: "x_torre", estado: "x_estado", precioMin: "x_precio_min", precioMax: "x_precio_max", moneda: "x_moneda" };
const NUM = ["hab", "banos", "area", "patio", "nivel", "precioMin", "precioMax"];

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
const aValores = (parcial) => Object.fromEntries(Object.entries(parcial).filter(([c, v]) => ATRIBUTO[c] && !(c === "estado" && v === null)).map(([c, v]) => [ATRIBUTO[c], v ?? (NUM.includes(c) ? 0 : false)]));

export async function listar() {
  const filas = await call("x_unidad", "search_read", [[]], { fields: ["x_codigo", "x_propiedad_id", ...Object.values(ATRIBUTO), "write_date"], limit: 5000, context: { active_test: false } });
  return filas.map((x) => ({
    id: String(x.id), slug: vacio(x.x_codigo) || x.x_name, padreId: x.x_propiedad_id ? String(x.x_propiedad_id[0]) : null, actualizadoEn: ms(x.write_date),
    datos: Object.fromEntries(Object.entries(ATRIBUTO).map(([c, f]) => [c, vacio(x[f])])),
  }));
}
export async function actualizar(id, parcial) { const v = aValores(parcial); if (Object.keys(v).length) await call("x_unidad", "write", [[Number(id)], v]); return []; }
export async function crear({ slug, padreId, datos }) {
  const id = await call("x_unidad", "create", [{ ...aValores(datos), x_name: slug, x_codigo: slug, x_propiedad_id: Number(padreId) }]);
  return { id: String(id), avisos: [] };
}
export async function health() { try { await call("x_unidad", "search_count", [[]]); return true; } catch { return false; } }
