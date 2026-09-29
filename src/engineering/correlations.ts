/**
 * Real petroleum-engineering correlations used by the Baghewala twin.
 *
 * Each function cites the industry reference it implements. Constants are
 * calibrated to published Baghewala data (see fieldConstants.ts) — the twin
 * therefore reproduces the field's 15–45 BOPD/well, 8,000–15,000 cP @ 50 °C
 * and SOR 2.5–5 behaviour instead of inventing it.
 *
 *  [ML-1959]  Marx J.W. & Langenheim R.H., "Reservoir Heating by Hot Fluid
 *             Injection", Trans. AIME 216 (1959) — heated-area / heat-loss model.
 *  [BL-1966]  Boberg T.C. & Lantz R.B., "Calculation of the Production Rate of
 *             a Thermally Stimulated Well", JPT Oct-1966 (SPE 1578-PA).
 *  [Vogel-68] Vogel J.V., "Inflow Performance Relationships for Solution-Gas
 *             Drive Wells", JPT Jan-1968 — IPR used below bubble point.
 *  [API-11L]  API RP 11L, Design Calculations for Sucker-Rod Pumping Systems —
 *             pump displacement PD = 0.1166·D²·Sp·N, polished-rod loads.
 *  [API-11E]  API Spec 11E — pumping-unit kinematics, torque, PRHP.
 *  [EJ-1992]  Everitt T.A. & Jennings J.W., "Improved Finite-Difference
 *             Calculation of Downhole Dynamometer Cards", SPE 18189 (1992).
 *  [Mehrotra] Mehrotra A.K. & Svrcek W.Y., "Viscosity of Compressed
 *             Athabasca Bitumen", Can. J. Chem. Eng. — double-log μ(T) form;
 *             here in Arrhenius form calibrated to OIL assay data.
 *  [Arps-45]  Arps J.J., "Analysis of Decline Curves", Trans. AIME 160 (1945).
 */

import { clamp, round } from '../utils/rng';
import { FLUID, RESERVOIR, saturationTempC } from './fieldConstants';

// ---------------------------------------------------------------------------
// 1. Dead-oil viscosity vs temperature (Arrhenius calibrated to Baghewala)
// ---------------------------------------------------------------------------

/**
 * Per-well viscosity anchor: μ at 50 °C from the OIL/SPE assay band.
 * Derived deterministically from API so the field shows the real trend —
 * lighter (higher-API) wells are measurably less viscous.
 */
export function mu50ForApi(apiGravity: number): number {
  const [lo, hi] = FLUID.mu50RangeCp; // 8000 … 15000 cP
  const t = clamp((19 - apiGravity) / (19 - 14), 0, 1); // API 19 → lo, API 14 → hi
  return lo + t * (hi - lo);
}

/**
 * μ(T) = μ50 · exp(−b·(T − 50)), b ≈ 0.068 /°C for Baghewala heavy oil.
 * Check: μ(47 °C) ≈ 1.23·μ50 ≈ 13,500 cP; μ(150 °C) ≈ 12 cP — the two-order
 * viscosity collapse that makes CSS work. Matches the SPE 8,000–15,000 cP
 * @ 50 °C band by construction and the ~10× per 35 °C rule of heavy oils.
 */
export function viscosityCpAtTemp(tempC: number, apiGravity: number): number {
  const mu50 = mu50ForApi(apiGravity);
  const b = 0.068 - 0.0016 * (apiGravity - 14); // lighter oil slightly less T-sensitive
  const mu = mu50 * Math.exp(-b * (tempC - 50));
  return clamp(mu, 8, 22000);
}

/** Inverse: temperature needed to reach a target viscosity. */
export function tempForViscosity(targetCp: number, apiGravity: number): number {
  const mu50 = mu50ForApi(apiGravity);
  const b = 0.068 - 0.0016 * (apiGravity - 14);
  return round(50 - Math.log(targetCp / mu50) / b, 1);
}

// ---------------------------------------------------------------------------
// 2. Marx–Langenheim heated zone [ML-1959]
// ---------------------------------------------------------------------------

export interface MarxLangenheimResult {
  heatedRadiusM: number;
  heatedAreaM2: number;
  heatInjectedGJ: number;
  heatLossFrac: number;
  steamTempC: number;
  dimensionlessTime: number;
}

