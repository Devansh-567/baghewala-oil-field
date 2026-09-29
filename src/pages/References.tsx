import { SimTag } from '../components/common';

const FIELD_SOURCES = [
  { claim: 'Baghewala PML 200–200.26 km², under development; 35 wells / 23 producing base; 52–56 wells / 33–34 producing latest', source: 'Oil India Ltd — Rajasthan Fields page (oil-india.com/rajasthan-fields) + Hindi update', use: 'Well count, block size, commercial status' },
  { claim: 'Jodhpur Sandstone avg. depth ~1,150 m; viscosity 10,000–13,000 cP @ 50 °C; SRP + CSS; VIT + thermal wellhead; >600 BOPD', source: 'Oil India Ltd — Rajasthan Fields page', use: 'Depth, μ anchor, completion, base rate' },
  { claim: 'API 14–17; viscosity 8,000–15,000 cP @ 50 °C; production from ~1,100 m Jodhpur Sandstone', source: 'Singh et al., SPE APOG 2023, Paper 535203 — Baghewala heavy-oil CSS case study', use: 'PVT band, pay depth cross-check' },
  { claim: 'Heavy oil in Cambrian Bilara Limestone + Jodhpur Sandstone at Baghewala / Tavriwali / Kalrewara; Bikaner–Nagaur sub-basin', source: 'DGH National Data Repository — Rajasthan Basin page (ndrdgh.gov.in)', use: 'Stratigraphy, basin setting' },
  { claim: 'Baghewala-1 (1991) heavy oil 17.6°API @ 1,104–1,117 m; sulphur-rich, low maturity', source: 'Bhat et al. via Springer J. Petrol. Explor. Prod. Technol. 2021 + Oil India 1991 discovery record', use: 'Discovery interval, perfs, fluid character' },
  { claim: '1,202 BOPD record from Jodhpur sandstone; CSS in 19 wells (+72% YoY); heating-cable pilot', source: 'Times of India / News18 / Economic Times Energy, Apr-2026 (OIL record-production announcement)', use: 'Scale calibration for field total' },
  { claim: '17–19°API; Tres 46–48 °C; low pressure; high asphaltene; CSS+SRP scope; data inventory', source: 'SIH 2026 Problem Statement SIH26120 (Oil India Ltd)', use: 'Problem framing, reservoir T, scope' },
];

const MODEL_SOURCES = [
  { model: 'Reservoir heating radius + heat loss', ref: 'Marx J.W. & Langenheim R.H., Trans. AIME 216 (1959)', inTwin: 'marxLangenheim() — heated radius, GJ injected, loss fraction' },
  { model: 'Thermally-stimulated well rate + soak conduction', ref: 'Boberg T.C. & Lantz R.B., JPT Oct-1966 (SPE 1578-PA)', inTwin: 'soakEfficiency() + heatedZoneTempC() + cycle SOR' },
  { model: 'Solution-gas IPR below bubble point', ref: 'Vogel J.V., JPT Jan-1968', inTwin: 'vogelIpr() + iprCurve() — inflow from k/μ' },
  { model: 'Pump displacement PD = 0.1166·D²·Sp·N; PPRL/MPRL/PRHP', ref: 'API RP 11L — Design Calculations for Sucker-Rod Pumping Systems', inTwin: 'apiRp11LMechanics() — displacement, loads, horsepower' },
  { model: 'Pumping-unit kinematics + torque', ref: 'API Spec 11E', inTwin: 'Torque + stroke-rate limits on SRP page' },
  { model: 'Downhole card from surface card (wave equation)', ref: 'Everitt T.A. & Jennings J.W., SPE 18189 (1992)', inTwin: 'synthesizeSurfaceCard() / synthesizePumpCard() character' },
  { model: 'Heavy-oil μ(T) double-log form', ref: 'Mehrotra & Svrcek, Can. J. Chem. Eng. (Arrhenius form here)', inTwin: 'viscosityCpAtTemp() anchored to OIL assay' },
  { model: 'Exponential decline curves', ref: 'Arps J.J., Trans. AIME 160 (1945)', inTwin: 'arpsForecast() in forecast provider' },
  { model: 'Saturation steam tables', ref: 'IAPWS-IF97 (Antoine-form fit 15–60 bar)', inTwin: 'saturationTempC() — injection P → steam T' },
  { model: 'Base map', ref: '© OpenStreetMap contributors, ODbL — tile.openstreetmap.org', inTwin: 'FieldMap — live tiles, WGS84 pads, no rendered terrain' },
];

export default function References() {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Engineering Basis — audit trail</div>
          <div className="page-subtitle">Every field number and every equation carries its source. Challenge any of them.</div>
        </div>
        <SimTag>Judge audit page</SimTag>
      </div>

      <div className="panel" style={{ marginBottom: 12 }} data-tour="audit-trail">
        <div className="panel-title">Field data provenance — published Baghewala facts used as calibration</div>
        <table className="table ref-table">
          <thead><tr><th>Field claim used</th><th>Public source</th><th>How the twin uses it</th></tr></thead>
          <tbody>
            {FIELD_SOURCES.map((r, i) => (
              <tr key={i}><td>{r.claim}</td><td>{r.source}</td><td>{r.use}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="panel" style={{ marginBottom: 12 }}>
        <div className="panel-title">Model provenance — industry references implemented in code</div>
        <table className="table ref-table">
          <thead><tr><th>Engineering model</th><th>Reference</th><th>Implementation</th></tr></thead>
          <tbody>
            {MODEL_SOURCES.map((r, i) => (
              <tr key={i}><td>{r.model}</td><td>{r.ref}</td><td className="mono">{r.inTwin}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-2">
        <div className="panel">
          <div className="panel-title">What is representative vs published</div>
          <ul className="explain-list">
            <li><b>Published:</b> block size, depths, API/μ bands, Tres, well counts, 1,202 BOPD record, CSS well count, completion type</li>
            <li><b>Representative:</b> 12-pad layout inside the 200 km² PML (52-well pattern compressed for demo); per-well API/P/k split across published ranges</li>
            <li><b>Computed, never hardcoded:</b> every BOPD, SOR, BHT, μ, fillage, load, Goodman, margin — all solved from the chain above</li>
            <li><b>Not live data:</b> no SCADA feed is claimed; the sensor page demonstrates the integrity architecture with scripted drift</li>
          </ul>
        </div>
        <div className="panel">
          <div className="panel-title">How to verify in 60 seconds</div>
          <ul className="explain-list">
            <li>Open Field Overview → zoom the OSM map to Baghewala, Bikaner–Nagaur — roads and tracks are live OSM</li>
            <li>Pick BGW-08 (API 18.2) vs BGW-11 (API 14.2) — μ50 differs 8,000 vs 15,000 cP exactly per the assay band</li>
            <li>CSS page: set steam 300 → 550 m³ — radius grows ∝ √Q (Marx–Langenheim), SOR grows ∝ Q — textbook CSS</li>
            <li>SRP page: raise SPM past inflow — fillage slides, Goodman climbs, production plateaus (pump-off)</li>
            <li>Optimizer: optimum sits at the Pareto knee — re-derive it by hand from the ₹ equation shown</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
