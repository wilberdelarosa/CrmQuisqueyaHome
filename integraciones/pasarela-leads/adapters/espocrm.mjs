// Adaptador de EspoCRM. Es el único archivo que conoce a EspoCRM (principio P1):
// para cambiar de CRM se reemplaza este archivo y se conserva el contrato de abajo.
//
// Contrato del puerto CRM:
//   upsertLead(lead)        -> { id, created }   (idempotente por lead.externalId)
//   findLeadByExternalId(x) -> { id, status } | null
//   health()                -> boolean
import { buscarProyecto, conCache } from "../lib/proyectos.mjs";
import { normalizarTelefono } from "../lib/telefono.mjs";
const BASE = (process.env.ESPO_URL || "http://espocrm").replace(/\/$/, "") + "/api/v1";
const KEY = process.env.ESPO_API_KEY || "";
const SOURCE = process.env.ESPO_LEAD_SOURCE || "Portal";
const ASESORES = (process.env.ESPO_ASSIGNEES || "").split(",").map((s) => s.trim()).filter(Boolean);
const TEAM_ID = process.env.ESPO_TEAM_ID || "";

async function call(method, path, body, extra = {}) {
  const res = await fetch(BASE + "/" + path, {
    method,
    headers: { "X-Api-Key": KEY, "Content-Type": "application/json", ...extra },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) {
    const err = new Error(`EspoCRM ${method} ${path} -> ${res.status}`);
    err.status = res.status;
    err.retryable = res.status >= 500 || res.status === 429;
    throw err;
  }
  return res.status === 204 ? null : res.json();
}

const partirNombre = (full) => {
  const partes = String(full || "").trim().split(/\s+/).filter(Boolean);
  if (partes.length <= 1) return { firstName: "", lastName: partes[0] || "Prospecto portal" };
  return { firstName: partes[0], lastName: partes.slice(1).join(" ") };
};

const proyectos = conCache(async () => {
  const r = await call("GET", "CPropiedad?select=id,name&maxSize=200");
  return (r.list || []).map((p) => ({ id: p.id, nombre: p.name }));
});
async function asesorMenosCargado() {
  if (!ASESORES.length) return {};
  try {
    const cargas = [];
    for (const id of ASESORES) {
      const q = new URLSearchParams({ select: "id", maxSize: "1" });
      q.set("where[0][type]", "equals"); q.set("where[0][attribute]", "assignedUserId"); q.set("where[0][value]", id);
      q.set("where[1][type]", "notIn"); q.set("where[1][attribute]", "status");
      ["Converted", "Dead", "Recycled"].forEach((s, i) => q.set("where[1][value][" + i + "]", s));
      const r = await call("GET", "Lead?" + q.toString());
      cargas.push({ id, n: r.total ?? 0 });
    }
    cargas.sort((a, b) => a.n - b.n);
    return { assignedUserId: cargas[0].id };
  } catch { return {}; }
}

async function proyectoVinculado(lead) {
  try { const id = buscarProyecto(lead.projectInterestText, await proyectos()); return id ? { cPropiedadInteresId: id } : {}; } catch { return {}; }
}

export async function findLeadByExternalId(externalId) {
  const q = new URLSearchParams({ select: "id,status,cIdExterno", maxSize: "1" });
  q.set("where[0][type]", "equals");
  q.set("where[0][attribute]", "cIdExterno");
  q.set("where[0][value]", externalId);
  const r = await call("GET", "Lead?" + q.toString());
  const f = r.list?.[0];
  return f ? { id: f.id, status: f.status } : null;
}

export async function upsertLead(lead) {
  const existente = await findLeadByExternalId(lead.externalId);
  if (existente) return { id: existente.id, created: false };
  const tel = normalizarTelefono(lead.phone);
  const descripcion = [lead.originalMessage, tel.invalido ? `Teléfono indicado (no válido para el CRM): ${tel.invalido}` : null].filter(Boolean).join("\n") || null;
  const body = {
    ...partirNombre(lead.fullName),
    emailAddress: lead.email || null,
    phoneNumber: tel.e164 || null,
    source: SOURCE,
    status: "New",
    cIdExterno: lead.externalId,
    cProyectoInteres: lead.projectInterestText || null,
    ...(await proyectoVinculado(lead)),
    ...(await asesorMenosCargado()),
    description: descripcion,
    ...(TEAM_ID ? { teamsIds: [TEAM_ID] } : {}),
  };
  // Cada solicitud del portal es un lead propio aunque la persona ya exista: sin esto EspoCRM responde 409 por duplicado de correo/teléfono.
  const creado = await call("POST", "Lead", body, { "X-Skip-Duplicate-Check": "true" });
  return { id: creado.id, created: true };
}

export async function health() {
  try { await call("GET", "App/user"); return true; } catch { return false; }
}
