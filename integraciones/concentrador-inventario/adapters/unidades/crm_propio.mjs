// Unidades del CRM propio (tabla units). Único archivo que conoce ese esquema para este recurso.
// Solo datos públicos: NUNCA lee ni escribe real_price_cents, internal_notes ni broker_id.
import pg from "pg";

export const campos = ["tipo", "hab", "banos", "area", "patio", "nivel", "torre", "estado", "precioMin", "precioMax", "moneda"];
const pool = new pg.Pool({ connectionString: process.env.CRM_DATABASE_URL, max: 3 });
const num = (v) => (v === null || v === undefined ? null : Number(v));
const aCentavos = (v) => (v === null || v === undefined ? null : Math.round(Number(v) * 100));
const deCentavos = (v) => (v === null || v === undefined ? null : Number(v) / 100);
const COLUMNA = { tipo: "unit_type", hab: "bedrooms", banos: "bathrooms", area: "built_area_m2", patio: "yard_area_m2", nivel: "floor_level", torre: "tower", estado: "status", moneda: "currency" };
const ENTEROS = ["hab", "nivel"];

export async function listar() {
  const { rows } = await pool.query(`
    select id, project_id, code, unit_type, bedrooms, bathrooms, built_area_m2, yard_area_m2, floor_level, tower, status, currency,
           public_range_min_cents, public_range_max_cents, (extract(epoch from updated_at) * 1000)::bigint as ts
    from public.units where deleted_at is null order by project_id, code`);
  return rows.map((r) => ({
    id: String(r.id), slug: r.code, padreId: String(r.project_id), actualizadoEn: Number(r.ts),
    datos: { tipo: r.unit_type, hab: num(r.bedrooms), banos: num(r.bathrooms), area: num(r.built_area_m2), patio: num(r.yard_area_m2), nivel: num(r.floor_level), torre: r.tower, estado: r.status, precioMin: deCentavos(r.public_range_min_cents), precioMax: deCentavos(r.public_range_max_cents), moneda: r.currency },
  }));
}

function valor(campo, v) { return ENTEROS.includes(campo) && v !== null ? Math.round(Number(v)) : v; }

export async function actualizar(id, parcial) {
  const sets = [], vals = [];
  const poner = (col, v) => { vals.push(v); sets.push(`${col} = $${vals.length}`); };
  for (const [campo, v] of Object.entries(parcial)) {
    if (COLUMNA[campo]) { if (campo === "estado" && v === null) continue; poner(COLUMNA[campo], valor(campo, v)); }
    else if (campo === "precioMin") poner("public_range_min_cents", aCentavos(v));
    else if (campo === "precioMax") poner("public_range_max_cents", aCentavos(v));
  }
  if (!sets.length) return [];
  vals.push(Number(id));
  await pool.query(`update public.units set ${sets.join(", ")}, updated_at = now(), row_version = row_version + 1 where id = $${vals.length}`, vals);
  return [];
}

export async function crear({ slug, padreId, datos }) {
  const r = await pool.query(
    `insert into public.units (project_id, code, unit_type, bedrooms, bathrooms, built_area_m2, yard_area_m2, floor_level, tower, status, currency, public_range_min_cents, public_range_max_cents)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) returning id`,
    [Number(padreId), slug, datos.tipo, valor("hab", datos.hab), datos.banos, datos.area, datos.patio, valor("nivel", datos.nivel), datos.torre, datos.estado || "available", datos.moneda || "USD", aCentavos(datos.precioMin), aCentavos(datos.precioMax)]);
  return { id: String(r.rows[0].id), avisos: [] };
}

export async function health() { try { await pool.query("select 1"); return true; } catch { return false; } }
