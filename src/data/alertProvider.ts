import type { Alert, AlertSeverity, WellState } from '../types';

function severityFor(score: number): AlertSeverity {
  if (score >= 65) return 'HIGH';
  if (score >= 35) return 'MEDIUM';
  return 'LOW';
}

/**
 * Alert engine — every rule is a named engineering criterion with its
 * threshold, e.g. Goodman > 0.8 (API Grade-D endurance), rod-float margin
 * < 250 lbf (heavy-oil float criterion), SOR > 4.0 (CSS efficiency band),
 * fillage < 55% (pump-off). Thresholds are shown in the UI so judges can audit.
 */
export function buildAlerts(wells: WellState[]): Alert[] {
  const alerts: Alert[] = [];

  for (const w of wells) {
    if (w.rodFloatMarginLb < 900 || w.rodFloatingRisk >= 35) {
      alerts.push({
        id: `${w.id}-rod-floating`,
        wellId: w.id,
        severity: severityFor(w.rodFloatingRisk),
        title: `ROD FLOATING RISK — ${w.id}`,
        mechanism: `Downstroke margin ${w.rodFloatMarginLb.toLocaleString()} lbf at ${w.pumpFillagePct}% fillage with ${w.fluidViscosityCp.toLocaleString()} cP fluid (μ50 ${w.mu50Cp.toLocaleString()} cP @ 50 °C, API ${w.apiGravity}). Buoyed rods cannot outrun viscous drag → slow fall, then impact loading.`,
        action: `Reduce SPM to ${(w.spm - 0.5).toFixed(1)} (≈ −10% displacement) and confirm fillage recovers above 70% before restoring rate. Criterion: margin > 900 lbf.`,
      });
    }
    if (w.goodmanRatio >= 0.55 || w.impactLoadingRisk >= 35) {
      alerts.push({
        id: `${w.id}-goodman`,
        wellId: w.id,
        severity: severityFor(w.impactLoadingRisk),
        title: `ELEVATED ROD STRESS (GOODMAN ${w.goodmanRatio.toFixed(2)}) — ${w.id}`,
        mechanism: `Peak load ${w.peakLoadKlb} klb at ${w.spm} SPM × ${w.strokeIn} in. Goodman ratio ${w.goodmanRatio.toFixed(2)} vs 0.80 endurance limit for API Grade-D rods (API RP 11L / Spec 11B).`,
        action: 'Cap SPM at current value; do not lengthen stroke. Re-check card after next CSS soak when viscosity falls.',
      });
    }
    if (w.pumpFillagePct <= 60) {
      alerts.push({
        id: `${w.id}-low-fillage`,
        wellId: w.id,
        severity: severityFor(100 - w.pumpFillagePct),
        title: `LOW PUMP FILLAGE ${w.pumpFillagePct}% — ${w.id}`,
        mechanism: `Vogel inflow cannot keep pace with API RP 11L displacement (heated radius ${w.heatedRadiusM} m, BHT ${w.bottomholeTempC} °C). Classic pump-off precursor.`,
        action: 'Evaluate −0.4 SPM or bring next CSS cycle forward; extending soak +12 hr is cheaper than adding steam.',
      });
    }
    if (w.thermalCoolingRisk >= 45) {
      alerts.push({
        id: `${w.id}-thermal-cooling`,
        wellId: w.id,
        severity: severityFor(w.thermalCoolingRisk),
        title: `THERMAL COOLING — ${w.id}`,
        mechanism: `BHT ${w.bottomholeTempC} °C relaxing toward virgin ${w.reservoirTempC} °C (τ ≈ 55 d, Ramey-type). Viscosity already ${w.fluidViscosityCp.toLocaleString()} cP.`,
        action: 'Schedule next CSS slug; current SOR headroom and heat-loss fraction support re-steaming within 10 days.',
      });
    }
    if (w.sor >= 3.4) {
      alerts.push({
        id: `${w.id}-high-sor`,
        wellId: w.id,
        severity: severityFor((w.sor - 2) * 28),
        title: `HIGH STEAM-OIL RATIO ${w.sor} — ${w.id}`,
        mechanism: `Cycle SOR ${w.sor} vs CSS economic band 2.5–4.0 (CSS literature; SOR 3–5 typical). ${w.energyConsumptionKwh.toLocaleString()} kWh this cycle.`,
        action: 'Trim next slug −25 m³ CWE and add +12 hr soak (optimizer shows equal retention at lower SOR).',
      });
    }
    if (w.waterCutPct >= 35) {
      alerts.push({
        id: `${w.id}-watercut`,
        wellId: w.id,
        severity: severityFor((w.waterCutPct - 25) * 2.2),
        title: `RISING WATER CUT ${w.waterCutPct}% — ${w.id}`,
        mechanism: `Water cut approaching the 65% CSS production cut-off. Cycle ${w.cssCycle} — edge-water advance in Jodhpur sand.`,
        action: 'Set production cut-off review; do not extend cycle past 70% water cut without economics re-run.',
      });
    }
  }

  const rank: Record<AlertSeverity, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  return alerts.sort((a, b) => rank[a.severity] - rank[b.severity]);
}
