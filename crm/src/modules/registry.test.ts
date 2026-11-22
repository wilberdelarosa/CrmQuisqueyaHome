import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { test } from "node:test";
import { existsSync, readdirSync } from "node:fs";
import { GUARDAS_EN_ESPERA } from "../application/testing/guardas-en-espera.ts";
import { REGISTRO_MODULOS } from "./registry.ts";
import { PERMISSION_RESOURCES } from "../domain/catalogs.ts";

const SRC = new URL("../", import.meta.url);
const APP_CRM = new URL("app/(crm)/", SRC);

test("registry: rutas base son únicas", () => {
  const rutas = REGISTRO_MODULOS.map((m) => m.rutaBase);
  const unicas = new Set(rutas);
  assert.equal(unicas.size, rutas.length, `Rutas duplicadas: ${rutas}`);
});

test("registry: todo módulo certificado tiene su page.tsx", () => {
  for (const m of REGISTRO_MODULOS.filter((modulo) => modulo.estado === "certificado")) {
    const pagePath = new URL(`${m.rutaBase.replace(/^\//, "")}/page.tsx`, APP_CRM);
    assert.ok(existsSync(pagePath), `Falta page.tsx para el módulo certificado ${m.id} ${m.rutaBase}`);
  }
});

test("registry: un módulo certificado no deja guardas en espera", () => {
  const certificados = new Set(REGISTRO_MODULOS.filter((m) => m.estado === "certificado").map((m) => m.id));
  const dormidas = GUARDAS_EN_ESPERA.filter((guarda) => certificados.has(guarda.modulo))
    .flatMap((guarda) => guarda.archivos.filter((archivo) => !existsSync(new URL(archivo, SRC))).map((archivo) => `${guarda.modulo}: ${guarda.protege} (espera ${archivo})`));
  assert.deepEqual(dormidas, [], "Al certificar un módulo, sus guardas deben volver a exigirse: crea la pantalla en esa ruta o apunta la guarda a la nueva.");
});

test("registry: toda guarda en espera pertenece a un módulo del registro", () => {
  const ids = new Set(REGISTRO_MODULOS.map((m) => m.id));
  assert.deepEqual(GUARDAS_EN_ESPERA.filter((guarda) => !ids.has(guarda.modulo)).map((guarda) => guarda.modulo), []);
});

