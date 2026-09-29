import type { ComponentType } from 'react';
import { NavLink, Route, Routes, useParams } from 'react-router-dom';
import Landing from './pages/Landing';
import FieldOverview from './pages/FieldOverview';
import WellTwin from './pages/WellTwin';
import CssOptimization from './pages/CssOptimization';
import SrpOptimization from './pages/SrpOptimization';
import Optimizer from './pages/Optimizer';
import Forecast from './pages/Forecast';
import Risk from './pages/Risk';
import Sensors from './pages/Sensors';
import Scenarios from './pages/Scenarios';
import References from './pages/References';
import TourOverlay from './components/TourOverlay';
import { TourProvider, useTour } from './tour/TourContext';
import { getWells } from './data/wellProvider';

function TourStartButton({ compact }: { compact?: boolean }) {
  const { start } = useTour();
  return (
    <button
      className={`btn tour-start-btn${compact ? '' : ''}`}
      style={compact ? { padding: '4px 10px', fontSize: 11 } : undefined}
      onClick={start}
      title="Start the narrated judge walkthrough (15 stops, ~5 minutes)"
    >
      ▶ Guided Tour
    </button>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-title">BAGHEWALA TWIN</div>
          <div className="sidebar-brand-sub">OIL · Bikaner–Nagaur · CSS+SRP</div>
          <div className="sidebar-live">
            <span className="pulse-dot" /> LIVE MODEL
          </div>
          <div style={{ marginTop: 10 }}>
            <TourStartButton compact />
          </div>
        </div>
        <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          Mission Brief
        </NavLink>
        <NavLink to="/field" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          Field Overview
        </NavLink>
        <div className="nav-section-label">Showcase well · BGW-07</div>
        <NavLink to="/well/BGW-07" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          Digital Twin
        </NavLink>
        <NavLink to="/well/BGW-07/css" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          CSS Optimization
        </NavLink>
        <NavLink to="/well/BGW-07/srp" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          SRP Optimization
        </NavLink>
        <NavLink to="/well/BGW-07/optimizer" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          Surface Optimizer
        </NavLink>
        <NavLink to="/well/BGW-07/forecast" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          Forecast
        </NavLink>
        <NavLink to="/well/BGW-07/scenarios" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          What-If Lab
        </NavLink>
        <div className="nav-section-label">Field systems</div>
        <NavLink to="/risk" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          Risk &amp; Alerts
        </NavLink>
        <NavLink to="/sensors" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          Sensor Integrity
        </NavLink>
        <NavLink to="/references" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          Engineering Basis
        </NavLink>
      </aside>
      <div className="main-col">
        <div className="topbar">
          <div className="topbar-item">
            <span className="topbar-dot" />
            Coupled model nominal
          </div>
          <div className="topbar-item mono">Baghewala PML · 27.58°N 72.82°E · Jodhpur Sandstone @ ~1,110 m</div>
          <div className="topbar-spacer" />
          <div className="topbar-item mono">Marx–Langenheim · Vogel · API RP 11L · OSM</div>
          <div className="topbar-item">
            <TourStartButton compact />
          </div>
        </div>
        <div className="demo-banner">
          ENGINEERING MODEL — Calibrated to published Oil India / SPE Baghewala data (see Engineering Basis). Representative
          12-pad development grid · not live SCADA.
        </div>
        {children}
      </div>
    </div>
  );
}

function WellRouteWrapper({ Page }: { Page: ComponentType<{ wellId: string }> }) {
  const { wellId } = useParams();
  return <Page wellId={wellId ?? 'BGW-07'} />;
}

export default function App() {
  const wells = getWells();

  return (
    <TourProvider>
      <TourOverlay />
      <Routes>
        <Route path="/" element={<Shell><Landing /></Shell>} />
        <Route path="/field" element={<Shell><FieldOverview wells={wells} /></Shell>} />
        <Route path="/well/:wellId" element={<Shell><WellRouteWrapper Page={WellTwin} /></Shell>} />
        <Route path="/well/:wellId/css" element={<Shell><WellRouteWrapper Page={CssOptimization} /></Shell>} />
        <Route path="/well/:wellId/srp" element={<Shell><WellRouteWrapper Page={SrpOptimization} /></Shell>} />
        <Route path="/well/:wellId/optimizer" element={<Shell><WellRouteWrapper Page={Optimizer} /></Shell>} />
        <Route path="/well/:wellId/forecast" element={<Shell><WellRouteWrapper Page={Forecast} /></Shell>} />
        <Route path="/well/:wellId/scenarios" element={<Shell><WellRouteWrapper Page={Scenarios} /></Shell>} />
        <Route path="/risk" element={<Shell><Risk wells={wells} /></Shell>} />
        <Route path="/sensors" element={<Shell><Sensors wells={wells} /></Shell>} />
        <Route path="/references" element={<Shell><References /></Shell>} />
      </Routes>
    </TourProvider>
  );
}
