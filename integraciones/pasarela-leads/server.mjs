// Puente Portal -> CRM. Recibe el POST que ya emite el portal (client-api.mjs) y lo
// traslada al CRM detrás de un adaptador. No contiene nada específico de EspoCRM.
import http from "node:http";
import { createHmac, timingSafeEqual } from "node:crypto";
import { appendFileSync } from "node:fs";
// El único punto que elige CRM: variable CRM_ADAPTER (espocrm | odoo | ...), un archivo por CRM en ./adapters.
const NOMBRE_ADAPTADOR = process.env.CRM_ADAPTER || "espocrm";
if (!/^[a-z0-9_-]+$/.test(NOMBRE_ADAPTADOR)) throw new Error("CRM_ADAPTER inválido");
const crm = await import(`./adapters/${NOMBRE_ADAPTADOR}.mjs`);

const PORT = Number(process.env.PORT || 8080);
const TOKEN = process.env.LEADS_WEBHOOK_TOKEN || "";
const WEBHOOK_SECRET = process.env.ESPO_WEBHOOK_SECRET || "";
const OUTBOX = process.env.STATUS_OUTBOX || "/data/estado-outbox.jsonl";
const REINTENTOS = Number(process.env.RETRIES || 3);
const MAX_BODY = 16 * 1024;

const iguales = (a, b) => {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
};
const json = (res, code, obj) => {
  res.writeHead(code, { "Content-Type": "application/json" });
  res.end(JSON.stringify(obj));
};
const leer = (req) =>
  new Promise((ok, fail) => {
    let n = 0;
    const partes = [];
    req.on("data", (c) => {
      n += c.length;
      if (n > MAX_BODY) {
        fail(Object.assign(new Error("cuerpo demasiado grande"), { status: 413 }));
        req.destroy();
      } else partes.push(c);
    });
    req.on("end", () => ok(Buffer.concat(partes)));
    req.on("error", fail);
  });
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

// Evita duplicados por solicitudes simultáneas con el mismo externalId.
const enCurso = new Map();
async function conCandado(clave, fn) {
  while (enCurso.has(clave)) await enCurso.get(clave).catch(() => {});
  const p = fn();
  enCurso.set(clave, p);
  try {
    return await p;
  } finally {
    enCurso.delete(clave);
  }
}

async function conReintentos(fn) {
  let ultimo;
  for (let i = 0; i <= REINTENTOS; i++) {
    try {
      return await fn();
    } catch (e) {
      ultimo = e;
      if (e.status && !e.retryable) throw e;
      await dormir(300 * 2 ** i);
    }
  }
  throw ultimo;
}

function validar(p) {
  const e = [];
  if (!p || typeof p !== "object") return ["cuerpo inválido"];
  if (typeof p.externalId !== "string" || !p.externalId.trim() || p.externalId.length > 60) e.push("externalId requerido (texto, máx. 60)");
  if (typeof p.fullName !== "string" || !p.fullName.trim()) e.push("fullName requerido");
  if (p.email != null && (typeof p.email !== "string" || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(p.email))) e.push("email inválido");
  for (const k of ["phone", "projectInterestText", "originalMessage"]) if (p[k] != null && typeof p[k] !== "string") e.push(k + " debe ser texto");
  return e;
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://x");
    if (req.method === "GET" && url.pathname === "/health") {
      const ok = await crm.health();
      const destinos = crm.healthDetalle ? await crm.healthDetalle() : undefined;
      return json(res, ok ? 200 : 503, { ok, ...(destinos ? { destinos } : {}) });
    }

    if (req.method === "POST" && url.pathname === "/api/leads/externo") {
      if (!TOKEN || !iguales(req.headers["x-webhook-token"] || "", TOKEN)) return json(res, 401, { error: "token inválido" });
      let p;
      try {
        p = JSON.parse((await leer(req)).toString("utf8"));
      } catch (e) {
        return json(res, e.status || 400, { error: "JSON inválido" });
      }
      const errores = validar(p);
      if (errores.length) return json(res, 422, { error: "datos inválidos", detalles: errores });
      try {
        const r = await conCandado(p.externalId, () => conReintentos(() => crm.upsertLead(p)));
        return json(res, r.created ? 201 : 200, { leadId: r.id, created: r.created, ...(r.destinos ? { destinos: r.destinos } : {}) });
      } catch (e) {
        console.error("[adaptador] fallo CRM:", e.message);
        return json(res, 502, { error: "CRM no disponible; reintenta" });
      }
    }

    if (req.method === "POST" && url.pathname === "/api/fanout/reintentar" && crm.reintentar) {
      if (!TOKEN || !iguales(req.headers["x-webhook-token"] || "", TOKEN)) return json(res, 401, { error: "token inválido" });
      return json(res, 200, await crm.reintentar());
    }

    // CRM -> portal: EspoCRM avisa cambios del lead. Cabecera Signature = base64("<id webhook>:<hex HMAC-SHA256 del cuerpo>").
    if (req.method === "POST" && url.pathname === "/api/crm/estado") {
      const raw = await leer(req);
      const hex = createHmac("sha256", WEBHOOK_SECRET).update(raw).digest("hex");
      const recibida = Buffer.from(String(req.headers["signature"] || ""), "base64").toString("utf8").split(":").slice(1).join(":");
      if (!WEBHOOK_SECRET || !iguales(recibida, hex)) {
        try { appendFileSync("/data/webhook-rechazado.jsonl", JSON.stringify({ sig: req.headers["signature"] || null, xsig: req.headers["x-signature"] || null, body: raw.toString("utf8") }) + "\n"); } catch {}
        console.warn("[adaptador] webhook rechazado: firma inválida (id=" + Buffer.from(String(req.headers["signature"] || ""), "base64").toString("utf8").split(":")[0] + ", recibida=" + recibida.slice(0, 8) + ", calculada=" + hex.slice(0, 8) + ", bytes=" + raw.length + ")");
        return json(res, 401, { error: "firma inválida" });
      }
      let eventos;
      try {
        eventos = JSON.parse(raw.toString("utf8"));
      } catch {
        return json(res, 400, { error: "JSON inválido" });
      }
      for (const ev of Array.isArray(eventos) ? eventos : [eventos]) {
        // El portal real todavía no expone /api/crm-sync/*: el estado queda en la bandeja de salida.
        appendFileSync(OUTBOX, JSON.stringify({ recibido: new Date().toISOString(), evento: ev }) + "\n");
      }
      return json(res, 200, { ok: true });
    }
    json(res, 404, { error: "no encontrado" });
  } catch (e) {
    json(res, e.status || 500, { error: "error interno" });
  }
});
server.listen(PORT, () => console.log("adaptador escuchando en " + PORT));
