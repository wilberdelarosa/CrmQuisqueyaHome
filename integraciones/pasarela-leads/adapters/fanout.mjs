// Adaptador multicanal ("fanout"). Mismo contrato que espocrm.mjs y odoo.mjs, pero en vez de hablar con un CRM
// reenvía el mismo lead a VARIOS destinos que ya cumplen el contrato POST /api/leads/externo (otros
// adaptadores o el CRM propio). Así se prueba que todos los CRM reciben lo mismo.
//   FANOUT_TARGETS = [{"name":"espocrm","url":"http://…:8080","tokenVar":"TOKEN_ESPOCRM"}, …]
//   FANOUT_PRIMARY = nombre del destino cuyo leadId se devuelve al portal.
// Si algún destino secundario falla, el lead queda en /data/fanout-pendientes.jsonl y se reintenta con
// POST /api/fanout/reintentar (todos los destinos son idempotentes por externalId).
import { appendFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";

const DESTINOS = JSON.parse(process.env.FANOUT_TARGETS || "[]").map((d) => ({ ...d, token: process.env[d.tokenVar] || "" }));
const PRIMARIO = process.env.FANOUT_PRIMARY || DESTINOS[0]?.name;
const PENDIENTES = process.env.FANOUT_PENDING || "/data/fanout-pendientes.jsonl";
const TIMEOUT = Number(process.env.FANOUT_TIMEOUT_MS || 20000);

async function enviar(destino, lead) {
  const res = await fetch(destino.url.replace(/\/$/, "") + "/api/leads/externo", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-webhook-token": destino.token },
    body: JSON.stringify(lead),
    signal: AbortSignal.timeout(TIMEOUT),
  });
  const cuerpo = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(`${destino.name} -> ${res.status}`);
    err.status = res.status;
    err.retryable = res.status >= 500 || res.status === 429;
    throw err;
  }
  return { ok: true, leadId: cuerpo.leadId ?? cuerpo.lead?.id ?? null, created: cuerpo.created ?? cuerpo.creado ?? null };
}

const yaPendiente = new Set();
export async function upsertLead(lead) {
  const resultados = await Promise.allSettled(DESTINOS.map((d) => enviar(d, lead)));
  const destinos = {};
  resultados.forEach((r, i) => {
    const d = DESTINOS[i];
    destinos[d.name] = r.status === "fulfilled" ? r.value : { ok: false, error: r.reason?.message ?? "error", status: r.reason?.status ?? null };
    if (r.status === "rejected" && !yaPendiente.has(d.name + "|" + lead.externalId) && (yaPendiente.add(d.name + "|" + lead.externalId), true)) appendFileSync(PENDIENTES, JSON.stringify({ destino: d.name, lead, falloEn: new Date().toISOString(), error: r.reason?.message }) + "\n");
  });
  const primario = destinos[PRIMARIO];
  if (!primario?.ok) {
    // Sin el destino principal el portal no tiene acuse: se reintenta todo (idempotente).
    const err = new Error("fanout: el destino principal (" + PRIMARIO + ") no respondió");
    err.retryable = true;
    throw err;
  }
  return { id: primario.leadId, created: primario.created === true, destinos };
}

export async function reintentar() {
  if (!existsSync(PENDIENTES)) return { reintentados: 0, pendientes: 0 };
  const lineas = readFileSync(PENDIENTES, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
  const quedan = [];
  let ok = 0;
  for (const p of lineas) {
    const d = DESTINOS.find((x) => x.name === p.destino);
    if (!d) { quedan.push(p); continue; }
    try { await enviar(d, p.lead); ok++; } catch (e) { quedan.push({ ...p, error: e.message }); }
  }
  writeFileSync(PENDIENTES, quedan.map((p) => JSON.stringify(p)).join("\n") + (quedan.length ? "\n" : ""));
  return { reintentados: ok, pendientes: quedan.length };
}

export async function healthDetalle() {
  const out = {};
  await Promise.all(DESTINOS.map(async (d) => {
    try { const r = await fetch(d.url.replace(/\/$/, "") + "/health", { signal: AbortSignal.timeout(5000) }); out[d.name] = r.ok; } catch { out[d.name] = false; }
  }));
  return out;
}
export async function health() { const d = await healthDetalle(); return d[PRIMARIO] === true; }
export async function findLeadByExternalId() { return null; }
