import { round } from '../utils/rng';
import type { WellState } from '../types';
import { arpsForecast, coolingCurve, viscosityCpAtTemp } from '../engineering/correlations';
import { RESERVOIR } from '../engineering/fieldConstants';

export interface ForecastPoint {
  day: number;
  productionBopd: number;
  waterCutPct: number;
  bottomholeTempC: number;
  fluidViscosityCp: number;
  pumpFillagePct: number;
  energyConsumptionKwh: number;
  uncertaintyLow: number;
  uncertaintyHigh: number;
}

/**
 * Forecast = Arps exponential decline [Arps-45] for rate × Ramey-type
 * exponential cooling toward virgin Tres for temperature × μ(T) for
 * viscosity. Uncertainty bands widen with horizon (P10/P90 ≈ ±(5% + 0.5%/day)).
 * Deterministic — same well + horizon → same curve, every reload.
 */
export function buildForecast(well: WellState, horizonDays: 7 | 14 | 30): ForecastPoint[] {
  // Decline rate inferred from cycle position: early-cycle flush, late-cycle stripper
  const cycleFrac = Math.min(1, well.daysSinceInjectionStart / 95);
  const declinePerDay = 0.004 + cycleFrac * 0.009;
  const rates = arpsForecast(well.productionBopd, declinePerDay, horizonDays);
  const temps = coolingCurve(well.bottomholeTempC, RESERVOIR.virginTempC, horizonDays, 55);

  return rates.map((q, i) => {
    const day = i + 1;
    const bht = round(temps[i], 1);
    const mu = Math.round(viscosityCpAtTemp(bht, well.apiGravity));
    const fillage = round(Math.max(20, well.pumpFillagePct - (well.bottomholeTempC - bht) * 0.55 - day * 0.12), 1);
    const waterCutPct = round(well.waterCutPct + day * 0.14, 1);
    const energyConsumptionKwh = Math.round(well.energyConsumptionKwh * (0.985 + (1 - q / Math.max(1, well.productionBopd)) * 0.1));
    const band = q * (0.05 + (day / horizonDays) * 0.14);
    return {
      day,
      productionBopd: round(Math.max(2, q), 1),
      waterCutPct,
      bottomholeTempC: bht,
      fluidViscosityCp: mu,
      pumpFillagePct: fillage,
      energyConsumptionKwh,
      uncertaintyLow: round(Math.max(1, q - band), 1),
      uncertaintyHigh: round(q + band, 1),
    };
  });
}
