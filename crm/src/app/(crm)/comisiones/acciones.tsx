"use client";

import { useId, useState, type FormEvent } from "react";
import type { CommissionStatus } from "@/domain/catalogs";
import { useAccion } from "../_ui/accion";
import { BOTON_PRINCIPAL, BOTON_SECUNDARIO, CAMPO } from "../_ui/pagina";

const PEQUENO = "h-10 px-3 text-sm";

/** Avanza la comisión (pendiente → aprobada → pagada), la anula o ajusta el reparto mientras está pendiente. */
export function AccionesDeComision({ id, estado, repartoBroker }: { id: number; estado: CommissionStatus; repartoBroker: number }) {
  const campo = useId();
  const { enviando, error, ejecutar } = useAccion();
  const [editandoReparto, setEditandoReparto] = useState(false);
  const ruta = `/api/comisiones/${id}`;
  const ocupado = enviando !== null;

  if (estado === "paid" || estado === "void") return <span />;

  async function guardarReparto(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const porcentaje = Number(new FormData(evento.currentTarget).get("reparto"));
    const ok = await ejecutar("reparto", { method: "PATCH", ruta, cuerpo: { brokerShareBasisPoints: Math.round(porcentaje * 100) } });
    if (ok) setEditandoReparto(false);
  }

  return (
    <div className="flex flex-col items-start gap-2 lg:items-end">
      {editandoReparto ? (
        <form onSubmit={guardarReparto} className="flex items-end gap-2">
          <label htmlFor={campo} className="text-sm font-medium text-ink">Parte del broker (%)
            <input id={campo} name="reparto" type="number" min={0} max={100} step={0.5} required autoFocus
              defaultValue={repartoBroker / 100} className={`${CAMPO} w-28`} />
          </label>
          <button type="submit" disabled={ocupado} className={`${BOTON_PRINCIPAL} ${PEQUENO}`}>{enviando === "reparto" ? "Guardando…" : "Guardar"}</button>
          <button type="button" onClick={() => setEditandoReparto(false)} className={`${BOTON_SECUNDARIO} ${PEQUENO}`}>Cancelar</button>
        </form>
      ) : (
        <div className="flex flex-wrap gap-2">
          {estado === "pending" ? (
            <>
              <button type="button" disabled={ocupado} aria-busy={enviando === "aprobar"} className={`${BOTON_PRINCIPAL} ${PEQUENO}`}
                onClick={() => void ejecutar("aprobar", { method: "PATCH", ruta, cuerpo: { status: "approved" } })}>
                {enviando === "aprobar" ? "Aprobando…" : "Aprobar"}
              </button>
              <button type="button" disabled={ocupado} className={`${BOTON_SECUNDARIO} ${PEQUENO}`} onClick={() => setEditandoReparto(true)}>Cambiar reparto</button>
            </>
          ) : (
            <button type="button" disabled={ocupado} aria-busy={enviando === "pagar"} className={`${BOTON_PRINCIPAL} ${PEQUENO}`}
              onClick={() => { if (window.confirm("¿Confirmas que esta comisión ya se le pagó al broker?")) void ejecutar("pagar", { method: "PATCH", ruta, cuerpo: { status: "paid" } }); }}>
              {enviando === "pagar" ? "Guardando…" : "Marcar pagada"}
            </button>
          )}
          <button type="button" disabled={ocupado} className={`${BOTON_SECUNDARIO} ${PEQUENO} text-danger`}
            onClick={() => { if (window.confirm("¿Anular esta comisión? No se podrá reactivar.")) void ejecutar("anular", { method: "PATCH", ruta, cuerpo: { status: "void" } }); }}>
            {enviando === "anular" ? "Anulando…" : "Anular"}
          </button>
        </div>
      )}
      {error ? <p role="alert" className="max-w-xs text-sm text-danger">{error}</p> : null}
    </div>
  );
}
