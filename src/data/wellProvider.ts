/**
 * Baghewala well inventory — representative development pads inside the real
 * Baghewala PML (Bikaner–Nagaur basin, ~27.58 °N 72.82 °E).
 *
 * Positions are TRUE WGS84 coordinates rendered on OpenStreetMap tiles
 * (© OpenStreetMap contributors, ODbL). The 12 pads sit on a 5 × 3 km
 * development grid about the PML centre — the same pattern Oil India uses
 * for the 52-well development (33 producing, Apr-2026 record 1,202 BOPD).
 * Per-well rates (15–45 BOPD) reproduce the published field total when
 * scaled to 33 producers.
 *
 * Subsurface + operating point per well comes from the coupled
 * Marx–Langenheim → Vogel IPR → API RP 11L solve in simulation/physics.ts,
 * with per-well API (14–19), pressure (70–95 bar) and permeability
 * (300–1500 mD) spanning the published Jodhpur Sandstone ranges.
 */
import { clamp, hashStringToSeed, mulberry32, round } from '../utils/rng';
import { mu50ForApi } from '../engineering/correlations';
import { solveCoupledChain } from '../simulation/physics';
import { FIELD, RESERVOIR, SRP } from '../engineering/fieldConstants';
import type { WellState, WellStatus } from '../types';

export const FIELD_CENTRE = { lat: FIELD.centreLat, lon: FIELD.centreLon };

interface PadDef {
  id: string;
  dLat: number;
  dLon: number;
  status: WellStatus;
  cssCycle: number;
  api: number;
  presBar: number;
  permMD: number;
  steamM3: number;
  soakHr: number;
  injPBar: number;
  injHr: number;
  spm: number;
  strokeIn: number;
  vfdHz: number;
  waterCut: number;
}

// 12 representative pads — deterministic, survey-style layout.
// dLat/dLon in degrees (≈111 km/deg lat, ≈98 km/deg lon here).
const PADS: PadDef[] = [
  { id: 'BGW-01', dLat: 0.012, dLon: -0.018, status: 'Producing', cssCycle: 4, api: 16.8, presBar: 86, permMD: 980, steamM3: 410, soakHr: 72, injPBar: 28, injHr: 48, spm: 5.2, strokeIn: 74, vfdHz: 46, waterCut: 0.24 },
  { id: 'BGW-02', dLat: 0.008, dLon: -0.006, status: 'Producing', cssCycle: 3, api: 15.4, presBar: 82, permMD: 860, steamM3: 430, soakHr: 84, injPBar: 30, injHr: 52, spm: 4.8, strokeIn: 74, vfdHz: 44, waterCut: 0.28 },
  { id: 'BGW-03', dLat: 0.014, dLon: 0.007, status: 'Soaking', cssCycle: 5, api: 14.6, presBar: 78, permMD: 720, steamM3: 470, soakHr: 96, injPBar: 32, injHr: 56, spm: 4.4, strokeIn: 70, vfdHz: 42, waterCut: 0.31 },
  { id: 'BGW-04', dLat: 0.002, dLon: -0.014, status: 'Producing', cssCycle: 2, api: 17.6, presBar: 90, permMD: 1200, steamM3: 380, soakHr: 60, injPBar: 26, injHr: 44, spm: 5.6, strokeIn: 78, vfdHz: 48, waterCut: 0.21 },
  { id: 'BGW-05', dLat: 0.0, dLon: 0.0, status: 'Producing', cssCycle: 4, api: 16.1, presBar: 84, permMD: 910, steamM3: 415, soakHr: 78, injPBar: 29, injHr: 50, spm: 5.0, strokeIn: 74, vfdHz: 45, waterCut: 0.27 },
  { id: 'BGW-06', dLat: -0.004, dLon: 0.012, status: 'Injecting', cssCycle: 3, api: 15.8, presBar: 80, permMD: 800, steamM3: 450, soakHr: 72, injPBar: 31, injHr: 54, spm: 4.6, strokeIn: 72, vfdHz: 43, waterCut: 0.3 },
  { id: 'BGW-07', dLat: -0.010, dLon: -0.004, status: 'Producing', cssCycle: 5, api: 15.1, presBar: 76, permMD: 680, steamM3: 440, soakHr: 90, injPBar: 30, injHr: 52, spm: 5.4, strokeIn: 76, vfdHz: 47, waterCut: 0.33 },
  { id: 'BGW-08', dLat: -0.014, dLon: 0.009, status: 'Producing', cssCycle: 2, api: 18.2, presBar: 92, permMD: 1350, steamM3: 360, soakHr: 54, injPBar: 25, injHr: 42, spm: 5.8, strokeIn: 80, vfdHz: 50, waterCut: 0.19 },
  { id: 'BGW-09', dLat: 0.006, dLon: 0.019, status: 'Soaking', cssCycle: 4, api: 14.9, presBar: 74, permMD: 610, steamM3: 480, soakHr: 108, injPBar: 33, injHr: 58, spm: 4.2, strokeIn: 68, vfdHz: 41, waterCut: 0.35 },
  { id: 'BGW-10', dLat: -0.008, dLon: -0.016, status: 'Producing', cssCycle: 3, api: 16.5, presBar: 88, permMD: 1050, steamM3: 395, soakHr: 66, injPBar: 27, injHr: 46, spm: 5.1, strokeIn: 74, vfdHz: 45, waterCut: 0.25 },
  { id: 'BGW-11', dLat: -0.016, dLon: -0.010, status: 'Shut-in', cssCycle: 6, api: 14.2, presBar: 71, permMD: 480, steamM3: 460, soakHr: 100, injPBar: 32, injHr: 55, spm: 3.8, strokeIn: 66, vfdHz: 39, waterCut: 0.42 },
  { id: 'BGW-12', dLat: 0.010, dLon: -0.028, status: 'Producing', cssCycle: 1, api: 17.2, presBar: 89, permMD: 1150, steamM3: 370, soakHr: 58, injPBar: 26, injHr: 43, spm: 5.5, strokeIn: 78, vfdHz: 49, waterCut: 0.22 },
];

