import { useMemo, useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getWell } from '../data/wellProvider';
import { solveCoupledChain } from '../simulation/physics';
import { apiRp11LMechanics, pumpFillageFrac, rodFloatAnalysis, synthesizePumpCard, synthesizeSurfaceCard, vogelIpr } from '../engineering/correlations';
import { SRP } from '../engineering/fieldConstants';
import { Readout, SimTag, StatBlock } from '../components/common';
import type { SrpPoint } from '../types';
import { flowingBhpBar } from '../simulation/physics';

function CardSvg({
  data,
  color,
  title,
  domain,
  refLines,
}: {
  data: Array<{ position: number; loadLb: number }>;
  color: string;
  title: string;
  /** Fixed [lo, hi] load scale — shared across renders so the loop visibly
   *  grows, shifts and pounds as the operating point moves instead of
   *  rescaling itself into an identical box. */
  domain: readonly [number, number];
  refLines?: Array<{ value: number; label: string; dashed?: boolean }>;
}) {
  const w = 300;
  const h = 190;
  const [lo, hi] = domain;
  const span = Math.max(1, hi - lo);
  const X = (p: number) => 34 + p * (w - 48);
  const Y = (l: number) => 12 + (1 - (l - lo) / span) * (h - 40);
  const d = data.map((p, i) => `${i === 0 ? 'M' : 'L'} ${X(p.position).toFixed(1)} ${Y(p.loadLb).toFixed(1)}`).join(' ') + ' Z';
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => lo + t * span);
  return (
    <div>
      <div className="cite" style={{ marginBottom: 4 }}>{title}</div>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="190">
        {ticks.map((t) => (
          <g key={t}>
            <line x1="34" y1={Y(t)} x2={w - 8} y2={Y(t)} stroke="var(--border-soft)" strokeWidth={t === ticks[0] ? 1 : 0.5} opacity={0.7} />
            <text x="2" y={Y(t) + 3} fontSize="8" fill="var(--text-faint)">{(t / 1000).toFixed(1)}k</text>
          </g>
        ))}
        <line x1="34" y1="10" x2="34" y2={h - 24} stroke="var(--border)" />
        <line x1="34" y1={h - 24} x2={w - 8} y2={h - 24} stroke="var(--border)" />
        <text x={w - 52} y={h - 8} fontSize="9" fill="var(--text-faint)">stroke →</text>
        {refLines?.map((r) => (
          <g key={r.label}>
            <line x1="34" y1={Y(r.value)} x2={w - 8} y2={Y(r.value)} stroke={color} strokeWidth="1" strokeDasharray="5 3" opacity={0.85} />
            <text x={w - 8} y={Y(r.value) - 3} fontSize="8" fill={color} textAnchor="end">{r.label}</text>
          </g>
        ))}
        <path d={d} fill={`${color}22`} stroke={color} strokeWidth="1.75" />
      </svg>
    </div>
  );
}

