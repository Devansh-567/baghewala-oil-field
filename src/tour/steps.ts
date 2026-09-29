/**
 * Guided judge tour — ordered stops across the twin.
 * Each step navigates to `route`, spotlights `[data-tour="target"]`
 * (or docks the card if the target is absent), and explains that
 * station in one or two sentences a non-specialist judge can follow.
 */
export interface TourStep {
  route: string;
  target?: string; // value of data-tour attribute to spotlight
  title: string;
  body: string;
  hint?: string; // small "try this" nudge shown under the body
}

export const TOUR_STEPS: TourStep[] = [
  {
    route: '/',
    target: 'mission-hero',
    title: '1 · The mission',
    body: 'Baghewala produces heavy oil that barely flows — 11,000 centipoise at 50 °C, like cold honey. This twin couples steam injection (CSS) and sucker-rod pumping (SRP) into one model, so a decision on one side is visible on the other before steam is ordered.',
  },
  {
    route: '/field',
    target: 'field-map',
    title: '2 · A real map, not a rendering',
    body: 'These are live OpenStreetMap tiles at true WGS84 pads inside the 200 km² Baghewala PML, Bikaner–Nagaur basin. Zoom in — the roads, tracks and terrain are the real Thar desert, verifiable against any atlas. Click any marker to open that well.',
    hint: 'Try: scroll-zoom into BGW-07, then click its popup.',
  },
  {
    route: '/field',
    target: 'field-kpis',
    title: '3 · Calibrated to published field data',
    body: 'Twelve representative pads produce ~360 BOPD, which scales to the published 1,202 BOPD record across 33 producers (April 2026). Mean SOR sits inside the CSS literature band of 2.5–5, and mean viscosity inside the Oil India assay band. Nothing here is fitted to look good.',
  },
  {
    route: '/well/BGW-07',
    target: 'well-schematic',
    title: '4 · The showcase well — BGW-07',
    body: 'BGW-07: cycle 5, API 15.1, permeability 680 mD. Thermal completion — thermal wellhead plus vacuum-insulated tubing — pump at 1,075 m, perforations at 1,104–1,117 m, the Baghewala-1 discovery interval. This schematic is the physical anchor for every number that follows.',
  },
  {
    route: '/well/BGW-07',
    target: 'well-ipr',
    title: '5 · Why steam works — in one chart',
    body: 'The Vogel inflow curve shows what the well can deliver at heated viscosity. The cold-oil curve would sit roughly 8× lower — that gap is the entire economic prize of CSS, and the viscosity–temperature curve below it shows exactly how heat buys that gap.',
  },
  {
    route: '/well/BGW-07/css',
    target: 'css-controls',
    title: '6 · CSS optimization — heat audit',
    body: 'Move the steam and soak sliders. Behind them runs Marx–Langenheim (1959): injected heat spreads a heated radius, overburden steals a fraction, soak efficiency keeps the rest. Every GJ is accounted — this is a heat balance, not a slider toy.',
    hint: 'Try: raise steam to 500 m³, then add +12 hr soak instead — compare retention.',
  },
  {
    route: '/well/BGW-07/css',
    target: 'css-sweeps',
    title: '7 · The diminishing-returns lesson',
    body: 'The steam sweep proves the central CSS trade: heated radius grows with the square root of steam, while SOR grows linearly. Past ~425 m³ you buy mostly SOR. Soak, by contrast, buys retention for free — the cheapest barrel in thermal EOR.',
  },
  {
    route: '/well/BGW-07/srp',
    target: 'srp-cards',
    title: '8 · SRP optimization — read the card',
    body: 'These surface and downhole dynamometer cards follow Everitt–Jennings character: the fluid-pound shoulder marks fillage, viscosity fattens the loop, gas rounds the corner. A field dynamometer analyst reads exactly these four signatures on a real card.',
    hint: 'Try: push SPM to 6.6 and watch the shoulder slide as fillage collapses.',
  },
  {
    route: '/well/BGW-07/srp',
    target: 'srp-integrity',
    title: '9 · Mechanical integrity in numbers',
    body: 'Goodman fatigue ratio against the 0.80 Grade-D endurance limit, rod-float margin in pounds of force, viscous drag in pounds. When the margin drops under 250 lbf the rods physically cannot fall faster than the fluid — that is rod float, stated as a force balance, not a vibe.',
  },
  {
    route: '/well/BGW-07/optimizer',
    target: 'opt-frontier',
    title: '10 · The optimizer — no black box',
    body: 'An exhaustive grid search over steam × soak × SPM — every node evaluated, ranked on operating margin in rupees per day: oil revenue minus steam, power and a risk penalty. The optimum sits at the knee of this Pareto frontier, and the top-8 table beside it lets anyone re-derive it by hand.',
    hint: 'Try: read the “Why this optimum” panel — each bullet carries its numbers.',
  },
  {
    route: '/well/BGW-07/forecast',
    target: 'forecast-band',
    title: '11 · Forecast with honest uncertainty',
    body: 'Arps decline times Ramey-type cooling toward virgin 47 °C, with a P10–P90 band that widens with horizon. When bottomhole temperature crosses ~60 °C, viscosity passes ~6,000 cP and fillage becomes the binding constraint — that crossing is the re-steam trigger, stated before it happens.',
  },
  {
    route: '/well/BGW-07/scenarios',
    target: 'scenario-lab',
    title: '12 · What-if lab — argue with the twin',
    body: 'Change anything and the margin delta in the header tells you instantly whether the idea earns or loses rupees per day — with the chain (radius, viscosity, fillage, Goodman) showing exactly why. This is where an engineer tests the optimizer instead of trusting it.',
  },
  {
    route: '/risk',
    target: 'risk-criteria',
    title: '13 · Alerts carry thresholds',
    body: 'Every alert states its criterion and threshold — float margin 900 lbf, Goodman 0.80, fillage 60%, SOR 4.0, water cut 65% — with mechanism in engineering units and a corrective action. A judge can disagree with a threshold; nobody has to guess one.',
  },
  {
    route: '/sensors',
    target: 'sensor-drift',
    title: '14 · Fail-safe sensing',
    body: 'The BGW-07 thermocouple reads +8.4 °C high. The twin flags it, excludes the channel, falls back to model temperature plus five corroborating channels — and restores confidence on recalibration. That is the difference between a dashboard and a safety-rated twin.',
    hint: 'Try: hit “Simulate field recalibration” and watch the residual collapse.',
  },
  {
    route: '/references',
    target: 'audit-trail',
    title: '15 · Challenge anything',
    body: 'The Engineering Basis page lists every field claim with its public source and every equation with its reference — Marx–Langenheim, Boberg–Lantz, Vogel, API RP 11L, IAPWS. End of tour: pick any number in this system and trace it here. Thank you.',
  },
];
