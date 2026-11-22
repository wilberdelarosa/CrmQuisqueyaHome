import type { Metadata } from "next";
import Link from "next/link";
import { can, scopeFor } from "@/domain/rbac";
import { requireActor } from "@/infrastructure/auth/actor";
import { listarActividades } from "@/infrastructure/contenedor/vistas";
import { empresa } from "@/infrastructure/empresa";
import { requireScopeInPage } from "@/infrastructure/page-guard";
import { fechaHora, PRIORIDAD } from "../_ui/formato";
import { Encabezado, Etiqueta, Filtros, PANEL, Vacio } from "../_ui/pagina";
import { CompletarTarea, NuevaTarea } from "./acciones";

export const metadata: Metadata = { title: "Tareas" };

export default async function Tareas({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const actor = await requireActor();
  const alcance = requireScopeInPage(actor, "activities", "view");
  const pedido = (await searchParams).estado;
  const hechas = (Array.isArray(pedido) ? pedido[0] : pedido) === "hechas";
  const tareas = await listarActividades(actor, alcance, { tipo: "tareas", estado: hechas ? "completed" : "pending" });
  const regional = empresa();
  const ahora = Date.now();
  const alcanceEdicion = scopeFor(actor, "activities", "edit");

  return (
    <div className="space-y-6">
      <Encabezado titulo="Tareas" detalle={hechas ? "Lo que ya se hizo" : `${tareas.length} ${tareas.length === 1 ? "pendiente" : "pendientes"}`}>
        {can(actor, "activities", "create") ? <NuevaTarea /> : null}
      </Encabezado>

      <Filtros etiqueta="Filtrar tareas" opciones={[
        { ruta: "/tareas", texto: "Pendientes", activa: !hechas },
        { ruta: "/tareas?estado=hechas", texto: "Hechas", activa: hechas },
      ]} />

      {tareas.length === 0 ? (
        <Vacio>{hechas ? "Todavía no hay tareas completadas." : "No tienes tareas pendientes. Crea una aquí o desde la ficha de un lead o de un negocio."}</Vacio>
      ) : (
        <ul className={`${PANEL} divide-y divide-line`}>
          {tareas.map((tarea) => {
            const vencida = !hechas && tarea.startsAt !== null && new Date(tarea.startsAt).getTime() < ahora;
            const puedeCompletar = !hechas && alcanceEdicion !== "none" && (alcanceEdicion !== "own" || tarea.assigneeId === actor.userId);
            return (
              <li key={tarea.id} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-4">
                <span className="min-w-0 flex-1 basis-64">
                  <span className="block font-medium text-ink">{tarea.title}</span>
                  <span className="block text-sm text-ink-muted">
                    {[
                      tarea.startsAt ? fechaHora(tarea.startsAt, regional) : "Sin fecha",
                      tarea.contactName,
                      tarea.assigneeId !== actor.userId ? tarea.assigneeName : null,
                    ].filter(Boolean).join(", ")}
                  </span>
                  {tarea.dealId ? <Link href={`/negocios/${tarea.dealId}`} className="text-sm font-medium text-brand-900 underline underline-offset-2">Ver el negocio</Link> : null}
                </span>
                <span className="flex flex-wrap items-center gap-2">
                  {vencida ? <Etiqueta tono="peligro">Vencida</Etiqueta> : null}
                  {tarea.priority === "high" ? <Etiqueta tono="aviso">Prioridad {PRIORIDAD.high!.toLowerCase()}</Etiqueta> : null}
                  {hechas ? <Etiqueta tono="exito">Hecha</Etiqueta> : null}
                </span>
                {puedeCompletar ? <CompletarTarea tareaId={tarea.id} /> : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
