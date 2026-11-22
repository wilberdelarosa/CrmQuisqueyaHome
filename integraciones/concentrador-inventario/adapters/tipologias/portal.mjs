// Tipologías en el portal (tabla project_variants). Único archivo que conoce ese esquema para este recurso.
// No toca validation_status ni publication_status (decisión editorial del portal).
import pg from "pg";

export const campos = ["nombre", "tipo", "habMin", "habMax", "banosMin", "banosMax", "areaMin", "areaMax", "precioMin", "precioMax", "moneda", "entrega"];
const pool = new pg.Pool({ connectionString: process.env.PORTAL_DATABASE_URL, max: 3 });
const num = (v) => (v === null || v === undefined ? null : Number(v));
const COLUMNA = { nombre: "name", tipo: "property_type", habMin: "bedrooms_min", habMax: "bedrooms_max", banosMin: "bathrooms_min", banosMax: "bathrooms_max", areaMin: "area_min_m2", areaMax: "area_max_m2", precioMin: "price_min", precioMax: "price_max", moneda: "currency", entrega: "delivery_text" };

export async function listar() {
  const { rows } = await pool.query(`
    select v.id, v.project_id, v.slug, v.name, v.property_type, v.bedrooms_min, v.bedrooms_max, v.bathrooms_min, v.bathrooms_max, v.area_min_m2, v.area_max_m2,
           v.price_min, v.price_max, trim(v.currency) as currency, v.delivery_text, (extract(epoch from v.updated_at) * 1000)::bigint as ts
    from public.project_variants v order by v.project_id, v.slug`);
  return rows.map((r) => ({
    id: String(r.id), slug: r.slug, padreId: String(r.project_id), actualizadoEn: Number(r.ts),
    datos: { nombre: r.name, tipo: r.property_type, habMin: num(r.bedrooms_min), habMax: num(r.bedrooms_max), banosMin: num(r.bathrooms_min), banosMax: num(r.bathrooms_max), areaMin: num(r.area_min_m2), areaMax: num(r.area_max_m2), precioMin: num(r.price_min), precioMax: num(r.price_max), moneda: r.currency, entrega: r.delivery_text },
  }));
}

export async function actualizar(id, parcial) {
  const sets = [], vals = [];
  for (const [campo, v] of Object.entries(parcial)) if (COLUMNA[campo]) { vals.push(v); sets.push(`${COLUMNA[campo]} = $${vals.length}`); }
  if (!sets.length) return [];
  vals.push(id);
  await pool.query(`update public.project_variants set ${sets.join(", ")}, updated_at = now() where id = $${vals.length}`, vals);
  return [];
}

export async function crear({ slug, padreId, datos }) {
  const r = await pool.query(
    `insert into public.project_variants (project_id, slug, name, property_type, bedrooms_min, bedrooms_max, bathrooms_min, bathrooms_max, area_min_m2, area_max_m2, price_min, price_max, currency, delivery_text)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) returning id`,
    [padreId, slug, datos.nombre, datos.tipo, datos.habMin, datos.habMax, datos.banosMin, datos.banosMax, datos.areaMin, datos.areaMax, datos.precioMin, datos.precioMax, datos.moneda, datos.entrega]);
  return { id: String(r.rows[0].id), avisos: [] };
}

export async function health() { try { await pool.query("select 1"); return true; } catch { return false; } }
