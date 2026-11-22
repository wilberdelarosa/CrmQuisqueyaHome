import type { AlcanceDeMeta } from "@/application/dashboard/puertos";
import { diagnosticarRitmo, nombreMes, type Periodo } from "@/domain/metas";

type Props = {
  /** Meta mensual en cierres; `null` cuando nadie la ha fijado. */
  meta: { achieved: number; target: number } | null;
  /** De quién es la meta: de la compañía, de tu equipo o tuya. */
  alcance: AlcanceDeMeta | null;
  periodo: Periodo;
  /** Fecha civil de hoy (AAAA-MM-DD) en la zona de la empresa. */
  hoy: string;
};

const plural = (cantidad: number, uno: string, varios: string) => `${cantidad} ${cantidad === 1 ? uno : varios}`;
const TITULOS: Record<AlcanceDeMeta, string> = { compania: "Meta de la compañía", equipo: "Meta de tu equipo", propia: "Tu meta" };

/**
 * Ritmo de la meta: compara lo logrado con el punto del mes en que estamos. La barra dorada es lo
 * cerrado; la marca es el día de hoy. Si la barra va por detrás de la marca, hay que acelerar.
 * La regla (proyección, faltantes, ritmo semanal) es del dominio: `diagnosticarRitmo`.
 */
export function RitmoDeMeta({ meta, alcance, periodo, hoy }: Props) {
  const mes = nombreMes(periodo.month).toLowerCase();
  const titulo = `${alcance ? TITULOS[alcance] : "Meta"} en ${mes}`;

  if (!meta || meta.target === 0) {
    return (
      <section aria-labelledby="titulo-ritmo" className="rounded-panel border border-line bg-surface px-5 py-6 sm:px-7">
        <h2 id="titulo-ritmo" className="text-lg font-semibold">{titulo}</h2>
        <p className="mt-2 max-w-prose text-text">
          Todavía no hay una meta fijada para este mes. Cuando la administración la asigne, aquí verás cuánto llevas y si vas en ritmo.
        </p>
      </section>
    );
  }

  const ritmo = diagnosticarRitmo(periodo, { targetDeals: meta.target, achievedDeals: meta.achieved }, hoy);
  const logrado = Math.min(100, Math.round((meta.achieved / meta.target) * 100));
  const avanceDelMes = Math.min(100, Math.round((ritmo.diasTranscurridos / ritmo.diasMes) * 100));
  const cumplida = meta.achieved >= meta.target;
  const mensaje = cumplida
    ? "Meta cumplida. Lo que cierres desde ahora suma por encima del objetivo."
    : ritmo.enRitmo
      ? `Vas en ritmo: a este paso cierras el mes con ${plural(ritmo.proyeccionFinMes, "cierre", "cierres")}.`
      : ritmo.diasRestantes > 0
        ? `Faltan ${plural(ritmo.faltantes, "cierre", "cierres")} y quedan ${plural(ritmo.diasRestantes, "día", "días")}: necesitas ${String(ritmo.ritmoSemanalRequerido).replace(".", ",")} por semana.`
        : `El mes terminó con ${plural(ritmo.faltantes, "cierre", "cierres")} por debajo de la meta.`;

  return (
    <section aria-labelledby="titulo-ritmo" className="rounded-panel border border-line bg-surface px-5 py-6 sm:px-7">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h2 id="titulo-ritmo" className="text-lg font-semibold">{titulo}</h2>
        <p className="text-sm text-ink-muted">Día {ritmo.diasTranscurridos} de {ritmo.diasMes}</p>
      </div>

      <p className="cifra mt-3 text-ink">
        <span className="text-[2.75rem] font-bold leading-none sm:text-[3.5rem]">{meta.achieved}</span>
        <span className="ml-2 text-xl font-medium text-ink-muted">de {plural(meta.target, "cierre", "cierres")}</span>
      </p>

      <div className="mt-6" role="img"
        aria-label={`${meta.achieved} de ${plural(meta.target, "cierre", "cierres")}, ${logrado} por ciento de la meta. El mes va por el día ${ritmo.diasTranscurridos} de ${ritmo.diasMes}.`}>
        <div className="relative h-3 rounded-full bg-brand-100">
          <div className="h-full rounded-full bg-accent-600" style={{ width: `${logrado}%` }} />
          <span className="absolute -top-1.5 h-6 w-0.5 -translate-x-1/2 rounded-full bg-brand-900" style={{ left: `${avanceDelMes}%` }} />
        </div>
        <div className="relative mt-2 h-5 text-sm text-ink-muted">
          <span className="absolute whitespace-nowrap" style={avanceDelMes > 80 ? { right: 0 } : { left: `${avanceDelMes}%`, transform: avanceDelMes < 8 ? undefined : "translateX(-50%)" }}>
            hoy
          </span>
        </div>
      </div>

      <p className={`mt-3 max-w-prose font-medium ${cumplida || ritmo.enRitmo ? "text-success" : "text-warning"}`}>{mensaje}</p>
    </section>
  );
}
