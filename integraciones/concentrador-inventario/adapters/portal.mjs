// Adaptador del portal (CMS). Único archivo que conoce el esquema del catálogo del portal.
// Hoy escribe en la base del portal porque el contrato oficial (/api/crm-sync/*) todavía no existe en el portal;
// cuando exista, se reemplaza SOLO este archivo. Nunca toca publication_status ni validation_status (decisión editorial).
import pg from "pg";

export const nombre = "portal";
export const campos = ["nombre", "zona", "clase", "habMin", "habMax", "areaMin", "areaMax", "precioMin", "precioMax", "moneda", "entrega", "disponibilidad", "ubicacion", "descripcion"];

const pool = new pg.Pool({ connectionString: process.env.PORTAL_DATABASE_URL, max: 3 });
const num = (v) => (v === null || v === undefined ? null : Number(v));

// campo canónico -> columna de projects
const COLUMNA = {
  nombre: "name", clase: "project_class", habMin: "bedrooms_min", habMax: "bedrooms_max", areaMin: "area_min_m2", areaMax: "area_max_m2",
  precioMin: "price_min", precioMax: "price_max", moneda: "currency", entrega: "delivery_text", disponibilidad: "availability_text",
  ubicacion: "location_text", descripcion: "summary",
};

export async function listar() {
  const { rows } = await pool.query(`
    select p.id, p.slug, p.catalog_id, p.name, z.name as zona, p.project_class, p.bedrooms_min, p.bedrooms_max, p.area_min_m2, p.area_max_m2,
           p.price_min, p.price_max, trim(p.currency) as currency, p.delivery_text, p.availability_text, p.location_text, p.summary,
           (extract(epoch from p.updated_at) * 1000)::bigint as ts
    from public.projects p left join public.zones z on z.id = p.zone_id order by p.catalog_id`);
  return rows.map((r) => ({
    id: String(r.id), slug: r.slug, codigo: r.catalog_id, actualizadoEn: Number(r.ts),
    datos: {
      nombre: r.name, zona: r.zona, clase: r.project_class, habMin: num(r.bedrooms_min), habMax: num(r.bedrooms_max), areaMin: num(r.area_min_m2), areaMax: num(r.area_max_m2),
      precioMin: num(r.price_min), precioMax: num(r.price_max), moneda: r.currency, entrega: r.delivery_text, disponibilidad: r.availability_text,
      ubicacion: r.location_text, descripcion: r.summary,
    },
  }));
}

async function idZona(cliente, nombreZona) {
  if (!nombreZona) return { ok: true, id: null };
  const r = await cliente.query("select id from public.zones where lower(name) = lower($1) limit 1", [nombreZona]);
  return r.rows[0] ? { ok: true, id: r.rows[0].id } : { ok: false, id: null };
}

export async function actualizar(id, parcial) {
  const sets = [], vals = [];
  const poner = (col, v) => { vals.push(v); sets.push(`${col} = $${vals.length}`); };
  const cliente = await pool.connect();
  const avisos = [];
  try {
    for (const [campo, v] of Object.entries(parcial)) {
      if (campo === "zona") {
        const z = await idZona(cliente, v);
        if (z.ok) poner("zone_id", z.id); else avisos.push(`zona «${v}» no existe en el portal: no se aplicó`);
      } else if (COLUMNA[campo]) poner(COLUMNA[campo], v);
    }
    if (parcial.precioMin !== undefined || parcial.precioMax !== undefined) sets.push("price_status = case when price_status = 'unknown' then 'reported' else price_status end", "price_date = current_date");
    if (sets.length) { vals.push(id); await cliente.query(`update public.projects set ${sets.join(", ")}, updated_at = now() where id = $${vals.length}`, vals); }
  } finally { cliente.release(); }
  return avisos;
}

export async function crear({ slug, codigo, datos }) {
  const cliente = await pool.connect();
  try {
    const z = await idZona(cliente, datos.zona);
    const r = await cliente.query(
      `insert into public.projects (catalog_id, slug, name, zone_id, project_class, bedrooms_min, bedrooms_max, area_min_m2, area_max_m2, price_min, price_max, currency,
         delivery_text, availability_text, location_text, summary)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) returning id`,
      [codigo || `HUB-${slug}`.slice(0, 40), slug, datos.nombre, z.id, datos.clase, datos.habMin, datos.habMax, datos.areaMin, datos.areaMax, datos.precioMin, datos.precioMax,
       datos.moneda, datos.entrega, datos.disponibilidad, datos.ubicacion, datos.descripcion]);
    return { id: String(r.rows[0].id), avisos: z.ok ? [] : [`zona «${datos.zona}» no existe en el portal: se creó sin zona`] };
  } finally { cliente.release(); }
}

export async function health() { try { await pool.query("select 1"); return true; } catch { return false; } }
