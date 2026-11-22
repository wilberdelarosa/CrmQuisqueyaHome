// Prueba de extremo a extremo de TIPOLOGÍAS y UNIDADES. Se ejecuta DENTRO del contenedor `inventario-hub`.
// Edita directamente en cada sistema (como una persona) y comprueba que el cambio llega a los demás, con el proyecto padre correcto.
import * as proyP from "./adapters/portal.mjs";
import * as proyC from "./adapters/crm_propio.mjs";
import * as proyE from "./adapters/espocrm.mjs";
import * as proyO from "./adapters/odoo.mjs";
import * as tipP from "./adapters/tipologias/portal.mjs";
import * as tipE from "./adapters/tipologias/espocrm.mjs";
import * as tipO from "./adapters/tipologias/odoo.mjs";
import * as uniC from "./adapters/unidades/crm_propio.mjs";
import * as uniE from "./adapters/unidades/espocrm.mjs";
import * as uniO from "./adapters/unidades/odoo.mjs";
import { iguales } from "./core.mjs";
import { RECURSOS } from "./recursos.mjs";

const PROY = { portal: proyP, crm_propio: proyC, espocrm: proyE, odoo: proyO };
const TIP = { portal: tipP, espocrm: tipE, odoo: tipO };
const UNI = { crm_propio: uniC, espocrm: uniE, odoo: uniO };
let fallos = 0;
const ok = (t, c, extra = "") => { if (!c) fallos++; console.log((c ? "OK   " : "FALLO") + " " + t + (extra ? " — " + extra : "")); };
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
const sync = async () => (await fetch("http://127.0.0.1:8081/api/inventario/sincronizar", { method: "POST", headers: { "x-hub-token": process.env.HUB_TOKEN } })).json();
const estado = async () => (await fetch("http://127.0.0.1:8081/api/inventario/estado", { headers: { "x-hub-token": process.env.HUB_TOKEN } })).json();

// id nativo del proyecto padre por sistema
const idProy = {};
for (const [s, m] of Object.entries(PROY)) for (const it of await m.listar()) (idProy[it.slug] ??= {})[s] = it.id;
const PADRE_A = "aldea-park", PADRE_B = "olea-at-cap-cana";

async function buscar(mapa, def, sistema, slug, padre) {
  const lista = await mapa[sistema].listar();
  return lista.find((x) => x.slug === slug && x.padreId === String(idProy[padre][sistema]));
}
async function ver(mapa, def, campo, esperado, sistemas, slug, padre, rotulo) {
  for (const s of sistemas) {
    const reg = await buscar(mapa, def, s, slug, padre);
    const valor = reg?.datos[campo];
    ok(`${rotulo} ${s}: ${campo} = ${JSON.stringify(esperado)}`, Boolean(reg) && iguales(campo, valor, esperado, RECURSOS[def].campos), reg ? `valor actual ${JSON.stringify(valor)}` : "no existe");
  }
}
const original = {};
const TIPOLOGIA = "villa-tao";
const ids = {};
for (const s of Object.keys(TIP)) { const r = await buscar(TIP, "tipologias", s, TIPOLOGIA, PADRE_A); ids[s] = r?.id; original[s] = r?.datos; }
console.log("   tipología de prueba:", PADRE_A + "/" + TIPOLOGIA, "ids:", JSON.stringify(ids));
const ST = Object.keys(TIP);

