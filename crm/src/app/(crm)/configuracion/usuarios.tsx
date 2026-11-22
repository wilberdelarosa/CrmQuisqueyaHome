"use client";

import { useId, useState, type FormEvent } from "react";
import { useAccion } from "../_ui/accion";
import { BOTON_PRINCIPAL, BOTON_SECUNDARIO, CAMPO } from "../_ui/pagina";

/** Alta de un usuario con su tipo. La invitación sale por correo si la empresa lo tiene configurado. */
export function NuevoUsuario({ roles }: { roles: { id: number; name: string; slug: string }[] }) {
  const id = useId();
  const { enviando, error, ejecutar } = useAccion();
  const [abierta, setAbierta] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const porDefecto = roles.find((rol) => rol.slug === "broker")?.id ?? roles[0]?.id;

  async function guardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const formulario = evento.currentTarget;
    const datos = Object.fromEntries(new FormData(formulario)) as Record<string, string>;
    const ok = await ejecutar("usuario", {
      method: "POST", ruta: "/api/usuarios",
      cuerpo: { fullName: datos.fullName, email: datos.email, roleId: Number(datos.roleId), jobTitle: datos.jobTitle || undefined },
    }, (respuesta) => {
      const { invitado, motivoError } = respuesta as { invitado?: boolean; motivoError?: string };
      setAviso(invitado ? "Usuario creado. Le llegó la invitación por correo." : `Usuario creado, pero la invitación no salió${motivoError ? `: ${motivoError}` : "."}`);
    });
    if (ok) { formulario.reset(); setAbierta(false); }
  }

  if (!abierta) {
    return (
      <span className="inline-flex flex-col items-end gap-1.5">
        <button type="button" onClick={() => { setAviso(null); setAbierta(true); }} className={BOTON_PRINCIPAL}>Añadir usuario</button>
        {aviso ? <span role="status" className="max-w-sm text-right text-sm text-text">{aviso}</span> : null}
      </span>
    );
  }
  return (
    <form onSubmit={guardar} className="grid w-full gap-4 rounded-panel border border-line bg-surface p-5 sm:grid-cols-2">
      <div>
        <label htmlFor={`${id}-nombre`} className="font-medium text-ink">Nombre completo <span className="text-ink-muted">(obligatorio)</span></label>
        <input id={`${id}-nombre`} name="fullName" required maxLength={120} autoFocus className={CAMPO} />
      </div>
      <div>
        <label htmlFor={`${id}-correo`} className="font-medium text-ink">Correo <span className="text-ink-muted">(obligatorio)</span></label>
        <input id={`${id}-correo`} name="email" type="email" required className={CAMPO} />
      </div>
      <div>
        <label htmlFor={`${id}-rol`} className="font-medium text-ink">Tipo de usuario <span className="text-ink-muted">(obligatorio)</span></label>
        <select id={`${id}-rol`} name="roleId" defaultValue={porDefecto} className={CAMPO}>
          {roles.map((rol) => <option key={rol.id} value={rol.id}>{rol.name}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor={`${id}-cargo`} className="font-medium text-ink">Cargo</label>
        <input id={`${id}-cargo`} name="jobTitle" maxLength={80} className={CAMPO} />
      </div>
      {error ? <p role="alert" className="text-sm text-danger sm:col-span-2">{error}</p> : null}
      <div className="flex gap-2 sm:col-span-2">
        <button type="submit" disabled={enviando !== null} aria-busy={enviando !== null} className={BOTON_PRINCIPAL}>{enviando ? "Guardando…" : "Guardar usuario"}</button>
        <button type="button" onClick={() => setAbierta(false)} className={BOTON_SECUNDARIO}>Cancelar</button>
      </div>
    </form>
  );
}
