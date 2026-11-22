// Tipos de recurso que sincroniza el concentrador. Cada uno declara sus campos canónicos (solo datos públicos), en qué sistemas
// vive, dónde están sus adaptadores y de qué otro recurso depende (su «padre»). Añadir un tipo nuevo = una entrada aquí + un
// adaptador por sistema; ni el núcleo ni el servidor cambian.
import { CAMPOS_PROYECTO } from "./core.mjs";

export const RECURSOS = {
  // Proyecto (obra): lo que ya existía.
  proyectos: {
    dir: "adapters", sistemas: ["portal", "crm_propio", "espocrm", "odoo"], campos: CAMPOS_PROYECTO, padre: null, requerido: "nombre", maxCrear: 60,
  },
  // Tipología de un proyecto (p. ej. «Villa Tao»): portal, EspoCRM y Odoo. El CRM propio no tiene tabla equivalente.
  tipologias: {
    dir: "adapters/tipologias", sistemas: ["portal", "espocrm", "odoo"], padre: "proyectos", requerido: "nombre", maxCrear: 150,
    campos: { nombre: "texto", tipo: "texto", habMin: "num", habMax: "num", banosMin: "num", banosMax: "num", areaMin: "num", areaMax: "num", precioMin: "num", precioMax: "num", moneda: "moneda", entrega: "texto" },
  },
  // Unidad concreta (A-101): CRM propio, EspoCRM y Odoo. Solo rango público; el precio real y las notas internas nunca viajan.
  // El portal no tiene inventario por unidad.
  unidades: {
    dir: "adapters/unidades", sistemas: ["crm_propio", "espocrm", "odoo"], padre: "proyectos", requerido: null, maxCrear: 600,
    campos: { tipo: "texto", hab: "entero", banos: "num", area: "num", patio: "num", nivel: "entero", torre: "texto", estado: "texto", precioMin: "num", precioMax: "num", moneda: "moneda" },
  },
};
