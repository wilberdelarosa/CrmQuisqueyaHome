"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";
import { ErrorDeApi, patch, post, put } from "@/lib/api";

type Llamada = { method: "POST" | "PATCH" | "PUT"; ruta: string; cuerpo?: unknown };

/** Ejecuta una acción contra la API, refresca los datos del servidor y devuelve el error legible si falla. */
export function useAccion() {
  const router = useRouter();
  const [enviando, setEnviando] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Tras guardar, la pantalla se refresca; mientras llegan los datos nuevos las acciones siguen bloqueadas.
  const [refrescando, iniciarRefresco] = useTransition();

  async function ejecutar(clave: string, { method, ruta, cuerpo }: Llamada, alTerminar?: (respuesta: unknown) => void): Promise<boolean> {
    setEnviando(clave);
    setError(null);
    try {
      const respuesta = method === "POST" ? await post<unknown>(ruta, cuerpo) : method === "PUT" ? await put<unknown>(ruta, cuerpo ?? {}) : await patch<unknown>(ruta, cuerpo ?? {});
      alTerminar?.(respuesta);
      iniciarRefresco(() => router.refresh());
      return true;
    } catch (e) {
      if (e instanceof ErrorDeApi) {
        const campos = e.fields ? Object.values(e.fields).filter(Boolean).join(" ") : "";
        setError(e.status === 0 ? "No hay conexión. Revisa tu internet e inténtalo otra vez." : campos || e.mensaje);
      } else setError("No se pudo completar. Inténtalo otra vez.");
      return false;
    } finally {
      setEnviando(null);
    }
  }

  return { enviando: enviando ?? (refrescando ? "refrescando" : null), error, ejecutar, limpiarError: () => setError(null) };
}

/** Botón que ejecuta una sola acción. Solo se bloquea mientras envía, y lo dice. */
export function BotonDeAccion({ llamada, className, enCurso, confirmar, children }: { llamada: Llamada; className: string; enCurso: string; confirmar?: string; children: ReactNode }) {
  const { enviando, error, ejecutar } = useAccion();
  return (
    <span className="inline-flex flex-col">
      <button type="button" className={className} disabled={enviando !== null} aria-busy={enviando !== null}
        onClick={() => { if (!confirmar || window.confirm(confirmar)) void ejecutar("unica", llamada); }}>
        {enviando ? enCurso : children}
      </button>
      {error ? <span role="alert" className="mt-1.5 max-w-xs text-sm text-danger">{error}</span> : null}
    </span>
  );
}
