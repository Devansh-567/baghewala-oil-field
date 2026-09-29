# Baghewala Well-to-Surface Digital Twin

CSS + SRP integrated decision-support system for Oil India Limited — SIH 2026 Problem Statement SIH26120.

## YouTube

[Watch the Project Demo on YouTube](https://youtu.be/H-ZebeYpsYc) <br>
[Project Report](https://drive.google.com/drive/u/1/folders/1MOWUXWEcWwqY_-9lLEU-eFsuUZSbtZxi)


## What this is

A coupled well-to-surface engineering model for heavy-oil CSS wells in the Jodhpur Sandstone:

```
CSS slug → Marx–Langenheim heated radius → soak retention → μ(T) →
Vogel IPR inflow → API RP 11L displacement → fillage → rod loads →
Goodman fatigue + rod-float margin → SOR / ₹ operating margin
```

Every rate, SOR, temperature, viscosity, fillage, load and margin in the UI is **solved
from that chain** — nothing is plotted from a random generator.

## Calibration (published data, see in-app Engineering Basis)

| Quantity | Twin behaviour | Published source |
|---|---|---|
| Depth / perfs | 1,110 m pay; perfs 1,104–1,117 m | OIL Rajasthan Fields; SPE APOG 2023 (535203) |
| API / viscosity | Per-well API 14–19; μ50 8,000–15,000 cP @ 50 °C | SIH26120; OIL (10–13k cP); SPE (8–15k cP) |
| Reservoir T / P | Virgin 47 °C; 70–95 bar | SIH26120 (46–48 °C) |
| Well rates | 15–45 BOPD/well; scales to 1,202 BOPD record @ 33 wells | OIL record-production announcement Apr-2026 |
| SOR | Cycle SOR 1–4, small-slug design target < 3 | CSS literature band 2–5 |
| Completion | Thermal wellhead + VIT; conventional + hydraulic SRP | OIL Rajasthan Fields |
| Map | Live OpenStreetMap tiles, true WGS84 pads in Baghewala PML | © OpenStreetMap contributors (ODbL) |

Representative 12-pad grid inside the 200.26 km² Baghewala PML (52-well pattern
compressed for demo). Not live SCADA — the Sensor Integrity page demonstrates the
drift detect → exclude → recalibrate architecture with a scripted residual.

## Engineering references implemented in code

Marx–Langenheim (Trans. AIME 216, 1959) · Boberg–Lantz (SPE 1578-PA) ·
Vogel (JPT 1968) · API RP 11L / Spec 11E · Everitt–Jennings (SPE 18189) ·
Mehrotra–Svrcek μ(T) form · Arps (1945) decline · IAPWS-IF97 steam tables.

## Run locally

```bash
npm install
npm run dev
```

Then open the printed local URL (typically http://localhost:5173).

## Production build

```bash
npm run build
npm run preview
```

Static bundle in `dist/` — deployable to Vercel, Netlify, or any static host.
Map tiles load live from `tile.openstreetmap.org` (internet required for the base map;
all engineering computation is local).

## Structure

```
src/
  engineering/   Published constants + real correlations (the audit trail)
  simulation/    Coupled CSS×SRP solver + ₹ grid optimizer (physics.ts)
  data/          Well inventory (WGS84 pads), forecast, alerts, sensors
  components/    Shared UI + live OSM FieldMap (react-leaflet)
  pages/         Mission Brief, Field Overview, Well Twin, CSS/SRP
                 Optimization, Surface Optimizer, Forecast, What-If Lab,
                 Risk & Alerts, Sensor Integrity, Engineering Basis
  styles/        Operations-console dark theme (global.css)
```

## Judge demo path (~3 minutes)

1. Mission Brief → Field Overview (live OSM map, KPIs scaled to the 1,202 BOPD record)
2. Click **BGW-07** → Well Twin (stratigraphy, Vogel IPR, μ(T) curve, heat audit)
3. CSS Optimization — move steam/soak, watch heated radius + SOR respond
4. SRP Optimization — move SPM, watch surface + pump cards + Goodman respond
5. Surface Optimizer — grid-searched ₹-optimal window + Pareto frontier
6. Risk & Alerts — rod-float margin in lbf with thresholds
7. Sensor Integrity — BGW-07 thermocouple drift → exclude → recalibrate
8. Engineering Basis — challenge any number or equation
