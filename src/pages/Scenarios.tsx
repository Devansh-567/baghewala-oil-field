import { useState } from 'react';
import { getWell } from '../data/wellProvider';
import { solveCoupledChain } from '../simulation/physics';
import { Readout, SimTag, StatBlock } from '../components/common';
import type { CssPlan, SrpPoint } from '../types';

export default function Scenarios({ wellId }: { wellId: string }) {
  const well = getWell(wellId);
  if (!well) return <div className="page"><div className="empty-state">Well not found.</div></div>;

  const baselineCss: CssPlan = {
    steamVolumeM3: well.steamVolumeM3,
    injectionPressureBar: well.injectionPressureBar,
    injectionDurationHours: well.injectionDurationHours,
    soakHours: well.soakHours,
    productionCutoffWaterCut: well.productionCutoffWaterCut,
  };
  const baselineSrp: SrpPoint = { spm: well.spm, strokeIn: well.strokeIn, vfdHz: well.vfdHz };

  const [css, setCss] = useState<CssPlan>(baselineCss);
  const [srp, setSrp] = useState<SrpPoint>(baselineSrp);

  const wc = well.waterCutPct / 100;
  const baseline = solveCoupledChain(baselineCss, baselineSrp, well.reservoirTempC, well.reservoirPressureBar, well.apiGravity, wc, well.permeabilityMD);
  const scenario = solveCoupledChain(css, srp, well.reservoirTempC, well.reservoirPressureBar, well.apiGravity, wc, well.permeabilityMD);

  const oilINR = 78 * 83.5;
  const margin = (c: typeof baseline, steam: number) =>
    c.liftedBopd * oilINR - (steam * 1450) / 120 - c.prhpKw * 24 * 8.5 - (c.rodFloatRisk + c.impactRisk) * 55;

  const dMargin = margin(scenario, css.steamVolumeM3) - margin(baseline, baselineCss.steamVolumeM3);

  const delta = (a: number, b: number, digits = 1) => {
    const d = b - a;
    return `${d >= 0 ? '+' : ''}${d.toFixed(digits)}`;
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">What-If Lab — {well.id}</div>
          <div className="page-subtitle">Full-chain scenario vs baseline · margin delta live in ₹/day</div>
        </div>
        <SimTag>Margin Δ {dMargin >= 0 ? '+' : ''}₹{Math.round(dMargin).toLocaleString('en-IN')}/day</SimTag>
      </div>

      <div className="grid grid-2" style={{ alignItems: 'start' }}>
        <div className="panel">
          <div className="panel-title">Scenario controls</div>
          <div className="control-row">
            <div className="control-label"><span>Steam volume</span><span className="val">{css.steamVolumeM3} m³</span></div>
            <input type="range" min={300} max={550} step={5} value={css.steamVolumeM3} onChange={(e) => setCss({ ...css, steamVolumeM3: Number(e.target.value) })} />
          </div>
          <div className="control-row">
            <div className="control-label"><span>Soak time</span><span className="val">{css.soakHours} hr</span></div>
            <input type="range" min={36} max={132} step={1} value={css.soakHours} onChange={(e) => setCss({ ...css, soakHours: Number(e.target.value) })} />
          </div>
          <div className="control-row">
            <div className="control-label"><span>Injection pressure</span><span className="val">{css.injectionPressureBar} bar</span></div>
            <input type="range" min={22} max={36} step={0.5} value={css.injectionPressureBar} onChange={(e) => setCss({ ...css, injectionPressureBar: Number(e.target.value) })} />
          </div>
          <div className="divider" />
          <div className="control-row">
            <div className="control-label"><span>SPM</span><span className="val">{srp.spm.toFixed(1)}</span></div>
            <input type="range" min={3} max={6.6} step={0.1} value={srp.spm} onChange={(e) => setSrp({ ...srp, spm: Number(e.target.value) })} />
          </div>
          <div className="control-row">
            <div className="control-label"><span>Stroke</span><span className="val">{srp.strokeIn} in</span></div>
            <input type="range" min={64} max={86} step={1} value={srp.strokeIn} onChange={(e) => setSrp({ ...srp, strokeIn: Number(e.target.value) })} />
          </div>
          <div className="control-row">
            <div className="control-label"><span>VFD</span><span className="val">{srp.vfdHz.toFixed(1)} Hz</span></div>
            <input type="range" min={35} max={55} step={0.5} value={srp.vfdHz} onChange={(e) => setSrp({ ...srp, vfdHz: Number(e.target.value) })} />
          </div>
          <button className="btn" onClick={() => { setCss(baselineCss); setSrp(baselineSrp); }}>Reset to baseline</button>
        </div>

        <div className="grid" style={{ gap: 12 }}>
          <div className="grid grid-2" data-tour="scenario-lab">
            <StatBlock label="Scenario rate" value={scenario.liftedBopd} unit="BOPD" />
            <StatBlock label="Scenario SOR" value={scenario.sor} />
            <StatBlock label="Scenario fillage" value={(scenario.fillageFrac * 100).toFixed(1)} unit="%" />
            <StatBlock label="Scenario margin" value={`₹${Math.round(margin(scenario, css.steamVolumeM3)).toLocaleString('en-IN')}`} unit="/d" />
          </div>
          <div className="grid grid-2" style={{ gap: 12 }}>
            <div className="panel">
              <div className="panel-title">Baseline (current)</div>
              <Readout label="Production" value={baseline.liftedBopd} unit="BOPD" />
              <Readout label="SOR" value={baseline.sor} />
              <Readout label="BHT / μ" value={`${baseline.bottomholeTempC} °C / ${baseline.viscosityCp.toLocaleString()} cP`} />
              <Readout label="Fillage" value={`${(baseline.fillageFrac * 100).toFixed(1)}`} unit="%" />
              <Readout label="Float margin" value={`${baseline.rodFloatMarginLb.toLocaleString()} lbf`} />
              <Readout label="Goodman" value={baseline.goodmanRatio.toFixed(2)} />
            </div>
            <div className="panel" style={{ borderColor: 'var(--amber-dim)' }}>
              <div className="panel-title">Scenario (Δ vs baseline)</div>
              <Readout label="Production" value={`${scenario.liftedBopd} (${delta(baseline.liftedBopd, scenario.liftedBopd)})`} unit="BOPD" tone={scenario.liftedBopd >= baseline.liftedBopd ? 'green' : 'red'} />
              <Readout label="SOR" value={`${scenario.sor} (${delta(baseline.sor, scenario.sor, 2)})`} tone={scenario.sor <= baseline.sor ? 'green' : 'red'} />
              <Readout label="BHT / μ" value={`${scenario.bottomholeTempC} °C / ${scenario.viscosityCp.toLocaleString()} cP`} tone="amber" />
              <Readout label="Fillage" value={`${(scenario.fillageFrac * 100).toFixed(1)} (${delta(baseline.fillageFrac * 100, scenario.fillageFrac * 100)})`} unit="%" tone={scenario.fillageFrac >= baseline.fillageFrac ? 'green' : 'red'} />
              <Readout label="Float margin" value={`${scenario.rodFloatMarginLb.toLocaleString()} (${delta(baseline.rodFloatMarginLb, scenario.rodFloatMarginLb, 0)} lbf)`} tone={scenario.rodFloatMarginLb >= baseline.rodFloatMarginLb ? 'green' : 'red'} />
              <Readout label="Goodman" value={`${scenario.goodmanRatio.toFixed(2)} (${delta(baseline.goodmanRatio, scenario.goodmanRatio, 2)})`} tone={scenario.goodmanRatio <= baseline.goodmanRatio ? 'green' : 'red'} />
            </div>
          </div>
          <div className="panel">
            <div className="panel-title">Engineer's reading</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-dim)', lineHeight: 1.7 }}>
              {dMargin >= 0 ? (
                <span>Scenario <b className="econ-good">earns ₹{Math.round(dMargin).toLocaleString('en-IN')}/day more</b> than baseline at $78/bbl. Check that the gain comes from heating (radius {scenario.heatedRadiusM} m vs {baseline.heatedRadiusM} m) rather than over-pumping (fillage {(scenario.fillageFrac * 100).toFixed(0)}%).</span>
              ) : (
                <span>Scenario <b className="econ-bad">loses ₹{Math.round(-dMargin).toLocaleString('en-IN')}/day</b> vs baseline. The chain shows why: {scenario.sor > baseline.sor ? 'SOR rose faster than rate. ' : ''}{scenario.fillageFrac < baseline.fillageFrac ? 'Fillage fell — displacement outran heated inflow. ' : ''}Try +12 hr soak instead of +steam.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
