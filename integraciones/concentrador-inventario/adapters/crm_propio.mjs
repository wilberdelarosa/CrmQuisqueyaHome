// Adaptador del CRM propio. Único archivo que conoce el esquema de `projects` del CRM.
// Solo maneja los datos públicos del proyecto (nombre, zona, moneda, rango público y descripción). Nunca toca
// internal_price_cents ni las unidades. Escribe por base de datos porque el CRM no expone un endpoint de servicio para
// esto; cuando exista (p. ej. /api/portal-sync), se reemplaza SOLO este archivo.
import pg from "pg";

export const nombre = "crm_propio";
export const campos = ["nombre", "zona", "moneda", "precioMin", "precioMax", "descripcion"];

const pool = new pg.Pool({ connectionString: process.env.CRM_DATABASE_URL, max: 3 });
const aCentavos = (v) => (v === null || v === undefined ? null : Math.round(Number(v) * 100));
const deCentavos = (v) => (v === null || v === undefined ? null : Number(v) / 100);
const COLUMNA = { nombre: "name", zona: "zone", moneda: "currency", descripcion: "description" };

export async function listar() {
  const { rows } = await pool.query(`
    select id, slug, name, zone, currency, public_range_min_cents, public_range_max_cents, description, (extract(epoch from updated_at) * 1000)::bigint as ts
    from public.projects where deleted_at is null order by id`);
  return rows.map((r) => ({
    id: String(r.id), slug: r.slug, codigo: null, actualizadoEn: Number(r.ts),
    datos: { nombre: r.name, zona: r.zone, moneda: r.currency, precioMin: deCentavos(r.public_range_min_cents), precioMax: deCentavos(r.public_range_max_cents), descripcion: r.description },
  }));
}

export async function actualizar(id, parcial) {
  const sets = [], vals = [];
  const poner = (col, v) => { vals.push(v); sets.push(`${col} = $${vals.length}`); };
  for (const [campo, v] of Object.entries(parcial)) {
    if (COLUMNA[campo]) poner(COLUMNA[campo], v);
    else if (campo === "precioMin") poner("public_range_min_cents", aCentavos(v));
    else if (campo === "precioMax") poner("public_range_max_cents", aCentavos(v));
  }
  if (!sets.length) return [];
  vals.push(Number(id));
  await pool.query(`update public.projects set ${sets.join(", ")}, updated_at = now() where id = $${vals.length}`, vals);
  return [];
}

export async function crear({ slug, datos }) {
  // Nace sin publicar: la publicación hacia el portal sigue siendo decisión del CRM.
  const r = await pool.query(
    `insert into public.projects (name, slug, zone, currency, public_range_min_cents, public_range_max_cents, description, is_published, is_active)
     values ($1,$2,$3,$4,$5,$6,$7,false,true) returning id`,
    [datos.nombre, slug, datos.zona, datos.moneda || "USD", aCentavos(datos.precioMin), aCentavos(datos.precioMax), datos.descripcion]);
  return { id: String(r.rows[0].id), avisos: [] };
}

export async function health() { try { await pool.query("select 1"); return true; } catch { return false; } }
