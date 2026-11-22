"use client";

import { useId, useState, type FormEvent } from "react";
import { useAccion } from "../_ui/accion";
import { BOTON_PRINCIPAL, BOTON_SECUNDARIO, CAMPO } from "../_ui/pagina";

const PEQUENO = "h-10 px-3 text-sm";

/** Extiende 24 horas o libera un apartado vigente. Las dos piden el motivo, que queda en la auditoría. */
export function AccionesDeApartado({ id, version }: { id: number; version: number }) {
  const campo = useId();
  const { enviando, error, ejecutar } = useAccion();
  const [modo, setModo] = useState<"extender" | "liberar" | null>(null);

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const reason = String(new FormData(evento.currentTarget).get("motivo") ?? "").trim();
    const ok = modo === "extender"
      ? await ejecutar("extender", { method: "POST", ruta: `/api/holds/${id}/extensiones`, cuerpo: { expectedVersion: version, reason, additionalHours: 24 } })
      : await ejecutar("liberar", { method: "POST", ruta: `/api/holds/${id}/cancelacion`, cuerpo: { expectedVersion: version, reason } });
    if (ok) setModo(null);
  }

  if (!modo) {
    return (
      <div className="flex flex-wrap gap-2">
        <button type="button" className={`${BOTON_SECUNDARIO} ${PEQUENO}`} onClick={() => setModo("extender")}>Extender 24 h</button>
        <button type="button" className={`${BOTON_SECUNDARIO} ${PEQUENO} text-danger`} onClick={() => setModo("liberar")}>Liberar</button>
      </div>
    );
  }
  return (
    <form onSubmit={enviar} className="flex w-full flex-wrap items-end gap-2 lg:w-96">
      <label htmlFor={campo} className="min-w-0 flex-1 text-sm font-medium text-ink">
        {modo === "extender" ? "Por qué se extiende" : "Por qué se libera"} <span className="text-ink-muted">(obligatorio)</span>
        <input id={campo} name="motivo" required maxLength={300} autoFocus className={CAMPO}
          placeholder={modo === "extender" ? "El cliente firma el lunes" : "El cliente eligió otra unidad"} />
      </label>
      <button type="submit" disabled={enviando !== null} className={`${BOTON_PRINCIPAL} ${PEQUENO}`}>
        {enviando ? "Guardando…" : modo === "extender" ? "Extender" : "Liberar unidad"}
      </button>
      <button type="button" onClick={() => setModo(null)} className={`${BOTON_SECUNDARIO} ${PEQUENO}`}>Cancelar</button>
      {error ? <p role="alert" className="w-full text-sm text-danger">{error}</p> : null}
    </form>
  );
}
