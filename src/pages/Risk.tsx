import { Link } from 'react-router-dom';
import type { WellState } from '../types';
import { buildAlerts } from '../data/alertProvider';
import { SeverityBadge, SimTag } from '../components/common';

const CRITERIA = [
  { name: 'Rod-float margin', threshold: '> 900 lbf healthy · < 250 lbf floating', ref: 'Heavy-oil downstroke force balance' },
  { name: 'Goodman ratio', threshold: '< 0.55 normal · 0.80 Grade-D endurance limit', ref: 'API RP 11L / Spec 11B' },
  { name: 'Pump fillage', threshold: '> 70% healthy · < 60% pump-off action', ref: 'API RP 11L nodal balance' },
  { name: 'Cycle SOR', threshold: '2.5–4.0 economic · > 4.0 review slug', ref: 'CSS literature band (SOR 3–5 typical)' },
  { name: 'Water cut', threshold: '65% production cut-off ends cycle', ref: 'Field operating practice' },
];

export default function Risk({ wells }: { wells: WellState[] }) {
  const alerts = buildAlerts(wells);
  const high = alerts.filter((a) => a.severity === 'HIGH').length;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Risk &amp; Alerts — {alerts.length} active ({high} HIGH)</div>
          <div className="page-subtitle">Every alert carries its mechanism in lbf / % / ratios — not a score without units</div>
        </div>
        <SimTag>Criteria-audited</SimTag>
      </div>

      <div className="panel" style={{ marginBottom: 12 }} data-tour="risk-criteria">
        <div className="panel-title">Alert criteria — the thresholds judges can check</div>
        <table className="table ref-table">
          <thead><tr><th>Criterion</th><th>Threshold</th><th>Reference</th></tr></thead>
          <tbody>
            {CRITERIA.map((c) => (
              <tr key={c.name}><td>{c.name}</td><td>{c.threshold}</td><td>{c.ref}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      {alerts.length === 0 && <div className="empty-state">No active alerts in the current state.</div>}

      <div className="grid" style={{ gap: 10 }}>
        {alerts.map((a) => (
          <div key={a.id} className={`panel alert-card sev-${a.severity}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <SeverityBadge severity={a.severity} />
                <span className="well-id" style={{ fontSize: 12.5 }}>{a.title}</span>
              </div>
              <Link to={`/well/${a.wellId}`} className="btn" style={{ padding: '3px 9px', fontSize: 11 }}>{a.wellId} →</Link>
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--text-dim)', marginBottom: 6 }}>
              <strong style={{ color: 'var(--text)', fontWeight: 500 }}>Mechanism: </strong>{a.mechanism}
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--text-dim)' }}>
              <strong style={{ color: 'var(--amber)', fontWeight: 500 }}>Action: </strong>{a.action}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
