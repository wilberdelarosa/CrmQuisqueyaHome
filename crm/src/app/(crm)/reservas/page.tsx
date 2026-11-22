import type { Metadata } from "next";
import Link from "next/link";
import { camposNegocios } from "@/application/pipeline/consultas";
import { can, scopeFor } from "@/domain/rbac";
import { requireActor } from "@/infrastructure/auth/actor";
import { apartadosYReservas } from "@/infrastructure/contenedor/vistas";
import { empresa } from "@/infrastructure/empresa";
import { requireScopeInPage } from "@/infrastructure/page-guard";
import { dinero, fechaCorta, fechaHora } from "../_ui/formato";
import { Encabezado, Etiqueta, Filtros, PANEL, Vacio, type Tono } from "../_ui/pagina";
import { AccionesDeApartado } from "./acciones";

export const metadata: Metadata = { title: "Reservas" };

const ESTADO_APARTADO: Record<string, { texto: string; tono: Tono }> = {
  activo: { texto: "Apartada", tono: "aviso" },
  convertido: { texto: "Pasó a reserva", tono: "exito" },
  cancelado: { texto: "Liberada", tono: "neutro" },
  expirado: { texto: "Venció", tono: "neutro" },
};
const ESTADO_RESERVA: Record<string, { texto: string; tono: Tono }> = {
  borrador: { texto: "Borrador", tono: "neutro" },
  pendiente_pago: { texto: "Esperando el pago", tono: "aviso" },
  en_verificacion: { texto: "Pago en verificación", tono: "info" },
  confirmada: { texto: "Confirmada", tono: "exito" },
  expirada: { texto: "Venció", tono: "neutro" },
  cancelacion_solicitada: { texto: "Cancelación pedida", tono: "peligro" },
  cancelada: { texto: "Cancelada", tono: "neutro" },
};

/** Tiempo que queda, en palabras: «quedan 5 h», «quedan 2 días». */
function restante(hasta: Date, ahora: number): string {
  const horas = Math.max(0, Math.round((new Date(hasta).getTime() - ahora) / 3_600_000));
  return horas < 48 ? `quedan ${horas} h` : `quedan ${Math.round(horas / 24)} días`;
}

