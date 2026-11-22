import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizarNombreProyecto, resolverProyecto, type ProyectoVinculable } from "./vinculo-proyecto.ts";

const PROYECTOS: ProyectoVinculable[] = [
  { id: 14, name: "Olea at Cap Cana", slug: "olea-at-cap-cana" },
  { id: 20, name: "Vista Farallón", slug: "vista-farallon" },
  { id: 21, name: "Vista Farallón II", slug: "vista-farallon-ii" },
  { id: 30, name: "Le Nid", slug: "le-nid" },
];

test("vínculo: normaliza tildes, mayúsculas y signos", () => {
  assert.equal(normalizarNombreProyecto("  Vista-Farallón!  "), "vista farallon");
});

test("vínculo: coincide por nombre exacto aunque cambien tildes y mayúsculas", () => {
  assert.equal(resolverProyecto("olea AT cap cana", PROYECTOS), 14);
  assert.equal(resolverProyecto("Vista Farallon", PROYECTOS), 20);
});

test("vínculo: coincide por slug", () => {
  assert.equal(resolverProyecto("vista-farallon-ii", PROYECTOS), 21);
});

test("vínculo: la coincidencia exacta gana a la contención en otro proyecto", () => {
  assert.equal(resolverProyecto("Vista Farallón", PROYECTOS), 20);
});

test("vínculo: contención en un único proyecto", () => {
  assert.equal(resolverProyecto("Me interesa Olea at Cap Cana, torre 2", PROYECTOS), 14);
  assert.equal(resolverProyecto("Olea", PROYECTOS), 14);
});

test("vínculo: ambiguo, vacío, corto o inexistente no vincula", () => {
  assert.equal(resolverProyecto("Vista", PROYECTOS), null, "contenido en dos proyectos");
  assert.equal(resolverProyecto("", PROYECTOS), null);
  assert.equal(resolverProyecto(null, PROYECTOS), null);
  assert.equal(resolverProyecto("Le", PROYECTOS), null, "demasiado corto para contención");
  assert.equal(resolverProyecto("Proyecto Inexistente", PROYECTOS), null);
});

test("vínculo: dos proyectos con el mismo nombre no se vinculan", () => {
  const repetidos = [...PROYECTOS, { id: 99, name: "Le Nid", slug: "le-nid-2" }];
  assert.equal(resolverProyecto("Le Nid", repetidos), null);
});
