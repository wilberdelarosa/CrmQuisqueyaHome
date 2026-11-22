// Adaptador de Odoo para el inventario (modelo x_propiedad, un registro por proyecto). Único archivo que lo conoce.
import { slugDe } from "../core.mjs";

export const nombre = "odoo";
// habMin/habMax NO se sincronizan aquí: este sistema guarda habitaciones como entero y el portal admite medias (p. ej. 3,5); redondear perdería datos.
export const campos = ["nombre", "zona", "clase", "areaMin", "areaMax", "precioMin", "precioMax", "moneda", "entrega", "disponibilidad", "ubicacion"];

const URL_RPC = (process.env.ODOO_URL || "http://odoo-crm:8069").replace(/\/$/, "") + "/jsonrpc";
const DB = process.env.ODOO_DB || "crm";
const LOGIN = process.env.ODOO_API_LOGIN || "";
const PASS = process.env.ODOO_API_PASSWORD || "";
let uid = null;

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

// campo canónico -> campo de x_propiedad
const ATRIBUTO = { nombre: "x_name", zona: "x_zona", clase: "x_tipo_unidad", habMin: "x_hab_min", habMax: "x_habitaciones", areaMin: "x_area_construida", areaMax: "x_area_max", precioMin: "x_precio", precioMax: "x_precio_hasta", moneda: "x_moneda", entrega: "x_entrega", disponibilidad: "x_disponibilidad_texto", ubicacion: "x_ubicacion" };
const NUMERICOS = ["habMin", "habMax", "areaMin", "areaMax", "precioMin", "precioMax"];
const aValores = (parcial) => Object.fromEntries(Object.entries(parcial).filter(([c]) => ATRIBUTO[c]).map(([c, v]) => [ATRIBUTO[c], v ?? (NUMERICOS.includes(c) ? 0 : false)]));

export async function listar() {
  const filas = await call("x_propiedad", "search_read", [[]], { fields: ["x_codigo", ...Object.values(ATRIBUTO), "write_date"], limit: 1000, context: { active_test: false } });
  return filas.map((x) => ({
    id: String(x.id), slug: slugDe(x.x_name), codigo: vacio(x.x_codigo), actualizadoEn: ms(x.write_date),
    datos: Object.fromEntries(Object.entries(ATRIBUTO).map(([c, f]) => [c, vacio(x[f])])),
  }));
}

export async function actualizar(id, parcial) { const v = aValores(parcial); if (Object.keys(v).length) await call("x_propiedad", "write", [[Number(id)], v]); return []; }

export async function crear({ slug, codigo, datos }) {
  const id = await call("x_propiedad", "create", [{ ...aValores(datos), x_codigo: codigo || `HUB-${slug}`.slice(0, 60), x_id_externo: codigo || `HUB-${slug}`.slice(0, 60), x_estado: "disponible", x_operacion: "venta" }]);
  return { id: String(id), avisos: [] };
}

export async function health() { try { await call("x_propiedad", "search_count", [[]]); return true; } catch { return false; } }