export default function SrpOptimization({ wellId }: { wellId: string }) {
  const well = getWell(wellId);
  if (!well) return <div className="page"><div className="empty-state">Well not found.</div></div>;

  const [point, setPoint] = useState<SrpPoint>({ spm: well.spm, strokeIn: well.strokeIn, vfdHz: well.vfdHz });

  const cssPlan = {
    steamVolumeM3: well.steamVolumeM3,
    injectionPressureBar: well.injectionPressureBar,
    injectionDurationHours: well.injectionDurationHours,
    soakHours: well.soakHours,
    productionCutoffWaterCut: well.productionCutoffWaterCut,
  };

  const chain = solveCoupledChain(cssPlan, point, well.reservoirTempC, well.reservoirPressureBar, well.apiGravity, well.waterCutPct / 100, well.permeabilityMD);

  // Mechanics + cards at live point — recomputed every render (97 points is
  // microseconds; no memo, so the cards can never go stale behind the sliders).
  const pwf = flowingBhpBar(well.reservoirPressureBar, chain.fillageFrac * 100);
  const inflow = vogelIpr(well.reservoirPressureBar, pwf, chain.viscosityCp, chain.heatedRadiusM, well.permeabilityMD).rateAtPwfBopd;
  const mech = apiRp11LMechanics(point.spm, point.strokeIn, SRP.plungerDiameterIn, SRP.pumpDepthM, chain.viscosityCp, well.waterCutPct / 100, chain.fillageFrac);
  const fill = pumpFillageFrac(inflow, mech.pumpDisplacementBpd);
  const surface = synthesizeSurfaceCard(mech, fill, chain.viscosityCp, 0.06, 0, point.spm, point.strokeIn);
  const pump = synthesizePumpCard(surface, mech);
  const rf = rodFloatAnalysis(mech, fill);

  // Fixed load-scale envelope per well: mechanics evaluated over the full
  // slider ranges (thermal state is fixed on this page), so both cards keep
  // one stable axis and every slider move reads as loop motion on video.
  const envelope = useMemo(() => {
    let sLo = Infinity;
    let sHi = -Infinity;
    let pLo = Infinity;
    let pHi = -Infinity;
    for (const s of [3, 4.8, 6.6]) {
      for (const st of [64, 75, 86]) {
        const m = apiRp11LMechanics(s, st, SRP.plungerDiameterIn, SRP.pumpDepthM, chain.viscosityCp, well.waterCutPct / 100, 0.7);
        const span = Math.max(600, m.peakPolishedRodLoadLb - m.minPolishedRodLoadLb);
        sLo = Math.min(sLo, m.minPolishedRodLoadLb - 0.22 * span);
        sHi = Math.max(sHi, m.peakPolishedRodLoadLb + 0.22 * span);
        const pTop = (m.peakPolishedRodLoadLb - m.rodWeightBuoyedLb) * 0.92;
        const pBot = (m.minPolishedRodLoadLb - m.rodWeightBuoyedLb) * 0.92;
        pLo = Math.min(pLo, Math.min(pTop, pBot) - 0.2 * span);
        pHi = Math.max(pHi, Math.max(pTop, pBot) + 0.2 * span);
      }
    }
    return { surface: [sLo, sHi] as const, pump: [pLo, pHi] as const };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wellId, chain.viscosityCp]);

  const spmSweep = useMemo(() => {
    const pts: Array<{ spm: number; production: number; fillage: number; goodman: number }> = [];
    for (let s = 3; s <= 6.6; s += 0.2) {
      const c = solveCoupledChain(cssPlan, { ...point, spm: Math.round(s * 10) / 10 }, well.reservoirTempC, well.reservoirPressureBar, well.apiGravity, well.waterCutPct / 100, well.permeabilityMD);
      pts.push({ spm: Math.round(s * 10) / 10, production: c.liftedBopd, fillage: Math.round(c.fillageFrac * 1000) / 10, goodman: c.goodmanRatio });
    }
    return pts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [point.strokeIn, point.vfdHz, wellId]);

  const riskTone = (v: number) => (v >= 65 ? 'red' : v >= 35 ? 'amber' : 'green');

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">SRP Optimization — {well.id}</div>
          <div className="page-subtitle">
            API RP 11L · {SRP.plungerDiameterIn}-in. plunger @ {SRP.pumpDepthM} m · Grade-D rods · heated μ {(chain.viscosityCp / 1000).toFixed(1)}k cP · inflow {inflow.toFixed(1)} BOPD
          </div>
        </div>
        <SimTag>Surface + pump cards live</SimTag>
      </div>

      <div className="grid grid-2" style={{ alignItems: 'start' }}>
        <div className="panel">
          <div className="panel-title">Operating point</div>
          <div className="control-row">
            <div className="control-label"><span>SPM</span><span className="val">{point.spm.toFixed(1)}</span></div>
            <input type="range" min={3} max={6.6} step={0.1} value={point.spm} onChange={(e) => setPoint({ ...point, spm: Number(e.target.value) })} />
          </div>
          <div className="control-row">
            <div className="control-label"><span>Stroke length</span><span className="val">{point.strokeIn} in</span></div>
            <input type="range" min={64} max={86} step={1} value={point.strokeIn} onChange={(e) => setPoint({ ...point, strokeIn: Number(e.target.value) })} />
          </div>
          <div className="control-row">
            <div className="control-label"><span>VFD frequency</span><span className="val">{point.vfdHz.toFixed(1)} Hz</span></div>
            <input type="range" min={35} max={55} step={0.5} value={point.vfdHz} onChange={(e) => setPoint({ ...point, vfdHz: Number(e.target.value) })} />
          </div>
          <button className="btn" onClick={() => setPoint({ spm: well.spm, strokeIn: well.strokeIn, vfdHz: well.vfdHz })}>Reset to current point</button>
          <div className="divider" />
          <div className="grid grid-2" data-tour="srp-cards">
            <CardSvg
              data={surface}
              color="var(--amber)"
              title={`Surface card — PPRL ${mech.peakPolishedRodLoadLb.toLocaleString()} lb / MPRL ${mech.minPolishedRodLoadLb.toLocaleString()} lb`}
              domain={envelope.surface}
              refLines={[
                { value: mech.peakPolishedRodLoadLb, label: `PPRL ${(mech.peakPolishedRodLoadLb / 1000).toFixed(1)}k` },
                { value: mech.minPolishedRodLoadLb, label: `MPRL ${(mech.minPolishedRodLoadLb / 1000).toFixed(1)}k` },
              ]}
            />
            <CardSvg
              data={pump}
              color="var(--blue)"
              title={`Pump (downhole) card — fluid load ${mech.fluidLoadLb.toLocaleString()} lb · fillage ${(fill * 100).toFixed(1)}%`}
              domain={envelope.pump}
              refLines={[{ value: mech.fluidLoadLb * 0.92, label: `Fo ${(mech.fluidLoadLb / 1000).toFixed(1)}k` }]}
            />
          </div>
          <div className="chart-note">
            Both cards share one fixed load scale per well — the loop itself grows, shifts and pounds as you
            move SPM, stroke or VFD. Fluid-pound shoulder grows as fillage falls below ~92%; high SPM skews
            the loop (rod-string inertia) and rounds the top-right corner; longer stroke widens elastic
            rounding. Read the shoulder position — it is the fillage meter.
          </div>
        </div>

        <div className="grid" style={{ gap: 12 }}>
          <div className="grid grid-2">
            <StatBlock label="Pump displacement (RP 11L)" value={mech.pumpDisplacementBpd} unit="BPD" />
            <StatBlock label="Pump fillage" value={(fill * 100).toFixed(1)} unit="%" />
            <StatBlock label="Lifted production" value={chain.liftedBopd} unit="BOPD" />
            <StatBlock label="Volumetric efficiency" value={`${(mech.volumetricEfficiencyFrac * 100).toFixed(1)}`} unit="%" />
            <StatBlock label="Peak / min load" value={`${(mech.peakPolishedRodLoadLb / 1000).toFixed(2)} / ${(mech.minPolishedRodLoadLb / 1000).toFixed(2)}`} unit="klb" />
            <StatBlock label="PRHP / motor" value={chain.prhpKw} unit="kW" />
          </div>

          <div className="panel" data-tour="srp-integrity">
            <div className="panel-title">Mechanical integrity</div>
            <Readout label="Goodman ratio (limit 0.80)" value={mech.goodmanRatio.toFixed(2)} tone={mech.goodmanRatio >= 0.8 ? 'red' : mech.goodmanRatio >= 0.55 ? 'amber' : 'green'} />
            <Readout label="Rod-float margin" value={`${rf.marginLb.toLocaleString()} lbf ${rf.floats ? '— FLOATING' : ''}`} tone={rf.floats ? 'red' : rf.marginLb < 900 ? 'amber' : 'green'} />
            <Readout label="Rod-floating risk" value={`${chain.rodFloatRisk}`} tone={riskTone(chain.rodFloatRisk)} />
            <Readout label="Impact-loading risk" value={`${chain.impactRisk}`} tone={riskTone(chain.impactRisk)} />
            <Readout label="Viscous drag on rods" value={`${mech.viscousDragLb.toLocaleString()} lbf`} />
          </div>

          <div className="panel">
            <div className="panel-title"><span>SPM sweep — the pump-off cliff</span><span className="cite">stroke {point.strokeIn} in</span></div>
            <ResponsiveContainer width="100%" height={190}>
              <LineChart data={spmSweep}>
                <CartesianGrid stroke="var(--border-soft)" vertical={false} />
                <XAxis dataKey="spm" stroke="var(--text-faint)" fontSize={10} label={{ value: 'SPM', position: 'insideBottomRight', fontSize: 10, fill: 'var(--text-faint)' }} />
                <YAxis yAxisId="l" stroke="var(--text-faint)" fontSize={10} width={40} />
                <YAxis yAxisId="r" orientation="right" stroke="var(--text-faint)" fontSize={10} width={40} />
                <Tooltip contentStyle={{ background: 'var(--bg-panel-raised)', border: '1px solid var(--border)', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <ReferenceLine yAxisId="l" x={point.spm} stroke="var(--amber)" strokeDasharray="4 3" />
                <Line yAxisId="l" type="monotone" dataKey="production" stroke="var(--green)" strokeWidth={2} dot={false} name="BOPD" />
                <Line yAxisId="l" type="monotone" dataKey="fillage" stroke="var(--blue)" strokeWidth={1.5} dot={false} name="Fillage %" />
                <Line yAxisId="r" type="monotone" dataKey="goodman" stroke="var(--red)" strokeWidth={1.25} dot={false} name="Goodman" />
              </LineChart>
            </ResponsiveContainer>
            <div className="chart-note">Past the inflow limit, +SPM only churns the same fluid: fillage slides, Goodman climbs, production plateaus then falls. Hold SPM where fillage ≥ 70%.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