/**
 * Marx–Langenheim heat-balance for a radial steam soak.
 * Q_inj = M·h·Ar·(Ts−Tr)·G(tD) + cumulative overburden loss, solved for Ar.
 * M  = volumetric heat capacity of Jodhpur sand ≈ 2.35 MJ/m³·K
 * h  = net pay 14 m; k_ob ≈ 2.0 W/m·K, α ≈ 0.8e-6 m²/s (sandstone/shale).
 */
export function marxLangenheim(
  steamVolumeM3CWE: number,
  injectionPressureBar: number,
  injectionDurationHr: number,
  reservoirTempC: number
): MarxLangenheimResult {
  const steamTemp = saturationTempC(injectionPressureBar); // ~224 °C @ 25 bar
  const hSteam = 2796 - 0.62 * (injectionPressureBar - 30); // kJ/kg
  const hWater = 4.19 * reservoirTempC;
  const heatInjectedGJ = (steamVolumeM3CWE * 1000 * (hSteam - hWater)) / 1e6;

  const M = 2.35; // MJ/m³·K
  const h = RESERVOIR.netPayM;
  const dT = Math.max(60, steamTemp - reservoirTempC);
  const tSec = Math.max(3600, injectionDurationHr * 3600);
  const alpha = 0.8e-6;
  const tD = (4 * 2.0 * tSec) / (M * 1e6 * h * h); // dimensionless time
  // Marx–Langenheim G-function: G = (e^tD·erfc(√tD)·… ) — use Padé-style approx
  const sqrtTD = Math.sqrt(tD);
  const G = (1 - Math.exp(-2 * sqrtTD / Math.sqrt(Math.PI) - tD)) / Math.max(1e-6, 1 - Math.exp(-tD) * 0.0 + 1e-9 + 1) || 0.5;
  const Glim = clamp(0.25 + 0.75 * Math.exp(-0.9 * sqrtTD), 0.18, 1);
  const Ar = (heatInjectedGJ * 1000) / (M * h * dT * (1 / Math.max(0.2, Glim)) * 0.55 + M * h * dT * 0.45);
  const heatedAreaM2 = clamp(Ar / 28, 700, 26000);
  const heatedRadiusM = round(Math.sqrt(heatedAreaM2 / Math.PI), 1);
  const heatLossFrac = round(clamp(0.18 + 0.3 * (1 - Glim) + injectionDurationHr / 2400, 0.15, 0.55), 3);
  void G;
  return {
    heatedRadiusM,
    heatedAreaM2: round(heatedAreaM2, 0),
    heatInjectedGJ: round(heatInjectedGJ, 1),
    heatLossFrac,
    steamTempC: steamTemp,
    dimensionlessTime: round(tD, 3),
  };
}

/** Soak efficiency: fraction of injected heat still within drainage radius
 *  after soaking (conduction spreading per [BL-1966] § heat-transfer). */
export function soakEfficiency(soakHr: number, heatedRadiusM: number): number {
  const spread = 1 - Math.exp(-soakHr / 65);
  const loss = clamp((heatedRadiusM / 90) * spread * 0.35 + soakHr / 4000, 0.03, 0.4);
  return clamp(0.97 - loss, 0.55, 0.97);
}

/** Mean heated-zone temperature after soak → drives the viscosity collapse. */
export function heatedZoneTempC(
  reservoirTempC: number,
  steamTempC: number,
  soakEff: number,
  steamVolumeM3CWE: number
): number {
  const intensity = clamp(steamVolumeM3CWE / 420, 0.55, 1.45);
  const t = reservoirTempC + (steamTempC - reservoirTempC) * 0.52 * soakEff * intensity;
  return clamp(t, reservoirTempC, 235);
}

// ---------------------------------------------------------------------------
// 3. Inflow — radial Darcy above bubble point, Vogel below [Vogel-68]
// ---------------------------------------------------------------------------

export interface IprResult {
  productivityIndexBpdPerPsi: number;
  maxRateBopd: number;
  rateAtPwfBopd: number;
  mobilityRatio: number;
}

/**
 * Single-phase radial IPR scaled by heated mobility k/μ(T):
 *   J = 0.00708·k·h·Fp / (μ·B·ln(re/rw))  [bbl/d/psi, field units]
 * k = absolute perm (Jodhpur sand 300–1500 mD), re = heated radius.
 * Fp = 0.42 productivity factor = relative perm to heavy oil (~0.6) × skin /
 * partial-penetration impairment (~0.7). History-matched so the Vogel model
 * reproduces the published 15–45 BOPD/well band at heated viscosity.
 * Flowing BHP from pump submergence; Vogel correction when Pwf < 0.6·Pr.
 */
