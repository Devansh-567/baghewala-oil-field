export type WellStatus = 'Producing' | 'Soaking' | 'Injecting' | 'Shut-in'

export interface WellState {
  id: string
  name: string
  x: number // legacy 0-100 grid (kept for compat)
  y: number
  /** True WGS84 position — plotted on the open-source OSM base map. */
  lat: number
  lon: number
  /** Kelly-bushing / ground-level elevation, m MSL (SRTM-derived approx). */
  elevationM: number
  status: WellStatus
  cssCycle: number
  daysSinceInjectionStart: number

  // Reservoir
  reservoirPressureBar: number
  reservoirTempC: number
  apiGravity: number
  permeabilityProxy: number // 0-1 relative index

  // Wellbore / thermal
  bottomholeTempC: number
  fluidViscosityCp: number
  wellheadPressureBar: number

  // CSS operating plan
  steamVolumeM3: number
  soakHours: number
  injectionPressureBar: number
  injectionDurationHours: number
  productionCutoffWaterCut: number

  // SRP operating point
  spm: number
  strokeIn: number
  vfdHz: number
  pumpFillagePct: number
  rodLoadKlb: number
  peakLoadKlb: number

  // Production / economics
  productionBopd: number
  waterCutPct: number
  sor: number
  energyConsumptionKwh: number
  pumpEfficiencyPct: number

  // Risk
  rodFloatingRisk: number // 0-100
  impactLoadingRisk: number // 0-100
  thermalCoolingRisk: number // 0-100
  overallRisk: number // 0-100

  // Engineering audit trail (per-well operating point)
  heatedRadiusM: number
  heatInjectedGJ: number
  goodmanRatio: number
  rodFloatMarginLb: number
  prhpKw: number
  permeabilityMD: number
  pumpDepthM: number
  payDepthM: number
  mu50Cp: number

  seed: number
}

export interface CssPlan {
  steamVolumeM3: number
  injectionPressureBar: number
  injectionDurationHours: number
  soakHours: number
  productionCutoffWaterCut: number
}

export interface CssPrediction {
  expectedProductionBopd: number
  expectedSor: number
  expectedThermalRetentionC: number
  expectedEnergyKwh: number
  heatedRadiusM?: number
  bottomholeTempC?: number
  viscosityCp?: number
}

export interface SrpPoint {
  spm: number
  strokeIn: number
  vfdHz: number
}

export interface SrpPrediction {
  pumpFillagePct: number
  estimatedProductionBopd: number
  rodLoadKlb: number
  peakLoadKlb: number
  powerConsumptionKw: number
  pumpEfficiencyPct: number
  rodFloatingRisk: number
  impactLoadingRisk: number
}

export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH'

export interface Alert {
  id: string
  wellId: string
  severity: AlertSeverity
  title: string
  mechanism: string
  action: string
}

export interface SensorReading {
  wellId: string
  sensor: 'Temperature' | 'Pressure' | 'VFD' | 'Current' | 'Load' | 'Production'
  observed: number
  expected: number
  unit: string
  status: 'Nominal' | 'Suspected drift' | 'Excluded'
}
