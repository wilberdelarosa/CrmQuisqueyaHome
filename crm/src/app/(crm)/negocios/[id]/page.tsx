import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { camposNegocios, consultarCatalogosNegocios, consultarFichaNegocio } from "@/application/pipeline/consultas";
import { NotFoundError, ValidationError } from "@/domain/errors";
import { can, reaches, scopeFor } from "@/domain/rbac";
import { requireActor } from "@/infrastructure/auth/actor";
import { pipelineParaLectura } from "@/infrastructure/contenedor/pipeline";
import { unidadesApartables } from "@/infrastructure/contenedor/vistas";
import { empresa } from "@/infrastructure/empresa";
import { requireScopeInPage } from "@/infrastructure/page-guard";
import { dinero, fechaCorta, fechaHora, OPERACION } from "../../_ui/formato";
import { Dato, Encabezado, Etiqueta, PANEL, Vacio } from "../../_ui/pagina";
import { AccionesDeNegocio, ApartarUnidad } from "./acciones";

export const metadata: Metadata = { title: "Negocio" };

export default async function FichaDeNegocio({ params }: { params: Promise<{ id: string }> }) {
  const actor = await requireActor();
  requireScopeInPage(actor, "deals", "view");
  const repo = pipelineParaLectura();
  const id = Number((await params).id);
  let ficha;
  try {
    ficha = await consultarFichaNegocio(repo, actor, id);
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ValidationError) notFound();
    throw error;
  }
  const catalogos = await consultarCatalogosNegocios(repo, actor);
  const regional = empresa();
  const { negocio, propiedades } = ficha;
  const etapas = catalogos.etapas.filter((etapa) => etapa.isActive !== false).sort((a, b) => a.position - b.position);
  const etapa = etapas.find((candidata) => candidata.id === negocio.stageId);
  const abierto = negocio.stageKind === "open";
  const campos = camposNegocios(actor);
  const alcanceEdicion = scopeFor(actor, "deals", "edit");
  const puedeEditar = !actor.readOnly && alcanceEdicion !== "none" && (alcanceEdicion !== "own" || negocio.brokerId === actor.userId);
  // Apartar: negocio abierto y al alcance de quien aparta. El precio lo pone el servidor.
  const puedeApartar = abierto && !actor.readOnly && reaches(actor, scopeFor(actor, "holds", "create"), negocio.brokerId);
  const apartables = puedeApartar ? new Map((await unidadesApartables(negocio.id)).map((unidad) => [unidad.id, unidad])) : new Map<number, { conPrecio: boolean; apartadaHasta: Date | null }>();

  return (
    <div className="space-y-6">
      <Encabezado titulo={negocio.contactName} volver={{ ruta: "/negocios", texto: "Negocios" }}
        detalle={`${OPERACION[negocio.operationType]}${negocio.brokerName ? `, a cargo de ${negocio.brokerName}` : ", sin responsable"}`}>
        <Etiqueta tono={negocio.stageKind === "won" ? "exito" : negocio.stageKind === "lost" ? "peligro" : "info"}>{etapa?.name ?? "Etapa sin nombre"}</Etiqueta>
      </Encabezado>

      <ol aria-label="Etapas del negocio" className="flex gap-1 overflow-x-auto">
        {etapas.filter((candidata) => candidata.kind !== "lost" || negocio.stageKind === "lost").map((candidata) => {
          const pasada = etapa ? candidata.position < etapa.position : false;
          const actual = candidata.id === negocio.stageId;
          return (
            <li key={candidata.id} aria-current={actual ? "step" : undefined}
              className={`min-w-24 flex-1 border-t-4 px-1 pt-2 text-sm ${actual ? "border-accent-600 font-semibold text-ink" : pasada ? "border-brand-700 text-text" : "border-line text-ink-muted"}`}>
              {candidata.name}
            </li>
          );
        })}
      </ol>

      {puedeEditar && abierto ? (
        <AccionesDeNegocio
          negocio={{
            id: negocio.id, stageId: negocio.stageId, stageChangedAt: negocio.stageChangedAt ? new Date(negocio.stageChangedAt).toISOString() : null,
            amountCents: negocio.amountCents ?? null, probability: negocio.probability, commissionBasisPoints: negocio.commissionBasisPoints ?? null,
            expectedCloseDate: negocio.expectedCloseDate, currency: negocio.currency,
          }}
          etapas={etapas.map(({ id: etapaId, name, kind, position }) => ({ id: etapaId, name, kind, position }))}
          motivos={catalogos.motivos.filter((motivo) => motivo.isActive)}
          proyectos={ficha.proyectosDisponibles}
          principal={propiedades.find((propiedad) => propiedad.isPrimary)?.unitId ?? null}
          puede={{ monto: campos.monto, comision: campos.comision, actividad: can(actor, "activities", "create") }}
        />
      ) : null}

      <dl className={`${PANEL} grid gap-x-8 gap-y-5 px-5 py-5 sm:grid-cols-2 lg:grid-cols-4`}>
        <Dato etiqueta="Teléfono">{negocio.contactPhoneDisplay ?? negocio.contactPhone ?? "Sin teléfono"}</Dato>
        {campos.monto ? <Dato etiqueta="Monto">{dinero(negocio.amountCents, negocio.currency, regional.idioma)}</Dato> : null}
        <Dato etiqueta="Probabilidad">{negocio.probability != null ? `${negocio.probability} %` : "Sin indicar"}</Dato>
        {campos.comision ? <Dato etiqueta="Comisión">{negocio.commissionBasisPoints != null ? `${(negocio.commissionBasisPoints / 100).toLocaleString(regional.idioma)} %` : "Sin definir"}</Dato> : null}
        <Dato etiqueta="Cierre estimado">{negocio.expectedCloseDate ? fechaCorta(negocio.expectedCloseDate, regional) : "Sin fecha"}</Dato>
        <Dato etiqueta="Próxima acción">
          {negocio.nextActivityTitle ? `${negocio.nextActivityTitle}${negocio.nextActivityStartsAt ? `, ${fechaHora(negocio.nextActivityStartsAt, regional)}` : ""}` : "Sin próxima acción"}
        </Dato>
        <Dato etiqueta="Origen">{negocio.sourceName ?? "Sin registrar"}</Dato>
        {negocio.closedAt ? <Dato etiqueta="Cerrado">{fechaCorta(negocio.closedAt, regional)}</Dato> : null}
        {negocio.lossComment ? <div className="sm:col-span-2"><Dato etiqueta="Motivo de la pérdida">{negocio.lossComment}</Dato></div> : null}
      </dl>

      <section aria-labelledby="titulo-propiedades">
        <h2 id="titulo-propiedades" className="text-lg font-semibold">Propiedades de interés</h2>
        {propiedades.length === 0 ? (
          <div className="mt-3"><Vacio>Todavía no hay una propiedad asociada. Hace falta al menos una para avanzar a preselección, y una principal para cerrar.</Vacio></div>
        ) : (
          <ul className={`${PANEL} mt-3 divide-y divide-line`}>
            {propiedades.map((propiedad) => (
              <li key={propiedad.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-5 py-3.5">
                <span className="text-ink">{propiedad.projectName}{propiedad.unitCode ? `, unidad ${propiedad.unitCode}` : ""}</span>
                <span className="flex flex-wrap items-center gap-2">
                  {propiedad.isPrimary ? <Etiqueta tono="neutro">Principal</Etiqueta> : null}
                  {propiedad.unitId && apartables.has(propiedad.unitId)
                    ? apartables.get(propiedad.unitId)!.apartadaHasta
                      ? <Etiqueta tono="aviso">Apartada hasta {fechaHora(apartables.get(propiedad.unitId)!.apartadaHasta!, regional)}</Etiqueta>
                      : apartables.get(propiedad.unitId)!.conPrecio
                        ? <ApartarUnidad dealId={negocio.id} unitId={propiedad.unitId} codigo={propiedad.unitCode ?? ""} />
                        : <span className="text-sm text-ink-muted">Para apartarla falta su precio real; lo carga la administración en Propiedades.</span>
                    : null}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {ficha.historialEtapas && ficha.historialEtapas.length > 0 ? (
        <section aria-labelledby="titulo-historial">
          <h2 id="titulo-historial" className="text-lg font-semibold">Recorrido</h2>
          <ol className={`${PANEL} mt-3 divide-y divide-line`}>
            {ficha.historialEtapas.map((paso) => (
              <li key={paso.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-5 py-3">
                <span className="text-ink">{paso.desde ? `De ${paso.desde} a ${paso.hasta}` : `Entró en ${paso.hasta}`}</span>
                <span className="text-sm text-ink-muted">{[paso.autor, fechaHora(paso.fecha, regional)].filter(Boolean).join(", ")}</span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </div>
  );
}