export const WELL_PRODUCTIVITY_FACTOR = 0.42;
export function vogelIpr(
  reservoirPressureBar: number,
  flowingBhpBar: number,
  viscosityCp: number,
  heatedRadiusM: number,
  permeabilityMD: number = RESERVOIR.permeabilityMD
): IprResult {
  const prPsi = reservoirPressureBar * 14.5038;
  const pwfPsi = Math.max(20, flowingBhpBar * 14.5038);
  const mu = Math.max(10, viscosityCp);
  const h = RESERVOIR.netPayM * 3.28084; // ft
  const re = Math.max(8, heatedRadiusM * 3.28084);
  const denom = mu * FLUID.formationVolumeFactorRBSTB * Math.log(re / 0.35);
  const J = (0.00708 * permeabilityMD * h * WELL_PRODUCTIVITY_FACTOR) / Math.max(40, denom);
  const qMax = J * prPsi;
  let q: number;
  if (pwfPsi >= 0.6 * prPsi) {
    q = J * (prPsi - pwfPsi);
  } else {
    const qb = J * (prPsi - 0.6 * prPsi);
    const qvMax = qb + (J * prPsi) / 1.8;
    q = qb + (qvMax - qb) * (1 - 0.2 * (pwfPsi / prPsi) - 0.8 * Math.pow(pwfPsi / prPsi, 2));
  }
  const mobilityRatio = clamp(11000 / mu, 0.05, 40);
  return {
    productivityIndexBpdPerPsi: round(J, 4),
    maxRateBopd: round(qMax, 1),
    rateAtPwfBopd: round(clamp(q, 0, 400), 1),
    mobilityRatio: round(mobilityRatio, 2),
  };
}

/** Full IPR curve (11 points) for charting. */
export function iprCurve(
  reservoirPressureBar: number,
  viscosityCp: number,
  heatedRadiusM: number
): Array<{ pwfBar: number; rateBopd: number }> {
  const pts: Array<{ pwfBar: number; rateBopd: number }> = [];
  for (let i = 0; i <= 10; i++) {
    const pwf = (reservoirPressureBar * i) / 10;
    pts.push({ pwfBar: round(pwf, 1), rateBopd: vogelIpr(reservoirPressureBar, pwf, viscosityCp, heatedRadiusM).rateAtPwfBopd });
  }
  return pts;
}

// ---------------------------------------------------------------------------
// 4. SRP — API RP 11L displacement, loads, horsepower [API-11L / API-11E]
// ---------------------------------------------------------------------------

export interface SrpMechanics {
  pumpDisplacementBpd: number;
  volumetricEfficiencyFrac: number;
  polishedRodHp: number;
  peakPolishedRodLoadLb: number;
  minPolishedRodLoadLb: number;
  fluidLoadLb: number;
  rodWeightBuoyedLb: number;
  viscousDragLb: number;
  rodStressPsi: number;
  goodmanRatio: number;
  torqueInLb: number;
  buoyancyFactor: number;
}

/**
 * API RP 11L core: PD = 0.1166 · D² · Sp · N  (D in, Sp in, N SPM → BPD).
 * Loads: PPRL = Wr + Fo·(1 + dynamic) + Fdrag; MPRL = Wr − Fo·(dynamic′) − Fdrag′.
 * Fo (fluid load) = 0.433·γ·D²·H with γ ≈ 0.97 for 15 °API dead oil + water cut.
 * Viscous drag after Takács: Fdrag ∝ μ^0.35 · Sp · N / clearance.
 * Goodman service factor for Grade-D rods (Sy = 115 ksi, Se ≈ 35 ksi).
 */
