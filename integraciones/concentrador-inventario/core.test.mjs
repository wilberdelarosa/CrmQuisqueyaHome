import assert from "node:assert/strict";
import { test } from "node:test";
import { fusionar, normalizar, slugDe } from "./core.mjs";

const prioridad = ["portal", "crm_propio", "espocrm", "odoo"];
const soportados = {
  portal: ["nombre", "zona", "precioMin", "precioMax", "moneda", "descripcion", "entrega"],
  crm_propio: ["nombre", "zona", "precioMin", "precioMax", "moneda", "descripcion"],
  espocrm: ["nombre", "zona", "precioMin", "precioMax", "moneda", "entrega"],
  odoo: ["nombre", "zona", "precioMin", "precioMax", "moneda", "entrega"],
};
const sistema = (datos, t = 0) => ({ datos, actualizadoEn: t });
const base = { nombre: "Olea", zona: "Cap Cana", precioMin: 100000, precioMax: 200000, moneda: "USD", descripcion: "x", entrega: "2028" };

test("normalizar: vacíos, ceros y mayúsculas", () => {
  assert.equal(normalizar("precioMin", 0), null);
  assert.equal(normalizar("precioMin", "125000.50"), 125000.5);
  assert.equal(normalizar("nombre", "  Olea   at  Cap Cana "), "Olea at Cap Cana");
  assert.equal(normalizar("moneda", "usd"), "USD");
  assert.equal(normalizar("zona", ""), null);
});

test("sin cambios en ningún sistema: no hay nada que escribir", () => {
  const r = fusionar({ base, soportados, prioridad, actuales: { portal: sistema(base), espocrm: sistema(base), odoo: sistema(base) } });
  assert.deepEqual(r.cambios, {});
  assert.deepEqual(r.conflictos, []);
});

test("un cambio en un CRM se propaga a los demás que soportan el campo", () => {
  const r = fusionar({ base, soportados, prioridad, actuales: {
    portal: sistema(base), crm_propio: sistema(base), odoo: sistema(base),
    espocrm: sistema({ ...base, precioMin: 90000 }, 10),
  } });
  assert.equal(r.nuevo.precioMin, 90000);
  assert.deepEqual(r.cambios.portal, { precioMin: 90000 });
  assert.deepEqual(r.cambios.odoo, { precioMin: 90000 });
  assert.deepEqual(r.cambios.crm_propio, { precioMin: 90000 });
  assert.equal(r.cambios.espocrm, undefined);
});

test("campos distintos cambiados en sistemas distintos se combinan (sin conflicto)", () => {
  const r = fusionar({ base, soportados, prioridad, actuales: {
    portal: sistema({ ...base, zona: "Punta Cana" }, 10),
    odoo: sistema({ ...base, entrega: "2029" }, 20),
    espocrm: sistema(base),
  } });
  assert.equal(r.nuevo.zona, "Punta Cana");
  assert.equal(r.nuevo.entrega, "2029");
  assert.deepEqual(r.conflictos, []);
  assert.deepEqual(r.cambios.espocrm, { zona: "Punta Cana", entrega: "2029" });
  assert.deepEqual(r.cambios.portal, { entrega: "2029" });
  assert.deepEqual(r.cambios.odoo, { zona: "Punta Cana" });
});

test("el mismo campo cambiado en dos sistemas: gana el más reciente y queda registrado", () => {
  const r = fusionar({ base, soportados, prioridad, actuales: {
    portal: sistema({ ...base, nombre: "Olea Residences" }, 100),
    odoo: sistema({ ...base, nombre: "Olea at Cap Cana II" }, 200),
    espocrm: sistema(base),
  } });
  assert.equal(r.nuevo.nombre, "Olea at Cap Cana II");
  assert.equal(r.conflictos.length, 1);
  assert.equal(r.conflictos[0].campo, "nombre");
  assert.equal(r.conflictos[0].ganador, "odoo");
  assert.deepEqual(r.cambios.portal, { nombre: "Olea at Cap Cana II" });
  assert.deepEqual(r.cambios.espocrm, { nombre: "Olea at Cap Cana II" });
});

test("empate de marcas de tiempo: manda la prioridad (portal antes que odoo)", () => {
  const r = fusionar({ base, soportados, prioridad, actuales: {
    portal: sistema({ ...base, zona: "A" }, 50),
    odoo: sistema({ ...base, zona: "B" }, 50),
  } });
  assert.equal(r.nuevo.zona, "A");
});

