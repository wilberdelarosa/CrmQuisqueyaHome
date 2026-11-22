/**
 * Configuración de la empresa de esta instalación (P2: fuente única).
 *
 * Una instalación aislada por empresa: nombre, marca, idioma, zona horaria, monedas y tema salen
 * de `config/empresas/<id>.json`, elegido con `CRM_EMPRESA`. Crear otra empresa es añadir su
 * archivo y sus recursos de marca; ningún texto ni color de una empresa vive en el código.
 * Solo servidor: lee del disco al arrancar y valida la forma con Zod.
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { empresaId } from "./env";

const Color = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color en formato #rrggbb.");

/** Claves del tema que una empresa puede sustituir; el resto de tokens es del producto (`tokens.css`). */
export const CLAVES_DE_TEMA = [
  "brand-950", "brand-900", "brand-700", "brand-100",
  "accent-600", "accent-700", "accent-800", "accent-100",
] as const;

const EsquemaEmpresa = z.object({
  id: z.string().regex(/^[a-z0-9-]{2,40}$/),
  nombre: z.string().trim().min(1).max(80),
  nombreCorto: z.string().trim().min(1).max(8),
  producto: z.string().trim().min(1).max(60),
  idioma: z.string().regex(/^[a-z]{2}-[A-Z]{2}$/),
  zonaHoraria: z.string().min(3).max(60),
  monedaPrincipal: z.string().regex(/^[A-Z]{3}$/),
  monedas: z.array(z.string().regex(/^[A-Z]{3}$/)).min(1).max(6),
  marca: z.object({ logo: z.string().startsWith("/"), isotipo: z.string().startsWith("/") }),
  tema: z.object(Object.fromEntries(CLAVES_DE_TEMA.map((clave) => [clave, Color])) as Record<(typeof CLAVES_DE_TEMA)[number], typeof Color>).partial(),
}).strict();

export type Empresa = z.infer<typeof EsquemaEmpresa>;

let enMemoria: Empresa | undefined;

export function validarEmpresa(dato: unknown): Empresa {
  return EsquemaEmpresa.parse(dato);
}

export function empresa(): Empresa {
  if (enMemoria) return enMemoria;
  const id = empresaId();
  if (!/^[a-z0-9-]{2,40}$/.test(id)) throw new Error("CRM_EMPRESA no es un identificador de empresa válido.");
  const ruta = path.join(process.cwd(), "config", "empresas", `${id}.json`);
  const leida = validarEmpresa(JSON.parse(readFileSync(ruta, "utf8")));
  if (leida.id !== id) throw new Error(`La configuración de ${id} declara otro id (${leida.id}).`);
  if (!leida.monedas.includes(leida.monedaPrincipal)) throw new Error("La moneda principal debe estar entre las monedas de la empresa.");
  enMemoria = leida;
  return leida;
}

/** Variables CSS del tema de la empresa, para el elemento raíz. */
export function variablesDeTema(tema: Empresa["tema"]): Record<string, string> {
  return Object.fromEntries(
    CLAVES_DE_TEMA.filter((clave) => tema[clave]).map((clave) => [`--color-${clave}`, tema[clave]!]),
  );
}
