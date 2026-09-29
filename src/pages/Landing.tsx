import { Link } from 'react-router-dom';
import { getWells } from '../data/wellProvider';
import { useTour } from '../tour/TourContext';
import { round } from '../utils/rng';

export default function Landing() {
  const { start } = useTour();
  const wells = getWells();
  const total = round(wells.reduce((s, w) => s + w.productionBopd, 0), 0);
  const scaled33 = Math.round(total * (33 / wells.length));

  return (
    <div className="page">
      <div className="mission-hero" data-tour="mission-hero">
        <div className="sim-tag" style={{ marginBottom: 10 }}>OIL · SIH26120 · WELL-TO-SURFACE DIGITAL TWIN</div>
        <h1>Baghewala Well-to-Surface Digital Twin</h1>
        <p className="lede">
          An integrated CSS + SRP decision system for heavy-oil wells in the Jodhpur Sandstone —
          coupling Marx–Langenheim reservoir heating, Vogel inflow, and API RP 11L rod-pump mechanics
          into one auditable operating picture, rendered on live open-source mapping.
        </p>
        <div className="hero-badges">
          <span className="hero-badge"><b>{total}</b> BOPD · 12-pad model ({scaled33} BOPD @ 33 wells)</span>
          <span className="hero-badge"><b>1,202</b> BOPD field record · Apr-2026</span>
          <span className="hero-badge"><b>11,000</b> cP @ 50 °C calibration</span>
          <span className="hero-badge"><b>OSM</b> live base map</span>
          <span className="hero-badge"><b>0</b> black boxes — every equation cited</span>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
          <button className="btn primary tour-start-btn" onClick={start}>▶ Guided Tour — show me everything (~5 min)</button>
          <Link to="/field" className="btn">Open Field Overview →</Link>
          <Link to="/well/BGW-07" className="btn">Open showcase well BGW-07 →</Link>
          <Link to="/references" className="btn">Engineering basis →</Link>
        </div>
      </div>

      <div className="grid grid-3">
        <div className="panel">
          <div className="panel-title">The field — as published</div>
          <div style={{ fontSize: 12.5, color: 'var(--text-dim)', lineHeight: 1.7 }}>
            <p style={{ margin: '0 0 8px 0' }}>
              <b style={{ color: 'var(--text)' }}>Baghewala PML · 200.26 km²</b>, Bikaner–Nagaur sub-basin.
              Heavy oil in Cambrian <b style={{ color: 'var(--text)' }}>Jodhpur Sandstone @ ~1,104–1,117 m</b> (avg.
              ~1,150 m), discovered by <b style={{ color: 'var(--text)' }}>Baghewala-1 (1991)</b>. Commercial CSS
              production since <b style={{ color: 'var(--text)' }}>2017</b>; first pilot 2006.
            </p>
            <p style={{ margin: '0 0 8px 0' }}>
              Dead-oil viscosity <b style={{ color: 'var(--amber)' }}>10,000–13,000 cP @ 50 °C</b> (OIL) /
              8,000–15,000 cP (SPE); API <b style={{ color: 'var(--amber)' }}>14–19°</b>; virgin{' '}
              <b style={{ color: 'var(--text)' }}>Tres 46–48 °C</b>, low pressure. 52 wells drilled, 33
              producing; CSS active in 19 wells (+72% YoY). Thermal completions: thermal wellhead + VIT;
              conventional + hydraulic SRP.
            </p>
            <p className="cite" style={{ margin: 0 }}>
              Sources: Oil India Ltd Rajasthan Fields page; Singh et al. SPE APOG 2023 (535203);
              DGH NDR Rajasthan Basin; TOI Apr-2026 record-production report. Full list → Engineering Basis.
            </p>
          </div>
        </div>

        <div className="panel">
          <div className="panel-title">The coupling judges asked for</div>
          <div className="flow-chain" style={{ marginBottom: 10 }}>
            <span className="node">CSS slug</span><span className="arrow">→</span>
            <span className="node">heated radius</span><span className="arrow">→</span>
            <span className="node">μ(T)</span><span className="arrow">→</span>
            <span className="node">Vogel inflow</span><span className="arrow">→</span>
            <span className="node">fillage</span><span className="arrow">→</span>
            <span className="node">rod load</span><span className="arrow">→</span>
            <span className="node">SOR / ₹</span>
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-dim)', lineHeight: 1.7 }}>
            Thermal and lift decisions share one state vector. Raising SPM without re-heating the
            near-wellbore simply pumps the same viscous fluid harder — fillage falls, rod-float margin
            collapses, Goodman ratio climbs, and SOR barely moves. The twin makes that trade-off
            numerically visible <i>before</i> steam is ordered.
          </div>
        </div>

        <div className="panel">
          <div className="panel-title">What runs under the hood</div>
          <ul className="explain-list">
            <li><b>Marx–Langenheim (1959)</b> heated radius + heat-loss fraction per CSS slug</li>
            <li><b>Boberg–Lantz (SPE 1578-PA)</b> soak spreading + thermal-retention logic</li>
            <li><b>Arrhenius μ(T)</b> calibrated to OIL 11,000 cP @ 50 °C assay anchor</li>
            <li><b>Vogel (1968)</b> IPR — inflow from heated mobility k/μ</li>
            <li><b>API RP 11L</b> displacement PD = 0.1166·D²·Sp·N + PPRL/MPRL/PRHP</li>
            <li><b>Goodman</b> fatigue check on Grade-D rods + rod-float margin</li>
            <li><b>Arps (1945)</b> decline × Ramey-type cooling for forecasts</li>
            <li><b>Grid optimizer</b> over steam × soak × SPM on operating margin (₹/d)</li>
          </ul>
        </div>
      </div>

      <div className="divider" />

      <div className="grid grid-2" style={{ alignItems: 'start' }}>
        <div className="panel">
          <div className="panel-title">Judge demo path — 3 minutes</div>
          <ol style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: 'var(--text-dim)', lineHeight: 1.9 }}>
            <li><Link to="/field">Field Overview</Link> — live OSM map, real pads, field KPIs scaled to 1,202 BOPD record</li>
            <li><Link to="/well/BGW-07">BGW-07 twin</Link> — stratigraphy, PVT, IPR curve, heat audit</li>
            <li><Link to="/well/BGW-07/css">CSS Optimization</Link> — move steam/soak, watch Marx–Langenheim radius + SOR respond</li>
            <li><Link to="/well/BGW-07/srp">SRP Optimization</Link> — move SPM, watch surface + pump cards + Goodman respond</li>
            <li><Link to="/well/BGW-07/optimizer">Surface Optimizer</Link> — grid-searched ₹-optimal window + Pareto frontier</li>
            <li><Link to="/risk">Risk &amp; Alerts</Link> — rod-float margin in lbf, not vibes</li>
            <li><Link to="/sensors">Sensor Integrity</Link> — drift detect → exclude → recalibrate loop</li>
          </ol>
        </div>
        <div className="panel">
          <div className="panel-title">Why this wins on engineering merit</div>
          <ul className="explain-list">
            <li>Map is <b>live OpenStreetMap</b> (ODbL) at true WGS84 pads — verifiable against any atlas, zero AI terrain</li>
            <li>Rates reproduce the <b>published 15–45 BOPD/well</b> band; field total scales to the 1,202 BOPD record</li>
            <li>Viscosity reproduces the <b>OIL/SPE assay band</b> at 50 °C by construction, per-well API-anchored</li>
            <li>SOR lives in the <b>CSS literature band 2.5–5</b>, computed from CWE ÷ cycle oil — not fitted</li>
            <li>Every recommendation carries its <b>criterion + threshold</b> (Goodman 0.80, float margin 900 lbf, SOR 4.0)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
