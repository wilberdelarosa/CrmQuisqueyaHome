"use client";

import { useId, useState, type FormEvent } from "react";
import { useAccion } from "../_ui/accion";
import { BOTON_PRINCIPAL, BOTON_SECUNDARIO, CAMPO } from "../_ui/pagina";

type Props = { year: number; month: number; moneda: string; brokers: { id: number; nombre: string }[]; puedeCompania: boolean };

/** Fija la meta del mes: de la compañía (solo administración) o de un broker al alcance. */
export function FijarMeta({ year, month, moneda, brokers, puedeCompania }: Props) {
  const id = useId();
  const { enviando, error, ejecutar } = useAccion();
  const [abierta, setAbierta] = useState(false);

  async function guardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const datos = Object.fromEntries(new FormData(evento.currentTarget)) as Record<string, string>;
    const monto = datos.amount?.trim() ? Math.round(Number(datos.amount.replace(",", ".")) * 100) : undefined;
    const ok = await ejecutar("meta", {
      method: "PUT", ruta: "/api/metas",
      cuerpo: {
        brokerId: datos.destino === "compania" ? null : Number(datos.destino), year, month,
        targetDeals: Number(datos.targetDeals), ...(monto !== undefined ? { targetAmountCents: monto } : {}),
      },
    });
    if (ok) setAbierta(false);
  }

  if (!abierta) return <button type="button" onClick={() => setAbierta(true)} className={BOTON_PRINCIPAL}>Fijar una meta</button>;
  return (
    <form onSubmit={guardar} className="grid gap-4 rounded-panel border border-line bg-surface p-5 sm:grid-cols-[2fr_1fr_1fr_auto] sm:items-end">
      <div>
        <label htmlFor={`${id}-destino`} className="font-medium text-ink">Para quién <span className="text-ink-muted">(obligatorio)</span></label>
        <select id={`${id}-destino`} name="destino" required defaultValue={puedeCompania ? "compania" : ""} className={CAMPO}>
          {!puedeCompania ? <option value="" disabled>Elige un broker</option> : <option value="compania">Toda la compañía</option>}
          {brokers.map((broker) => <option key={broker.id} value={broker.id}>{broker.nombre}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor={`${id}-cierres`} className="font-medium text-ink">Cierres <span className="text-ink-muted">(obligatorio)</span></label>
        <input id={`${id}-cierres`} name="targetDeals" type="number" min={0} step={1} required className={CAMPO} />
      </div>
      <div>
        <label htmlFor={`${id}-monto`} className="font-medium text-ink">Monto en {moneda}</label>
        <input id={`${id}-monto`} name="amount" inputMode="decimal" className={CAMPO} />
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={enviando !== null} aria-busy={enviando !== null} className={BOTON_PRINCIPAL}>{enviando ? "Guardando…" : "Guardar"}</button>
        <button type="button" onClick={() => setAbierta(false)} className={BOTON_SECUNDARIO}>Cancelar</button>
      </div>
      {error ? <p role="alert" className="text-sm text-danger sm:col-span-4">{error}</p> : null}
    </form>
  );
}
