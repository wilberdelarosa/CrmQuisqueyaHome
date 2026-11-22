"use client";

import { useId, useState, type FormEvent } from "react";
import { ErrorDeApi, post } from "@/lib/api";

type Errores = { email?: string; password?: string; general?: string };

const CAMPO = "mt-1.5 block h-11 w-full rounded-control border bg-surface px-3 text-ink placeholder:text-ink-muted/70";

export function FormularioDeAcceso({ destino }: { destino: string }) {
  const [errores, setErrores] = useState<Errores>({});
  const [enviando, setEnviando] = useState<string | null>(null);
  const idCorreo = useId();
  const idClave = useId();
  const idGeneral = useId();

  async function entrar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    const email = String(datos.get("email") ?? "").trim();
    const password = String(datos.get("password") ?? "");
    const faltan: Errores = {};
    if (!email) faltan.email = "Escribe tu correo.";
    if (!password) faltan.password = "Escribe tu contraseña.";
    if (faltan.email || faltan.password) return setErrores(faltan);
    await enviar("clave", () => post("/api/auth/login", { email, password }));
  }

  async function enviar(origen: string, llamada: () => Promise<unknown>) {
    setErrores({});
    setEnviando(origen);
    try {
      await llamada();
      window.location.assign(destino);
    } catch (error) {
      setEnviando(null);
      if (error instanceof ErrorDeApi) {
        if (error.status === 0) return setErrores({ general: "No hay conexión. Revisa tu internet e inténtalo otra vez." });
        return setErrores({ email: error.fields?.email, password: error.fields?.password, general: error.fields ? undefined : error.mensaje });
      }
      setErrores({ general: "No se pudo entrar. Inténtalo otra vez." });
    }
  }

  return (
    <>
      <form onSubmit={entrar} noValidate className="mt-8 space-y-5" aria-describedby={errores.general ? idGeneral : undefined}>
        {errores.general ? (
          <p id={idGeneral} role="alert" className="rounded-control bg-danger-bg px-3 py-2.5 text-danger">{errores.general}</p>
        ) : null}

        <div>
          <label htmlFor={idCorreo} className="font-medium text-ink">Correo <span className="text-ink-muted">(obligatorio)</span></label>
          <input id={idCorreo} name="email" type="email" inputMode="email" autoComplete="username" required
            aria-invalid={Boolean(errores.email)} aria-describedby={errores.email ? `${idCorreo}-error` : undefined}
            className={`${CAMPO} ${errores.email ? "border-danger" : "border-input-line"}`} />
          {errores.email ? <p id={`${idCorreo}-error`} className="mt-1.5 text-sm text-danger">{errores.email}</p> : null}
        </div>

        <div>
          <label htmlFor={idClave} className="font-medium text-ink">Contraseña <span className="text-ink-muted">(obligatorio)</span></label>
          <input id={idClave} name="password" type="password" autoComplete="current-password" required
            aria-invalid={Boolean(errores.password)} aria-describedby={errores.password ? `${idClave}-error` : undefined}
            className={`${CAMPO} ${errores.password ? "border-danger" : "border-input-line"}`} />
          {errores.password ? <p id={`${idClave}-error`} className="mt-1.5 text-sm text-danger">{errores.password}</p> : null}
        </div>

        <button type="submit" aria-busy={enviando === "clave"} disabled={enviando !== null}
          className="h-11 w-full rounded-control bg-brand-900 px-4 font-semibold text-white transition-colors hover:bg-brand-950 disabled:cursor-progress disabled:opacity-80">
          {enviando === "clave" ? "Entrando…" : "Entrar"}
        </button>
      </form>

    </>
  );
}
