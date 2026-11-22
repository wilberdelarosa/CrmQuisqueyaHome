// Lógica de negocio del tablero: metas, ranking y tendencia.
// Moneda y valor de la copa: los fija la pantalla con los datos de la empresa (configurarLiga).
let SIMBOLO = '$';
export let COPA = 100000;
export function configurarLiga({ simbolo, copa }) {
  if (simbolo) SIMBOLO = simbolo;
  if (copa > 0) COPA = copa;
}

const DAY = 864e5;

// Cada mes "YYYY-MM" pertenece a un mes, un trimestre y un año
export const periodKeys = (m) => [
  ['mes', m],
  ['trimestre', m.slice(0, 4) + '-T' + Math.ceil(Number(m.slice(5, 7)) / 3)],
  ['año', m.slice(0, 4)],
];

const tieneMetaFija = (b) => b.meta_personal !== '' && b.meta_personal != null && !isNaN(Number(b.meta_personal));

/** Meta colectiva vs. vendido por periodo (mes, trimestre, año). */
export function calcResumen(metas, ventas, equipo) {
  const acc = new Map();
  const get = (v, p) => {
    const id = v + ':' + p;
    if (!acc.has(id)) acc.set(id, { id, vista: v, periodo: p, meta: 0, vendido: 0, cierres: 0 });
    return acc.get(id);
  };
  metas.forEach((r) => periodKeys(String(r.periodo).slice(0, 7)).forEach(([v, p]) => { get(v, p).meta += Number(r.meta_colectiva) || 0; }));
  ventas.forEach((r) => periodKeys(String(r.fecha).slice(0, 7)).forEach(([v, p]) => {
    const g = get(v, p); g.vendido += Number(r.monto) || 0; g.cierres += 1;
  }));
  return [...acc.values()].map((r) => ({
    ...r,
    pct: r.meta ? r.vendido / r.meta : null,
    faltan: Math.max(0, r.meta - r.vendido),
    copas: Math.floor(r.vendido / COPA),
    brokers: equipo.length,
    meta_promedio: equipo.length ? r.meta / equipo.length : 0,
    ticket: r.cierres ? r.vendido / r.cierres : 0,
  }));
}

/** Ranking por periodo: meta personal equitativa (o fija), % cumplido, puesto. */
export function calcRanking(metas, ventas, equipo) {
  const sumaFija = equipo.filter(tieneMetaFija).reduce((s, b) => s + Number(b.meta_personal), 0);
  const libres = equipo.filter((b) => !tieneMetaFija(b)).length || 1;
  const metaMes = new Map(metas.map((r) => [String(r.periodo).slice(0, 7), Number(r.meta_colectiva) || 0]));
  const meses = new Set([...metaMes.keys(), ...ventas.map((r) => String(r.fecha).slice(0, 7))]);
  const acc = new Map();
  const get = (v, p, b) => {
    const id = v + ':' + p + ':' + b;
    if (!acc.has(id)) acc.set(id, { id, vista: v, periodo: p, broker: b, meta: 0, vendido: 0, cierres: 0 });
    return acc.get(id);
  };
  meses.forEach((m) => {
    const total = metaMes.get(m) || 0;
    equipo.forEach((b) => {
      const meta = !total ? 0 : tieneMetaFija(b) ? Number(b.meta_personal) : Math.max(0, total - sumaFija) / libres;
      periodKeys(m).forEach(([v, p]) => { get(v, p, b.broker).meta += meta; });
    });
  });
  ventas.forEach((r) => periodKeys(String(r.fecha).slice(0, 7)).forEach(([v, p]) => {
    const g = get(v, p, r.broker); g.vendido += Number(r.monto) || 0; g.cierres += 1;
  }));
  const grupos = new Map();
  acc.forEach((r) => {
    const k = r.vista + ':' + r.periodo;
    if (!grupos.has(k)) grupos.set(k, []);
    grupos.get(k).push(r);
  });
  const out = [];
  grupos.forEach((rows) => {
    rows.forEach((r) => { r.pct = r.meta ? r.vendido / r.meta : null; r.copas = Math.floor(r.vendido / COPA); r.brecha = r.meta - r.vendido; });
    rows.sort((a, b) => ((b.pct ?? -1) - (a.pct ?? -1)) || (b.vendido - a.vendido));
    rows.forEach((r, i) => out.push({ ...r, puesto: i + 1 }));
  });
  return out;
}

