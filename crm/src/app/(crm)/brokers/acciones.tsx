"use client";

import { useId, useState, type FormEvent } from "react";
import { useAccion } from "../_ui/accion";
import { BOTON_PRINCIPAL, BOTON_SECUNDARIO } from "../_ui/pagina";

type Proyecto = { id: number; nombre: string; brokerId: number | null };

/** Marca qué proyectos lleva el broker. Un proyecto de otro broker se reasigna, y se avisa. */
export function AsignarProyectos({ brokerId, nombre, proyectos, asignados }: { brokerId: number; nombre: string; proyectos: Proyecto[]; asignados: number[] }) {
  const id = useId();
  const { enviando, error, ejecutar } = useAccion();
  const [abierto, setAbierto] = useState(false);

  async function guardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const projectIds = new FormData(evento.currentTarget).getAll("proyecto").map(Number);
    const ok = await ejecutar("proyectos", { method: "PUT", ruta: `/api/brokers/${brokerId}/proyectos`, cuerpo: { projectIds } });
    if (ok) setAbierto(false);
  }

  if (!abierto) {
    return <button type="button" onClick={() => setAbierto(true)} className="mt-2 text-sm font-medium text-brand-900 underline underline-offset-2">Cambiar proyectos</button>;
  }
  return (
    <form onSubmit={guardar} className="mt-3 space-y-3" aria-labelledby={`${id}-titulo`}>
      <fieldset>
        <legend id={`${id}-titulo`} className="text-sm font-medium text-ink">Proyectos que lleva {nombre}</legend>
        {proyectos.length === 0 ? <p className="mt-1 text-sm text-ink-muted">No hay proyectos activos.</p> : (
          <ul className="mt-2 grid max-h-64 gap-1 overflow-y-auto rounded-control border border-line p-2 sm:grid-cols-2">
            {proyectos.map((proyecto) => (
              <li key={proyecto.id}>
                <label className="flex min-h-10 items-center gap-2 rounded px-2 hover:bg-surface-hover">
                  <input type="checkbox" name="proyecto" value={proyecto.id} defaultChecked={asignados.includes(proyecto.id)} className="size-4 accent-brand-900" />
                  <span className="min-w-0 text-sm text-text">
                    {proyecto.nombre}
                    {proyecto.brokerId !== null && proyecto.brokerId !== brokerId ? <span className="block text-xs text-warning">Hoy lo lleva otro broker</span> : null}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </fieldset>
      <div className="flex gap-2">
        <button type="submit" disabled={enviando !== null} className={BOTON_PRINCIPAL}>{enviando === "proyectos" ? "Guardando…" : "Guardar proyectos"}</button>
        <button type="button" onClick={() => setAbierto(false)} className={BOTON_SECUNDARIO}>Cancelar</button>
      </div>
      {error ? <p role="alert" className="text-sm text-danger">{error}</p> : null}
    </form>
  );
}
