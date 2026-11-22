import type { ReactElement } from "react";

/** Tipos del tablero «Liga de metas» (componente aportado por el dueño, en JavaScript). */
export type PropsDeLiga = {
  metas: { periodo: string; meta_colectiva: number }[];
  equipo: { broker: string; meta_personal: number | null }[];
  ventas: { fecha: string; broker: string; monto: number }[];
  titulo?: string;
  /** Símbolo de la moneda de la empresa. */
  simbolo?: string;
  /** Monto vendido que equivale a una copa. */
  copa?: number;
};

export default function LigaDeMetas(props: PropsDeLiga): ReactElement;
