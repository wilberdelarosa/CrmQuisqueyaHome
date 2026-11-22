"use client";

import { useId, useState, type FormEvent } from "react";
import { useAccion } from "../../_ui/accion";
import { BOTON_PRINCIPAL, BOTON_SECUNDARIO, CAMPO } from "../../_ui/pagina";

type Etapa = { id: number; name: string; kind: "open" | "won" | "lost"; position: number };
type Props = {
  negocio: {
    id: number; stageId: number; stageChangedAt: string | null; amountCents: number | null; probability: number | null;
    commissionBasisPoints: number | null; expectedCloseDate: string | null; currency: string;
  };
  etapas: Etapa[];
  motivos: { id: number; name: string }[];
  proyectos: { id: number; name: string; unidades: { id: number; code: string }[] }[];
  principal: number | null;
  puede: { monto: boolean; comision: boolean; actividad: boolean };
};

/** Acciones de la ficha del negocio. El motor valida cada requisito de etapa y devuelve qué falta. */
export function AccionesDeNegocio({ negocio, etapas, motivos, proyectos, principal, puede }: Props) {
  const id = useId();
  const { enviando, error, ejecutar } = useAccion();
  const [panel, setPanel] = useState<"datos" | "propiedad" | "actividad" | "perder" | null>(null);
  const [proyectoId, setProyectoId] = useState<number | "">("");
  const ocupado = enviando !== null;
  const actual = etapas.find((etapa) => etapa.id === negocio.stageId);
  const siguientes = etapas.filter((etapa) => etapa.kind !== "lost" && actual && etapa.position > actual.position);
  const perdida = etapas.find((etapa) => etapa.kind === "lost");
  const esperado = { expectedStageId: negocio.stageId, expectedStageChangedAt: negocio.stageChangedAt };

  async function mover(etapa: Etapa) {
    await ejecutar(`etapa-${etapa.id}`, {
      method: "PATCH", ruta: `/api/pipeline/${negocio.id}/etapa`,
      cuerpo: { stageId: etapa.id, ...esperado, ...(etapa.kind === "won" && principal ? { unitId: principal } : {}) },
    });
  }

  async function guardarDatos(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const datos = Object.fromEntries(new FormData(evento.currentTarget)) as Record<string, string>;
    const numero = (texto: string | undefined) => (texto?.trim() ? Number(texto.replace(",", ".")) : null);
    const cuerpo: Record<string, unknown> = { probability: numero(datos.probability), expectedCloseDate: datos.expectedCloseDate || null };
    if (puede.monto) { const monto = numero(datos.amount); cuerpo.amountCents = monto == null ? null : Math.round(monto * 100); }
    if (puede.comision) { const comision = numero(datos.commission); cuerpo.commissionBasisPoints = comision == null ? null : Math.round(comision * 100); }
    if (await ejecutar("datos", { method: "PATCH", ruta: `/api/pipeline/${negocio.id}`, cuerpo })) setPanel(null);
  }

  async function asociar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    const unidad = Number(datos.get("unitId")) || undefined;
    const ok = await ejecutar("propiedad", {
      method: "POST", ruta: `/api/pipeline/${negocio.id}/propiedades`,
      cuerpo: { projectId: Number(datos.get("projectId")), ...(unidad ? { unitId: unidad } : {}), isPrimary: datos.get("isPrimary") === "on" },
    });
    if (ok) setPanel(null);
  }

  async function registrar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const formulario = evento.currentTarget;
    const datos = Object.fromEntries(new FormData(formulario)) as Record<string, string>;
    const programada = datos.activityType === "task" || datos.activityType === "meeting";
    const ok = await ejecutar("actividad", {
      method: "POST", ruta: "/api/actividades",
      cuerpo: {
        activityType: datos.activityType, title: datos.title, dealId: negocio.id,
        startsAt: datos.startsAt ? new Date(datos.startsAt).toISOString() : undefined, status: programada ? "pending" : "completed",
      },
    });
    if (ok) { formulario.reset(); setPanel(null); }
  }

  async function perder(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!perdida) return;
    const datos = new FormData(evento.currentTarget);
    const ok = await ejecutar("perder", {
      method: "PATCH", ruta: `/api/pipeline/${negocio.id}/etapa`,
      cuerpo: { stageId: perdida.id, ...esperado, lossReasonId: Number(datos.get("lossReasonId")), lossComment: String(datos.get("lossComment") ?? "") || undefined },
    });
    if (ok) setPanel(null);
  }

  const alternar = (nombre: NonNullable<typeof panel>) => setPanel(panel === nombre ? null : nombre);
  const unidades = proyectos.find((proyecto) => proyecto.id === proyectoId)?.unidades ?? [];

  return (
    <section aria-label="Acciones" className="space-y-4">
      {error ? <p role="alert" className="rounded-control bg-danger-bg px-3 py-2.5 text-danger">{error}</p> : null}

      {siguientes.length > 0 ? (
        <div>
          <p className="text-sm text-ink-muted">Avanzar a</p>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {siguientes.map((etapa, indice) => (
              <button key={etapa.id} type="button" onClick={() => mover(etapa)} disabled={ocupado} aria-busy={enviando === `etapa-${etapa.id}`}
                className={indice === 0 ? BOTON_PRINCIPAL : BOTON_SECUNDARIO}>
                {enviando === `etapa-${etapa.id}` ? "Moviendo…" : etapa.kind === "won" ? `${etapa.name} (ganado)` : etapa.name}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {puede.actividad ? <button type="button" onClick={() => alternar("actividad")} aria-expanded={panel === "actividad"} className={BOTON_SECUNDARIO}>Registrar llamada o cita</button> : null}
        <button type="button" onClick={() => alternar("propiedad")} aria-expanded={panel === "propiedad"} className={BOTON_SECUNDARIO}>Añadir propiedad</button>
        <button type="button" onClick={() => alternar("datos")} aria-expanded={panel === "datos"} className={BOTON_SECUNDARIO}>Editar monto y fechas</button>
        {perdida ? <button type="button" onClick={() => alternar("perder")} aria-expanded={panel === "perder"} className={BOTON_SECUNDARIO}>Marcar como perdido</button> : null}
      </div>

      {panel === "actividad" ? (
        <form onSubmit={registrar} className="grid gap-4 rounded-panel border border-line bg-surface p-5 sm:grid-cols-2">
          <div>
            <label htmlFor={`${id}-tipo`} className="font-medium text-ink">Qué registras <span className="text-ink-muted">(obligatorio)</span></label>
            <select id={`${id}-tipo`} name="activityType" defaultValue="call" className={CAMPO}>
              <option value="call">Llamada hecha</option>
              <option value="whatsapp">WhatsApp enviado</option>
              <option value="email">Correo enviado</option>
              <option value="meeting">Cita o visita</option>
              <option value="task">Tarea pendiente</option>
            </select>
          </div>
          <div>
            <label htmlFor={`${id}-fecha`} className="font-medium text-ink">Fecha y hora <span className="text-ink-muted">(para citas y tareas)</span></label>
            <input id={`${id}-fecha`} name="startsAt" type="datetime-local" className={CAMPO} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor={`${id}-titulo`} className="font-medium text-ink">Título <span className="text-ink-muted">(obligatorio)</span></label>
            <input id={`${id}-titulo`} name="title" required maxLength={160} className={CAMPO} />
          </div>
          <button type="submit" disabled={ocupado} aria-busy={enviando === "actividad"} className={`${BOTON_PRINCIPAL} sm:justify-self-start`}>{enviando === "actividad" ? "Guardando…" : "Guardar"}</button>
        </form>
      ) : null}

      {panel === "propiedad" ? (
        <form onSubmit={asociar} className="grid gap-4 rounded-panel border border-line bg-surface p-5 sm:grid-cols-2">
          <div>
            <label htmlFor={`${id}-proyecto`} className="font-medium text-ink">Proyecto <span className="text-ink-muted">(obligatorio)</span></label>
            <select id={`${id}-proyecto`} name="projectId" required value={proyectoId} onChange={(evento) => setProyectoId(Number(evento.target.value) || "")} className={CAMPO}>
              <option value="" disabled>Elige un proyecto</option>
              {proyectos.map((proyecto) => <option key={proyecto.id} value={proyecto.id}>{proyecto.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor={`${id}-unidad`} className="font-medium text-ink">Unidad</label>
            <select id={`${id}-unidad`} name="unitId" defaultValue="" className={CAMPO}>
              <option value="">{unidades.length ? "Sin unidad concreta" : "Este proyecto no tiene unidades disponibles"}</option>
              {unidades.map((unidad) => <option key={unidad.id} value={unidad.id}>{unidad.code}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-2.5 text-ink sm:col-span-2">
            <input type="checkbox" name="isPrimary" defaultChecked className="h-5 w-5 accent-[var(--color-brand-900)]" />
            Es la propiedad principal del negocio
          </label>
          <button type="submit" disabled={ocupado} aria-busy={enviando === "propiedad"} className={`${BOTON_PRINCIPAL} sm:justify-self-start`}>{enviando === "propiedad" ? "Guardando…" : "Añadir"}</button>
        </form>
      ) : null}

      {panel === "datos" ? (
        <form onSubmit={guardarDatos} className="grid gap-4 rounded-panel border border-line bg-surface p-5 sm:grid-cols-2">
          {puede.monto ? (
            <div>
              <label htmlFor={`${id}-monto`} className="font-medium text-ink">Monto en {negocio.currency}</label>
              <input id={`${id}-monto`} name="amount" inputMode="decimal" defaultValue={negocio.amountCents != null ? negocio.amountCents / 100 : ""} className={CAMPO} />
            </div>
          ) : null}
          <div>
            <label htmlFor={`${id}-prob`} className="font-medium text-ink">Probabilidad de cierre (%)</label>
            <input id={`${id}-prob`} name="probability" type="number" min={0} max={100} defaultValue={negocio.probability ?? ""} className={CAMPO} />
          </div>
          {puede.comision ? (
            <div>
              <label htmlFor={`${id}-comision`} className="font-medium text-ink">Comisión (%)</label>
              <input id={`${id}-comision`} name="commission" inputMode="decimal" defaultValue={negocio.commissionBasisPoints != null ? negocio.commissionBasisPoints / 100 : ""} className={CAMPO} />
            </div>
          ) : null}
          <div>
            <label htmlFor={`${id}-cierre`} className="font-medium text-ink">Fecha estimada de cierre</label>
            <input id={`${id}-cierre`} name="expectedCloseDate" type="date" defaultValue={negocio.expectedCloseDate ?? ""} className={CAMPO} />
          </div>
          {!puede.comision ? <p className="text-sm text-ink-muted sm:col-span-2">El porcentaje de comisión lo define la administración.</p> : null}
          <button type="submit" disabled={ocupado} aria-busy={enviando === "datos"} className={`${BOTON_PRINCIPAL} sm:justify-self-start`}>{enviando === "datos" ? "Guardando…" : "Guardar"}</button>
        </form>
      ) : null}

      {panel === "perder" ? (
        <form onSubmit={perder} className="grid gap-4 rounded-panel border border-line bg-surface p-5 sm:grid-cols-2">
          <div>
            <label htmlFor={`${id}-motivo`} className="font-medium text-ink">Motivo <span className="text-ink-muted">(obligatorio)</span></label>
            <select id={`${id}-motivo`} name="lossReasonId" required defaultValue="" className={CAMPO}>
              <option value="" disabled>Elige un motivo</option>
              {motivos.map((motivo) => <option key={motivo.id} value={motivo.id}>{motivo.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor={`${id}-comentario`} className="font-medium text-ink">Comentario</label>
            <input id={`${id}-comentario`} name="lossComment" maxLength={300} className={CAMPO} />
          </div>
          <p className="text-sm text-ink-muted sm:col-span-2">Un negocio cerrado no vuelve a abrirse.</p>
          <button type="submit" disabled={ocupado} aria-busy={enviando === "perder"} className={`${BOTON_SECUNDARIO} sm:justify-self-start`}>{enviando === "perder" ? "Guardando…" : "Marcar como perdido"}</button>
        </form>
      ) : null}
    </section>
  );
}
