import { useState } from 'react';
import type { WellState } from '../types';
import { buildSensorReadings, DRIFT_SENSOR, DRIFT_WELL_ID } from '../data/sensorProvider';
import { SimTag } from '../components/common';

const CHANNELS = [
  { tag: 'THT-01', desc: 'Wellhead temperature (°C) — VIT outlet', rate: '1/min' },
  { tag: 'THP-01', desc: 'Wellhead pressure (bar) — tubing head', rate: '1/min' },
  { tag: 'BHT-TC', desc: 'Bottomhole thermocouple (°C) — pump intake', rate: '1/5 min' },
  { tag: 'VFD-F', desc: 'VFD frequency (Hz) + motor current (A)', rate: '1/min' },
  { tag: 'PR-LC', desc: 'Polished-rod load cell (klb) — dynamometer', rate: 'per stroke' },
  { tag: 'Q-SEP', desc: 'Test-separator oil rate (BOPD)', rate: 'daily test' },
];

export default function Sensors({ wells }: { wells: WellState[] }) {
  const readings = buildSensorReadings(wells);
  const [recalibrated, setRecalibrated] = useState(false);

  const driftReading = readings.find((r) => r.wellId === DRIFT_WELL_ID && r.sensor === DRIFT_SENSOR);
  const residual = driftReading ? driftReading.observed - driftReading.expected : 0;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Sensor &amp; Data Integrity</div>
          <div className="page-subtitle">SCADA channel map + CUSUM-style drift detection (±3σ residual gate, 3 consecutive violations)</div>
        </div>
        <SimTag>Fail-safe: drifted channel excluded from optimizer</SimTag>
      </div>

      <div className="panel" style={{ marginBottom: 12 }}>
        <div className="panel-title"><span>SCADA channel map — per pad</span><span className="cite">6 channels × {wells.length} pads</span></div>
        <table className="table">
          <thead><tr><th>Tag</th><th>Channel</th><th>Rate</th></tr></thead>
          <tbody>
            {CHANNELS.map((c) => (
              <tr key={c.tag}><td>{c.tag}</td><td style={{ fontFamily: 'var(--sans)' }}>{c.desc}</td><td>{c.rate}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="panel" style={{ marginBottom: 16, borderColor: recalibrated ? undefined : 'var(--red)' }} data-tour="sensor-drift">
        <div className="panel-title">
          <span>{DRIFT_WELL_ID} — {DRIFT_SENSOR} (BHT thermocouple)</span>
          <span className={`badge ${recalibrated ? 'low' : 'high'}`}>{recalibrated ? 'RECALIBRATED' : 'SUSPECTED DRIFT'}</span>
        </div>
        <div className="grid grid-3" style={{ marginBottom: 12 }}>
          <div className="stat-block">
            <div className="stat-label">Observed</div>
            <div className="stat-value">{recalibrated ? driftReading?.expected.toFixed(1) : driftReading?.observed.toFixed(1)}<span className="stat-unit">°C</span></div>
          </div>
          <div className="stat-block">
            <div className="stat-label">Expected (coupled model)</div>
            <div className="stat-value">{driftReading?.expected.toFixed(1)}<span className="stat-unit">°C</span></div>
          </div>
          <div className="stat-block">
            <div className="stat-label">Residual</div>
            <div className="stat-value" style={{ color: recalibrated ? 'var(--green)' : 'var(--red)' }}>
              {recalibrated ? '0.0' : `+${residual.toFixed(1)}`}<span className="stat-unit">°C (gate ±1.5)</span>
            </div>
          </div>
        </div>

        <div className="panel-title" style={{ marginTop: 4 }}>Fail-safe flow</div>
        <div className="flow-chain" style={{ marginBottom: 12 }}>
          <span className="node" style={{ color: !recalibrated ? 'var(--red)' : undefined }}>Residual +8.4 °C → 3rd violation</span>
          <span className="arrow">→</span>
          <span className="node" style={{ color: !recalibrated ? 'var(--amber)' : undefined }}>Channel excluded · optimizer falls back to model BHT</span>
          <span className="arrow">→</span>
          <span className="node">Wellhead T + motor current corroborate</span>
          <span className="arrow">→</span>
          <span className="node" style={{ color: recalibrated ? 'var(--green)' : undefined }}>Recalibrated · confidence restored</span>
        </div>
        <button className="btn primary" onClick={() => setRecalibrated((v) => !v)}>
          {recalibrated ? 'Reset demo (re-inject drift)' : 'Simulate field recalibration'}
        </button>
        <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 10 }}>
          While flagged, {DRIFT_WELL_ID} recommendations use the coupled-model BHT ({driftReading?.expected.toFixed(1)} °C)
          and the remaining 5 corroborating channels — never the raw +8.4 °C reading. That is the difference between a
          dashboard and a safety-rated twin.
        </p>
      </div>

      <div className="panel">
        <div className="panel-title">Field sensor table — residual = observed − expected</div>
        <table className="table">
          <thead><tr><th>Well</th><th>Sensor</th><th>Observed</th><th>Expected</th><th>Residual</th><th>Status</th></tr></thead>
          <tbody>
            {readings.map((r, i) => {
              const isDrift = r.wellId === DRIFT_WELL_ID && r.sensor === DRIFT_SENSOR;
              const status = isDrift && recalibrated ? 'Nominal' : r.status;
              const obs = isDrift && recalibrated ? r.expected : r.observed;
              const res = typeof obs === 'number' ? obs - r.expected : 0;
              return (
                <tr key={i} style={isDrift && !recalibrated ? { background: 'rgba(200,92,78,.07)' } : undefined}>
                  <td>{r.wellId}</td>
                  <td>{r.sensor}</td>
                  <td>{typeof obs === 'number' ? obs.toFixed(1) : obs} {r.unit}</td>
                  <td>{r.expected} {r.unit}</td>
                  <td style={{ color: Math.abs(res) > 1.5 ? 'var(--red)' : 'var(--green)' }}>
                    {res >= 0 ? '+' : ''}{res.toFixed(1)}
                  </td>
                  <td style={{ color: status === 'Nominal' ? 'var(--green)' : 'var(--amber)' }}>{status}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
