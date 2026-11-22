// Adaptador de Odoo Community. Mismo contrato que adapters/espocrm.mjs:
//   upsertLead(lead)        -> { id, created }   (idempotente por lead.externalId)
//   findLeadByExternalId(x) -> { id, status } | null
//   health()                -> boolean
// Cambiar de EspoCRM a Odoo es cambiar CRM_ADAPTER=odoo; el servidor HTTP no se toca.
import { buscarProyecto, conCache } from "../lib/proyectos.mjs";
import { normalizarTelefono } from "../lib/telefono.mjs";
const URL_RPC = (process.env.ODOO_URL || "http://odoo-crm:8069").replace(/\/$/, "") + "/jsonrpc";
const DB = process.env.ODOO_DB || "crm";
const LOGIN = process.env.ODOO_API_LOGIN || "";
const PASS = process.env.ODOO_API_PASSWORD || "";
const SOURCE = process.env.ODOO_LEAD_SOURCE || "Portal web";
const ASESORES = (process.env.ODOO_ASSIGNEES || "").split(",").map((s) => Number(s.trim())).filter(Boolean);
const TEAM = process.env.ODOO_TEAM_NAME || "Ventas";

let uid = null;
let cacheIds = {};

async function rpc(service, method, args) {
  const res = await fetch(URL_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", method: "call", params: { service, method, args }, id: 1 }),
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) {
    const err = new Error(`Odoo HTTP ${res.status}`);
    err.status = res.status;
    err.retryable = res.status >= 500 || res.status === 429;
    throw err;
  }
  const j = await res.json();
  if (j.error) {
    const err = new Error("Odoo: " + (j.error.data?.message || j.error.message));
    err.status = 400; // error de negocio: no se reintenta
    err.retryable = false;
    throw err;
  }
  return j.result;
}

async function ensureLogin() {
  if (uid) return uid;
  uid = await rpc("common", "login", [DB, LOGIN, PASS]);
  if (!uid) { const e = new Error("Odoo: credenciales del adaptador rechazadas"); e.status = 401; e.retryable = false; throw e; }
  return uid;
}
const call = async (model, method, args, kwargs = {}) => rpc("object", "execute_kw", [DB, await ensureLogin(), PASS, model, method, args, kwargs]);

async function idPorNombre(model, name) {
  const clave = model + ":" + name;
  if (cacheIds[clave]) return cacheIds[clave];
  const r = await call(model, "search", [[["name", "=", name]]], { limit: 1 });
  if (r[0]) cacheIds[clave] = r[0];
  return r[0] || false;
}

const proyectos = conCache(async () => {
  const r = await call("x_propiedad", "search_read", [[]], { fields: ["id", "x_name"], limit: 500 });
  return r.map((p) => ({ id: p.id, nombre: p.x_name }));
});
async function proyectoVinculado(lead) {
  try { const id = buscarProyecto(lead.projectInterestText, await proyectos()); return id ? { x_propiedad_id: id } : {}; } catch { return {}; }
}

// Misma política que el adaptador de EspoCRM: el asesor con menos interesados abiertos (lista en ODOO_ASSIGNEES).
async function asesorMenosCargado() {
  if (!ASESORES.length) return false;
  try {
    const cargas = [];
    for (const id of ASESORES) cargas.push({ id, n: await call("crm.lead", "search_count", [[["user_id", "=", id], ["probability", "<", 100]]]) });
    cargas.sort((a, b) => a.n - b.n);
    return cargas[0].id;
  } catch { return false; }
}

export async function findLeadByExternalId(externalId) {
  const r = await call("crm.lead", "search_read", [[["x_external_id", "=", externalId]]], { fields: ["id", "stage_id"], limit: 1, context: { active_test: false } });
  return r[0] ? { id: r[0].id, status: r[0].stage_id?.[1] ?? null } : null;
}

export async function upsertLead(lead) {
  const existente = await findLeadByExternalId(lead.externalId);
  if (existente) return { id: existente.id, created: false };
  const tel = normalizarTelefono(lead.phone);
  const descripcion = [lead.originalMessage, tel.invalido ? `Teléfono indicado (no válido): ${tel.invalido}` : null].filter(Boolean).join("\n") || false;
  const vals = {
    name: `${lead.fullName} — ${lead.projectInterestText || "Consulta del portal"}`,
    contact_name: lead.fullName,
    email_from: lead.email || false,
    phone: tel.e164 || false,
    description: descripcion,
    x_external_id: lead.externalId,
    x_proyecto_interes: lead.projectInterestText || false,
    ...(await proyectoVinculado(lead)),
    source_id: await idPorNombre("utm.source", SOURCE),
    team_id: await idPorNombre("crm.team", TEAM),
    user_id: await asesorMenosCargado(),
  };
  const id = await call("crm.lead", "create", [vals]);

  return { id, created: true };
}

export async function health() {
  try { await ensureLogin(); return true; } catch { return false; }
}
