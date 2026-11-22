"use client";

import React, { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import './liga-de-metas.css';
import {
  COPA, calcResumen, calcRanking, calcTendencia, money, moneyShort, pct, int, initials, parseD, fmtDay, fmtMon,
  label, rangeOf, todayKey, niceScale, MESES, configurarLiga,
} from './calculos.js';

/* =========================================================
   Hooks
   ========================================================= */
function useWidth(ref) {
  const [w, setW] = useState(0);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(ref.current);
    setW(ref.current.clientWidth);
    return () => ro.disconnect();
  }, [ref]);
  return w;
}

const prefersReduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** true en el frame siguiente al montaje: sirve para animar de 0 al valor final. */
function useArmed(delay = 0) {
  const [on, setOn] = useState(prefersReduced());
  useEffect(() => {
    if (prefersReduced()) return;
    const t = setTimeout(() => requestAnimationFrame(() => setOn(true)), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return on;
}

/** Cuenta animada hasta `value`; se reinicia cuando cambia `resetKey`. */
function useCountUp(value, resetKey, dur = 1200) {
  const [v, setV] = useState(prefersReduced() ? value : 0);
  useEffect(() => {
    if (value == null) return;
    if (prefersReduced()) { setV(value); return; }
    let raf; const t0 = performance.now();
    const step = (t) => {
      const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      setV(k === 1 ? value : value * e);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, resetKey, dur]);
  return value == null ? null : v;
}

function CountUp({ value, fmt, resetKey }) {
  const v = useCountUp(value, resetKey);
  return <>{v == null ? '—' : fmt(v)}</>;
}

// Ancho aproximado de un texto (para márgenes de ejes)
const tw = (s, size = 11, weight = 400) => String(s).length * size * (weight >= 600 ? 0.62 : 0.56);
const safeId = (id) => id.replace(/[^a-zA-Z0-9_-]/g, '');

/* =========================================================
   Iconos y piezas gráficas
   ========================================================= */
function Defs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="lmGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f7e3a1" /><stop offset=".5" stopColor="#d4af37" /><stop offset="1" stopColor="#93721f" /></linearGradient>
        <linearGradient id="lmSilver" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f4f6f9" /><stop offset=".5" stopColor="#b3bdc8" /><stop offset="1" stopColor="#6f7b88" /></linearGradient>
        <linearGradient id="lmBronze" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f3cba5" /><stop offset=".5" stopColor="#c07a42" /><stop offset="1" stopColor="#7c4520" /></linearGradient>
        <linearGradient id="lmBrand" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#1d2b53" /><stop offset="1" stopColor="#4a5f8f" /></linearGradient>
        <linearGradient id="lmArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#344872" stopOpacity=".22" /><stop offset=".5" stopColor="#344872" stopOpacity=".08" /><stop offset="1" stopColor="#344872" stopOpacity="0" /></linearGradient>
        <linearGradient id="lmBarG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4a5f8f" /><stop offset="1" stopColor="#1d2b53" /></linearGradient>
        <linearGradient id="lmBarGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e2c36a" /><stop offset="1" stopColor="#b38c2c" /></linearGradient>
      </defs>
    </svg>
  );
}

const MEDAL_FILL = { 1: 'url(#lmGold)', 2: 'url(#lmSilver)', 3: 'url(#lmBronze)' };
const rankFill = (puesto, fallback = 'url(#lmBrand)') => MEDAL_FILL[puesto] || fallback;

function Medal({ n, size = 40 }) {
  return (
    <svg viewBox="0 0 48 62" width={size} height={Math.round((size * 62) / 48)} className="lm-medal-svg">
      <path d="M11 0h11l6 20H17z" fill="#1d2b53" />
      <path d="M37 0H26l-6 20h11z" fill="#344872" />
      <path d="M22 0h4l-2 8z" fill="#10172d" opacity=".5" />
      <circle cx="24" cy="40" r="20" fill={MEDAL_FILL[n]} />
      <circle cx="24" cy="40" r="15.5" fill="none" stroke="rgba(255,255,255,.6)" strokeWidth="1.4" />
      <path d="M10 33a15 15 0 0 1 12-9" fill="none" stroke="rgba(255,255,255,.7)" strokeWidth="2" strokeLinecap="round" />
      <text x="24" y="40" dy=".36em" textAnchor="middle" fontSize="17" fontWeight="700" fill="#fff">{n}</text>
    </svg>
  );
}

const Icon = ({ children, size = 18 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
);
const Trophy = ({ size = 16, color }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color || 'currentColor'} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);
const ICONS = {
  vendido: <Icon><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /><path d="M6 12h.01M18 12h.01" /></Icon>,
  meta: <Icon><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></Icon>,
  brecha: <Icon><path d="M4 22V4" /><path d="M4 4h12l-2 4 2 4H4" /></Icon>,
  cierres: <Icon><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /><path d="m9 15 2 2 4-4" /></Icon>,
  copas: <Trophy size={18} />,
};

function Tooltip({ tip }) {
  if (!tip) return null;
  return (
    <div className="lm-tip" style={{ left: tip.x, top: tip.y }}>
      <div className="t">{tip.title}</div>
      {tip.lines.map(([n, c, v, dashed]) => (
        <div className="r" key={n}>
          <span>{c && <i className="sw" style={dashed ? { borderTop: `2px dashed ${c}`, background: 'transparent' } : { background: c }} />}{n}</span>
          <b>{v}</b>
        </div>
      ))}
    </div>
  );
}

/** Calcula la posición del tooltip dentro de la caja */
function tipPos(ev, box, w = 190, h = 110) {
  const r = box.getBoundingClientRect();
  const px = ev.clientX - r.left, py = ev.clientY - r.top;
  let x = px + 14; if (x + w > r.width) x = px - w - 14;
  return { x: Math.max(0, x), y: Math.max(0, Math.min(r.height - h, py - h / 2)) };
}

/* =========================================================
   Indicador circular (meta colectiva)
   ========================================================= */
function Gauge({ s, vista, periodo }) {
  const ref = useRef(null);
  const boxW = useWidth(ref);
  const armed = useArmed(60);
  const W = Math.max(200, Math.min(boxW || 260, 280)), cx = W / 2, R = W / 2 - 14, th = Math.max(16, R * 0.15);
  const H = Math.round(cx + R * Math.SQRT1_2 + 18), Rm = R - th / 2;
  const A0 = -0.75 * Math.PI, SPAN = 1.5 * Math.PI;
  const pt = (a, r) => [cx + Math.sin(a) * r, cx - Math.cos(a) * r];
  const arc = (a0, a1, r) => { const [x0, y0] = pt(a0, r), [x1, y1] = pt(a1, r); return `M${x0},${y0}A${r},${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1},${y1}`; };
  const p = Math.max(0, s.pct || 0);
  const [a, e] = rangeOf(vista, periodo), now = new Date();
  const pace = now >= a && now < e && s.meta ? (now - a) / (e - a) : null;
  const tipA = A0 + SPAN * Math.min(1, armed ? p : 0);
  return (
    <div className="lm-gauge" ref={ref} style={{ height: H }}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
        <path d={arc(A0, A0 + SPAN, Rm)} fill="none" stroke="#eef2f7" strokeWidth={th} strokeLinecap="round" />
        {Array.from({ length: 11 }, (_, i) => {
          const ang = A0 + SPAN * (i / 10), major = i % 5 === 0, r1 = R - th - 6, r2 = r1 - (major ? 8 : 4);
          const [x1, y1] = pt(ang, r1), [x2, y2] = pt(ang, r2);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={major ? '#94a3b8' : '#d5dce5'} strokeWidth={major ? 1.6 : 1.1} strokeLinecap="round" />;
        })}
        {[[0, '0%'], [1, '100%']].map(([t, l]) => { const [x, y] = pt(A0 + SPAN * t, Rm); return <text key={l} x={x} y={y + th + 6} textAnchor="middle" fontSize="11" fill="#94a3b8">{l}</text>; })}
        <path d={arc(A0, A0 + SPAN, Rm)} fill="none" stroke={p >= 1 ? 'url(#lmGold)' : 'url(#lmBrand)'} strokeWidth={th} strokeLinecap="round"
          pathLength="100" strokeDasharray="100" strokeDashoffset={100 - Math.min(1, armed ? p : 0) * 100} className="lm-gauge-arc" style={{ opacity: p > 0 ? 1 : 0 }} />
        {p > 0.02 && <circle cx={pt(tipA, Rm)[0]} cy={pt(tipA, Rm)[1]} r={th / 2 - 3} fill="#fff" opacity=".9" className="lm-gauge-dot" />}
        {p > 1 && (
          <path d={arc(A0, A0 + SPAN, R + 6)} fill="none" stroke="#c9a23f" strokeWidth="4" strokeLinecap="round" pathLength="100" strokeDasharray="100"
            strokeDashoffset={100 - Math.min(1, armed ? p - 1 : 0) * 100} className="lm-gauge-arc lm-delay" />
        )}
        {pace != null && (() => {
          const ang = A0 + SPAN * pace, [x1, y1] = pt(ang, R + 6), [x2, y2] = pt(ang, R - th - 2), [lx, ly] = pt(ang, R + 16);
          return (
            <g>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#0b1324" strokeWidth="2.4" strokeLinecap="round" />
              <text x={lx} y={ly} dy=".35em" textAnchor={Math.sin(ang) > 0.2 ? 'start' : Math.sin(ang) < -0.2 ? 'end' : 'middle'} fontSize="10.5" fontWeight="600" fill="#0b1324" letterSpacing=".06em">RITMO</text>
            </g>
          );
        })()}
      </svg>
      <div className="lm-gc" style={{ top: cx }}>
        <div className="lm-gpct num"><CountUp value={s.pct} fmt={pct} resetKey={s.id} /></div>
        <div className="lm-glab">de la meta cumplida</div>
      </div>
    </div>
  );
}

function StatusChips({ s, vista, periodo }) {
  const [a, e] = rangeOf(vista, periodo), now = new Date(), p = s.pct || 0;
  const Chip = ({ cls, children }) => <span className={'lm-chip ' + cls}><i />{children}</span>;
  if (now >= a && now < e && s.meta) {
    const frac = (now - a) / (e - a), left = Math.ceil((e - now) / 864e5);
    return <div className="lm-status">{p >= frac ? <Chip cls="up">Por encima del ritmo</Chip> : <Chip cls="down">Por debajo del ritmo</Chip>}<Chip cls="neutral">Quedan {left} {left === 1 ? 'día' : 'días'}</Chip></div>;
  }
  if (now >= e) return <div className="lm-status">{p >= 1 ? <Chip cls="up">Periodo cerrado · meta lograda</Chip> : <Chip cls="down">Periodo cerrado</Chip>}</div>;
  return <div className="lm-status"><Chip cls="neutral">Periodo por iniciar</Chip></div>;
}

/* =========================================================
   Tendencia tipo trading
   ========================================================= */
function TrendChart({ pts, meta, vista, periodo, modo }) {
  const ref = useRef(null);
  const W = Math.max(300, useWidth(ref) || 600);
  const [hover, setHover] = useState(null);
  const clipId = 'lmClip' + safeId(useId());
  const H = 320, volH = 48, xLabH = 22, gap = 14, top = 16;
  const mainBot = H - xLabH - volH - gap, vTop = mainBot + gap, vBot = H - xLabH;
  const isDay = vista === 'mes';
  if (!pts.length) return <div className="lm-chart" ref={ref}><div className="lm-empty">Sin ventas registradas en este periodo</div></div>;

  const acum = modo === 'acumulado';
  const val = (p) => (acum ? p.acumulado : p.monto);
  const [a, e] = rangeOf(vista, periodo), now = new Date();
  const last = pts[pts.length - 1];
  const best = pts.reduce((m, p) => (p.monto > m.monto ? p : m), pts[0]);
  const series = acum && +pts[0].d > +a ? [{ d: a, acumulado: 0, monto: 0 }, ...pts] : pts;
  const yRaw = acum ? Math.max(meta || 0, last.acumulado) * 1.1 : Math.max(...pts.map((p) => Math.max(p.monto, p.media))) * 1.18;
  const { ticks, max: yMax } = niceScale(yRaw, 4);
  const y = (v) => mainBot - (v / yMax) * (mainBot - top);
  const tagTxt = moneyShort(val(last));
  const right = Math.max(...ticks.map((t) => tw(moneyShort(t))), tw(tagTxt, 11, 600) + 12) + 16, left = 6;
  const x0 = acum ? +a : +pts[0].d, x1 = acum ? +e : pts.length > 1 ? +last.d : +pts[0].d + 864e5;
  const x = (t) => left + 8 + ((+t - x0) / (x1 - x0)) * (W - right - 12 - left - 8);
  const nT = W < 560 ? 4 : 7;
  const xTicks = Array.from({ length: nT + 1 }, (_, i) => { const d = new Date(x0 + (i * (x1 - x0)) / nT); d.setHours(0, 0, 0, 0); return d; })
    .filter((d, i, arr) => +d >= x0 && (i === 0 || +d !== +arr[i - 1]));
  const maxC = Math.max(1, ...pts.map((p) => p.cierres));
  const yv = (c) => vBot - (c / maxC) * (vBot - vTop - 10);
  const step = pts.length > 1 ? x(pts[1].d) - x(pts[0].d) : 20;
  const bw = Math.max(2, Math.min(14, step * 0.6));
  const UP = '#059669', DN = '#dc2626';
  const path = (arr, f) => arr.map((p, i) => (i ? 'L' : 'M') + x(p.d).toFixed(1) + ',' + y(f(p)).toFixed(1)).join('');
  const line = path(series, val);
  const area = line + `L${x(series[series.length - 1].d)},${y(0)}L${x(series[0].d)},${y(0)}Z`;
  const ly = y(val(last));

  const onMove = (ev) => {
    const r = ev.currentTarget.ownerSVGElement.getBoundingClientRect();
    const mx = ((ev.clientX - r.left) / r.width) * W;
    let p = pts[0];
    pts.forEach((q) => { if (Math.abs(x(q.d) - mx) < Math.abs(x(p.d) - mx)) p = q; });
    const prev = p.monto - p.cambio;
    const varPct = p.cambio && prev > 0 ? ` (${p.cambio > 0 ? '+' : ''}${Math.round((p.cambio / prev) * 100)}%)` : '';
    setHover({
      p, ...tipPos(ev, ref.current, 210, 120),
      title: (isDay ? '' : 'Semana del ') + fmtDay(p.d) + ' ' + p.d.getFullYear(),
      lines: [
        ['Ventas', '#1d2b53', money(p.monto)],
        ['Variación', p.cambio >= 0 ? UP : DN, (p.cambio > 0 ? '+' : '') + money(p.cambio) + varPct],
        ['Media móvil', '#c9a23f', money(p.media)],
        ['Cierres', null, int(p.cierres)],
        ['Acumulado', null, money(p.acumulado)],
      ],
    });
  };

  const peakLab = 'Pico ' + moneyShort(best.monto), plw = tw(peakLab, 11, 600) + 14;
  const ppx = x(best.d), ppy = y(best.monto);
  const plx = Math.max(left, Math.min(W - right - plw, ppx - plw / 2)), ply = Math.max(0, ppy - 32);

  return (
    <div className="lm-chart" ref={ref} style={{ minHeight: H }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
        <clipPath id={clipId}><rect className="lm-reveal" x="0" y="0" width={W} height={H} /></clipPath>
        {ticks.map((t) => <line key={t} x1={left} x2={W - right} y1={y(t)} y2={y(t)} stroke="#eef1f5" />)}
        {ticks.map((t) => <text key={'l' + t} x={W - right + 8} y={y(t)} dy=".32em" fontSize="11" fill="#94a3b8">{moneyShort(t)}</text>)}
        {xTicks.map((d) => <text key={+d} x={x(d)} y={H - 6} textAnchor="middle" fontSize="11" fill="#94a3b8">{fmtDay(d)}</text>)}
        <line x1={left} x2={W - right} y1={y(0)} y2={y(0)} stroke="#d5dce5" />
        <text x={left} y={vTop + 4} fontSize="10" fontWeight="600" letterSpacing=".08em" fill="#94a3b8">CIERRES</text>
        <line x1={left} x2={W - right} y1={vBot} y2={vBot} stroke="#e6e9ef" />

        {acum && meta > 0 && (
          <g>
            <line x1={left} x2={W - right} y1={y(meta)} y2={y(meta)} stroke="#c9a23f" strokeDasharray="2 4" />
            <text x={left + 4} y={y(meta) - 6} fontSize="10.5" fontWeight="600" letterSpacing=".06em" fill="#93721f">META {moneyShort(meta)}</text>
            <line x1={x(a)} y1={y(0)} x2={x(e)} y2={y(meta)} stroke="#0b1324" strokeWidth="1.4" strokeDasharray="5 5" opacity=".5" />
          </g>
        )}
        {acum && now >= a && now < e && (
          <g>
            <line x1={x(now)} x2={x(now)} y1={top} y2={vBot} stroke="#cbd5e1" strokeDasharray="3 3" />
            <text x={x(now)} y={top - 6} textAnchor="middle" fontSize="10" fontWeight="600" letterSpacing=".06em" fill="#64748b">HOY</text>
          </g>
        )}

        <g clipPath={`url(#${clipId})`}>
          {pts.filter((p) => p.cierres).map((p) => (
            <rect key={'v' + p.id} x={x(p.d) - bw / 2} width={bw} y={yv(p.cierres)} height={vBot - yv(p.cierres)} rx={Math.min(2, bw / 2)} fill={p.cambio >= 0 ? UP : DN} opacity=".38" />
          ))}
          <path d={area} fill="url(#lmArea)" />
          {!acum && <path d={path(pts, (p) => p.media)} fill="none" stroke="#c9a23f" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />}
          <path d={line} fill="none" stroke="#1d2b53" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          {!acum && pts.filter((p) => p.monto > 0).map((p) => (
            <circle key={'c' + p.id} cx={x(p.d)} cy={y(p.monto)} r="2.8" fill="#fff" stroke={p.cambio >= 0 ? UP : DN} strokeWidth="1.6" />
          ))}
        </g>

        {!acum && best.monto > 0 && (
          <g className="lm-late">
            <circle cx={ppx} cy={ppy} r="6.5" fill="none" stroke="#1d2b53" strokeWidth="1.4" />
            <line x1={ppx} x2={ppx} y1={ply + 20} y2={ppy - 7} stroke="#1d2b53" />
            <rect x={plx} y={ply} width={plw} height="20" rx="5" fill="#0b1324" />
            <text x={plx + plw / 2} y={ply + 10} dy=".35em" textAnchor="middle" fontSize="11" fontWeight="600" fill="#fff">{peakLab}</text>
          </g>
        )}

        <g className="lm-late">
          <line x1={x(last.d)} x2={W - right + 2} y1={ly} y2={ly} stroke="#1d2b53" strokeDasharray="2 3" opacity=".6" />
          <circle className="lm-pulse" cx={x(last.d)} cy={ly} r="4" fill="#4a5f8f" />
          <circle cx={x(last.d)} cy={ly} r="4" fill="#1d2b53" stroke="#fff" strokeWidth="2" />
          <rect x={W - right + 2} y={ly - 10} width={tw(tagTxt, 11, 600) + 12} height="20" rx="4" fill="#1d2b53" />
          <text x={W - right + 2 + (tw(tagTxt, 11, 600) + 12) / 2} y={ly} dy=".35em" textAnchor="middle" fontSize="11" fontWeight="600" fill="#fff">{tagTxt}</text>
        </g>

        {hover && (() => {
          const hx = x(hover.p.d), hy = y(val(hover.p)), t = moneyShort(val(hover.p)), w = tw(t, 11, 600) + 12;
          return (
            <g pointerEvents="none">
              <line x1={hx} x2={hx} y1={top} y2={vBot} stroke="#64748b" strokeDasharray="3 3" />
              <line x1={left} x2={W - right} y1={hy} y2={hy} stroke="#64748b" strokeDasharray="3 3" />
              <circle cx={hx} cy={hy} r="5" fill="#1d2b53" stroke="#fff" strokeWidth="2" />
              <rect x={W - right + 2} y={hy - 10} width={w} height="20" rx="4" fill="#0b1324" />
              <text x={W - right + 2 + w / 2} y={hy} dy=".35em" textAnchor="middle" fontSize="11" fontWeight="600" fill="#fff">{t}</text>
            </g>
          );
        })()}
        <rect x={left} y="0" width={W - right - left} height={vBot} fill="transparent" onMouseMove={onMove} onMouseLeave={() => setHover(null)} />
      </svg>
      <Tooltip tip={hover} />
    </div>
  );
}

/* =========================================================
   Podio
   ========================================================= */
function Podium({ rk, onPick }) {
  return (
    <div className="lm-podium">
      {[1, 0, 2].map((i) => {
        const r = rk[i];
        const visible = r && r.vendido > 0;
        return (
          <div key={i} className={`lm-pod p${i + 1}${visible ? '' : ' empty'}`} onClick={() => r && onPick(r.broker)}
            role={r ? 'button' : undefined} tabIndex={r ? 0 : undefined} aria-label={r ? `Ver la curva de ${r.broker}` : undefined}
            onKeyDown={(e) => { if (r && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onPick(r.broker); } }}>
            {r && (
              <>
                <div className="lm-medal"><Medal n={r.puesto} size={i === 0 ? 48 : 40} /></div>
                <div className="lm-av" data-ini={initials(r.broker)} />
                <div className="lm-pname">{r.broker}</div>
                <div className="lm-ppct num"><CountUp value={r.pct} fmt={pct} resetKey={r.id} /></div>
                <div className="lm-pmoney num">{money(r.vendido)}</div>
                <div className="lm-ped">
                  <div className="lm-pcl">Copas</div>
                  <div className="lm-pcups"><Trophy size={16} /><span className="num">{int(r.copas)}</span></div>
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* =========================================================
   Vendido vs. meta personal (bullet chart)
   ========================================================= */
function BulletChart({ rk, sel, onPick }) {
  const armed = useArmed(200);
  const ref = useRef(null);
  const [tip, setTip] = useState(null);
  const xMax = Math.max(1, ...rk.map((r) => Math.max(r.meta, r.vendido))) * 1.05;
  const { ticks } = niceScale(xMax, 4);
  const toPct = (v) => (v / xMax) * 100 + '%';
  const tint = ['#fbf6e7', '#f3f5f8', '#fbf1e8'], ink = ['#8f6f22', '#5b6672', '#8a4f24'];
  return (
    <div className="lm-bullet" ref={ref}>
      {rk.map((r, i) => (
        <div key={r.id} className={'lm-brow' + (sel === r.broker ? ' sel' : sel ? ' dim' : '')} onClick={() => onPick(r.broker)}
          role="button" tabIndex={0} aria-pressed={sel === r.broker} aria-label={`Ver la curva de ${r.broker}`}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPick(r.broker); } }}
          onMouseMove={(ev) => setTip({ ...tipPos(ev, ref.current, 200, 110), title: `${r.broker} · puesto ${r.puesto}`, lines: [['Vendido', '#1d2b53', money(r.vendido)], ['Meta personal', '#c7d4ee', money(r.meta)], ['Avance', null, pct(r.pct)], ['Copas', '#c9a23f', int(r.copas)]] })}
          onMouseLeave={() => setTip(null)}>
          <div className="lm-bname">
            <span className="lm-bav" style={{ background: r.puesto <= 3 ? tint[r.puesto - 1] : '#eef3ff', color: r.puesto <= 3 ? ink[r.puesto - 1] : '#1d2b53' }}>{initials(r.broker)}</span>
            {r.broker}
          </div>
          <div className="lm-btrack">
            {ticks.slice(1).map((t) => t < xMax && <i key={t} className="grid" style={{ left: toPct(t) }} />)}
            <div className="goal" style={{ width: toPct(r.meta) }} />
            <div className={'fill p' + Math.min(r.puesto, 4)} style={{ width: armed ? toPct(r.vendido) : 0, transitionDelay: i * 80 + 'ms' }} />
            {r.meta > 0 && <i className="mark" style={{ left: toPct(r.meta) }} />}
          </div>
          <div className={'lm-bpct num' + (r.pct >= 1 ? ' ok' : '')}>{pct(r.pct)}</div>
        </div>
      ))}
      <div className="lm-baxis">
        <span />
        <div className="lm-btrack axis">{ticks.map((t) => t <= xMax && <span key={t} style={{ left: toPct(t) }}>{moneyShort(t)}</span>)}</div>
        <span />
      </div>
      <Tooltip tip={tip} />
    </div>
  );
}

/* =========================================================
   Anillo de % (tabla)
   ========================================================= */
function Ring({ r, delay }) {
  const armed = useArmed(250 + delay);
  const done = r.pct >= 1, C = 2 * Math.PI * 23, C2 = 2 * Math.PI * 27.5;
  const stroke = rankFill(r.puesto, done ? '#059669' : 'url(#lmBrand)');
  const p = Math.min(1, Math.max(0, r.pct || 0));
  return (
    <div className={'lm-ring' + (done ? ' done' : '')}>
      <svg viewBox="0 0 54 54">
        <circle cx="27" cy="27" r="23" fill="none" stroke="#eef2f7" strokeWidth="5" />
        <circle cx="27" cy="27" r="23" fill="none" stroke={stroke} strokeWidth="5" strokeLinecap="round" strokeDasharray={C}
          strokeDashoffset={C * (1 - (armed ? p : 0))} className="arc" strokeOpacity={r.pct ? 1 : 0} />
        {r.pct > 1 && (
          <circle cx="27" cy="27" r="27.5" fill="none" stroke="#c9a23f" strokeWidth="2" strokeLinecap="round" strokeDasharray={C2}
            strokeDashoffset={C2 * (1 - (armed ? Math.min(1, r.pct - 1) : 0))} className="arc" />
        )}
      </svg>
      <span className="num">{pct(r.pct)}</span>
    </div>
  );
}

function RankingTable({ rk, sel, onPick }) {
  return (
    <div className="lm-tablewrap">
      <table className="lm-table">
        <thead>
          <tr>
            <th>Pos.</th><th>Broker</th><th>Avance</th><th className="r">Vendido</th>
            <th className="r lm-hide">Meta personal</th><th className="r lm-hide">Brecha</th><th className="r lm-hide">Cierres</th><th className="r">Copas</th>
          </tr>
        </thead>
        <tbody>
          {rk.map((r, i) => (
            <tr key={r.id} style={{ '--i': i }} onClick={() => onPick(r.broker)}
              className={(r.puesto <= 3 ? 'r' + r.puesto : '') + (sel === r.broker ? ' sel' : sel ? ' dim' : '')}>
              <td>{r.puesto <= 3 ? <Medal n={r.puesto} size={22} /> : <span className="lm-rank">{r.puesto}</span>}</td>
              <td><span className={'lm-who' + (r.pct >= 1 ? ' done' : '')} data-ini={initials(r.broker)}>{r.broker}</span></td>
              <td><Ring r={r} delay={i * 70} /></td>
              <td className="r">{money(r.vendido)}</td>
              <td className="r lm-hide">{money(r.meta)}</td>
              <td className="r lm-hide"><span className={'lm-gap' + (r.brecha <= 0 ? ' ok' : '')}>{money(r.brecha)}</span></td>
              <td className="r lm-hide">{int(r.cierres)}</td>
              <td className="r">
                <span className={'lm-cups' + (r.copas ? '' : ' zero')}>
                  {Array.from({ length: Math.min(Math.max(r.copas, 1), 5) }, (_, k) => <Trophy key={k} size={15} />)}
                  <em>{int(r.copas)}</em>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* =========================================================
   Cumplimiento mensual
   ========================================================= */
function MonthlyChart({ resumen, vista, periodo }) {
  const ref = useRef(null);
  const W = Math.max(300, useWidth(ref) || 800);
  const [tip, setTip] = useState(null);
  const H = 280, year = periodo.slice(0, 4);
  const [a, e] = rangeOf(vista, periodo);
  const months = Array.from({ length: 12 }, (_, m) => year + '-' + String(m + 1).padStart(2, '0'));
  const byId = new Map(resumen.filter((r) => r.vista === 'mes').map((r) => [r.periodo, r]));
  const data = months.map((m) => byId.get(m) || { periodo: m, meta: 0, vendido: 0, pct: null });
  const { ticks, max } = niceScale(Math.max(1, ...data.map((d) => Math.max(d.meta, d.vendido))) * 1.15, 4);
  const top = 18, base = H - 30;
  const y = (v) => base - (v / max) * (base - top);
  const left = Math.max(...ticks.map((t) => tw(moneyShort(t)))) + 14;
  const stepW = (W - 4 - left) / 12, bw = Math.min(stepW * 0.7, 46);
  const cx = (i) => left + stepW * i + stepW / 2;
  const inSel = (m) => { const d = new Date(Number(m.slice(0, 4)), Number(m.slice(5, 7)) - 1, 1); return d >= a && d < e; };
  return (
    <div className="lm-chart" ref={ref} style={{ minHeight: H }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
        {ticks.map((t) => <line key={t} x1={left} x2={W - 4} y1={y(t)} y2={y(t)} stroke="#eef1f5" />)}
        {ticks.map((t) => <text key={'t' + t} x={left - 10} y={y(t)} dy=".32em" textAnchor="end" fontSize="11" fill="#94a3b8">{moneyShort(t)}</text>)}
        {data.map((d, i) => inSel(d.periodo) && <rect key={'s' + i} x={left + stepW * i} width={stepW} y="6" height={H - 30} fill="#f7f9fc" rx="8" />)}
        {data.map((d, i) => (
          <g key={d.periodo} style={{ '--i': i }}>
            <rect className="lm-grow" x={cx(i) - bw / 2} width={bw} y={y(d.meta)} height={base - y(d.meta)} rx="6" fill="#e8eef9" />
            <rect className="lm-grow lm-grow2" x={cx(i) - bw * 0.3} width={bw * 0.6} y={y(d.vendido)} height={base - y(d.vendido)} rx="4"
              fill={d.meta && d.vendido >= d.meta ? 'url(#lmBarGold)' : 'url(#lmBarG)'} opacity={inSel(d.periodo) ? 1 : 0.5} />
            {d.meta > 0 && <text x={cx(i)} y={y(Math.max(d.meta, d.vendido)) - 7} textAnchor="middle" fontSize="11" fontWeight="600" fill={d.pct >= 1 ? '#93721f' : '#334155'}>{pct(d.pct)}</text>}
            <text x={cx(i)} y={H - 8} textAnchor="middle" fontSize="11.5" fontWeight={inSel(d.periodo) ? 600 : 400} fill={inSel(d.periodo) ? '#0b1324' : '#94a3b8'}>{fmtMon(i)}</text>
            <rect x={left + stepW * i} width={stepW} y="0" height={H - 24} fill="transparent"
              onMouseMove={(ev) => setTip({ ...tipPos(ev, ref.current, 180, 80), title: label('mes', d.periodo), lines: [['Meta', '#c7d4ee', money(d.meta)], ['Vendido', '#1d2b53', money(d.vendido)], ['Avance', null, pct(d.pct)]] })}
              onMouseLeave={() => setTip(null)} />
          </g>
        ))}
        <line x1={left} x2={W - 4} y1={base} y2={base} stroke="#d5dce5" />
      </svg>
      <Tooltip tip={tip} />
    </div>
  );
}

/* =========================================================
   KPI
   ========================================================= */
function Kpi({ i, label: l, icon, gold, value, fmt, resetKey, children, bar }) {
  const armed = useArmed(100);
  return (
    <div className="lm-card lm-kpi" style={{ '--i': i }}>
      <div className="lm-kh"><span className="lm-kl">{l}</span><span className={'lm-ki' + (gold ? ' gold' : '')}>{icon}</span></div>
      <div className="lm-kv num"><CountUp value={value} fmt={fmt} resetKey={resetKey} /></div>
      {bar != null && <div className="lm-kbar"><div style={{ width: armed ? Math.min(100, bar * 100) + '%' : 0 }} /></div>}
      <div className="lm-ks">{children}</div>
    </div>
  );
}

/* =========================================================
   Componente principal
   ========================================================= */
const VISTAS = [['mes', 'Mensual'], ['trimestre', 'Trimestral'], ['año', 'Anual']];
const VISTA_TXT = { mes: 'del mes', trimestre: 'del trimestre', 'año': 'del año' };

export default function LigaDeMetas({ metas, equipo, ventas, titulo = 'Liga de metas de brokers', simbolo, copa }) {
  configurarLiga({ simbolo, copa });
  const resumen = useMemo(() => calcResumen(metas, ventas, equipo), [metas, ventas, equipo]);
  const ranking = useMemo(() => calcRanking(metas, ventas, equipo), [metas, ventas, equipo]);
  const tendencia = useMemo(() => calcTendencia(ventas), [ventas]);

  const [vista, setVista] = useState('mes');
  const [periodo, setPeriodo] = useState(null);
  const [sel, setSel] = useState(null);
  const [modo, setModo] = useState('diario');

  const list = useMemo(() => resumen.filter((r) => r.vista === vista).map((r) => r.periodo).sort(), [resumen, vista]);
  const tk = todayKey(vista);
  const per = periodo && list.includes(periodo) ? periodo : list.includes(tk) ? tk : list[list.length - 1];

  if (!per) return <div className="lm"><Defs /><div className="lm-empty-page">Aún no hay metas ni ventas cargadas.</div></div>;

  const key = vista + ':' + per;
  const s = resumen.find((r) => r.id === key);
  const rk = ranking.filter((r) => r.vista === vista && r.periodo === per).sort((x, y) => x.puesto - y.puesto);
  const selB = sel && rk.some((r) => r.broker === sel) ? sel : null;
  const selRow = selB ? rk.find((r) => r.broker === selB) : null;
  const pick = (b) => setSel((x) => (x === b ? null : b));
  const idx = list.indexOf(per);
  const go = (d) => list[idx + d] && setPeriodo(list[idx + d]);
  const lider = rk[0];
  const isDay = vista === 'mes';

  const pts = tendencia
    .filter((r) => r.vista === vista && r.periodo === per && (selRow ? r.alcance === 'broker' && r.broker === selB : r.alcance === 'equipo'))
    .sort((x, y) => (x.fecha < y.fecha ? -1 : 1))
    .map((r) => ({ ...r, d: parseD(r.fecha) }));
  const lastP = pts[pts.length - 1];
  const bestP = pts.length ? pts.reduce((m, p) => (p.monto > m.monto ? p : m), pts[0]) : null;
  const trendKey = key + ':' + modo + ':' + (selB || '');

  return (
    <div className="lm">
      <Defs />
      <header className="lm-head">
        <div>
          <div className="lm-eyebrow"><i />Panel comercial · Metas</div>
          <h1 className="lm-h1">{titulo}</h1>
          <p className="lm-take">
            {!s.meta ? <>Sin meta definida para {label(vista, per)}. Vendido: <b>{money(s.vendido)}</b>.</>
              : s.pct >= 1 ? <>Meta {VISTA_TXT[vista]} superada: el equipo cerró al <b>{pct(s.pct)}</b> de su objetivo.</>
                : <>El equipo lleva el <b>{pct(s.pct)}</b> de la meta {VISTA_TXT[vista]} y le faltan <b>{money(s.faltan)}</b>.</>}
            {lider && lider.vendido > 0 && <> Lidera <b>{lider.broker}</b> con <b>{pct(lider.pct)}</b> de su meta personal.</>}
          </p>
        </div>
        <div className="lm-controls">
          <div className="lm-seg" role="group" aria-label="Vista">
            {VISTAS.map(([v, l]) => <button key={v} type="button" aria-pressed={vista === v} onClick={() => { setVista(v); setPeriodo(null); }}>{l}</button>)}
          </div>
          <div className="lm-nav">
            <button type="button" aria-label="Periodo anterior" disabled={idx <= 0} onClick={() => go(-1)}><Icon size={16}><path d="m15 18-6-6 6-6" /></Icon></button>
            <div className="lm-plabel">{label(vista, per)}</div>
            <button type="button" aria-label="Periodo siguiente" disabled={idx >= list.length - 1} onClick={() => go(1)}><Icon size={16}><path d="m9 18 6-6-6-6" /></Icon></button>
          </div>
        </div>
      </header>

      <div key={key} className="lm-body lm-enter">
        <div className="lm-g">
          <section className="lm-card s4">
            <div className="lm-ch"><div><h2>Meta colectiva</h2><p>Avance del equipo · {label(vista, per)}</p></div></div>
            <Gauge s={s} vista={vista} periodo={per} />
            <StatusChips s={s} vista={vista} periodo={per} />
            <div className="lm-gfoot">
              <div><div className="k">Vendido</div><div className="v num"><CountUp value={s.vendido} fmt={money} resetKey={key} /></div></div>
              <div style={{ textAlign: 'right' }}><div className="k">Meta</div><div className="v num"><CountUp value={s.meta} fmt={money} resetKey={key} /></div></div>
            </div>
          </section>

          <section className="lm-card s8">
            <div className="lm-ch">
              <div>
                <h2>Tendencia de ventas</h2>
                <p>{(selRow ? selB : 'Equipo completo') + ' · ' + (modo === 'diario' ? `ventas por ${isDay ? 'día' : 'semana'} con media móvil` : 'acumulado contra el ritmo de la meta') + (selRow ? '' : ' · clic en un broker para ver su curva')}</p>
              </div>
              <div className="lm-controls">
                {selRow && <button type="button" className="lm-chip btn" onClick={() => setSel(null)}>Ver equipo ×</button>}
                <div className="lm-seg sm" role="group" aria-label="Tipo de gráfico">
                  <button type="button" aria-pressed={modo === 'diario'} onClick={() => setModo('diario')}>{isDay ? 'Por día' : 'Por semana'}</button>
                  <button type="button" aria-pressed={modo === 'acumulado'} onClick={() => setModo('acumulado')}>Acumulado</button>
                </div>
              </div>
            </div>
            <div className="lm-stats">
              <div><div className="k">{isDay ? 'Último día' : 'Última semana'}</div>
                <div className="v"><span className="num">{lastP ? money(lastP.monto) : '—'}</span>
                  {lastP && <span className={'lm-delta num ' + (lastP.cambio > 0 ? 'up' : lastP.cambio < 0 ? 'down' : 'flat')}>{(lastP.cambio > 0 ? '+' : '') + money(lastP.cambio)}</span>}</div></div>
              <div><div className="k">{isDay ? 'Mejor día' : 'Mejor semana'}</div><div className="v num">{bestP ? money(bestP.monto) : '—'}</div><div className="d">{bestP ? (isDay ? '' : 'Semana del ') + fmtDay(bestP.d) : ''}</div></div>
              <div><div className="k">{isDay ? 'Media móvil 7 días' : 'Media móvil 4 semanas'}</div><div className="v num">{lastP ? money(lastP.media) : '—'}</div></div>
              <div><div className="k">Acumulado</div><div className="v num">{lastP ? money(lastP.acumulado) : '—'}</div></div>
            </div>
            <div className="lm-legend" style={{ marginBottom: 6 }}>
              {modo === 'acumulado'
                ? <><span><i className="line" style={{ background: '#1d2b53' }} />Acumulado</span><span><i className="dash" />Ritmo para cumplir</span></>
                : <><span><i className="line" style={{ background: '#1d2b53' }} />Ventas por {isDay ? 'día' : 'semana'}</span><span><i className="line" style={{ background: '#c9a23f' }} />{isDay ? 'Media móvil 7 días' : 'Media móvil 4 semanas'}</span><span><i style={{ background: '#059669', opacity: 0.5 }} />Sube</span><span><i style={{ background: '#dc2626', opacity: 0.5 }} />Baja</span></>}
            </div>
            <TrendChart key={trendKey} pts={pts} meta={selRow ? selRow.meta : s.meta} vista={vista} periodo={per} modo={modo} />
          </section>
        </div>

        <div className="lm-kpis">
          <Kpi i={0} label="Vendido" icon={ICONS.vendido} value={s.vendido} fmt={money} resetKey={key} bar={s.pct || 0}><b className="num">{pct(s.pct)}</b> de la meta colectiva</Kpi>
          <Kpi i={1} label="Meta colectiva" icon={ICONS.meta} value={s.meta} fmt={money} resetKey={key}>Promedio <b className="num">{money(s.meta_promedio)}</b> por broker</Kpi>
          <Kpi i={2} label="Brecha por cerrar" icon={ICONS.brecha} value={s.faltan} fmt={money} resetKey={key}>{s.meta && s.faltan === 0 ? 'Meta alcanzada' : 'Para alcanzar el 100%'}</Kpi>
          <Kpi i={3} label="Cierres" icon={ICONS.cierres} value={s.cierres} fmt={int} resetKey={key}>Ticket promedio <b className="num">{money(s.ticket)}</b></Kpi>
          <Kpi i={4} label="Copas del equipo" icon={ICONS.copas} gold value={s.copas} fmt={int} resetKey={key}>1 copa = {money(COPA)} vendidos</Kpi>
        </div>

        <div className="lm-g">
          <section className="lm-card s5">
            <div className="lm-ch"><div><h2>Podio del periodo</h2><p>Top 3 por % de meta personal cumplida</p></div></div>
            <Podium rk={rk} onPick={pick} />
          </section>
          <section className="lm-card s7">
            <div className="lm-ch">
              <div><h2>Vendido vs. meta personal</h2><p>Cada barra es lo vendido; la marca vertical es la meta del broker</p></div>
              <div className="lm-legend"><span><i style={{ background: '#1d2b53' }} />Vendido</span><span><i style={{ background: '#e8eef9' }} />Meta personal</span></div>
            </div>
            <BulletChart rk={rk} sel={selB} onPick={pick} />
          </section>
        </div>

        <section className="lm-card lm-mb">
          <div className="lm-ch"><div><h2>Ranking de brokers</h2><p>Meta personal = meta colectiva repartida en partes iguales, salvo brokers con meta fija</p></div></div>
          <RankingTable rk={rk} sel={selB} onPick={pick} />
        </section>

        <section className="lm-card lm-mb">
          <div className="lm-ch">
            <div><h2>Cumplimiento mensual</h2><p>Meta colectiva vs. vendido por mes · {per.slice(0, 4)}</p></div>
            <div className="lm-legend"><span><i style={{ background: '#e8eef9' }} />Meta</span><span><i style={{ background: '#1d2b53' }} />Vendido</span><span><i style={{ background: '#c9a23f' }} />Meta superada</span></div>
          </div>
          <MonthlyChart resumen={resumen} vista={vista} periodo={per} />
        </section>
        <p className="lm-foot">Ranking por % de meta personal cumplida; en empate gana quien más vendió. Cada copa equivale a {money(COPA)} en ventas.</p>
      </div>
    </div>
  );
}
