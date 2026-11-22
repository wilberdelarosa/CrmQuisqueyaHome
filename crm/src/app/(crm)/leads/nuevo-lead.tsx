"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";
import { Drawer } from "vaul";
import { ErrorDeApi, post } from "@/lib/api";
import { BOTON_PRINCIPAL, BOTON_SECUNDARIO, CAMPO } from "../_ui/pagina";

/** Alta manual de un lead, en una hoja lateral: pocos campos, el resto se completa en la ficha. */
export function NuevoLead() {
  const router = useRouter();
  const id = useId();
  const [abierta, setAbierta] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});

  async function guardar(evento: FormEvent<HTMLFormElement>, forzar = false) {
    evento.preventDefault();
    const datos = Object.fromEntries(new FormData(evento.currentTarget)) as Record<string, string>;
    if (!datos.fullName?.trim()) return setErrores({ fullName: "Escribe el nombre de la persona." });
    if (!datos.phone?.trim() && !datos.email?.trim()) return setErrores({ phone: "Escribe un teléfono o un correo para poder contactarla." });
    setEnviando(true);
    setErrores({});
    try {
      const respuesta = await post<{ lead: { id: number } }>("/api/leads", { ...datos, ...(forzar ? { force: true } : {}) });
      setAbierta(false);
      router.push(`/leads/${respuesta.lead.id}`);
      router.refresh();
    } catch (e) {
      if (e instanceof ErrorDeApi) setErrores(e.fields ?? { _: e.status === 0 ? "No hay conexión. Revisa tu internet e inténtalo otra vez." : e.mensaje });
      else setErrores({ _: "No se pudo guardar. Inténtalo otra vez." });
    } finally {
      setEnviando(false);
    }
  }

  const campo = (nombre: string, etiqueta: string, extra: { tipo?: string; obligatorio?: boolean; modo?: "tel" | "email" } = {}) => (
    <div>
      <label htmlFor={`${id}-${nombre}`} className="font-medium text-ink">
        {etiqueta} {extra.obligatorio ? <span className="text-ink-muted">(obligatorio)</span> : null}
      </label>
      <input id={`${id}-${nombre}`} name={nombre} type={extra.tipo ?? "text"} inputMode={extra.modo}
        aria-invalid={Boolean(errores[nombre])} aria-describedby={errores[nombre] ? `${id}-${nombre}-error` : undefined}
        className={`${CAMPO} ${errores[nombre] ? "border-danger" : ""}`} />
      {errores[nombre] ? <p id={`${id}-${nombre}-error`} className="mt-1.5 text-sm text-danger">{errores[nombre]}</p> : null}
    </div>
  );

  return (
    <Drawer.Root open={abierta} onOpenChange={setAbierta} direction="right">
      <Drawer.Trigger className={BOTON_PRINCIPAL}>Registrar lead</Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-brand-950/40" />
        <Drawer.Content className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-surface outline-none">
          <form onSubmit={guardar} noValidate className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
              <Drawer.Title className="font-display text-xl font-semibold text-ink">Registrar lead</Drawer.Title>
              <Drawer.Description className="text-ink-muted">Persona interesada que llegó por un canal distinto al portal.</Drawer.Description>
              {errores._ ? <p role="alert" className="rounded-control bg-danger-bg px-3 py-2.5 text-danger">{errores._}</p> : null}
              {campo("fullName", "Nombre", { obligatorio: true })}
              {campo("phone", "Teléfono", { tipo: "tel", modo: "tel" })}
              {campo("email", "Correo", { tipo: "email", modo: "email" })}
              {campo("projectInterestText", "Proyecto o zona de interés")}
              <div>
                <label htmlFor={`${id}-operationType`} className="font-medium text-ink">Operación</label>
                <select id={`${id}-operationType`} name="operationType" defaultValue="sale" className={CAMPO}>
                  <option value="sale">Venta</option>
                  <option value="rent">Alquiler</option>
                </select>
              </div>
              <div>
                <label htmlFor={`${id}-originalMessage`} className="font-medium text-ink">Qué busca</label>
                <textarea id={`${id}-originalMessage`} name="originalMessage" rows={3} className={`${CAMPO} h-auto py-2`} />
              </div>
            </div>
            <div className="flex gap-2 border-t border-line px-6 py-4">
              <button type="submit" disabled={enviando} aria-busy={enviando} className={`${BOTON_PRINCIPAL} flex-1`}>{enviando ? "Guardando…" : "Guardar lead"}</button>
              <button type="button" onClick={() => setAbierta(false)} className={BOTON_SECUNDARIO}>Cancelar</button>
            </div>
          </form>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
