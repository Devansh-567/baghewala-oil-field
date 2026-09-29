import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { WellState } from '../types';
import { FIELD_CENTRE } from '../data/wellProvider';

// Fix default icon paths under Vite (use vector div-markers instead of images)
function markerIcon(status: WellState['status'], selected: boolean): L.DivIcon {
  const color =
    status === 'Producing' ? '#5a9c6e' : status === 'Soaking' ? '#c98a3e' : status === 'Injecting' ? '#4f8fc4' : '#6b7280';
  return L.divIcon({
    className: 'bgw-marker',
    html: `<div style="width:${selected ? 20 : 15}px;height:${selected ? 20 : 15}px;border-radius:50%;background:${color};border:3px solid ${selected ? '#ffd479' : '#101315'};box-shadow:0 0 0 1px ${color}, 0 2px 8px rgba(0,0,0,.55);"></div>`,
    iconSize: [selected ? 20 : 15, selected ? 20 : 15],
    iconAnchor: [selected ? 10 : 7, selected ? 10 : 7],
    popupAnchor: [0, -10],
  });
}

function FitToWells({ wells }: { wells: WellState[] }) {
  const map = useMap();
  useEffect(() => {
    const b = L.latLngBounds(wells.map((w) => [w.lat, w.lon] as [number, number]));
    map.fitBounds(b.pad(0.35));
  }, [map, wells]);
  return null;
}

export default function FieldMap({
  wells,
  selectedId,
  height = 420,
}: {
  wells: WellState[];
  selectedId?: string;
  height?: number;
}) {
  return (
    <div className="osm-map-wrap" style={{ height }} data-tour="field-map">
      <MapContainer
        center={[FIELD_CENTRE.lat, FIELD_CENTRE.lon]}
        zoom={13}
        scrollWheelZoom
        style={{ height: '100%', width: '100%', background: '#0e1113' }}
      >
        {/* OPEN-SOURCE BASE MAP — OpenStreetMap standard tiles (© OSM contributors, ODbL).
            No AI imagery: every road, village track and terrain pixel is live OSM. */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Baghewala PML 200.26 km²'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitToWells wells={wells} />
        {/* PML boundary (representative 5 × 3 km development block about field centre) */}
        <Circle
          center={[FIELD_CENTRE.lat, FIELD_CENTRE.lon]}
          radius={2600}
          pathOptions={{ color: '#c98a3e', weight: 1.5, dashArray: '6 5', fillColor: '#c98a3e', fillOpacity: 0.04 }}
        />
        {wells.map((w) => (
          <Marker key={w.id} position={[w.lat, w.lon]} icon={markerIcon(w.status, w.id === selectedId)}>
            <Popup>
              <div style={{ fontFamily: 'monospace', fontSize: 12, lineHeight: 1.6, color: '#111' }}>
                <strong>{w.id}</strong> — {w.status}
                <br />
                {w.lat.toFixed(5)}°N, {w.lon.toFixed(5)}°E
                <br />
                {w.productionBopd} BOPD · SOR {w.sor} · BHT {w.bottomholeTempC} °C
                <br />
                <Link to={`/well/${w.id}`}>Open digital twin →</Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <div className="osm-map-caption">
        OpenStreetMap live tiles (ODbL © OSM contributors) · WGS84 pads · dashed ring = representative development
        block inside Baghewala PML, Bikaner–Nagaur basin · terrain + tracks are real, not rendered
      </div>
    </div>
  );
}