/** Serie diaria (mes) o semanal (trimestre/año) con media móvil, acumulado y variación. */
export function calcTendencia(ventas) {
  const startOf = (vi, p) => Date.UTC(Number(p.slice(0, 4)), vi === 'mes' ? Number(p.slice(5, 7)) - 1 : vi === 'trimestre' ? (Number(p.slice(6)) - 1) * 3 : 0, 1);
  const series = new Map();
  ventas.forEach((r) => {
    const f = String(r.fecha).slice(0, 10);
    const [y, m, d] = f.split('-').map(Number);
    const t = Date.UTC(y, m - 1, d), v = Number(r.monto) || 0;
    periodKeys(f.slice(0, 7)).forEach(([vi, p]) => {
      const st = startOf(vi, p), step = vi === 'mes' ? 1 : 7, idx = Math.floor((t - st) / DAY / step);
      [['equipo', ''], ['broker', String(r.broker)]].forEach(([al, b]) => {
        const k = [vi, p, al, b].join('|');
        if (!series.has(k)) series.set(k, { st, step, b: new Map() });
        const s = series.get(k), o = s.b.get(idx) || { monto: 0, cierres: 0 };
        o.monto += v; o.cierres += 1; s.b.set(idx, o);
      });
    });
  });
  const out = [];
  series.forEach((s, k) => {
    const [vista, periodo, alcance, broker] = k.split('|');
    const idxs = [...s.b.keys()], hi = Math.max(...idxs), lo = vista === 'mes' ? 0 : Math.max(0, Math.min(...idxs) - 1);
    const win = s.step === 1 ? 7 : 4, vals = [];
    let acc = 0;
    for (let i = lo; i <= hi; i++) {
      const o = s.b.get(i) || { monto: 0, cierres: 0 };
      vals.push(o.monto); acc += o.monto;
      const w = vals.slice(-win);
      const fecha = new Date(s.st + i * s.step * DAY).toISOString().slice(0, 10);
      out.push({
        id: [vista, periodo, alcance, broker, fecha].join(':'), vista, periodo, alcance, broker, fecha,
        monto: o.monto, cierres: o.cierres, media: w.reduce((a, b) => a + b, 0) / w.length, acumulado: acc,
        cambio: vals.length > 1 ? o.monto - vals[vals.length - 2] : 0,
      });
    }
  });
  return out;
}

// ---------- Utilidades de periodo y formato ----------
export const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const nf = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

export const money = (v) => (v < 0 ? '-' : '') + SIMBOLO + nf.format(Math.abs(v));
export const moneyShort = (v) => {
  const a = Math.abs(v);
  if (a >= 1e6) return SIMBOLO + +(v / 1e6).toFixed(2) + 'M';
  if (a >= 1e3) return SIMBOLO + Math.round(v / 1e3) + 'K';
  return SIMBOLO + Math.round(v);
};
export const pct = (v) => (v == null ? '—' : Math.round(v * 100) + '%');
export const int = (v) => nf.format(v);
export const initials = (n) => String(n).split(/\s+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
export const parseD = (s) => { const [y, m, d] = String(s).slice(0, 10).split('-').map(Number); return new Date(y, m - 1, d); };
export const fmtDay = (d) => d.getDate() + ' ' + MESES[d.getMonth()].slice(0, 3);
export const fmtMon = (m) => cap(MESES[m].slice(0, 3));

export const label = (v, p) =>
  v === 'mes' ? cap(MESES[Number(p.slice(5, 7)) - 1]) + ' ' + p.slice(0, 4)
    : v === 'trimestre' ? p.slice(5) + ' ' + p.slice(0, 4)
      : 'Año ' + p;

export function rangeOf(v, p) {
  const y = Number(p.slice(0, 4));
  if (v === 'mes') { const m = Number(p.slice(5, 7)) - 1; return [new Date(y, m, 1), new Date(y, m + 1, 1)]; }
  if (v === 'trimestre') { const q = Number(p.slice(6)) - 1; return [new Date(y, q * 3, 1), new Date(y, q * 3 + 3, 1)]; }
  return [new Date(y, 0, 1), new Date(y + 1, 0, 1)];
}

export function todayKey(v) {
  const n = new Date();
  if (v === 'mes') return n.getFullYear() + '-' + String(n.getMonth() + 1).padStart(2, '0');
  if (v === 'trimestre') return n.getFullYear() + '-T' + (Math.floor(n.getMonth() / 3) + 1);
  return String(n.getFullYear());
}

/** Escala "bonita" para ejes: devuelve ticks y el máximo redondeado. */
export function niceScale(max, count = 4) {
  if (!(max > 0)) return { ticks: [0, 1], max: 1 };
  const raw = max / count, p = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / p;
  const step = (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * p;
  const top = Math.ceil(max / step) * step, ticks = [];
  for (let v = 0; v <= top + step / 2; v += step) ticks.push(v);
  return { ticks, max: top };
}
