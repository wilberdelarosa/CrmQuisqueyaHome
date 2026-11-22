import assert from "node:assert/strict";
import { test } from "node:test";
import type { Actor } from "../../../domain/rbac.ts";
import { REGISTRO_MODULOS } from "../../../modules/registry.ts";
import { estaActiva, menuPara } from "./navegacion.ts";

const conTodo: Actor = {
  userId: 1,
  roleSlug: "admin",
  permissions: [...new Set(REGISTRO_MODULOS.map((m) => m.recurso))].map((resource) => ({ resource, action: "view" as const, scope: "all" as const })),
};
const sinNada: Actor = { userId: 2, roleSlug: "broker", permissions: [] };

test("menú: sin la bandera de revisión solo llegan módulos certificados y no se listan pendientes", () => {
  const menu = menuPara(conTodo, false);
  assert.ok(menu.disponibles.every((entrada) => entrada.estado === "certificado"));
  assert.deepEqual(menu.pendientes, []);
});

test("menú: con la bandera se suman los módulos en revisión y se listan los que faltan", () => {
  const menu = menuPara(conTodo, true);
  assert.ok(menu.disponibles.every((entrada) => entrada.estado !== "en_construccion"));
  assert.ok(menu.pendientes.every((entrada) => entrada.estado === "en_construccion"));
  assert.ok(menu.disponibles.length + menu.pendientes.length > 0);
});

test("menú: sin permiso de lectura un módulo no aparece ni como pendiente", () => {
  assert.deepEqual(menuPara(sinNada, true), { disponibles: [], pendientes: [] });
});

test("menú: una entrada está activa en su base y en sus subrutas, no en rutas que solo comparten prefijo", () => {
  assert.equal(estaActiva("/leads", "/leads"), true);
  assert.equal(estaActiva("/leads/22", "/leads"), true);
  assert.equal(estaActiva("/leads-importados", "/leads"), false);
});