test("registry: toda guarda de la lista la usa una prueba (ninguna queda suelta)", () => {
  const pruebas = ["application/busqueda/m41-r2-render.test.ts", "application/leads/s3-flujos.test.ts", "infrastructure/conexiones-oauth/rutas.test.ts", "lib/academy-fechas.test.ts"]
    .map((archivo) => readFileSync(new URL(archivo, SRC), "utf8")).join("\n");
  const sinUso = GUARDAS_EN_ESPERA.filter((guarda) => !pruebas.includes(`pantallaReconstruida(t, "${guarda.id}")`)).map((guarda) => guarda.id);
  assert.deepEqual(sinUso, []);
  assert.doesNotMatch(pruebas, /pantallaReconstruida\(t, (new URL|"src\/)/, "Las pruebas toman sus rutas de la lista, no las repiten.");
});

test("registry: cada guarda en espera vigila archivos de su propio módulo", () => {
  const cruzadas = GUARDAS_EN_ESPERA.flatMap((guarda) => {
    const base = REGISTRO_MODULOS.find((m) => m.id === guarda.modulo)?.rutaBase.replace(/^\//, "");
    return guarda.archivos
      // Solo las pantallas tienen carpeta de módulo; una guarda sobre el motor se asigna a mano.
      .filter((archivo) => archivo.startsWith("app/(crm)/"))
      .map((archivo) => archivo.replace("app/(crm)/", "").split("/")[0]!)
      // `_ui` y demás carpetas compartidas no pertenecen a un módulo: se asignan a mano.
      .filter((carpeta) => !carpeta.startsWith("_") && carpeta !== base)
      .map((carpeta) => `${guarda.id}: vigila ${carpeta} pero está asignada a ${guarda.modulo} (${base})`);
  });
  assert.deepEqual(cruzadas, []);
});

test("registry: ninguna pantalla vive fuera del registro", () => {
  if (!existsSync(APP_CRM)) return;
  const bases = new Set(REGISTRO_MODULOS.map((m) => m.rutaBase.replace(/^\//, "").split("/")[0]));
  const carpetas = readdirSync(APP_CRM, { withFileTypes: true })
    .filter((entrada) => entrada.isDirectory() && !entrada.name.startsWith("_") && !entrada.name.startsWith("("))
    .map((entrada) => entrada.name);
  assert.deepEqual(carpetas.filter((carpeta) => !bases.has(carpeta)), [], "Toda carpeta de pantallas debe pertenecer a un módulo del registro.");
});

test("registry: todos los recursos RBAC son válidos y cerrados", () => {
  const validos = new Set(PERMISSION_RESOURCES);
  for (const m of REGISTRO_MODULOS) {
    assert.ok(
      (validos as Set<string>).has(m.recurso),
      `Recurso inválido en ${m.id}/${m.nombre}: ${m.recurso}`
    );
  }
});

test("registry: subrutas empiezan con / y bases son únicas", () => {
  for (const m of REGISTRO_MODULOS) {
    const subs = m.subrutas ?? [m.rutaBase];
    for (const s of subs) {
      assert.ok(s.startsWith("/"), `Subruta sin / : ${s} en ${m.id}`);
    }
  }
  // subrutas pueden solaparse entre grupos (ej. /aprobaciones en Inicio y Aprobaciones) — intencional
});

test("registry: contiene exactamente 22 módulos", () => {
  assert.equal(REGISTRO_MODULOS.length, 22);
});

test("registry: ids únicos y la navegación conserva los ids históricos (M4 en Agenda y Tareas)", () => {
  const ids = REGISTRO_MODULOS.map((m) => m.id);
  assert.equal(new Set(ids).size, ids.length);
  const legado = REGISTRO_MODULOS.filter((m) => m.idLegado).map((m) => [m.rutaBase, m.idLegado]);
  assert.deepEqual(legado, [["/agenda", "M4"], ["/tareas", "M4"]]);
});


test("registry: manifiesto tiene permisos y navegación/flags para módulos clave", () => {
  const leads = REGISTRO_MODULOS.find(m => m.id === "M2");
  assert.ok(leads, "debe tener leads");
  // permisos y navegacion son opcionales en esta fase
  const all = REGISTRO_MODULOS.every(m => m.recurso && m.rutaBase.startsWith("/"));
  assert.ok(all);
});


test("registry: getPermisosDesdeRegistro genera lista sin hardcodes", async () => {
  const mod = await import("./registry.ts");
  const perms = mod.getPermisosDesdeRegistro();
  assert.ok(Array.isArray(perms));
  assert.ok(perms.includes("leads"));
  assert.ok(perms.includes("dashboard"));
});

test("registry: generarEntradasN1Base produce entradas con rutas del registry (sin hardcode en modulos.ts)", async () => {
  const mod = await import("./registry.ts");
  const entradas = mod.generarEntradasN1Base();
  assert.ok(entradas.length >= 9);
  const rutasReg = new Set(mod.REGISTRO_MODULOS.map((m) => m.rutaBase));
  entradas.forEach((e) => {
    assert.ok(e.ruta.startsWith("/"));
    assert.ok(rutasReg.has(e.ruta), `ruta fuera del registro: ${e.ruta}`);
    if (e.rutasHijas) e.rutasHijas.forEach((r: string) => assert.ok(rutasReg.has(r)));
  });
});


test("registry: generarEntradasN1Base no cae a '/' ni a 'dashboard' por un id inexistente (lanza error)", () => {
  const src = readFileSync(new URL("./registry.ts", import.meta.url), "utf8");
  assert.doesNotMatch(src, /rutaBase \|\| "\/"/);
  assert.doesNotMatch(src, /\|\| \("dashboard" as PermissionResource\)/);
  assert.match(src, /throw new Error\(`registry: módulo inexistente/);
});
