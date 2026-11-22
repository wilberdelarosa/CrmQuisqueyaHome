import type { Metadata } from "next";
import { nombreMes, parsearPeriodo } from "@/domain/metas";
import { scopeFor } from "@/domain/rbac";
import { requireActor } from "@/infrastructure/auth/actor";
import { brokersAsignables, datosDeLiga, metasDelPeriodo } from "@/infrastructure/contenedor/vistas";
import { empresa } from "@/infrastructure/empresa";
import { requireScopeInPage } from "@/infrastructure/page-guard";
import { dinero } from "../_ui/formato";
import { PANEL, Vacio } from "../_ui/pagina";
import { FijarMeta } from "./fijar-meta";
import LigaDeMetas from "./liga/LigaDeMetas";
import "./liga/liga-de-metas.css";

export const metadata: Metadata = { title: "Metas" };

export default async function Metas() {
  const actor = await requireActor();
  const alcance = requireScopeInPage(actor, "goals", "view");
  const regional = empresa();
  const periodo = parsearPeriodo(undefined, new Date());
  const alcanceEdicion = actor.readOnly ? "none" : scopeFor(actor, "goals", "edit");
  const [liga, delMes, brokers] = await Promise.all([
    datosDeLiga(actor, alcance, regional.monedaPrincipal, regional.zonaHoraria, periodo.year, periodo.month),
    metasDelPeriodo(actor, alcance, periodo.year, periodo.month),
    brokersAsignables(actor, alcanceEdicion),
  ]);
  const simbolo = new Intl.NumberFormat(regional.idioma, { style: "currency", currency: regional.monedaPrincipal, maximumFractionDigits: 0 })
    .formatToParts(0).find((parte) => parte.type === "currency")?.value ?? regional.monedaPrincipal;
  const mes = nombreMes(periodo.month).toLowerCase();
  const titulo = alcance === "all" ? "Metas de la compañía" : alcance === "team" ? "Metas de tu equipo" : "Tus metas";

  return (
    <div className="space-y-8">
      <LigaDeMetas metas={liga.metas} equipo={liga.equipo} ventas={liga.ventas} titulo={titulo} simbolo={simbolo} />

      <section aria-labelledby="titulo-metas-mes" className="space-y-4">
        <h2 id="titulo-metas-mes" className="text-lg font-semibold">Metas fijadas en {mes}</h2>
        {alcanceEdicion !== "none" ? (
          <FijarMeta year={periodo.year} month={periodo.month} moneda={regional.monedaPrincipal} brokers={brokers} puedeCompania={alcanceEdicion === "all"} />
        ) : null}
        {!delMes.compania && delMes.brokers.length === 0 ? (
          <Vacio>Aún no hay metas fijadas para {mes}.{alcanceEdicion === "none" ? " Las asigna la administración o tu gerente." : " Fija la primera con el formulario de arriba."}</Vacio>
        ) : (
          <div className={`${PANEL} overflow-x-auto`}>
            <table className="w-full min-w-[34rem] text-left">
              <thead className="border-b border-line text-sm text-ink-muted">
                <tr>
                  <th scope="col" className="px-5 py-3 font-medium">De quién</th>
                  <th scope="col" className="px-3 py-3 font-medium">Cierres</th>
                  <th scope="col" className="px-3 py-3 font-medium">Vendido</th>
                  <th scope="col" className="px-5 py-3 font-medium">Objetivo de monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {[...(delMes.compania ? [delMes.compania] : []), ...delMes.brokers].map((meta) => (
                  <tr key={meta.brokerId ?? "compania"}>
                    <th scope="row" className="px-5 py-3 font-medium text-ink">{meta.brokerId === null ? "Compañía" : meta.nombre}</th>
                    <td className="cifra px-3 py-3 text-text">{meta.achievedDeals} de {meta.targetDeals}</td>
                    <td className="cifra px-3 py-3 text-text">{dinero(meta.achievedAmountCents, meta.currency, regional.idioma)}</td>
                    <td className="cifra px-5 py-3 text-text">{meta.targetAmountCents != null ? dinero(meta.targetAmountCents, meta.currency, regional.idioma) : "Sin objetivo de monto"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
