"use client";

import { useMemo, useState } from "react";
import { useAccion } from "../../_ui/accion";
import { BOTON_PRINCIPAL, BOTON_SECUNDARIO } from "../../_ui/pagina";
import { ACCION, ALCANCE, nombreDeRecurso } from "../etiquetas";

type Celda = { resource: string; action: string; scope: string };
type Props = {
  rol: { id: number; nombre: string; protegido: boolean };
  recursos: string[];
  acciones: string[];
  permisos: Celda[];
  editable: boolean;
};

const ALCANCES = ["none", "own", "team", "all"] as const;
const clave = (recurso: string, accion: string) => `${recurso}:${accion}`;

/** Matriz completa de un tipo de usuario: cada cruce recurso–acción con su alcance. Se guarda entera. */
export function MatrizDePermisos({ rol, recursos, acciones, permisos, editable }: Props) {
  const inicial = useMemo(() => Object.fromEntries(permisos.map((permiso) => [clave(permiso.resource, permiso.action), permiso.scope])), [permisos]);
  const [celdas, setCeldas] = useState<Record<string, string>>(inicial);
  const [guardado, setGuardado] = useState(false);
  const { enviando, error, ejecutar } = useAccion();
  const puedeEditar = editable && !rol.protegido;
  const cambios = recursos.flatMap((recurso) => acciones.map((accion) => clave(recurso, accion)))
    .filter((id) => (celdas[id] ?? "none") !== (inicial[id] ?? "none")).length;

  async function guardar() {
    setGuardado(false);
    const lista = Object.entries(celdas).filter(([, scope]) => scope !== "none").map(([id, scope]) => {
      const [resource, action] = id.split(":");
      return { resource, action, scope };
    });
    if (await ejecutar("matriz", { method: "PATCH", ruta: `/api/roles/${rol.id}/permisos`, cuerpo: { permisos: lista } })) setGuardado(true);
  }

  return (
    <section aria-label={`Permisos de ${rol.nombre}`} className="space-y-4">
      {rol.protegido ? (
        <p className="rounded-control bg-info-bg px-3 py-2.5 text-info">El tipo {rol.nombre} tiene acceso total y fijo: no se puede recortar, para que nadie se quede sin administrar el sistema.</p>
      ) : !editable ? (
        <p className="rounded-control bg-info-bg px-3 py-2.5 text-info">Solo la administración puede cambiar los permisos. Aquí los ves en modo de lectura.</p>
      ) : null}

      <div className="overflow-x-auto rounded-panel border border-line bg-surface">
        <table className="w-full min-w-[52rem] text-left">
          <thead className="border-b border-line text-sm text-ink-muted">
            <tr>
              <th scope="col" className="sticky left-0 bg-surface px-5 py-3 font-medium">Sobre qué</th>
              {acciones.map((accion) => <th key={accion} scope="col" className="px-2 py-3 font-medium">{ACCION[accion] ?? accion}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {recursos.map((recurso) => (
              <tr key={recurso}>
                <th scope="row" className="sticky left-0 bg-surface px-5 py-2.5 font-medium text-ink">{nombreDeRecurso(recurso)}</th>
                {acciones.map((accion) => {
                  const id = clave(recurso, accion);
                  const valor = celdas[id] ?? "none";
                  return (
                    <td key={accion} className="px-2 py-2">
                      <select aria-label={`${ACCION[accion] ?? accion} ${nombreDeRecurso(recurso)}`} value={valor} disabled={!puedeEditar}
                        onChange={(evento) => { setGuardado(false); setCeldas((previas) => ({ ...previas, [id]: evento.target.value })); }}
                        className={`h-10 w-full min-w-28 rounded-control border px-2 text-sm ${
                          valor === "none" ? "border-input-line bg-surface text-ink-muted" : valor === "all" ? "border-brand-700 bg-brand-100 font-medium text-brand-900" : "border-input-line bg-surface font-medium text-ink"
                        } ${(inicial[id] ?? "none") !== valor ? "outline outline-2 outline-accent-600" : ""}`}>
                        {ALCANCES.map((alcance) => <option key={alcance} value={alcance}>{ALCANCE[alcance]}</option>)}
                      </select>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {puedeEditar ? (
        <div className="sticky bottom-[calc(var(--spacing-dock)+env(safe-area-inset-bottom)+0.5rem)] flex flex-wrap items-center gap-3 rounded-panel border border-line bg-surface px-5 py-3 lg:bottom-4">
          <button type="button" onClick={guardar} disabled={enviando !== null || cambios === 0} aria-busy={enviando !== null} className={BOTON_PRINCIPAL}>
            {enviando ? "Guardando…" : cambios === 0 ? "Sin cambios por guardar" : `Guardar ${cambios} ${cambios === 1 ? "cambio" : "cambios"}`}
          </button>
          {cambios > 0 ? <button type="button" onClick={() => setCeldas(inicial)} className={BOTON_SECUNDARIO}>Deshacer</button> : null}
          {guardado ? <span role="status" className="text-success">Permisos guardados. Aplican desde la próxima pantalla que abra cada usuario.</span> : null}
          {error ? <span role="alert" className="text-danger">{error}</span> : null}
        </div>
      ) : null}
    </section>
  );
}
