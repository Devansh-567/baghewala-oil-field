import { useMemo, useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getWell } from '../data/wellProvider';
import { solveCoupledChain } from '../simulation/physics';
import { Readout, SimTag, StatBlock } from '../components/common';
import type { CssPlan } from '../types';
import { saturationTempC } from '../engineering/fieldConstants';

export default function CssOptimization({ wellId }: { wellId: string }) {
  const well = getWell(wellId);
  if (!well) return <div className="page"><div className="empty-state">Well not found.</div></div>;

  const currentPlan: CssPlan = {
    steamVolumeM3: well.steamVolumeM3,
    injectionPressureBar: well.injectionPressureBar,
    injectionDurationHours: well.injectionDurationHours,
    soakHours: well.soakHours,
    productionCutoffWaterCut: well.productionCutoffWaterCut,
  };

  const [plan, setPlan] = useState<CssPlan>(currentPlan);
  const srpPoint = { spm: well.spm, strokeIn: well.strokeIn, vfdHz: well.vfdHz };

  const live = solveCoupledChain(plan, srpPoint, well.reservoirTempC, well.reservoirPressureBar, well.apiGravity, well.waterCutPct / 100, well.permeabilityMD);
  const base = useMemo(
    () => solveCoupledChain(currentPlan, srpPoint, well.reservoirTempC, well.reservoirPressureBar, well.apiGravity, well.waterCutPct / 100, well.permeabilityMD),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [wellId]
  );

  // Sensitivity sweeps (hold other controls at live values)
  const steamSweep = useMemo(() => {
    const pts: Array<{ steam: number; production: number; sor: number; radius: number }> = [];
    for (let s = 300; s <= 550; s += 25) {
      const c = solveCoupledChain({ ...plan, steamVolumeM3: s }, srpPoint, well.reservoirTempC, well.reservoirPressureBar, well.apiGravity, well.waterCutPct / 100, well.permeabilityMD);
      pts.push({ steam: s, production: c.liftedBopd, sor: c.sor, radius: c.heatedRadiusM });
    }
    return pts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan.injectionPressureBar, plan.injectionDurationHours, plan.soakHours, wellId]);

  const soakSweep = useMemo(() => {
    const pts: Array<{ soak: number; production: number; sor: number; bht: number }> = [];
    for (let h = 36; h <= 132; h += 12) {
      const c = solveCoupledChain({ ...plan, soakHours: h }, srpPoint, well.reservoirTempC, well.reservoirPressureBar, well.apiGravity, well.waterCutPct / 100, well.permeabilityMD);
      pts.push({ soak: h, production: c.liftedBopd, sor: c.sor, bht: c.bottomholeTempC });
    }
    return pts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan.steamVolumeM3, plan.injectionPressureBar, plan.injectionDurationHours, wellId]);

  const steamT = saturationTempC(plan.injectionPressureBar);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">CSS Optimization — {well.id} · Cycle {well.cssCycle}</div>
          <div className="page-subtitle">Marx–Langenheim heating → soak retention → μ(T) → Vogel inflow · steam {steamT} °C @ {plan.injectionPressureBar} bar (IAPWS)</div>
        </div>
        <SimTag>Slug economics live</SimTag>
      </div>

      <div className="grid grid-2" style={{ alignItems: 'start' }}>
        <div className="panel" data-tour="css-controls">
          <div className="panel-title">Slug controls — coupled response</div>
          {(
            [
              { label: 'Steam volume (CWE)', val: `${plan.steamVolumeM3} m³`, min: 300, max: 550, step: 5, key: 'steamVolumeM3' },
              { label: 'Injection pressure', val: `${plan.injectionPressureBar} bar → ${steamT} °C steam`, min: 22, max: 36, step: 0.5, key: 'injectionPressureBar' },
              { label: 'Injection duration', val: `${plan.injectionDurationHours} hr`, min: 36, max: 64, step: 1, key: 'injectionDurationHours' },
              { label: 'Soak time', val: `${plan.soakHours} hr`, min: 36, max: 132, step: 1, key: 'soakHours' },
            ] as const
          ).map((c) => (
            <div className="control-row" key={c.key}>
              <div className="control-label"><span>{c.label}</span><span className="val">{c.val}</span></div>
              <input
                type="range" min={c.min} max={c.max} step={c.step}
                value={plan[c.key]}
                onChange={(e) => setPlan({ ...plan, [c.key]: Number(e.target.value) })}
              />
            </div>
          ))}
          <button className="btn" onClick={() => setPlan(currentPlan)}>Reset to current slug</button>
          <div className="divider" />
          <div className="panel-title">Heat audit (Marx–Langenheim 1959)</div>
          <Readout label="Heated radius" value={live.heatedRadiusM} unit="m" tone="amber" />
          <Readout label="Heat injected" value={live.heatInjectedGJ.toLocaleString()} unit="GJ" />
          <Readout label="Overburden loss" value={`${(live.heatLossFrac * 100).toFixed(1)}`} unit="%" />
          <Readout label="Soak efficiency" value={`${(live.soakEff * 100).toFixed(1)}`} unit="%" tone="green" />
          <Readout label="BHT / viscosity" value={`${live.bottomholeTempC} °C / ${live.viscosityCp.toLocaleString()} cP`} tone="amber" />
        </div>

        <div className="grid" style={{ gap: 12 }}>
          <div className="grid grid-2">
            <StatBlock label="Lifted rate" value={live.liftedBopd} unit="BOPD" />
            <StatBlock label="Cycle SOR" value={live.sor} />
            <StatBlock label="Cycle oil" value={live.cycleOilBbl.toLocaleString()} unit="bbl" />
            <StatBlock label="Steam energy" value={live.steamEnergyMWh.toFixed(0)} unit="MWh" />
          </div>
          <div className="panel" data-tour="css-sweeps">
            <div className="panel-title"><span>Steam sweep — production vs SOR</span><span className="cite">soak held @ {plan.soakHours} hr</span></div>
            <ResponsiveContainer width="100%" height={190}>
              <LineChart data={steamSweep}>
                <CartesianGrid stroke="var(--border-soft)" vertical={false} />
                <XAxis dataKey="steam" stroke="var(--text-faint)" fontSize={10} label={{ value: 'm³ CWE', position: 'insideBottomRight', fontSize: 10, fill: 'var(--text-faint)' }} />
                <YAxis yAxisId="l" stroke="var(--text-faint)" fontSize={10} width={40} />
                <YAxis yAxisId="r" orientation="right" stroke="var(--text-faint)" fontSize={10} width={36} />
                <Tooltip contentStyle={{ background: 'var(--bg-panel-raised)', border: '1px solid var(--border)', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <ReferenceLine yAxisId="l" x={plan.steamVolumeM3} stroke="var(--amber)" strokeDasharray="4 3" />
                <Line yAxisId="l" type="monotone" dataKey="production" stroke="var(--green)" strokeWidth={2} dot={false} name="BOPD" />
                <Line yAxisId="r" type="monotone" dataKey="sor" stroke="var(--red)" strokeWidth={1.5} dot={false} name="SOR" />
              </LineChart>
            </ResponsiveContainer>
            <div className="chart-note">Diminishing returns past ~425 m³: radius grows ∝ √Q while SOR grows ∝ Q — the optimizer's core trade.</div>
          </div>
          <div className="panel">
            <div className="panel-title"><span>Soak sweep — retention vs rate</span><span className="cite">steam held @ {plan.steamVolumeM3} m³</span></div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={soakSweep}>
                <CartesianGrid stroke="var(--border-soft)" vertical={false} />
                <XAxis dataKey="soak" stroke="var(--text-faint)" fontSize={10} label={{ value: 'soak hr', position: 'insideBottomRight', fontSize: 10, fill: 'var(--text-faint)' }} />
                <YAxis stroke="var(--text-faint)" fontSize={10} width={40} />
                <Tooltip contentStyle={{ background: 'var(--bg-panel-raised)', border: '1px solid var(--border)', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <ReferenceLine x={plan.soakHours} stroke="var(--amber)" strokeDasharray="4 3" />
                <Line type="monotone" dataKey="production" stroke="var(--green)" strokeWidth={2} dot={false} name="BOPD" />
                <Line type="monotone" dataKey="bht" stroke="var(--amber)" strokeWidth={1.5} dot={false} name="BHT °C" />
              </LineChart>
            </ResponsiveContainer>
            <div className="chart-note">Soak is the cheapest barrel: +12 hr buys retention with zero extra steam. Base slug {base.liftedBopd} BOPD @ SOR {base.sor} → live {live.liftedBopd} BOPD @ SOR {live.sor}.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
