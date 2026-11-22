// Verifica que las unidades reales están completas e iguales en los tres sistemas. Se ejecuta DENTRO del contenedor `inventario-hub`.
import { readFileSync } from "node:fs";
import * as uniC from "./adapters/unidades/crm_propio.mjs";
import * as uniE from "./adapters/unidades/espocrm.mjs";
import * as uniO from "./adapters/unidades/odoo.mjs";
import * as proyC from "./adapters/crm_propio.mjs";
import * as proyE from "./adapters/espocrm.mjs";
import * as proyO from "./adapters/odoo.mjs";
import { iguales } from "./core.mjs";
import { RECURSOS } from "./recursos.mjs";

const fuente = JSON.parse(readFileSync(process.argv[2], "utf8"));
const campos = RECURSOS.unidades.campos;
let fallos = 0;
const ok = (t, c, extra = "") => { if (!c) fallos++; console.log((c ? "OK   " : "FALLO") + " " + t + (extra ? " — " + extra : "")); };
const SIS = { crm_propio: [uniC, proyC], espocrm: [uniE, proyE], odoo: [uniO, proyO] };

for (const [slug, p] of Object.entries(fuente.proyectos)) {
  console.log(`== ${slug} (${p.unidades.length} unidades en la fuente)`);
  for (const [s, [uni, proy]] of Object.entries(SIS)) {
    const idProyecto = (await proy.listar()).find((x) => x.slug === slug)?.id;
    const mias = (await uni.listar()).filter((u) => u.padreId === String(idProyecto));
    const porCodigo = new Map(mias.map((u) => [u.slug, u]));
    const faltan = p.unidades.filter((u) => !porCodigo.has(u.codigo)).length;
    const distintas = p.unidades.filter((u) => {
      const x = porCodigo.get(u.codigo);
      return x && !["tipo", "hab", "area", "patio", "estado", "precioMin", "precioMax", "moneda"].every((c) => iguales(c, x.datos[c], u[c], campos));
    });
    const sobran = mias.filter((u) => !p.unidades.some((x) => x.codigo === u.slug)).length;
    const estados = {};
    for (const u of mias) estados[u.datos.estado] = (estados[u.datos.estado] ?? 0) + 1;
    ok(`${s}: ${mias.length} unidades, ninguna falta, ninguna distinta, ninguna de más`, faltan === 0 && distintas.length === 0 && sobran === 0, `faltan ${faltan}, distintas ${distintas.length}${distintas[0] ? " (p. ej. " + distintas[0].codigo + ")" : ""}, de más ${sobran}; estados ${JSON.stringify(estados)}`);
  }
}
console.log(fallos === 0 ? "TODO OK" : `${fallos} FALLOS`);
process.exit(fallos === 0 ? 0 : 1);