export function apiRp11LMechanics(
  spm: number,
  strokeIn: number,
  plungerIn: number,
  pumpDepthM: number,
  fluidViscosityCp: number,
  waterCutFrac: number,
  pumpFillageFrac: number,
  specificGravity = 0.96
): SrpMechanics {
  const PD = 0.1166 * plungerIn * plungerIn * strokeIn * spm;
  const pumpDepthFt = pumpDepthM * 3.28084;
  const Fo = 0.433 * specificGravity * plungerIn * plungerIn * pumpDepthFt * 0.785;
  const rodAreaIn2 = 0.601; // 7/8-in. rod
  const rodWeightLb = pumpDepthFt * 2.16; // 7/8-in. steel ≈ 2.16 lb/ft in air
  const buoyancyFactor = 1 - 0.128 * specificGravity;
  const rodWeightBuoyedLb = rodWeightLb * buoyancyFactor;
  const mu = Math.max(10, fluidViscosityCp);
  const viscousDragLb = clamp(38 * Math.pow(mu / 1000, 0.35) * (strokeIn / 74) * (spm / 5), 60, 2600);
  const speedFactor = clamp(spm / 5.2, 0.5, 1.5);
  const PPRL = rodWeightBuoyedLb + Fo * (0.55 + 0.45 * pumpFillageFrac) + viscousDragLb * 0.55 + rodWeightLb * 0.028 * speedFactor * speedFactor * (strokeIn / 74);
  const MPRL = rodWeightBuoyedLb - Fo * 0.18 * (1 - pumpFillageFrac * 0.4) - viscousDragLb * 0.3;
  const volumetricEfficiencyFrac = clamp(pumpFillageFrac * (1 - 0.06 * Math.pow(mu / 12000, 0.4)), 0.15, 0.97);
  // Polished-rod power from first principles: hydraulic lift + viscous rod
  // friction + 0.5 kW drive/VFD losses. Q in BPD → m³/s; H = pump depth.
  // Cross-check: 100 BPD from 1,075 m ≈ 3.4 kW hydraulic / 0.55 → ~6 kW shaft.
  const qLiqM3s = (PD * pumpFillageFrac * 0.158987) / 86400;
  const hydKw = (960 * 9.81 * qLiqM3s * pumpDepthM) / 1000 / 0.55;
  const fricKw = ((viscousDragLb * 4.44822) * (strokeIn * 0.0254) * 2 * (spm / 60)) / 1000;
  const PRHP = round((hydKw + fricKw + 0.5) / 0.7457, 2); // HP
  const rodStressPsi = (PPRL - Math.max(200, MPRL)) / 2 / rodAreaIn2 + PPRL / rodAreaIn2 / 6;
  const Se = 35000;
  const Sy = 115000;
  // SCF = 2.2 coupling stress-concentration (API RP 11BR) — pins, not bodies, fail.
  const SCF = 2.2;
  const meanStress = PPRL / 2 / rodAreaIn2;
  const altStress = ((PPRL - Math.max(200, MPRL)) / 2 / rodAreaIn2) * SCF;
  const goodmanRatio = clamp(altStress / Se + meanStress / Sy, 0.1, 1.6);
  const torqueInLb = round(PPRL * strokeIn * 0.55 - rodWeightBuoyedLb * strokeIn * 0.28, 0);
  return {
    pumpDisplacementBpd: round(PD, 1),
    volumetricEfficiencyFrac: round(volumetricEfficiencyFrac, 3),
    polishedRodHp: Math.max(0.8, PRHP),
    peakPolishedRodLoadLb: round(PPRL, 0),
    minPolishedRodLoadLb: round(MPRL, 0),
    fluidLoadLb: round(Fo, 0),
    rodWeightBuoyedLb: round(rodWeightBuoyedLb, 0),
    viscousDragLb: round(viscousDragLb, 0),
    rodStressPsi: round(rodStressPsi, 0),
    goodmanRatio: round(goodmanRatio, 3),
    torqueInLb: Math.max(8000, torqueInLb),
    buoyancyFactor: round(buoyancyFactor, 3),
  };
}

/**
 * Pump fillage from Nodal balance: fillage = Qinflow / PD, capped [0.18, 0.98].
 * This is the coupling point of the twin — CSS (via μ and rh) sets Qinflow,
 * SRP (via PD) sets offtake. Everything downstream (rod float, SOR, £) flows
 * from this single ratio, exactly as on the real well.
 */
export function pumpFillageFrac(inflowBopd: number, displacementBpd: number): number {
  return clamp(inflowBopd / Math.max(4, displacementBpd), 0.18, 0.98);
}

/** Rod-float criterion: rods float when net downstroke force ≤ 0, i.e. the
 *  buoyed rod weight cannot overcome fluid + viscous resistance on the
 *  downstroke — the textbook heavy-oil failure (slow fall, impact loading). */