function buildWell(pad: PadDef): WellState {
  const seed = hashStringToSeed(pad.id);
  const rnd = mulberry32(seed);
  const lat = round(FIELD.centreLat + pad.dLat + (rnd() - 0.5) * 0.0012, 5);
  const lon = round(FIELD.centreLon + pad.dLon + (rnd() - 0.5) * 0.0012, 5);

  const chain = solveCoupledChain(
    {
      steamVolumeM3: pad.steamM3,
      injectionPressureBar: pad.injPBar,
      injectionDurationHours: pad.injHr,
      soakHours: pad.soakHr,
      productionCutoffWaterCut: 65,
    },
    { spm: pad.spm, strokeIn: pad.strokeIn, vfdHz: pad.vfdHz },
    RESERVOIR.virginTempC,
    pad.presBar,
    pad.api,
    pad.waterCut,
    pad.permMD
  );

  const waterCutPct = round(pad.waterCut * 100 + (rnd() - 0.5) * 1.5, 1);
  const thermalCoolingRisk = round(clamp((95 - chain.bottomholeTempC) * 1.35, 3, 95), 0);
  const overallRisk = round(
    clamp(chain.rodFloatRisk * 0.4 + chain.impactRisk * 0.35 + thermalCoolingRisk * 0.25, 2, 97),
    0
  );
  const daysSinceInjectionStart = Math.floor(10 + rnd() * 70);

  return {
    id: pad.id,
    name: pad.id,
    x: round(((lon - (FIELD.centreLon - 0.035)) / 0.07) * 100, 1),
    y: round((1 - (lat - (FIELD.centreLat - 0.025)) / 0.05) * 100, 1),
    lat,
    lon,
    elevationM: round(208 + rnd() * 14, 0),
    status: pad.status,
    cssCycle: pad.cssCycle,
    daysSinceInjectionStart,

    reservoirPressureBar: pad.presBar,
    reservoirTempC: RESERVOIR.virginTempC,
    apiGravity: pad.api,
    permeabilityProxy: round(clamp((pad.permMD - 300) / 1200, 0, 1), 2),

    bottomholeTempC: chain.bottomholeTempC,
    fluidViscosityCp: chain.viscosityCp,
    wellheadPressureBar: round(1.6 + (chain.inflowBopd / 60) + rnd() * 0.4, 2),

    steamVolumeM3: pad.steamM3,
    soakHours: pad.soakHr,
    injectionPressureBar: pad.injPBar,
    injectionDurationHours: pad.injHr,
    productionCutoffWaterCut: 65,

    spm: pad.spm,
    strokeIn: pad.strokeIn,
    vfdHz: pad.vfdHz,
    pumpFillagePct: round(chain.fillageFrac * 100, 1),
    rodLoadKlb: round(chain.peakLoadLb / 1000, 2),
    peakLoadKlb: round(chain.peakLoadLb / 1000, 2),

    productionBopd: chain.liftedBopd,
    waterCutPct,
    sor: chain.sor,
    energyConsumptionKwh: Math.round(chain.steamEnergyMWh * 1000),
    pumpEfficiencyPct: round(clamp(96 - (1 - chain.fillageFrac) * 62 - Math.pow(chain.viscosityCp / 14000, 0.5) * 14, 28, 94), 1),

    rodFloatingRisk: chain.rodFloatRisk,
    impactLoadingRisk: chain.impactRisk,
    thermalCoolingRisk,
    overallRisk,

    heatedRadiusM: chain.heatedRadiusM,
    heatInjectedGJ: chain.heatInjectedGJ,
    goodmanRatio: chain.goodmanRatio,
    rodFloatMarginLb: chain.rodFloatMarginLb,
    prhpKw: chain.prhpKw,
    permeabilityMD: pad.permMD,
    pumpDepthM: SRP.pumpDepthM,
    payDepthM: RESERVOIR.payDepthM,
    mu50Cp: Math.round(mu50ForApi(pad.api)),

    seed,
  };
}

const WELLS: WellState[] = PADS.map(buildWell);

export function getWells(): WellState[] {
  return WELLS;
}

export function getWell(id: string): WellState | undefined {
  return WELLS.find((w) => w.id === id);
}

export function getWellIds(): string[] {
  return PADS.map((p) => p.id);
}
