/**
 * Guardas de fuente heredadas que esperan a que su pantalla se reconstruya. Lista única: de aquí
 * toman sus rutas las pruebas (para omitirse con motivo y para leer el archivo) y el registro de
 * módulos (para impedir que un módulo se certifique con una guarda todavía omitida).
 * Rutas relativas a `src/`. Si una pantalla nueva vive en otra ruta, se cambia aquí y en ningún otro sitio.
 */
export const GUARDAS_EN_ESPERA = [
  { id: "paleta-etiquetas", modulo: "M2", protege: "La paleta muestra las etiquetas en español de cada resultado", archivos: ["app/(crm)/_ui/command-palette.tsx"] },
  { id: "leads-tomar", modulo: "M2", protege: "Tomar un lead usa su operación propia, no la reasignación administrativa", archivos: ["app/(crm)/leads/[id]/acciones.tsx"] },
  { id: "leads-cola", modulo: "M2", protege: "La cola sin responsable solo se amplía para brokers con edición", archivos: ["infrastructure/db/repos/leads-lectura.ts"] },
  { id: "google-boton", modulo: "M13", protege: "El botón de Google cumple la guía de marca", archivos: ["app/(crm)/configuracion/conexiones/botones.tsx", "app/(crm)/configuracion/conexiones/logos.tsx"] },
  { id: "academy-reloj", modulo: "M10", protege: "El reloj del servidor y los formatos de fecha de Academy son deterministas", archivos: ["app/(crm)/academy/page.tsx", "app/(crm)/academy/vista.tsx"] },
] as const;

export type IdDeGuarda = (typeof GUARDAS_EN_ESPERA)[number]["id"];