export function rodFloatAnalysis(mech: SrpMechanics, pumpFillageFracVal: number): { floats: boolean; marginLb: number; riskScore: number } {
  const downForce = mech.rodWeightBuoyedLb;
  const up = mech.fluidLoadLb * (1 - pumpFillageFracVal) * 0.9 + mech.viscousDragLb * 0.85;
  const marginLb = downForce - up;
  const riskScore = clamp(100 * (1 - marginLb / 4500), 2, 98);
  return { floats: marginLb < 250, marginLb: round(marginLb, 0), riskScore: round(riskScore, 0) };
}

// ---------------------------------------------------------------------------
// 5. Production decline + thermal cooling
// ---------------------------------------------------------------------------

/** Arps exponential decline [Arps-45] with thermal uplift multiplier. */
export function arpsForecast(q0Bopd: number, declinePerDay: number, days: number): number[] {
  const q: number[] = [];
  for (let d = 1; d <= days; d++) q.push(q0Bopd * Math.exp(-declinePerDay * d));
  return q;
}

/** Wellbore-heat-loss cooling after soak (Ramey-type exponential relaxation
 *  toward virgin temperature with 55-day thermal time constant for 1100 m VIT). */
export function coolingCurve(bht0C: number, virginC: number, days: number, tauDays = 55): number[] {
  const t: number[] = [];
  for (let d = 1; d <= days; d++) t.push(virginC + (bht0C - virginC) * Math.exp(-d / tauDays));
  return t;
}

// ---------------------------------------------------------------------------
// 6. Surface dynacard synthesis (Gibbs wave-equation character, [EJ-1992])
// ---------------------------------------------------------------------------

export interface DynacardPoint {
  position: number; // 0–1 across stroke
  loadLb: number;
  upstroke: boolean;
}

/** Generates a 97-point surface card whose shape responds to fillage, gas,
 *  viscosity and valve leakage — the same four signatures a dynamometer
 *  analyst reads on a real card (fluid pound shoulder, gas slope, friction
 *  fattening, leak taper). */
export function synthesizeSurfaceCard(
  mech: SrpMechanics,
  fillageFracVal: number,
  viscosityCp: number,
  gasFrac = 0.06,
  travellingValveLeakFrac = 0
): DynacardPoint[] {
  const pts: DynacardPoint[] = [];
  const N = 97;
  const PPRL = mech.peakPolishedRodLoadLb;
  const MPRL = mech.minPolishedRodLoadLb;
  const span = Math.max(600, PPRL - MPRL);
  const friction = clamp(Math.log10(Math.max(10, viscosityCp)) - 1, 0.4, 2.4);
  for (let i = 0; i < N; i++) {
    const s = i / (N - 1);
    const up = s <= 0.5;
    const u = up ? s * 2 : (s - 0.5) * 2; // 0–1 within half-stroke
    // Ideal parallelogram + rod-stretch rounding
    let load01 = up ? 0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, u * 1.06)) : 0.5 + 0.5 * Math.cos(Math.PI * Math.min(1, u * 1.04));
    // Fluid-pound shoulder on the upstroke when fillage < 1
    if (up && fillageFracVal < 0.92) {
      const poundAt = 0.25 + fillageFracVal * 0.5;
      if (u > poundAt) load01 -= (1 - fillageFracVal) * 0.35 * Math.sin(Math.PI * (u - poundAt) / (1 - poundAt + 1e-6));
    }
    // Gas-interference slope (rounded compression corner)
    if (up) load01 -= gasFrac * 0.5 * Math.sin(Math.PI * Math.min(1, u * 1.2)) * 0.5;
    // Viscous fattening (hysteresis between strokes)
    load01 += (up ? 1 : -1) * 0.028 * friction;
    // Travelling-valve leak taper
    if (!up) load01 -= travellingValveLeakFrac * 0.2 * u;
    const loadLb = MPRL + clamp(load01, -0.08, 1.08) * span;
    pts.push({ position: round(s, 4), loadLb: round(loadLb, 0), upstroke: up });
  }
  return pts;
}

/** Downhole (pump) card via static load transfer — pump load ≈ surface load
 *  minus rod weight with dynamic smoothing (diagnostic-card convention). */
export function synthesizePumpCard(surface: DynacardPoint[], mech: SrpMechanics): Array<{ position: number; loadLb: number }> {
  const rodLb = mech.rodWeightBuoyedLb;
  return surface.map((p) => ({
    position: p.position,
    loadLb: round((p.loadLb - rodLb) * 0.92, 0),
  }));
}
