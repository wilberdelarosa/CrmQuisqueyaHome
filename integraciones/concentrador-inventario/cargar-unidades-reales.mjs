// Carga unidades REALES (extraídas por extraer-unidades-reales.py) en el CRM propio de staging; el concentrador las propaga a EspoCRM y Odoo.
// Se ejecuta DENTRO del contenedor `inventario-hub`. Idempotente: una unidad que ya existe (mismo proyecto y código) no se vuelve a crear.
// Uso: node cargar-unidades-reales.mjs unidades-reales.json [--aplicar]   (sin --aplicar solo informa)
import { readFileSync } from "node:fs";
import pg from "pg";
import * as proyC from "./adapters/crm_propio.mjs";
import * as uniC from "./adapters/unidades/crm_propio.mjs";

const [archivo, ...banderas] = process.argv.slice(2);
const aplicar = banderas.includes("--aplicar");
const datos = JSON.parse(readFileSync(archivo, "utf8"));
const pool = new pg.Pool({ connectionString: process.env.CRM_DATABASE_URL, max: 2 });

const proyectos = Object.fromEntries((await proyC.listar()).map((p) => [p.slug, p.id]));
const existentes = new Set((await uniC.listar()).map((u) => `${u.padreId}/${u.slug}`));
let creadas = 0, omitidas = 0;
for (const [slug, p] of Object.entries(datos.proyectos)) {
  const idProyecto = proyectos[slug];
  if (!idProyecto) { console.log(`✖ el proyecto «${slug}» no existe en el CRM propio: se omite (${p.unidades.length} unidades)`); continue; }
  const porEstado = {};
  let nuevas = 0;
  for (const u of p.unidades) {
    porEstado[u.estado] = (porEstado[u.estado] ?? 0) + 1;
    if (existentes.has(`${idProyecto}/${u.codigo}`)) { omitidas++; continue; }
    nuevas++;
    if (!aplicar) continue;
    const { id } = await uniC.crear({ slug: u.codigo, padreId: idProyecto, datos: { tipo: u.tipo, hab: u.hab, banos: u.banos, area: u.area, patio: u.patio, nivel: u.nivel, torre: u.torre, estado: u.estado, precioMin: u.precioMin, precioMax: u.precioMax, moneda: u.moneda } });
    // Trazabilidad en el campo INTERNO del CRM (el concentrador nunca lo sincroniza).
    await pool.query("update public.units set internal_notes = $1 where id = $2", [`Fuente: ${p.fuente} (${p.fecha_fuente}). Pendiente de validación comercial. Datos extra: ${JSON.stringify(u.extra)}`, Number(id)]);
    creadas++;
  }
  console.log(`${aplicar ? "✔" : "·"} ${slug}: ${p.unidades.length} en la fuente (${JSON.stringify(porEstado)}), ${nuevas} ${aplicar ? "creadas" : "por crear"}`);
}
console.log(aplicar ? `Listo: ${creadas} creadas, ${omitidas} ya existían.` : `Simulacro: ${omitidas} ya existían. Repite con --aplicar para cargar.`);
await pool.end();
