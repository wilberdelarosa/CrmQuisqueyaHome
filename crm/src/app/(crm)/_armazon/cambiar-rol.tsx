"use client";

import { useId, useState } from "react";
import { ErrorDeApi, post } from "@/lib/api";

/**
 * Cambio de rol para revisar el CRM con cada perfil. Solo existe en el acceso de evaluación
 * (equipo de desarrollo, nunca en una instalación real): el armazón no lo pinta si no hay roles.
 */
export function CambiarRol({ roles, actual, tono }: { roles: { slug: string; nombre: string }[]; actual: string; tono: "oscuro" | "claro" }) {
  const id = useId();
  const [error, setError] = useState<string | null>(null);
  const [cambiando, setCambiando] = useState(false);

  async function cambiar(slug: string) {
    setCambiando(true);
    setError(null);
    try {
      await post("/api/auth/demo", { role: slug });
      window.location.reload();
    } catch (e) {
      setCambiando(false);
      setError(e instanceof ErrorDeApi ? e.mensaje : "No se pudo cambiar de rol.");
    }
  }

  const oscuro = tono === "oscuro";
  return (
    <div className="mt-3">
      <label htmlFor={id} className={`block text-sm ${oscuro ? "text-rail-muted" : "text-ink-muted"}`}>Revisar como (solo en este equipo)</label>
      <select id={id} defaultValue={actual} disabled={cambiando} aria-busy={cambiando} onChange={(evento) => cambiar(evento.target.value)}
        className={`mt-1 h-10 w-full rounded-control border px-2 text-sm font-medium ${
          oscuro ? "border-white/15 bg-brand-900 text-rail-ink" : "border-input-line bg-surface text-ink"
        }`}>
        {roles.map((rol) => <option key={rol.slug} value={rol.slug}>{rol.nombre}</option>)}
      </select>
      {error ? <p role="alert" className={`mt-1 text-sm ${oscuro ? "text-rail-ink" : "text-danger"}`}>{error}</p> : null}
    </div>
  );
}
