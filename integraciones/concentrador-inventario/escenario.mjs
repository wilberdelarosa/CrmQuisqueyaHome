// Prueba de extremo a extremo del concentrador. Se ejecuta DENTRO del contenedor `inventario-hub` (tiene los cuatro adaptadores).
// Edita un proyecto de prueba DIRECTAMENTE en cada sistema (como lo haría una persona) y comprueba que el cambio llega a los demás.
import * as portal from "./adapters/portal.mjs";
import * as crm_propio from "./adapters/crm_propio.mjs";
import * as espocrm from "./adapters/espocrm.mjs";
import * as odoo from "./adapters/odoo.mjs";
import { iguales } from "./core.mjs";

const SIS = { portal, crm_propio, espocrm, odoo };
const SLUG = "moon-garden";
let fallos = 0;
const ok = (t, c, extra = "") => { if (!c) fallos++; console.log((c ? "OK   " : "FALLO") + " " + t + (extra ? " — " + extra : "")); };
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
const sync = async () => (await fetch("http://127.0.0.1:8081/api/inventario/sincronizar", { method: "POST", headers: { "x-hub-token": process.env.HUB_TOKEN } })).json();
const estado = async () => (await fetch("http://127.0.0.1:8081/api/inventario/estado", { headers: { "x-hub-token": process.env.HUB_TOKEN } })).json();

async function leer(sistema, slugOCodigo) {
  const lista = await SIS[sistema].listar();
  // El proyecto de prueba se localiza por id nativo (Espo y Odoo derivan el slug del nombre, que la prueba cambia).
  if (slugOCodigo === SLUG && ids[sistema]) return lista.find((x) => x.id === ids[sistema]);
  return lista.find((x) => x.slug === slugOCodigo || x.codigo === slugOCodigo || x.datos.nombre === slugOCodigo);
}
async function ver(campo, esperado, sistemas, slug = SLUG, codigo = null) {
  for (const s of sistemas) {
    let reg = await leer(s, slug);
    if (!reg && codigo) reg = await leer(s, codigo);
    const valor = reg?.datos[campo];
    ok(`${s}: ${campo} = ${JSON.stringify(esperado)}`, Boolean(reg) && iguales(campo, valor, esperado), `valor actual ${JSON.stringify(valor)}`);
  }
}

const original = {};
const ids = {};
for (const s of Object.keys(SIS)) { const r = await leer(s, SLUG); ids[s] = r?.id; original[s] = r?.datos; }
console.log("   proyecto de prueba:", SLUG, "ids:", JSON.stringify(ids));
const o = original.portal;

