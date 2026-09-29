# VIDEO SCRIPT — Baghewala Well-to-Surface Digital Twin (SIH26120)

**Format:** single-take screen recording with voiceover, **target length 8–9 minutes**
(allowed window 7–10). Pace: ~140 words/min — read the narration lines verbatim;
they total ~1,230 words ≈ 8 min 45 s, leaving buffer for clicks and pauses.

**In-app helper:** the project now has a built-in **▶ Guided Tour** button (sidebar,
topbar, and Mission Brief hero). It walks a viewer through the same 15 stations as
this script with on-screen narration cards, arrow-key navigation, and an autoplay
mode. Use it for the live judge demo; use this file for the recorded video.

---

## 1. Recording checklist (do this before pressing record)

1. `npm install` → `npm run dev` → open the local URL (e.g. http://localhost:5173).
2. Browser at **1920×1080**, 100% zoom, sidebar fully visible. Close other tabs.
3. Internet **ON** — the field map loads live OpenStreetMap tiles.
4. Reset state: reload once so every slider is at its default; go to `/` (Mission Brief).
5. Open the **BGW-07** pages in order once, so charts are cached and render instantly.
6. Microphone check: record 10 s, play back, confirm no fan noise. Keep water nearby.
7. If anything lags mid-take, say *"Let me reload that panel"* — cut it in edit, never apologise to judges.

---

## 2. The script

### SCENE 1 — Hook (0:00–0:45) · Screen: Mission Brief hero

> **Say:** "In Rajasthan's Thar desert, Oil India's Baghewala field produces oil so
> thick it barely flows — eleven thousand centipoise at fifty degrees, roughly the
> consistency of cold honey. To produce it, engineers inject high-pressure steam to
> heat the reservoir, then lift the oil with sucker-rod pumps. Today those two
> decisions — how much steam, and how hard to pump — are made separately, by
> different teams, from experience. As the rock cools, viscosity climbs, pumps gasp,
> rods float and snap, steam is wasted, and production falls. Our project, the
> Baghewala Well-to-Surface Digital Twin, fuses both halves into one coupled,
> predictive, optimising system — built for problem statement SIH26120."

**Do:** Let the hero badges sit on screen for 3 seconds. No clicks yet.

---

### SCENE 2 — The problem, crisply (0:45–1:40) · Screen: scroll to "The coupling judges asked for"

> **Say:** "Here is the crux, and it fits in one chain. A steam slug heats a radius
> of rock. Heat collapses viscosity — two orders of magnitude. Lower viscosity feeds
> Vogel inflow. Inflow meets pump displacement at a single ratio called fillage.
> Fillage sets rod load, rod fatigue, steam-oil ratio, and rupees per day. Change
> anything on the left, and everything on the right moves. Operate the two sides
> separately and you get exactly what Baghewala gets today: higher steam-oil ratios,
> rod floating, impact loading, pump unsetting, and energy burned per barrel. Our
> twin computes this entire chain live, for every well, before a single rupee of
> steam is ordered."

**Do:** Slowly scroll the flow-chain into view. Pause on it.

---

### SCENE 3 — Field overview + the real map (1:40–3:00) · Screen: Field Overview

> **Say:** "This is the field. Twelve representative pads inside the two-hundred
> square kilometre Baghewala production lease, in the Bikaner–Nagaur basin — and I
> want to stress the map, because judges are rightly suspicious of AI-generated
> visuals. These are live OpenStreetMap tiles at true GPS coordinates. Zoom in and
> you'll see the real desert tracks around 27.58 north, 72.82 east — verifiable
> against any atlas. Nothing is rendered.
>
> Above the map, the KPIs: twelve modelled pads making roughly three-sixty barrels
> a day, which scales to the field's published record of twelve-oh-two barrels a
> day across thirty-three producers from April twenty-twenty-six. Mean steam-oil
> ratio inside the literature band of two-point-five to five. Mean viscosity inside
> Oil India's assay band of ten to thirteen thousand centipoise. We calibrated to
> published Oil India and SPE data — every source is listed on the Engineering
> Basis page, which I'll show at the end."

**Do:** Click **Field Overview** → zoom the map twice → click the **BGW-07** marker →
click **"Open digital twin"** in its popup.

---

### SCENE 4 — The well twin (3:00–3:55) · Screen: BGW-07 Digital Twin

> **Say:** "Well BGW-07, cycle five. Thermal completion — thermal wellhead and
> vacuum-insulated tubing — pump at one-thousand-seventy-five metres, perforations
> at eleven-oh-four to eleven-seventeen metres, the Baghewala-1 discovery interval.
> API fifteen-point-one, six-eighty millidarcies.
>
> Two charts matter here. The Vogel inflow curve — what the well can deliver at
> heated viscosity. And the viscosity–temperature curve on a log scale, anchored to
> Oil India's lab assays. The cold-oil curve would sit eight times lower than the
> heated one — that gap is the entire economic prize of steam, and everything from
> here on is about buying that gap as cheaply as possible."

**Do:** Linger 4 seconds on the IPR chart, then 4 seconds on the viscosity chart.

---

### SCENE 5 — CSS optimisation (3:55–5:00) · Screen: CSS Optimization

> **Say:** "Now the steam side. Drag the steam slider and three things respond:
> heated radius from Marx and Langenheim's nineteen-fifty-nine heat balance, the
> overburden heat-loss fraction, and soak efficiency. Every gigajoule is accounted.
>
> Watch the steam sweep: radius grows with the square root of steam, but SOR grows
> linearly — past roughly four-twenty-five cubic metres you're buying mostly SOR.
> Now the soak sweep: plus twelve hours of soak buys retention for zero extra
> steam. Soak is the cheapest barrel in thermal EOR, and the twin is the first
> place a Baghewala engineer sees that trade numerically instead of feeling it
> after the fuel bill arrives."

**Do:** Drag steam 410 → 500 (pause) → back to 410 → drag soak +12 hr (pause on the retention readout).

---

### SCENE 6 — SRP optimisation (5:00–6:05) · Screen: SRP Optimization

> **Say:** "The lift side. These surface and downhole dynamometer cards follow
> Everitt–Jennings character — the same four signatures a field analyst reads on a
> real card: the fluid-pound shoulder marks fillage, viscosity fattens the loop,
> gas rounds the corner, a leaking valve tapers the stroke.
>
> Push the SPM slider up and watch the pump-off cliff in the sweep below: past the
> inflow limit, production plateaus, fillage slides, and the Goodman fatigue ratio
> climbs toward the zero-point-eight endurance limit for Grade-D rods. Beside it,
> the rod-float margin in pounds of force — when it drops under two-fifty, the rods
> physically cannot fall faster than the fluid. That is rod float as a force
> balance, not a warning light."

**Do:** Drag SPM to 6.6 (hold 3 s on the cards) → return to 5.4 → point at Goodman + float margin readouts.

---

### SCENE 7 — The optimiser (6:05–7:05) · Screen: Well-to-Surface Optimizer

> **Say:** "This is the centrepiece. An exhaustive grid search over steam, soak and
> pump speed — every node evaluated, ranked on operating margin in rupees per day:
> oil revenue minus steam, power, and a risk penalty calibrated so a high-risk node
> can never outrank a safe one on rate alone. No machine-learning black box — a
> judge can re-derive the optimum by hand from the equation on screen.
>
> The Pareto frontier says it in one glance: up and left is better — more oil, less
> steam — and the optimum sits at the knee, where steam cost starts outrunning
> heated-mobility gains. The recommended window, the top-eight table, and the five
> numbered reasons with their exact figures go straight into the morning operating
> meeting."

**Do:** Hover two frontier bubbles (tooltip shows ₹/day) → scroll to "Why this optimum".

---

### SCENE 8 — Risk + sensors, fast (7:05–7:55) · Screen: Risk & Alerts, then Sensor Integrity

> **Say:** "Two reliability pages, quickly. Risk: every alert states its threshold —
> float margin nine hundred pounds, Goodman zero-point-eight, fillage sixty
> percent, SOR four, water cut sixty-five — with the mechanism in engineering units
> and a corrective action. You can disagree with a threshold; you never have to
> guess one.
>
> Sensors: the BGW-07 thermocouple reads eight-point-four degrees high. The twin
> flags it, excludes the channel, falls back to model temperature plus five
> corroborating channels — and restores confidence on recalibration."

**Do:** On Sensors, click **"Simulate field recalibration"** → hold 2 s on the green 0.0 residual.

---

### SCENE 9 — Close on the audit trail (7:55–8:40) · Screen: Engineering Basis

> **Say:** "And the page that makes the rest believable: every field number carries
> its public source — Oil India, SPE paper fifty-three-twenty-oh-three, the
> national data repository — and every equation carries its reference:
> Marx–Langenheim, Boberg–Lantz, Vogel, API RP-11L, IAPWS steam tables. Challenge
> any number in this system and it traces here. That is the Baghewala digital twin:
> real map, real correlations, real economics — thank you."

**Do:** Slow scroll down both provenance tables. Hold 3 s. **Stop recording.**

---

## 3. After recording — 10-minute edit

- Trim silences over 1.5 s; keep all chart pauses (judges read charts slower than you think).
- Add lower-third captions with the five key figures: **11,000 cP · 1,202 BOPD ·
  SOR < 3 · Goodman 0.80 · 27.58°N 72.82°E**.
- Export 1080p, H.264, ≤ 200 MB. Name it `SIH26120_Baghewala_DigitalTwin_Demo.mp4`.
- Watch once at 1× with this checklist: every click in Section 2 executed? every
  number spoken matches the screen? narration under 9:30 with title cards?

## 4. Likely judge questions (one-line answers)

| Question | Answer |
|---|---|
| Is this real data or synthetic? | Calibrated model: published OIL/SPE bands reproduced by construction; 12-pad layout representative; no live SCADA claimed — see Engineering Basis. |
| Why 12 wells, not 52? | Demo compression of the 52-well pattern; totals scale linearly to the 1,202 BOPD record (shown on Field Overview). |
| What is novel vs existing CSS software? | The coupling: one state vector (fillage) joins Marx–Langenheim heating to API RP 11L mechanics with ₹-ranked grid optimisation — thermal and lift are never optimised apart. |
| How is rod floating detected? | Downstroke force balance: buoyed rod weight vs fluid + viscous resistance; margin in lbf, 900/250 lbf thresholds. |
| What does SOR mean here? | Cycle SOR = cold-water-equivalent steam ÷ oil produced in the 60-day flush window; small-slug design targets < 3. |
| Can it take live SCADA? | Yes — providers are isolated (`src/data/*`); the Sensor Integrity page already implements the drift-exclusion contract a live feed needs. |
| Biggest limitation? | No history-matching to proprietary well files yet; productivity factor 0.42 is literature-typical, not field-matched — flagged openly on the site. |

## 5. Glossary (if a non-petroleum judge asks)

- **CSS** — Cyclic Steam Stimulation: inject steam → soak → produce, same well.
- **SRP** — Sucker-Rod Pump: beam unit driving a downhole plunger via rods.
- **SOR** — Steam-Oil Ratio: water-as-steam in ÷ oil out; lower is better.
- **BOPD** — barrels of oil per day. **BHT** — bottomhole temperature.
- **Vogel IPR** — curve of rate vs flowing pressure. **Goodman** — rod fatigue check.
- **VIT** — vacuum-insulated tubing keeps steam hot on the way down.
- **PML** — petroleum mining lease (the 200 km² block).
