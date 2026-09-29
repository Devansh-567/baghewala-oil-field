import { useState } from 'react';
import { Area, AreaChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getWell } from '../data/wellProvider';
import { buildForecast } from '../data/forecastProvider';
import { SimTag, StatBlock } from '../components/common';

const HORIZONS: (7 | 14 | 30)[] = [7, 14, 30];

export default function Forecast({ wellId }: { wellId: string }) {
  const well = getWell(wellId);
  const [horizon, setHorizon] = useState<7 | 14 | 30>(30);
  if (!well) return <div className="page"><div className="empty-state">Well not found.</div></div>;

  const data = buildForecast(well, horizon);
  const end = data[data.length - 1];
  const cumOil = Math.round(data.reduce((s, d) => s + d.productionBopd, 0));

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Forecast — {well.id}</div>
          <div className="page-subtitle">Arps decline × Ramey-type cooling × μ(T) · cycle day {well.daysSinceInjectionStart} of ~95</div>
        </div>
        <SimTag>P10–P90 band · deterministic</SimTag>
      </div>

      <div className="tabs">
        {HORIZONS.map((h) => (
          <div key={h} className={`tab${horizon === h ? ' active' : ''}`} onClick={() => setHorizon(h)}>{h}D</div>
        ))}
      </div>

      <div className="grid grid-4" style={{ marginBottom: 12 }}>
        <StatBlock label={`Day-${horizon} rate`} value={end.productionBopd} unit="BOPD" />
        <StatBlock label={`Day-${horizon} BHT`} value={end.bottomholeTempC} unit="°C" />
        <StatBlock label={`Day-${horizon} viscosity`} value={end.fluidViscosityCp.toLocaleString()} unit="cP" />
        <StatBlock label="Cumulative oil" value={cumOil.toLocaleString()} unit="bbl" />
      </div>

      <div className="panel" style={{ marginBottom: 12 }} data-tour="forecast-band">
        <div className="panel-title"><span>Oil rate with P10–P90 uncertainty</span><span className="cite">band ±(5% + 0.5%/day)</span></div>
        <ResponsiveContainer width="100%" height={230}>
          <AreaChart data={data}>
            <CartesianGrid stroke="var(--border-soft)" vertical={false} />
            <XAxis dataKey="day" stroke="var(--text-faint)" fontSize={10} label={{ value: 'days ahead', position: 'insideBottomRight', fill: 'var(--text-faint)', fontSize: 10 }} />
            <YAxis stroke="var(--text-faint)" fontSize={10} width={44} />
            <Tooltip contentStyle={{ background: 'var(--bg-panel-raised)', border: '1px solid var(--border)', fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Area type="monotone" dataKey="uncertaintyHigh" stroke="none" fill="var(--green)" fillOpacity={0.1} name="P90" />
            <Area type="monotone" dataKey="uncertaintyLow" stroke="none" fill="var(--bg)" fillOpacity={1} name="P10" />
            <Line type="monotone" dataKey="productionBopd" stroke="var(--green)" strokeWidth={2} dot={false} name="Expected BOPD" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-2">
        <div className="panel">
          <div className="panel-title">Thermal trajectory — BHT cooling toward 47 °C virgin</div>
          <ResponsiveContainer width="100%" height={190}>
            <LineChart data={data}>
              <CartesianGrid stroke="var(--border-soft)" vertical={false} />
              <XAxis dataKey="day" stroke="var(--text-faint)" fontSize={10} />
              <YAxis stroke="var(--text-faint)" fontSize={10} width={44} domain={['auto', 'auto']} />
              <Tooltip contentStyle={{ background: 'var(--bg-panel-raised)', border: '1px solid var(--border)', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="bottomholeTempC" stroke="var(--amber)" strokeWidth={2} dot={false} name="BHT °C" />
              <Line type="monotone" dataKey="fluidViscosityCp" stroke="var(--red)" strokeWidth={1.25} dot={false} name="μ cP" />
            </LineChart>
          </ResponsiveContainer>
          <div className="chart-note">τ ≈ 55 days (VIT wellbore). When BHT crosses ~60 °C, μ exceeds ~6,000 cP and fillage protection becomes the binding constraint — that crossing is the re-steam trigger.</div>
        </div>

        <div className="panel">
          <div className="panel-title">Fillage erosion + water-cut advance</div>
          <ResponsiveContainer width="100%" height={190}>
            <LineChart data={data}>
              <CartesianGrid stroke="var(--border-soft)" vertical={false} />
              <XAxis dataKey="day" stroke="var(--text-faint)" fontSize={10} />
              <YAxis stroke="var(--text-faint)" fontSize={10} width={44} />
              <Tooltip contentStyle={{ background: 'var(--bg-panel-raised)', border: '1px solid var(--border)', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="pumpFillagePct" stroke="var(--blue)" strokeWidth={2} dot={false} name="Fillage %" />
              <Line type="monotone" dataKey="waterCutPct" stroke="var(--text-dim)" strokeWidth={1.5} dot={false} name="Water cut %" />
            </LineChart>
          </ResponsiveContainer>
          <div className="chart-note">Action rule encoded in alerts: fillage &lt; 60% → cut SPM 0.4; water cut → 65% cut-off ends the cycle. No silent extrapolation — the band tells you when the forecast stops being useful.</div>
        </div>
      </div>
    </div>
  );
}