try {
  await sync(); // estado base limpio
  // 1) EspoCRM -> todos
  await espocrm.actualizar(ids.espocrm, { precioMin: 123456 });
  let r = await sync();
  ok("1. cambio de precio hecho en EspoCRM: el concentrador lo aplicó", r.actualizados >= 1 && r.ok, `acciones: ${r.acciones.map((a) => a.sistema).join(",")}`);
  await ver("precioMin", 123456, ["portal", "crm_propio", "espocrm", "odoo"]);

  // 2) Odoo -> todos (cambio de nombre: la identidad sigue por id, no por nombre)
  await sleep2();
  await odoo.actualizar(ids.odoo, { nombre: "Moon Garden QA" });
  r = await sync();
  ok("2. cambio de nombre hecho en Odoo", r.ok && r.creados === 0, `creados ${r.creados} (debe ser 0: no es un proyecto nuevo)`);
  await ver("nombre", "Moon Garden QA", ["portal", "crm_propio", "espocrm", "odoo"]);

  // 3) Portal -> todos (zona existente en el portal)
  await sleep2();
  const zonaNueva = o.zona === "Cap Cana" ? "Punta Cana" : "Cap Cana";
  await portal.actualizar(ids.portal, { zona: zonaNueva });
  r = await sync();
  ok("3. cambio de zona hecho en el portal", r.ok);
  await ver("zona", zonaNueva, ["portal", "crm_propio", "espocrm", "odoo"]);

  // 4) CRM propio -> portal (descripción) y -> todos (precio máximo)
  await sleep2();
  await crm_propio.actualizar(ids.crm_propio, { descripcion: "Descripción editada en el CRM propio", precioMax: 555000 });
  r = await sync();
  ok("4. cambios hechos en el CRM propio", r.ok);
  await ver("descripcion", "Descripción editada en el CRM propio", ["portal", "crm_propio"]);
  await ver("precioMax", 555000, ["portal", "crm_propio", "espocrm", "odoo"]);

  // 5) Dos personas editan campos DISTINTOS a la vez en sistemas distintos: se combinan
  await sleep2();
  await espocrm.actualizar(ids.espocrm, { entrega: "Entrega QA 2030" });
  await odoo.actualizar(ids.odoo, { ubicacion: "Ubicación QA, Punta Cana" });
  r = await sync();
  ok("5. ediciones simultáneas de campos distintos", r.ok && r.conflictos === 0, `conflictos ${r.conflictos}`);
  await ver("entrega", "Entrega QA 2030", ["portal", "espocrm", "odoo"]);
  await ver("ubicacion", "Ubicación QA, Punta Cana", ["portal", "espocrm", "odoo"]);

  // 6) Conflicto: el MISMO campo editado en dos sistemas antes de sincronizar: gana el más reciente
  await sleep2();
  await espocrm.actualizar(ids.espocrm, { disponibilidad: "Texto de EspoCRM" });
  await sleep2(2500);
  await odoo.actualizar(ids.odoo, { disponibilidad: "Texto de Odoo (más reciente)" });
  r = await sync();
  const est = await estado();
  const confl = est.conflictos.filter((c) => c.slug === SLUG && c.campo === "disponibilidad").pop();
  ok("6. conflicto del mismo campo: gana el cambio más reciente (Odoo) y queda registrado", r.conflictos >= 1 && confl?.ganador === "odoo", `ganador ${confl?.ganador}`);
  await ver("disponibilidad", "Texto de Odoo (más reciente)", ["portal", "espocrm", "odoo"]);

  // 7) Proyecto NUEVO creado en Odoo con código: aparece en el portal, el CRM propio y EspoCRM
  const nuevo = { nombre: "Proyecto QA Bidireccional", zona: zonaNueva, precioMin: 99000, precioMax: 150000, moneda: "USD" };
  const idNuevo = await odoo.crear({ slug: "proyecto-qa-bidireccional", codigo: "QH-QA-001", datos: nuevo });
  r = await sync();
  ok("7. proyecto nuevo creado en Odoo", r.ok && r.creados >= 3, `creados ${r.creados} (portal, CRM propio, EspoCRM)`);
  await ver("nombre", "Proyecto QA Bidireccional", ["portal", "crm_propio", "espocrm", "odoo"], "proyecto-qa-bidireccional", "QH-QA-001");
  await ver("precioMin", 99000, ["portal", "crm_propio", "espocrm", "odoo"], "proyecto-qa-bidireccional", "QH-QA-001");
  const enPortal = await leer("portal", "proyecto-qa-bidireccional");
  ok("7b. el código de catálogo viajó al portal", enPortal?.codigo === "QH-QA-001", `catalog_id ${enPortal?.codigo}`);

  // 8) Nada rebota: otra pasada no cambia nada
  r = await sync();
  ok("8. sin rebotes: una pasada más no cambia nada", r.ok && r.actualizados === 0 && r.creados === 0, `actualizados ${r.actualizados}, creados ${r.creados}`);
  void idNuevo;
} finally {
  // Restauración: se devuelve el proyecto a su estado original por el mismo camino (el portal manda) y se retira el proyecto de prueba.
  const parcial = Object.fromEntries(Object.entries(original.portal).filter(([c]) => portal.campos.includes(c)));
  try { await portal.actualizar(ids.portal, parcial); await sync(); } catch (e) { console.log("   restauración:", e.message); }
  const restaurado = await leer("portal", SLUG);
  ok("restauración: el portal volvió a sus valores originales", ["nombre", "zona", "precioMin", "precioMax", "entrega", "ubicacion", "disponibilidad", "descripcion"].every((c) => iguales(c, restaurado?.datos[c], original.portal[c])));
  const limpio = {};
  for (const s of ["espocrm", "odoo", "crm_propio"]) { const r2 = await leer(s, SLUG); limpio[s] = ["nombre", "zona", "precioMin", "precioMax"].every((c) => iguales(c, r2?.datos[c], original.portal[c])); }
  ok("restauración: los CRM también", Object.values(limpio).every(Boolean), JSON.stringify(limpio));
  console.log(fallos === 0 ? "TODO OK" : `${fallos} FALLOS`);
}
function sleep2(ms = 1500) { return dormir(ms); }
process.exit(fallos === 0 ? 0 : 1);