try {
  await sync();
  // ---------- TIPOLOGÍAS ----------
  await tipE.actualizar(ids.espocrm, { precioMin: 310000 });
  let r = await sync();
  ok("T1. precio de una tipología cambiado en EspoCRM", r.ok && r.porRecurso.tipologias.actualizados >= 1);
  await ver(TIP, "tipologias", "precioMin", 310000, ST, TIPOLOGIA, PADRE_A, "T1");

  await dormir(1500);
  await tipO.actualizar(ids.odoo, { areaMin: 161.5, nombre: "Villa Tao QA" });
  r = await sync();
  ok("T2. área y nombre cambiados en Odoo; no se duplica la tipología", r.ok && r.porRecurso.tipologias.creados === 0, `creados ${r.porRecurso.tipologias.creados}`);
  await ver(TIP, "tipologias", "areaMin", 161.5, ST, TIPOLOGIA, PADRE_A, "T2");
  for (const s of ST) { const x = (await TIP[s].listar()).find((y) => y.id === ids[s]); ok(`T2. ${s}: nombre = «Villa Tao QA»`, x?.datos.nombre === "Villa Tao QA", `valor actual ${x?.datos.nombre}`); }

  await dormir(1500);
  await tipP.actualizar(ids.portal, { habMax: 4.5, entrega: "Entrega QA 2031" });
  r = await sync();
  ok("T3. habitaciones (media) y entrega cambiadas en el portal", r.ok);
  for (const s of ST) { const x = (await TIP[s].listar()).find((y) => y.id === ids[s]); ok(`T3. ${s}: habMax = 4.5 y entrega`, iguales("habMax", x?.datos.habMax, 4.5) && x?.datos.entrega === "Entrega QA 2031", `habMax ${x?.datos.habMax}, entrega ${x?.datos.entrega}`); }

  await dormir(1500);
  await tipO.crear({ slug: "qa-tipologia", padreId: idProy[PADRE_B].odoo, datos: { nombre: "Tipología QA Odoo", tipo: "apartamento", habMin: 2, habMax: 2, areaMin: 90, precioMin: 250000, precioMax: 260000, moneda: "USD" } });
  r = await sync();
  ok("T4. tipología nueva creada en Odoo llega al portal y EspoCRM", r.ok && r.porRecurso.tipologias.creados >= 2, `creados ${r.porRecurso.tipologias.creados}`);
  await ver(TIP, "tipologias", "nombre", "Tipología QA Odoo", ST, "qa-tipologia", PADRE_B, "T4");
  await ver(TIP, "tipologias", "precioMax", 260000, ST, "qa-tipologia", PADRE_B, "T4 (con su proyecto padre correcto)");

  // ---------- UNIDADES ----------
  await dormir(1500);
  await uniC.crear({ slug: "QA-101", padreId: idProy[PADRE_A].crm_propio, datos: { tipo: "Apartamento", hab: 2, banos: 2, area: 95.5, patio: null, nivel: 3, torre: "A", estado: "available", precioMin: 150000, precioMax: 160000, moneda: "USD" } });
  r = await sync();
  const SU = Object.keys(UNI);
  ok("U1. unidad nueva creada en el CRM propio llega a EspoCRM y Odoo", r.ok && r.porRecurso.unidades.creados >= 2, `creados ${r.porRecurso.unidades.creados}`);
  await ver(UNI, "unidades", "area", 95.5, SU, "QA-101", PADRE_A, "U1");
  await ver(UNI, "unidades", "estado", "available", SU, "QA-101", PADRE_A, "U1");
  await ver(UNI, "unidades", "precioMin", 150000, SU, "QA-101", PADRE_A, "U1");

  const uOdoo = await buscar(UNI, "unidades", "odoo", "QA-101", PADRE_A);
  const uEspo = await buscar(UNI, "unidades", "espocrm", "QA-101", PADRE_A);
  const uCrm = await buscar(UNI, "unidades", "crm_propio", "QA-101", PADRE_A);
  await dormir(1500);
  await uniO.actualizar(uOdoo.id, { estado: "reserved" });
  r = await sync();
  ok("U2. estado cambiado a «reservada» en Odoo", r.ok);
  await ver(UNI, "unidades", "estado", "reserved", SU, "QA-101", PADRE_A, "U2");

  await dormir(1500);
  await uniE.actualizar(uEspo.id, { precioMin: 148000 });
  r = await sync();
  ok("U3. precio cambiado en EspoCRM", r.ok);
  await ver(UNI, "unidades", "precioMin", 148000, SU, "QA-101", PADRE_A, "U3");

  await dormir(1500);
  await uniC.actualizar(uCrm.id, { area: 97.25 });
  await uniO.actualizar(uOdoo.id, { torre: "B" });
  r = await sync();
  ok("U4. campos distintos editados a la vez en dos sistemas", r.ok && r.porRecurso.unidades.conflictos === 0, `conflictos ${r.porRecurso.unidades.conflictos}`);
  await ver(UNI, "unidades", "area", 97.25, SU, "QA-101", PADRE_A, "U4");
  await ver(UNI, "unidades", "torre", "B", SU, "QA-101", PADRE_A, "U4");

  await dormir(1500);
  await uniE.actualizar(uEspo.id, { nivel: 5 });
  await dormir(2500);
  await uniO.actualizar(uOdoo.id, { nivel: 7 });
  r = await sync();
  const est = await estado();
  const confl = est.conflictos.filter((c) => c.recurso === "unidades" && c.campo === "nivel").pop();
  ok("U5. conflicto del mismo campo: gana el más reciente (Odoo) y queda registrado", r.porRecurso.unidades.conflictos >= 1 && confl?.ganador === "odoo", `ganador ${confl?.ganador}`);
  await ver(UNI, "unidades", "nivel", 7, SU, "QA-101", PADRE_A, "U5");

  await dormir(1500);
  await uniO.crear({ slug: "QA-102", padreId: idProy[PADRE_B].odoo, datos: { tipo: "Penthouse", hab: 3, banos: 3.5, area: 240, patio: 30, nivel: 9, torre: "C", estado: "available", precioMin: 700000, precioMax: 720000, moneda: "USD" } });
  r = await sync();
  ok("U6. unidad nueva creada en Odoo, bajo OTRO proyecto, llega al CRM propio y a EspoCRM", r.ok && r.porRecurso.unidades.creados >= 2, `creados ${r.porRecurso.unidades.creados}`);
  await ver(UNI, "unidades", "area", 240, SU, "QA-102", PADRE_B, "U6 (proyecto padre correcto)");
  await ver(UNI, "unidades", "estado", "available", SU, "QA-102", PADRE_B, "U6");
  const malPuesta = [];
  for (const s of SU) { const x = await buscar(UNI, "unidades", s, "QA-102", PADRE_A); if (x) malPuesta.push(s); }
  ok("U6. no aparece bajo el proyecto equivocado", malPuesta.length === 0, malPuesta.join(","));

  // ---------- Garantías de privacidad y estabilidad ----------
  const campos = RECURSOS.unidades.campos;
  ok("el precio real / notas internas no son campos canónicos de las unidades", !Object.keys(campos).some((c) => /real|interno|notas|broker/i.test(c)));
  r = await sync();
  ok("sin rebotes: una pasada más no cambia nada", r.ok && r.actualizados === 0 && r.creados === 0, `actualizados ${r.actualizados}, creados ${r.creados}`);
} finally {
  // Restauración de la tipología real por el mismo camino; el resto (objetos QA) se retira con limpiar-qa.
  const parcial = Object.fromEntries(Object.entries(original.portal).filter(([c]) => tipP.campos.includes(c)));
  try { await tipP.actualizar(ids.portal, parcial); await sync(); } catch (e) { console.log("   restauración:", e.message); }
  const rr = await buscar(TIP, "tipologias", "portal", TIPOLOGIA, PADRE_A);
  ok("restauración: la tipología real volvió a sus valores originales", ["nombre", "precioMin", "areaMin", "habMax", "entrega"].every((c) => iguales(c, rr?.datos[c], original.portal[c], RECURSOS.tipologias.campos)));
  const otros = {};
  for (const s of ["espocrm", "odoo"]) { const x = await buscar(TIP, "tipologias", s, TIPOLOGIA, PADRE_A); otros[s] = ["nombre", "precioMin", "areaMin", "habMax", "entrega"].every((c) => iguales(c, x?.datos[c], original.portal[c], RECURSOS.tipologias.campos)); }
  ok("restauración: EspoCRM y Odoo también", Object.values(otros).every(Boolean), JSON.stringify(otros));
  console.log(fallos === 0 ? "TODO OK" : `${fallos} FALLOS`);
}
process.exit(fallos === 0 ? 0 : 1);
