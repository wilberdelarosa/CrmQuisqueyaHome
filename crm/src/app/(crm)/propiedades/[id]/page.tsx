import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { can, scopeFor } from "@/domain/rbac";
import { requireActor } from "@/infrastructure/auth/actor";
import { fichaProyecto } from "@/infrastructure/contenedor/vistas";
import { empresa } from "@/infrastructure/empresa";
import { requireScopeInPage } from "@/infrastructure/page-guard";
import { dinero, ESTADO_UNIDAD, fechaCorta, rangoDePrecio, TIPO_PROYECTO } from "../../_ui/formato";
import { Dato, Encabezado, Etiqueta, Filtros, PANEL, Vacio } from "../../_ui/pagina";
import { PrecioReal } from "./acciones";

export const metadata: Metadata = { title: "Proyecto" };

const ESTADOS = ["available", "reserved", "sold", "unavailable"] as const;

export default async function FichaDeProyecto({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const actor = await requireActor();
  const alcance = requireScopeInPage(actor, "projects", "view");
  const id = Number((await params).id);
  if (!Number.isSafeInteger(id) || id <= 0 || id > 2147483647) notFound();
  const ficha = await fichaProyecto(actor, alcance, id);
  if (!ficha) notFound();

  const { proyecto, unidades } = ficha;
  const regional = empresa();
  const pedido = (await searchParams).estado;
  const estado = ESTADOS.find((valor) => valor === (Array.isArray(pedido) ? pedido[0] : pedido));
  const visibles = estado ? unidades.filter((unidad) => unidad.status === estado) : unidades;
  const verPrecioReal = can(actor, "unit_real_price", "view");
  const editarPrecioReal = !actor.readOnly && verPrecioReal && can(actor, "unit_real_price", "edit") && scopeFor(actor, "units", "edit") === "all";
  const sinPrecio = unidades.filter((unidad) => unidad.status === "available" && unidad.realPriceCents == null).length;
  const cuenta = (valor: string) => unidades.filter((unidad) => unidad.status === valor).length;

  return (
    <div className="space-y-6">
      <Encabezado titulo={proyecto.name} volver={{ ruta: "/propiedades", texto: "Propiedades" }}
        detalle={[proyecto.zone, TIPO_PROYECTO[proyecto.projectType], proyecto.developer].filter(Boolean).join(", ") || undefined} />

      <dl className={`${PANEL} grid gap-x-8 gap-y-5 px-5 py-5 sm:grid-cols-2 lg:grid-cols-4`}>
        <Dato etiqueta="Precio publicado">{rangoDePrecio(proyecto.publicRangeMinCents, proyecto.publicRangeMaxCents, proyecto.currency, regional.idioma)}</Dato>
        <Dato etiqueta="Disponibles">{proyecto.disponibles} de {proyecto.total}</Dato>
        <Dato etiqueta="Entrega estimada">{proyecto.estimatedDeliveryDate ? fechaCorta(proyecto.estimatedDeliveryDate, regional) : "Sin fecha"}</Dato>
        <Dato etiqueta="Avance de obra">{proyecto.progressPercent != null ? `${proyecto.progressPercent} %` : "Sin registrar"}</Dato>
        {proyecto.description ? <div className="sm:col-span-2 lg:col-span-4"><Dato etiqueta="Descripción">{proyecto.description}</Dato></div> : null}
      </dl>

      <section aria-labelledby="titulo-unidades" className="space-y-4">
        <h2 id="titulo-unidades" className="text-lg font-semibold">Unidades</h2>
        {editarPrecioReal && sinPrecio > 0 ? (
          <p className="rounded-panel border border-warning/40 bg-warning-bg px-5 py-3 text-text">
            {sinPrecio} {sinPrecio === 1 ? "unidad disponible no tiene" : "unidades disponibles no tienen"} precio real. Sin él no se pueden apartar ni reservar: cárgalo con «Cargar».
          </p>
        ) : null}
        {unidades.length === 0 ? (
          <Vacio>Este proyecto todavía no tiene unidades cargadas.</Vacio>
        ) : (
          <>
            <Filtros etiqueta="Filtrar unidades por estado" opciones={[
              { ruta: `/propiedades/${id}`, texto: "Todas", cantidad: unidades.length, activa: !estado },
              ...ESTADOS.map((valor) => ({ ruta: `/propiedades/${id}?estado=${valor}`, texto: ESTADO_UNIDAD[valor]!.texto, cantidad: cuenta(valor), activa: estado === valor })),
            ]} />
            {visibles.length === 0 ? <Vacio>No hay unidades en este estado.</Vacio> : (
              <div className={`${PANEL} overflow-x-auto`}>
                <table className="w-full min-w-[36rem] text-left">
                  <thead className="border-b border-line text-sm text-ink-muted">
                    <tr>
                      <th scope="col" className="px-5 py-3 font-medium">Unidad</th>
                      <th scope="col" className="px-3 py-3 font-medium">Tipo</th>
                      <th scope="col" className="px-3 py-3 font-medium">Habitaciones</th>
                      <th scope="col" className="px-3 py-3 font-medium">{verPrecioReal ? "Precio publicado y real" : "Precio"}</th>
                      <th scope="col" className="px-5 py-3 font-medium">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {visibles.map((unidad) => (
                      <tr key={unidad.id}>
                        <th scope="row" className="cifra px-5 py-3 font-semibold text-ink">{unidad.code}</th>
                        <td className="px-3 py-3 text-text">{[unidad.unitType, unidad.tower ? `torre ${unidad.tower}` : null].filter(Boolean).join(", ") || "Sin tipo"}</td>
                        <td className="cifra px-3 py-3 text-text">{unidad.bedrooms ?? "Sin dato"}</td>
                        <td className="cifra px-3 py-3 text-text">
                          <span className="block">{rangoDePrecio(unidad.publicRangeMinCents, unidad.publicRangeMaxCents, unidad.currency, regional.idioma)}</span>
                          {editarPrecioReal ? (
                            <span className="mt-0.5 block text-sm">
                              <PrecioReal projectId={id} unitId={unidad.id} codigo={unidad.code} centavos={unidad.realPriceCents} moneda={unidad.currency} idioma={regional.idioma} />
                            </span>
                          ) : verPrecioReal && unidad.realPriceCents != null
                            ? <span className="block text-sm text-ink-muted">Real {dinero(unidad.realPriceCents, unidad.currency, regional.idioma)}</span>
                            : null}
                        </td>
                        <td className="px-5 py-3"><Etiqueta tono={ESTADO_UNIDAD[unidad.status]?.tono}>{ESTADO_UNIDAD[unidad.status]?.texto ?? unidad.status}</Etiqueta></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
