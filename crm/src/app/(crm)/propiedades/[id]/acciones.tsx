"use client";

import { useId, useState, type FormEvent } from "react";
import { useAccion } from "../../_ui/accion";
import { BOTON_PRINCIPAL, BOTON_SECUNDARIO, CAMPO } from "../../_ui/pagina";

/** Carga o corrige el precio real de una unidad. Sin precio real no se puede apartar ni reservar. */
export function PrecioReal({ projectId, unitId, codigo, centavos, moneda, idioma }: { projectId: number; unitId: number; codigo: string; centavos: number | null; moneda: string; idioma: string }) {
  const id = useId();
  const { enviando, error, ejecutar } = useAccion();
  const [editando, setEditando] = useState(false);
  const texto = centavos != null ? new Intl.NumberFormat(idioma, { style: "currency", currency: moneda, maximumFractionDigits: 0 }).format(centavos / 100) : null;

  async function guardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const monto = Number(String(new FormData(evento.currentTarget).get("precio") ?? "").replace(/[^\d.]/g, ""));
    const ok = await ejecutar("precio", { method: "PATCH", ruta: `/api/proyectos/${projectId}/unidades/${unitId}`, cuerpo: { realPriceCents: Math.round(monto * 100) } });
    if (ok) setEditando(false);
  }

  if (!editando) {
    return (
      <span className="inline-flex flex-wrap items-baseline gap-x-2">
        {texto ? <span>Real {texto}</span> : <span className="text-ink-muted">Sin precio real</span>}
        <button type="button" onClick={() => setEditando(true)} className="text-sm font-medium text-brand-900 underline underline-offset-2"
          aria-label={`${texto ? "Cambiar" : "Cargar"} el precio real de ${codigo}`}>{texto ? "Cambiar" : "Cargar"}</button>
      </span>
    );
  }
  return (
    <form onSubmit={guardar} className="flex flex-wrap items-end gap-2">
      <label htmlFor={id} className="text-sm font-medium text-ink">Precio real de {codigo} ({moneda})
        <input id={id} name="precio" inputMode="decimal" required autoFocus pattern="[0-9.,]+" defaultValue={centavos != null ? centavos / 100 : ""} className={`${CAMPO} w-40`} />
      </label>
      <button type="submit" disabled={enviando !== null} className={`${BOTON_PRINCIPAL} h-10 px-3 text-sm`}>{enviando ? "Guardando…" : "Guardar"}</button>
      <button type="button" onClick={() => setEditando(false)} className={`${BOTON_SECUNDARIO} h-10 px-3 text-sm`}>Cancelar</button>
      {error ? <p role="alert" className="w-full text-sm text-danger">{error}</p> : null}
    </form>
  );
}
