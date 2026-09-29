import { Link } from 'react-router-dom';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getWell, getWells } from '../data/wellProvider';
import { Readout, SimTag, StatusDot } from '../components/common';
import FieldMap from '../components/FieldMap';
import { iprCurve, viscosityCpAtTemp } from '../engineering/correlations';
import { saturationTempC } from '../engineering/fieldConstants';

export default function WellTwin({ wellId }: { wellId: string }) {
  const well = getWell(wellId);
  const wells = getWells();

  if (!well) {
    return (
      <div className="page">
        <div className="empty-state">Well {wellId} not found.</div>
      </div>
    );
  }

  const ipr = iprCurve(well.reservoirPressureBar, well.fluidViscosityCp, well.heatedRadiusM);
  const muCurve = [20, 40, 60, 80, 100, 120, 150, 180, 210].map((t) => ({
    temp: t,
    viscosity: Math.round(viscosityCpAtTemp(t, well.apiGravity)),
  }));
  const steamT = saturationTempC(well.injectionPressureBar);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title mono">{well.id} — {well.status} · CSS Cycle {well.cssCycle}</div>
          <div className="page-subtitle mono">
            {well.lat.toFixed(5)}°N {well.lon.toFixed(5)}°E · EL {well.elevationM} m · TD {well.payDepthM} m · pump @ {well.pumpDepthM} m · perfs 1,104–1,117 m
          </div>
        </div>
        <SimTag>Calibrated model · VIT + thermal wellhead</SimTag>
      </div>

      <div className="well-switcher">
        {wells.map((w) => (
          <Link key={w.id} to={`/well/${w.id}`} className={`btn${w.id === well.id ? ' sel' : ''}`} style={{ padding: '4px 10px', fontSize: 11 }}>
            {w.id}
          </Link>
        ))}
      </div>

      <div className="kpi-strip">
        <div className="kpi"><div className="k-label">Lifted rate</div><div className="k-value" style={{ color: 'var(--green)' }}>{well.productionBopd}<span className="stat-unit"> BOPD</span></div><div className="k-sub">Vogel IPR @ heated μ</div></div>
        <div className="kpi"><div className="k-label">BHT / viscosity</div><div className="k-value" style={{ color: 'var(--amber)' }}>{well.bottomholeTempC}°<span className="stat-unit">C · {(well.fluidViscosityCp / 1000).toFixed(1)}k cP</span></div><div className="k-sub">μ50 {well.mu50Cp.toLocaleString()} cP · API {well.apiGravity}</div></div>
        <div className="kpi"><div className="k-label">Heated radius</div><div className="k-value">{well.heatedRadiusM}<span className="stat-unit"> m</span></div><div className="k-sub">{well.heatInjectedGJ.toLocaleString()} GJ injected</div></div>
        <div className="kpi"><div className="k-label">Pump fillage</div><div className="k-value">{well.pumpFillagePct}<span className="stat-unit"> %</span></div><div className="k-sub">API RP 11L nodal balance</div></div>
        <div className="kpi"><div className="k-label">Peak load / Goodman</div><div className="k-value">{well.peakLoadKlb}<span className="stat-unit"> klb · {well.goodmanRatio.toFixed(2)}</span></div><div className="k-sub">limit 0.80 · Grade-D</div></div>
        <div className="kpi"><div className="k-label">SOR (cycle)</div><div className="k-value">{well.sor}</div><div className="k-sub">band 2.5–5.0</div></div>
      </div>

      <div className="grid grid-2" style={{ alignItems: 'start' }}>
        <div className="grid" style={{ gap: 12 }}>
          <FieldMap wells={wells} selectedId={well.id} height={300} />
          <div className="panel">
            <div className="panel-title"><span>Wellbore schematic — thermal completion</span><span className="cite">VIT · {well.pumpDepthM} m pump</span></div>
            <div className="strat-block" data-tour="well-schematic">
              <div><b>0 m</b> — Thermal wellhead (OIL-RF thermal completion)</div>
              <div><b>0–1,075 m</b> — 2⅞-in. vacuum-insulated tubing (VIT), 7/8-in. Grade-D rods</div>
              <div><b>{well.pumpDepthM} m</b> — 1.75-in. plunger pump · {well.spm} SPM × {well.strokeIn} in · VFD {well.vfdHz} Hz</div>
              <div><b>1,104–1,117 m</b> — Jodhpur Sandstone perfs (Baghewala-1 discovery interval)</div>
              <div><b>BHT {well.bottomholeTempC} °C</b> — heated radius {well.heatedRadiusM} m · steam {steamT} °C @ {well.injectionPressureBar} bar</div>
              <div><b>Virgin 47 °C / {well.reservoirPressureBar} bar</b> — k {well.permeabilityMD} mD · φ 19% · net 14 m</div>
            </div>
          </div>
        </div>

        <div className="grid" style={{ gap: 12 }}>
          <div className="panel" data-tour="well-ipr">
            <div className="panel-title"><span>Inflow performance (Vogel 1968)</span><span className="cite">k/μ heated mobility</span></div>
            <ResponsiveContainer width="100%" height={190}>
              <LineChart data={ipr}>
                <CartesianGrid stroke="var(--border-soft)" vertical={false} />
                <XAxis dataKey="pwfBar" stroke="var(--text-faint)" fontSize={10} label={{ value: 'Pwf (bar)', position: 'insideBottomRight', fontSize: 10, fill: 'var(--text-faint)' }} />
                <YAxis stroke="var(--text-faint)" fontSize={10} width={44} />
                <Tooltip contentStyle={{ background: 'var(--bg-panel-raised)', border: '1px solid var(--border)', fontSize: 12 }} />
                <Line type="monotone" dataKey="rateBopd" stroke="var(--green)" strokeWidth={2} dot={false} name="Rate BOPD" />
              </LineChart>
            </ResponsiveContainer>
            <div className="chart-note">Operating point marked by current fillage {well.pumpFillagePct}% — inflow {well.productionBopd} BOPD at heated μ {(well.fluidViscosityCp / 1000).toFixed(1)}k cP. Cold-μ curve would sit ~8× lower: that gap is the CSS prize.</div>
          </div>

          <div className="panel">
            <div className="panel-title"><span>Viscosity–temperature (Arrhenius, OIL-calibrated)</span><span className="cite">log scale</span></div>
            <ResponsiveContainer width="100%" height={170}>
              <LineChart data={muCurve}>
                <CartesianGrid stroke="var(--border-soft)" vertical={false} />
                <XAxis dataKey="temp" stroke="var(--text-faint)" fontSize={10} label={{ value: '°C', position: 'insideBottomRight', fontSize: 10, fill: 'var(--text-faint)' }} />
                <YAxis scale="log" domain={[10, 20000]} stroke="var(--text-faint)" fontSize={10} width={48} />
                <Tooltip contentStyle={{ background: 'var(--bg-panel-raised)', border: '1px solid var(--border)', fontSize: 12 }} />
                <Line type="monotone" dataKey="viscosity" stroke="var(--amber)" strokeWidth={2} dot={false} name="μ cP" />
              </LineChart>
            </ResponsiveContainer>
            <div className="chart-note">Anchor μ50 = {well.mu50Cp.toLocaleString()} cP (API {well.apiGravity}) — inside OIL 10–13k / SPE 8–15k band. BHT {well.bottomholeTempC} °C → {(well.fluidViscosityCp / 1000).toFixed(1)}k cP.</div>
          </div>

          <div className="panel">
            <div className="panel-title">State vector <StatusDot status={well.status} /></div>
            <Readout label="Reservoir P / T" value={`${well.reservoirPressureBar} bar / ${well.reservoirTempC} °C`} tone="blue" />
            <Readout label="Bottomhole T / μ" value={`${well.bottomholeTempC} °C / ${well.fluidViscosityCp.toLocaleString()} cP`} tone="amber" />
            <Readout label="CSS slug / soak" value={`${well.steamVolumeM3} m³ CWE / ${well.soakHours} hr`} />
            <Readout label="SRP point" value={`${well.spm} SPM × ${well.strokeIn} in @ ${well.vfdHz} Hz`} />
            <Readout label="Rod-float margin" value={`${well.rodFloatMarginLb.toLocaleString()} lbf`} tone={well.rodFloatMarginLb < 900 ? 'red' : 'green'} />
            <Readout label="Motor (PRHP)" value={well.prhpKw} unit="kW" />
          </div>
        </div>
      </div>

      <div className="divider" />
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Link to={`/well/${well.id}/css`} className="btn primary">CSS Optimization →</Link>
        <Link to={`/well/${well.id}/srp`} className="btn">SRP Optimization →</Link>
        <Link to={`/well/${well.id}/optimizer`} className="btn">Surface Optimizer →</Link>
        <Link to={`/well/${well.id}/forecast`} className="btn">Forecast →</Link>
      </div>
    </div>
  );
}
