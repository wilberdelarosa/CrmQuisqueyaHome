"use client";

import { useId, useState, type FormEvent } from "react";
import { useAccion } from "../_ui/accion";
import { BOTON_PRINCIPAL, BOTON_SECUNDARIO, CAMPO } from "../_ui/pagina";

/** Alta rápida de una tarea propia. */
export function NuevaTarea() {
  const id = useId();
  const { enviando, error, ejecutar } = useAccion();
  const [abierta, setAbierta] = useState(false);

  async function guardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const formulario = evento.currentTarget;
    const datos = Object.fromEntries(new FormData(formulario)) as Record<string, string>;
    const ok = await ejecutar("tarea", {
      method: "POST", ruta: "/api/actividades",
      cuerpo: { activityType: "task", title: datos.title, priority: datos.priority, startsAt: datos.startsAt ? new Date(datos.startsAt).toISOString() : undefined },
    });
    if (ok) { formulario.reset(); setAbierta(false); }
  }

  if (!abierta) return <button type="button" onClick={() => setAbierta(true)} className={BOTON_PRINCIPAL}>Nueva tarea</button>;
  return (
    <form onSubmit={guardar} className="grid w-full gap-4 rounded-panel border border-line bg-surface p-5 sm:grid-cols-[2fr_1fr_1fr_auto] sm:items-end">
      <div>
        <label htmlFor={`${id}-titulo`} className="font-medium text-ink">Qué hay que hacer <span className="text-ink-muted">(obligatorio)</span></label>
        <input id={`${id}-titulo`} name="title" required maxLength={160} autoFocus className={CAMPO} />
      </div>
      <div>
        <label htmlFor={`${id}-fecha`} className="font-medium text-ink">Para cuándo</label>
        <input id={`${id}-fecha`} name="startsAt" type="datetime-local" className={CAMPO} />
      </div>
      <div>
        <label htmlFor={`${id}-prioridad`} className="font-medium text-ink">Prioridad</label>
        <select id={`${id}-prioridad`} name="priority" defaultValue="normal" className={CAMPO}>
          <option value="low">Baja</option>
          <option value="normal">Normal</option>
          <option value="high">Alta</option>
        </select>
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={enviando !== null} aria-busy={enviando !== null} className={BOTON_PRINCIPAL}>{enviando ? "Guardando…" : "Guardar"}</button>
        <button type="button" onClick={() => setAbierta(false)} className={BOTON_SECUNDARIO}>Cancelar</button>
      </div>
      {error ? <p role="alert" className="text-sm text-danger sm:col-span-4">{error}</p> : null}
    </form>
  );
}

/** Completar una tarea pide el resultado: es la regla del motor y lo que da valor al historial. */
export function CompletarTarea({ tareaId }: { tareaId: number }) {
  const id = useId();
  const { enviando, error, ejecutar } = useAccion();
  const [abierta, setAbierta] = useState(false);

  async function completar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const description = String(new FormData(evento.currentTarget).get("description") ?? "").trim();
    if (await ejecutar("completar", { method: "PATCH", ruta: `/api/actividades/${tareaId}`, cuerpo: { status: "completed", description } })) setAbierta(false);
  }

  if (!abierta) return <button type="button" onClick={() => setAbierta(true)} className="h-10 rounded-control border border-input-line bg-surface px-3 text-sm font-semibold text-ink hover:bg-surface-hover">Marcar hecha</button>;
  return (
    <form onSubmit={completar} className="flex w-full flex-wrap items-end gap-2">
      <div className="min-w-52 flex-1">
        <label htmlFor={`${id}-resultado`} className="text-sm font-medium text-ink">Resultado <span className="text-ink-muted">(obligatorio)</span></label>
        <input id={`${id}-resultado`} name="description" required maxLength={400} autoFocus className={CAMPO} />
      </div>
      <button type="submit" disabled={enviando !== null} aria-busy={enviando !== null} className={BOTON_PRINCIPAL}>{enviando ? "Guardando…" : "Guardar"}</button>
      <button type="button" onClick={() => setAbierta(false)} className={BOTON_SECUNDARIO}>Cancelar</button>
      {error ? <p role="alert" className="w-full text-sm text-danger">{error}</p> : null}
    </form>
  );
}
