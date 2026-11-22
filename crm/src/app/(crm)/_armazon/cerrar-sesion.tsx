"use client";

import { useState } from "react";
import { post } from "@/lib/api";

/** Cierra la sesión y vuelve al acceso. En el acceso de evaluación no se pinta: allí no hay sesión que cerrar. */
export function CerrarSesion({ className }: { className?: string }) {
  const [saliendo, setSaliendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function salir() {
    setSaliendo(true);
    setError(null);
    try {
      await post("/api/auth/logout");
      window.location.assign("/login");
    } catch {
      setSaliendo(false);
      setError("No se pudo cerrar la sesión. Revisa tu conexión e inténtalo otra vez.");
    }
  }

  return (
    <>
      <button type="button" onClick={salir} aria-busy={saliendo} disabled={saliendo} className={className}>
        {saliendo ? "Cerrando…" : "Cerrar sesión"}
      </button>
      {error ? <p role="alert" className="mt-2 text-sm text-danger">{error}</p> : null}
    </>
  );
}
