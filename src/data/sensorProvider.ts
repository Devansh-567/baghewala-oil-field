import { mulberry32, round } from '../utils/rng';
import type { SensorReading, WellState } from '../types';

// Scripted drift demo on the showcase well so judges can walk the
// detect → exclude → recalibrate → recover loop end-to-end.
export const DRIFT_WELL_ID = 'BGW-07';
export const DRIFT_SENSOR = 'Temperature' as const;

/** SCADA channel map per pad: THP/THT at wellhead, BHT via VIT thermocouple,
 *  VFD frequency + motor current, polished-rod load cell, test-separator rate. */
export function buildSensorReadings(wells: WellState[]): SensorReading[] {
  const readings: SensorReading[] = [];

  for (const w of wells) {
    const rnd = mulberry32(w.seed + 11);
    const isDrifted = w.id === DRIFT_WELL_ID;

    readings.push({
      wellId: w.id,
      sensor: 'Temperature',
      expected: w.bottomholeTempC,
      observed: isDrifted
        ? round(w.bottomholeTempC + 8.4 + rnd() * 1.5, 1)
        : round(w.bottomholeTempC + (rnd() - 0.5) * 0.8, 1),
      unit: '°C',
      status: isDrifted ? 'Suspected drift' : 'Nominal',
    });

    readings.push({
      wellId: w.id,
      sensor: 'Pressure',
      expected: w.wellheadPressureBar,
      observed: round(w.wellheadPressureBar + (rnd() - 0.5) * 0.15, 2),
      unit: 'bar',
      status: 'Nominal',
    });

    readings.push({
      wellId: w.id,
      sensor: 'VFD',
      expected: w.vfdHz,
      observed: round(w.vfdHz + (rnd() - 0.5) * 0.4, 1),
      unit: 'Hz',
      status: 'Nominal',
    });

    readings.push({
      wellId: w.id,
      sensor: 'Current',
      expected: round(w.prhpKw * 1.9, 1),
      observed: round(w.prhpKw * 1.9 + (rnd() - 0.5) * 0.8, 1),
      unit: 'A',
      status: 'Nominal',
    });

    readings.push({
      wellId: w.id,
      sensor: 'Load',
      expected: w.rodLoadKlb,
      observed: round(w.rodLoadKlb + (rnd() - 0.5) * 0.25, 2),
      unit: 'klb',
      status: 'Nominal',
    });

    readings.push({
      wellId: w.id,
      sensor: 'Production',
      expected: w.productionBopd,
      observed: round(w.productionBopd + (rnd() - 0.5) * 1.2, 1),
      unit: 'BOPD',
      status: 'Nominal',
    });
  }

  return readings;
}