export default async function Reservas({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const actor = await requireActor();
  const alcanceApartados = requireScopeInPage(actor, "holds", "view");
  const alcanceReservas = scopeFor(actor, "reservations", "view");
  const pedido = (await searchParams).ver;
  const verHistorial = (Array.isArray(pedido) ? pedido[0] : pedido) === "historial";
  const { apartados, reservas } = await apartadosYReservas(actor, alcanceApartados, alcanceReservas);
  const regional = empresa();
  const ahora = Date.now();
  const vigente = (apartado: (typeof apartados)[number]) => apartado.status === "activo" && new Date(apartado.expiresAt).getTime() > ahora;
  const activos = apartados.filter(vigente);
  const historial = apartados.filter((apartado) => !vigente(apartado));
  const lista = verHistorial ? historial : activos;
  const verPrecio = can(actor, "unit_real_price", "view");
  // Total y depósito de una reserva son montos del negocio: los ve quien ve el monto del negocio.
  const verMontos = camposNegocios(actor).monto;
  const alcanceEdicion = actor.readOnly ? "none" : scopeFor(actor, "holds", "edit");
  const porVencer = activos.filter((apartado) => new Date(apartado.expiresAt).getTime() - ahora < 12 * 3_600_000).length;

  return (
    <div className="space-y-6">
      <Encabezado titulo="Reservas"
        detalle={`${activos.length} ${activos.length === 1 ? "unidad apartada" : "unidades apartadas"} ahora${porVencer ? `, ${porVencer} vence${porVencer === 1 ? "" : "n"} en menos de 12 horas` : ""}. Se aparta desde la ficha de un negocio.`} />

      <section aria-labelledby="titulo-apartados" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="titulo-apartados" className="text-lg font-semibold">Apartados</h2>
          <Filtros etiqueta="Ver apartados" opciones={[
            { ruta: "/reservas", texto: "Vigentes", cantidad: activos.length, activa: !verHistorial },
            { ruta: "/reservas?ver=historial", texto: "Historial", cantidad: historial.length, activa: verHistorial },
          ]} />
        </div>
        <p className="text-sm text-ink-muted">Un apartado bloquea la unidad para tu cliente durante 48 horas: nadie más la puede ofrecer. Se puede extender o liberar.</p>

        {lista.length === 0 ? (
          <Vacio>{verHistorial ? "Todavía no hay apartados vencidos, liberados ni convertidos."
            : <>No hay unidades apartadas. Abre un <Link href="/negocios" className="font-medium text-brand-900 underline underline-offset-2">negocio</Link> con una propiedad de interés y usa «Apartar unidad».</>}</Vacio>
        ) : (
          <ul className={`${PANEL} divide-y divide-line`}>
            {lista.map((apartado) => {
              const estado = vigente(apartado) ? ESTADO_APARTADO.activo! : ESTADO_APARTADO[apartado.status === "activo" ? "expirado" : apartado.status] ?? { texto: apartado.status, tono: "neutro" as Tono };
              const urgente = vigente(apartado) && new Date(apartado.expiresAt).getTime() - ahora < 12 * 3_600_000;
              const puedeEditar = vigente(apartado) && alcanceEdicion !== "none" && (alcanceEdicion !== "own" || apartado.brokerId === actor.userId);
              return (
                <li key={apartado.id} className="grid gap-x-6 gap-y-3 px-5 py-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-ink">Unidad {apartado.unidades ?? "sin código"}</span>
                      <Etiqueta tono={urgente ? "peligro" : estado.tono}>{vigente(apartado) ? `${estado.texto}, ${restante(apartado.expiresAt, ahora)}` : estado.texto}</Etiqueta>
                    </div>
                    <p className="text-sm text-ink-muted">
                      {[
                        apartado.contacto ? `Para ${apartado.contacto}` : null,
                        apartado.titular ? `apartó ${apartado.titular}` : null,
                        vigente(apartado) ? `vence ${fechaHora(apartado.expiresAt, regional)}` : null,
                        apartado.extensionCount > 0 ? `extendido ${apartado.extensionCount} ${apartado.extensionCount === 1 ? "vez" : "veces"}` : null,
                        verPrecio && apartado.moneda ? dinero(apartado.totalCents, apartado.moneda, regional.idioma) : null,
                      ].filter(Boolean).join(", ")}
                    </p>
                    <Link href={`/negocios/${apartado.dealId}`} className="text-sm font-medium text-brand-900 underline underline-offset-2">Ver el negocio</Link>
                  </div>
                  {puedeEditar ? <AccionesDeApartado id={apartado.id} version={apartado.rowVersion} /> : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {alcanceReservas !== "none" ? (
        <section aria-labelledby="titulo-reservas" className="space-y-4">
          <h2 id="titulo-reservas" className="text-lg font-semibold">Reservas firmadas</h2>
          {reservas.length === 0 ? (
            <Vacio>Aún no hay reservas. Una reserva formaliza el apartado con las condiciones firmadas y el depósito; se activará junto con el módulo de Documentos, que guarda esas condiciones.</Vacio>
          ) : (
            <ul className={`${PANEL} divide-y divide-line`}>
              {reservas.map((reserva) => {
                const estado = ESTADO_RESERVA[reserva.status] ?? { texto: reserva.status, tono: "neutro" as Tono };
                return (
                  <li key={reserva.id} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-ink">{reserva.contacto ?? "Cliente"}, unidad {reserva.unidades ?? "sin código"}</span>
                        <Etiqueta tono={estado.tono}>{estado.texto}</Etiqueta>
                      </div>
                      <p className="text-sm text-ink-muted">
                        {[verMontos ? `Total ${dinero(reserva.totalCents, reserva.currency, regional.idioma)}` : null, verMontos ? `depósito ${dinero(reserva.depositRequiredCents, reserva.currency, regional.idioma)}` : null,
                          reserva.confirmedAt ? `confirmada ${fechaCorta(reserva.confirmedAt, regional)}` : reserva.expiresAt ? `vence ${fechaHora(reserva.expiresAt, regional)}` : null].filter(Boolean).join(", ")}
                      </p>
                    </div>
                    <Link href={`/negocios/${reserva.dealId}`} className="text-sm font-medium text-brand-900 underline underline-offset-2">Ver el negocio</Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      ) : null}
    </div>
  );
}
