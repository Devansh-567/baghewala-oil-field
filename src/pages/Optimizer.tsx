import { useMemo } from 'react';
import { CartesianGrid, Legend, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from 'recharts';
import { getWell } from '../data/wellProvider';
import { optimizeWell, solveCoupledChain } from '../simulation/physics';
import { Readout, SimTag } from '../components/common';

const CHAIN = ['Reservoir', 'Heating (M–L)', 'Viscosity μ(T)', 'Vogel inflow', 'Fillage', 'RP 11L loads', 'Production', 'SOR / ₹'];

export default function Optimizer({ wellId }: { wellId: string }) {
  const well = getWell(wellId);
  if (!well) return <div className="page"><div className="empty-state">Well not found.</div></div>;

  const result = useMemo(
    () =>
      optimizeWell(
        well.reservoirTempC,
        well.reservoirPressureBar,
        well.apiGravity,
        well.waterCutPct / 100,
        well.injectionPressureBar,
        well.injectionDurationHours,
        well.permeabilityMD
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [wellId]
  );

  const current = solveCoupledChain(
    { steamVolumeM3: well.steamVolumeM3, injectionPressureBar: well.injectionPressureBar, injectionDurationHours: well.injectionDurationHours, soakHours: well.soakHours, productionCutoffWaterCut: 65 },
    { spm: well.spm, strokeIn: well.strokeIn, vfdHz: well.vfdHz },
    well.reservoirTempC, well.reservoirPressureBar, well.apiGravity, well.waterCutPct / 100, well.permeabilityMD
  );

  const best = solveCoupledChain(
    { steamVolumeM3: result.bestSteamM3, injectionPressureBar: well.injectionPressureBar, injectionDurationHours: well.injectionDurationHours, soakHours: result.bestSoakHr, productionCutoffWaterCut: 65 },
    { spm: result.bestSpm, strokeIn: well.strokeIn, vfdHz: well.vfdHz },
    well.reservoirTempC, well.reservoirPressureBar, well.apiGravity, well.waterCutPct / 100, well.permeabilityMD
  );

  const inr = (v: number) => `₹${Math.round(v).toLocaleString('en-IN')}`;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Well-to-Surface Optimizer — {well.id}</div>
          <div className="page-subtitle">
            Exhaustive grid search · {result.evaluated} nodes (steam × soak × SPM) ranked on operating margin ₹/day = oil − steam − power − risk
          </div>
        </div>
        <SimTag>Deterministic · auditable · no ML black box</SimTag>
      </div>

      <div className="panel" style={{ marginBottom: 12 }}>
        <div className="panel-title">Coupled chain under optimization</div>
        <div className="flow-chain">
          {CHAIN.map((s, i) => (
            <span key={s} style={{ display: 'contents' }}>
              <span className="node">{s}</span>
              {i < CHAIN.length - 1 && <span className="arrow">→</span>}
            </span>
          ))}
        </div>
      </div>

      <div className="kpi-strip" data-tour="opt-window">
        <div className="kpi"><div className="k-label">Optimal steam slug</div><div className="k-value" style={{ color: 'var(--amber)' }}>{result.bestSteamM3}<span className="stat-unit"> m³ CWE</span></div><div className="k-sub">vs current {well.steamVolumeM3} m³</div></div>
        <div className="kpi"><div className="k-label">Optimal soak</div><div className="k-value" style={{ color: 'var(--amber)' }}>{result.bestSoakHr}<span className="stat-unit"> hr</span></div><div className="k-sub">vs current {well.soakHours} hr</div></div>
        <div className="kpi"><div className="k-label">Optimal SPM</div><div className="k-value" style={{ color: 'var(--amber)' }}>{result.bestSpm.toFixed(1)}</div><div className="k-sub">vs current {well.spm}</div></div>
        <div className="kpi"><div className="k-label">Production @ optimum</div><div className="k-value" style={{ color: 'var(--green)' }}>{result.bestProductionBopd}<span className="stat-unit"> BOPD</span></div><div className="k-sub">vs current {current.liftedBopd} BOPD</div></div>
        <div className="kpi"><div className="k-label">SOR @ optimum</div><div className="k-value">{result.bestSor}</div><div className="k-sub">vs current {current.sor}</div></div>
        <div className="kpi"><div className="k-label">Margin @ optimum</div><div className="k-value" style={{ color: 'var(--green)', fontSize: 16 }}>{inr(result.bestMarginINRPerDay)}<span className="stat-unit">/d</span></div><div className="k-sub">$78/bbl · ₹1,450/m³ steam</div></div>
      </div>

      <div className="grid grid-2" style={{ alignItems: 'start' }}>
        <div className="panel" data-tour="opt-frontier">
          <div className="panel-title"><span>Pareto frontier — production vs SOR, sized by margin</span><span className="cite">top-60 nodes</span></div>
          <ResponsiveContainer width="100%" height={280}>
            <ScatterChart>
              <CartesianGrid stroke="var(--border-soft)" />
              <XAxis dataKey="sor" stroke="var(--text-faint)" fontSize={10} name="SOR" label={{ value: 'SOR →', position: 'insideBottomRight', fontSize: 10, fill: 'var(--text-faint)' }} />
              <YAxis dataKey="productionBopd" stroke="var(--text-faint)" fontSize={10} name="BOPD" label={{ value: 'BOPD', angle: -90, position: 'insideLeft', fontSize: 10, fill: 'var(--text-faint)' }} />
              <ZAxis dataKey="marginINRPerDay" range={[24, 220]} name="₹/d" />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{ background: 'var(--bg-panel-raised)', border: '1px solid var(--border)', fontSize: 12 }}
                formatter={(v, name) => [typeof v === 'number' ? v.toLocaleString('en-IN') : v, name]}
              />
              <Scatter data={result.frontier} fill="var(--amber)" fillOpacity={0.75} />
            </ScatterChart>
          </ResponsiveContainer>
          <div className="chart-note">Up-left is better (more oil, less steam). Bubble size = operating margin. The optimum sits at the knee — beyond it, steam cost outruns heated-mobility gains.</div>
          <div className="divider" />
          <div className="panel-title">Top-8 operating nodes</div>
          <table className="table">
            <thead><tr><th>#</th><th>Steam</th><th>Soak</th><th>SPM</th><th>BOPD</th><th>SOR</th><th>₹/day</th></tr></thead>
            <tbody>
              {result.frontier.slice(0, 8).map((r, i) => (
                <tr key={i} style={i === 0 ? { background: 'rgba(201,138,62,.08)' } : undefined}>
                  <td>{i + 1}</td><td>{r.steamM3}</td><td>{r.soakHr}</td><td>{r.spm.toFixed(1)}</td>
                  <td>{r.productionBopd}</td><td>{r.sor}</td><td>{inr(r.marginINRPerDay)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid" style={{ gap: 12 }}>
          <div className="panel">
            <div className="panel-title">Recommended operating window (± tolerance)</div>
            <Readout label="Steam slug" value={`${result.bestSteamM3 - 12} – ${result.bestSteamM3 + 12} m³ CWE`} />
            <Readout label="Soak" value={`${result.bestSoakHr - 6} – ${result.bestSoakHr + 6} hr`} />
            <Readout label="SPM" value={`${(result.bestSpm - 0.2).toFixed(1)} – ${(result.bestSpm + 0.2).toFixed(1)}`} />
            <Readout label="Stroke / VFD" value={`${well.strokeIn} in / ${well.vfdHz} Hz (hold)`} />
          </div>
          <div className="panel">
            <div className="panel-title">Why this optimum — in numbers</div>
            <ul className="explain-list">
              <li>Heated radius {best.heatedRadiusM} m (vs {current.heatedRadiusM} m now) at {(best.soakEff * 100).toFixed(0)}% soak efficiency — retention without extra steam</li>
              <li>Viscosity {best.viscosityCp.toLocaleString()} cP (vs {current.viscosityCp.toLocaleString()} cP) → fillage {(best.fillageFrac * 100).toFixed(0)}% (vs {(current.fillageFrac * 100).toFixed(0)}%)</li>
              <li>Rod-float margin {best.rodFloatMarginLb.toLocaleString()} lbf (vs {current.rodFloatMarginLb.toLocaleString()} lbf) · Goodman {best.goodmanRatio.toFixed(2)}</li>
              <li>SOR {best.sor} (vs {current.sor}) — steam trimmed where radius growth went sub-linear</li>
              <li>Margin {inr(result.bestMarginINRPerDay)}/day at $78/bbl, ₹1,450/m³ CWE, ₹8.5/kWh — re-runs instantly if prices move</li>
            </ul>
          </div>
          <div className="panel">
            <div className="panel-title">Decision objective</div>
            <div style={{ fontSize: 13, lineHeight: 1.8 }}>
              max <span className="mono" style={{ color: 'var(--green)' }}>oil revenue</span>
              <span style={{ color: 'var(--text-faint)' }}> − </span>
              <span className="mono" style={{ color: 'var(--amber)' }}>steam cost</span>
              <span style={{ color: 'var(--text-faint)' }}> − </span>
              <span className="mono" style={{ color: 'var(--blue)' }}>power</span>
              <span style={{ color: 'var(--text-faint)' }}> − </span>
              <span className="mono" style={{ color: 'var(--red)' }}>risk penalty</span>
            </div>
            <div className="cite" style={{ marginTop: 8 }}>Risk penalty = (rod-float + impact risk) × ₹55/point/day — calibrated so a HIGH-risk node can never outrank a MEDIUM one on rate alone.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
