import { existsSync } from "node:fs";
import type { TestContext } from "node:test";
import { GUARDAS_EN_ESPERA, type IdDeGuarda } from "./guardas-en-espera.ts";

const SRC = new URL("../../", import.meta.url);

/**
 * Las guardas de fuente heredadas vigilan archivos de pantalla. En el CRM nuevo las pantallas se
 * reconstruyen módulo por módulo: mientras falte alguno de sus archivos la guarda se omite con su
 * motivo, y vuelve a exigirse sola en cuanto existen. Devuelve las rutas de la lista única
 * (`guardas-en-espera.ts`), en su mismo orden, para que la prueba lea de ahí y no repita rutas.
 */
export function pantallaReconstruida(t: TestContext, id: IdDeGuarda): readonly URL[] | null {
  const guarda = GUARDAS_EN_ESPERA.find((candidata) => candidata.id === id)!;
  const rutas = guarda.archivos.map((archivo) => new URL(archivo, SRC));
  const falta = guarda.archivos.find((_, indice) => !existsSync(rutas[indice]!));
  if (!falta) return rutas;
  t.skip(`pantalla aún no reconstruida: src/${falta}`);
  return null;
}