test("dos sistemas cambian al mismo valor: no es conflicto", () => {
  const r = fusionar({ base, soportados, prioridad, actuales: {
    portal: sistema({ ...base, moneda: "DOP" }, 1), odoo: sistema({ ...base, moneda: "dop" }, 2), espocrm: sistema(base),
  } });
  assert.equal(r.nuevo.moneda, "DOP");
  assert.deepEqual(r.conflictos, []);
});

test("vaciar un campo en un sistema lo vacía en los demás", () => {
  const r = fusionar({ base, soportados, prioridad, actuales: { portal: sistema(base), espocrm: sistema({ ...base, entrega: "" }, 5) } });
  assert.equal(r.nuevo.entrega, null);
  assert.deepEqual(r.cambios.portal, { entrega: null });
});

test("un campo que un sistema no soporta nunca se le escribe ni cuenta para él", () => {
  const r = fusionar({ base, soportados, prioridad, actuales: {
    crm_propio: sistema({ ...base, entrega: "ignorada" }), portal: sistema(base),
  } });
  assert.equal(r.nuevo.entrega, "2028");
  assert.equal(r.cambios.crm_propio, undefined);
});

test("primera carga (sin base): manda la prioridad y los demás convergen", () => {
  const r = fusionar({ base: null, soportados, prioridad, actuales: {
    portal: sistema({ nombre: "Olea at Cap Cana", precioMin: 349250, moneda: "USD" }),
    espocrm: sistema({ nombre: "Olea at Cap Cana", precioMin: 349250.0, moneda: "usd" }),
    odoo: sistema({ nombre: "OLEA", precioMin: 300000, moneda: "USD" }),
  } });
  assert.equal(r.nuevo.nombre, "Olea at Cap Cana");
  assert.deepEqual(r.cambios.odoo, { nombre: "Olea at Cap Cana", precioMin: 349250 });
  assert.equal(r.conflictos.some((c) => c.campo === "nombre"), true);
});

test("tras aplicar los cambios, otra pasada no encuentra nada (sin rebotes)", () => {
  const actuales = { portal: sistema(base), espocrm: sistema({ ...base, precioMin: 90000 }, 9), odoo: sistema(base) };
  const r1 = fusionar({ base, soportados, prioridad, actuales });
  const aplicados = Object.fromEntries(Object.entries(actuales).map(([s, v]) => [s, sistema({ ...v.datos, ...(r1.cambios[s] ?? {}) }, 99)]));
  const r2 = fusionar({ base: r1.nuevo, soportados, prioridad, actuales: aplicados });
  assert.deepEqual(r2.cambios, {});
  assert.deepEqual(r2.conflictos, []);
});

test("slugDe: tildes, espacios y símbolos", () => {
  assert.equal(slugDe("Vista Farallón"), "vista-farallon");
  assert.equal(slugDe("  Marina Garden 2 "), "marina-garden-2");
  assert.equal(slugDe("Azzure at Coral Golf"), "azzure-at-coral-golf");
});

// --- campos propios de otros tipos de recurso (tipologías, unidades) -----------------
const camposUnidad = { tipo: "texto", hab: "entero", nivel: "entero", area: "num", estado: "texto" };
test("tipo entero: se compara redondeado y 0 es sin dato (no hay reescritura en bucle)", () => {
  assert.equal(normalizar("hab", 2.4, camposUnidad), 2);
  assert.equal(normalizar("hab", "3", camposUnidad), 3);
  assert.equal(normalizar("nivel", 0, camposUnidad), null);
});

test("fusionar con los campos de unidades: el cambio de estado en un CRM llega a los demás", () => {
  const sop = { crm_propio: Object.keys(camposUnidad), espocrm: Object.keys(camposUnidad), odoo: Object.keys(camposUnidad) };
  const b = { tipo: "Apartamento", hab: 2, nivel: 3, area: 96.9, estado: "available" };
  const r = fusionar({ base: b, soportados: sop, prioridad: ["crm_propio", "espocrm", "odoo"], campos: camposUnidad, actuales: {
    crm_propio: sistema(b), espocrm: sistema({ ...b, estado: "reserved" }, 9), odoo: sistema({ ...b, hab: 2.0 }),
  } });
  assert.equal(r.nuevo.estado, "reserved");
  assert.deepEqual(r.cambios.crm_propio, { estado: "reserved" });
  assert.deepEqual(r.cambios.odoo, { estado: "reserved" });
  assert.deepEqual(r.conflictos, []);
});
