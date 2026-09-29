import { Link } from 'react-router-dom';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { WellState } from '../types';
import { StatusDot } from '../components/common';
import FieldMap from '../components/FieldMap';
import { buildAlerts } from '../data/alertProvider';
import { round } from '../utils/rng';

function fieldTrend(wells: WellState[]) {
  const total = wells.reduce((s, w) => s + w.productionBopd, 0);
  const pts: Array<{ day: string; production: number; scaled33: number }> = [];
  for (let d = 13; d >= 0; d--) {
    const seasonal = Math.sin((14 - d) / 2.4) * total * 0.02;
    const decline = d * 0.55;
    const p = round(total - decline - seasonal, 1);
    pts.push({ day: `D-${d}`, production: p, scaled33: round(p * (33 / wells.length), 0) });
  }
  return pts;
}

export default function FieldOverview({ wells }: { wells: WellState[] }) {
  const totalProduction = round(wells.reduce((s, w) => s + w.productionBopd, 0), 0);
  const scaledField = Math.round(totalProduction * (33 / wells.length));
  const producing = wells.filter((w) => w.status === 'Producing').length;
  const alerts = buildAlerts(wells);
  const highAlerts = alerts.filter((a) => a.severity === 'HIGH').length;
  const avgSor = round(wells.reduce((s, w) => s + w.sor, 0) / wells.length, 2);
  const avgBht = round(wells.reduce((s, w) => s + w.bottomholeTempC, 0) / wells.length, 1);
  const avgMu = Math.round(wells.reduce((s, w) => s + w.fluidViscosityCp, 0) / wells.length);
  const trend = fieldTrend(wells);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Field Overview — Baghewala PML</div>
          <div className="page-subtitle mono">
            27.58°N 72.82°E · Bikaner–Nagaur basin · Jodhpur Sandstone @ ~1,110 m · 12 representative pads of 52-well development
          </div>
        </div>
        <span className="sim-tag">OSM live map · calibrated model</span>
      </div>

      <div className="kpi-strip" data-tour="field-kpis">
        <div className="kpi"><div className="k-label">Model production (12 pads)</div><div className="k-value">{totalProduction}<span className="stat-unit"> BOPD</span></div><div className="k-sub">scaled ×33 wells → {scaledField} BOPD</div></div>
        <div className="kpi"><div className="k-label">Field record (Apr-2026)</div><div className="k-value">1,202<span className="stat-unit"> BOPD</span></div><div className="k-sub">33 producing · CSS in 19 wells</div></div>
        <div className="kpi"><div className="k-label">Mean SOR (cycle)</div><div className="k-value">{avgSor}</div><div className="k-sub">CSS band 2.5–5.0</div></div>
        <div className="kpi"><div className="k-label">Mean BHT</div><div className="k-value">{avgBht}<span className="stat-unit"> °C</span></div><div className="k-sub">virgin 47 °C</div></div>
        <div className="kpi"><div className="k-label">Mean viscosity</div><div className="k-value">{avgMu.toLocaleString()}<span className="stat-unit"> cP</span></div><div className="k-sub">assay 8–15k @ 50 °C</div></div>
        <div className="kpi"><div className="k-label">Alerts</div><div className="k-value" style={{ color: highAlerts > 0 ? 'var(--red)' : 'var(--green)' }}>{alerts.length}<span className="stat-unit"> ({highAlerts} HIGH)</span></div><div className="k-sub">{producing}/{wells.length} producing</div></div>
      </div>

      <div className="grid grid-2" style={{ alignItems: 'start' }}>
        <div>
          <FieldMap wells={wells} height={460} />
        </div>
        <div className="grid" style={{ gap: 12 }}>
          <div className="panel">
            <div className="panel-title"><span>Field rate — 14-day model trend</span><span className="cite">Arps-scaled well rates</span></div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trend}>
                <CartesianGrid stroke="var(--border-soft)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--text-faint)" fontSize={10} />
                <YAxis stroke="var(--text-faint)" fontSize={10} width={44} />
                <Tooltip contentStyle={{ background: 'var(--bg-panel-raised)', border: '1px solid var(--border)', fontSize: 12 }} />
                <Area type="monotone" dataKey="production" stroke="var(--green)" fill="var(--green)" fillOpacity={0.14} strokeWidth={1.75} name="12-pad BOPD" />
                <Area type="monotone" dataKey="scaled33" stroke="var(--amber)" fill="transparent" strokeWidth={1.25} strokeDasharray="5 4" name="Scaled ×33 wells" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="chart-note">Solid = 12 modelled pads · dashed = scaled to 33 producers for direct comparison with the 1,202 BOPD published record.</div>
          </div>
          <div className="panel">
            <div className="panel-title">Status legend</div>
            <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-dim)', flexWrap: 'wrap' }}>
              <span><StatusDot status="Producing" /> Producing ({wells.filter((w) => w.status === 'Producing').length})</span>
              <span><StatusDot status="Soaking" /> Soaking ({wells.filter((w) => w.status === 'Soaking').length})</span>
              <span><StatusDot status="Injecting" /> Injecting ({wells.filter((w) => w.status === 'Injecting').length})</span>
              <span><StatusDot status="Shut-in" /> Shut-in ({wells.filter((w) => w.status === 'Shut-in').length})</span>
            </div>
            <div className="divider" />
            <div className="cite">Pads carry true WGS84 coordinates — click any marker popup → open its twin. Base tiles: © OpenStreetMap contributors (ODbL), live.</div>
          </div>
        </div>
      </div>

      <div className="divider" />

      <div className="panel-title" style={{ marginBottom: 8 }}>Pads — click through to the twin</div>
      <div className="grid grid-4">
        {wells.map((w) => (
          <Link key={w.id} to={`/well/${w.id}`} className="well-card">
            <div className="well-card-top">
              <span className="well-id"><StatusDot status={w.status} /> {w.id}</span>
              <span style={{ fontSize: 10.5, color: 'var(--text-faint)' }}>Cycle {w.cssCycle}</span>
            </div>
            <div style={{ fontSize: 10.5, color: 'var(--text-faint)', marginBottom: 4 }} className="mono">
              {w.lat.toFixed(4)}°N {w.lon.toFixed(4)}°E · API {w.apiGravity} · {w.permeabilityMD} mD
            </div>
            <div className="readout-row" style={{ padding: '3px 0' }}>
              <span className="readout-label">Production</span>
              <span className="readout-value">{w.productionBopd} BOPD</span>
            </div>
            <div className="readout-row" style={{ padding: '3px 0' }}>
              <span className="readout-label">BHT / μ</span>
              <span className="readout-value amber">{w.bottomholeTempC} °C · {(w.fluidViscosityCp / 1000).toFixed(1)}k cP</span>
            </div>
            <div className="readout-row" style={{ padding: '3px 0' }}>
              <span className="readout-label">SOR / Fillage</span>
              <span className="readout-value">{w.sor} · {w.pumpFillagePct}%</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
