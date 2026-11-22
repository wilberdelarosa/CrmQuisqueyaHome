"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";
import { useAccion } from "../../_ui/accion";
import { BOTON_PRINCIPAL, BOTON_SECUNDARIO, CAMPO } from "../../_ui/pagina";

type Props = {
  leadId: number;
  contactId: number;
  abierto: boolean;
  sinResponsable: boolean;
  puede: { tomar: boolean; asignar: boolean; editar: boolean; convertir: boolean; actividad: boolean };
  brokers: { id: number; nombre: string }[];
  brokerActual: number | null;
};

/** Acciones de la ficha del lead. Cada una llama a su operación propia del motor. */
export function AccionesDeLead({ leadId, contactId, abierto, sinResponsable, puede, brokers, brokerActual }: Props) {
  const router = useRouter();
  const id = useId();
  const { enviando, error, ejecutar } = useAccion();
  const [panel, setPanel] = useState<"actividad" | "descartar" | null>(null);
  const [elegido, setElegido] = useState<number | null>(brokerActual);

  async function tomarLead() {
    await ejecutar("tomar", { method: "POST", ruta: `/api/leads/${leadId}/tomar` });
  }

  async function asignar() {
    if (elegido) await ejecutar("asignar", { method: "PATCH", ruta: `/api/leads/${leadId}`, cuerpo: { brokerId: elegido } });
  }

  async function registrarActividad(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const formulario = evento.currentTarget;
    const datos = Object.fromEntries(new FormData(formulario)) as Record<string, string>;
    const hecha = datos.activityType !== "task" && datos.activityType !== "meeting";
    const ok = await ejecutar("actividad", {
      method: "POST", ruta: "/api/actividades",
      cuerpo: {
        activityType: datos.activityType, title: datos.title, contactId, description: datos.description || undefined,
        startsAt: datos.startsAt ? new Date(datos.startsAt).toISOString() : undefined, status: hecha ? "completed" : "pending",
      },
    });
    if (ok) { formulario.reset(); setPanel(null); }
  }

  async function convertir() {
    await ejecutar("convertir", { method: "POST", ruta: `/api/leads/${leadId}/convertir` }, (respuesta) => {
      const negocio = (respuesta as { deal?: { id: number } }).deal;
      if (negocio) router.push(`/negocios/${negocio.id}`);
    });
  }

  async function descartar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const discardReason = String(new FormData(evento.currentTarget).get("discardReason") ?? "").trim();
    const ok = await ejecutar("descartar", { method: "POST", ruta: `/api/leads/${leadId}/descartar`, cuerpo: { discardReason } });
    if (ok) setPanel(null);
  }

  if (!abierto) return null;
  const ocupado = enviando !== null;

  return (
    <section aria-label="Acciones" className="space-y-4">
      {error ? <p role="alert" className="rounded-control bg-danger-bg px-3 py-2.5 text-danger">{error}</p> : null}

      <div className="flex flex-wrap gap-2">
        {puede.tomar && sinResponsable ? (
          <button type="button" onClick={tomarLead} disabled={ocupado} aria-busy={enviando === "tomar"} className={BOTON_PRINCIPAL}>
            {enviando === "tomar" ? "Tomando…" : "Tomar este lead"}
          </button>
        ) : null}
        {puede.convertir ? (
          <button type="button" onClick={convertir} disabled={ocupado} aria-busy={enviando === "convertir"} className={BOTON_PRINCIPAL}>
            {enviando === "convertir" ? "Convirtiendo…" : "Convertir en negocio"}
          </button>
        ) : null}
        {puede.actividad ? (
          <button type="button" onClick={() => setPanel(panel === "actividad" ? null : "actividad")} aria-expanded={panel === "actividad"} className={BOTON_SECUNDARIO}>
            Registrar llamada o tarea
          </button>
        ) : null}
        {puede.editar ? (
          <button type="button" onClick={() => setPanel(panel === "descartar" ? null : "descartar")} aria-expanded={panel === "descartar"} className={BOTON_SECUNDARIO}>
            Descartar
          </button>
        ) : null}
      </div>

      {puede.asignar && brokers.length > 0 ? (
        <form onSubmit={(evento) => { evento.preventDefault(); void asignar(); }} className="flex flex-wrap items-end gap-2">
          <div className="min-w-56 flex-1 sm:flex-none">
            <label htmlFor={`${id}-broker`} className="font-medium text-ink">Responsable</label>
            <select id={`${id}-broker`} name="brokerId" value={elegido ?? ""} onChange={(evento) => setElegido(Number(evento.target.value) || null)} className={CAMPO}>
              <option value="" disabled>Elige un broker</option>
              {brokers.map((broker) => <option key={broker.id} value={broker.id}>{broker.nombre}</option>)}
            </select>
          </div>
          <button type="submit" disabled={ocupado} aria-busy={enviando === "asignar"} className={BOTON_SECUNDARIO}>
            {enviando === "asignar" ? "Asignando…" : sinResponsable ? "Asignar" : "Reasignar"}
          </button>
        </form>
      ) : null}

      {panel === "actividad" ? (
        <form onSubmit={registrarActividad} className="grid gap-4 rounded-panel border border-line bg-surface p-5 sm:grid-cols-2">
          <div>
            <label htmlFor={`${id}-tipo`} className="font-medium text-ink">Qué registras <span className="text-ink-muted">(obligatorio)</span></label>
            <select id={`${id}-tipo`} name="activityType" defaultValue="call" className={CAMPO}>
              <option value="call">Llamada hecha</option>
              <option value="whatsapp">WhatsApp enviado</option>
              <option value="email">Correo enviado</option>
              <option value="task">Tarea pendiente</option>
              <option value="meeting">Cita</option>
            </select>
          </div>
          <div>
            <label htmlFor={`${id}-fecha`} className="font-medium text-ink">Fecha y hora <span className="text-ink-muted">(para tareas y citas)</span></label>
            <input id={`${id}-fecha`} name="startsAt" type="datetime-local" className={CAMPO} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor={`${id}-titulo`} className="font-medium text-ink">Título <span className="text-ink-muted">(obligatorio)</span></label>
            <input id={`${id}-titulo`} name="title" required maxLength={160} className={CAMPO} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor={`${id}-detalle`} className="font-medium text-ink">Detalle</label>
            <textarea id={`${id}-detalle`} name="description" rows={2} className={`${CAMPO} h-auto py-2`} />
          </div>
          <button type="submit" disabled={ocupado} aria-busy={enviando === "actividad"} className={`${BOTON_PRINCIPAL} sm:justify-self-start`}>
            {enviando === "actividad" ? "Guardando…" : "Guardar"}
          </button>
        </form>
      ) : null}

      {panel === "descartar" ? (
        <form onSubmit={descartar} className="space-y-3 rounded-panel border border-line bg-surface p-5">
          <label htmlFor={`${id}-motivo`} className="font-medium text-ink">Motivo del descarte <span className="text-ink-muted">(obligatorio)</span></label>
          <textarea id={`${id}-motivo`} name="discardReason" required rows={2} className={`${CAMPO} h-auto py-2`} />
          <p className="text-sm text-ink-muted">El lead queda cerrado y el motivo se guarda en su historial.</p>
          <button type="submit" disabled={ocupado} aria-busy={enviando === "descartar"} className={BOTON_SECUNDARIO}>
            {enviando === "descartar" ? "Descartando…" : "Descartar lead"}
          </button>
        </form>
      ) : null}
    </section>
  );
}
