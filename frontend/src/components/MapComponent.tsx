import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Popup, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { NodeItem, SensorType } from '../types';
import { Link } from 'react-router-dom';
import { StatusBadge } from './StatusBadge';
import { Battery, Signal, ArrowRight, Waves, Flame, Wind, Mountain, Factory } from 'lucide-react';

// Fix Leaflet marker default icons in React Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapComponentProps {
  nodes: NodeItem[];
  selectedSensorFilter?: string;
  onNodeSelect?: (node: NodeItem) => void;
  center?: [number, number];
  zoom?: number;
}

// Center helper component
const ChangeView: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

export const MapComponent: React.FC<MapComponentProps> = ({
  nodes,
  selectedSensorFilter = 'all',
  onNodeSelect,
  center = [23.5937, 78.9629], // India Center
  zoom = 5
}) => {
  const filteredNodes = nodes.filter(n => {
    if (selectedSensorFilter !== 'all' && n.sensor_type !== selectedSensorFilter) {
      return false;
    }
    return true;
  });

  const getMarkerColor = (level?: string, status?: string) => {
    if (status === 'offline') return '#64748B';
    switch (level) {
      case 'Critical': return '#EF4444';
      case 'Warning': return '#F97316';
      case 'Watch': return '#F59E0B';
      case 'Safe':
      default: return '#10B981';
    }
  };

  const getSensorIcon = (type: SensorType) => {
    switch (type) {
      case 'water': return <Waves className="h-4 w-4 text-cyan-400" />;
      case 'fire': return <Flame className="h-4 w-4 text-rose-400" />;
      case 'air': return <Wind className="h-4 w-4 text-purple-400" />;
      case 'landslide': return <Mountain className="h-4 w-4 text-amber-500" />;
      case 'industrial': return <Factory className="h-4 w-4 text-lime-400" />;
    }
  };

  return (
    <div className="relative w-full h-full min-h-[450px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full z-10"
      >
        <ChangeView center={center} zoom={zoom} />
        
        {/* Public OpenStreetMap basemap; no provider key is required. */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {filteredNodes.map((node) => {
          const color = getMarkerColor(node.alert_level, node.status);
          const isCritical = node.alert_level === 'Critical';

          return (
            <React.Fragment key={node.id}>
              {/* Outer Pulse Circle for Warning / Critical */}
              {(node.alert_level === 'Warning' || isCritical) && (
                <CircleMarker
                  center={[node.latitude, node.longitude]}
                  radius={isCritical ? 24 : 18}
                  pathOptions={{
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.25,
                    weight: 2,
                    className: isCritical ? 'animate-ping' : 'animate-pulse'
                  }}
                />
              )}

              {/* Main Sensor Pole Marker */}
              <CircleMarker
                center={[node.latitude, node.longitude]}
                radius={8}
                pathOptions={{
                  color: '#FFFFFF',
                  fillColor: color,
                  fillOpacity: 0.9,
                  weight: 2
                }}
                eventHandlers={{
                  click: () => onNodeSelect && onNodeSelect(node)
                }}
              >
                <Popup className="dark-leaflet-popup">
                  <div className="p-3 max-w-xs space-y-2 text-slate-100 font-body">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-700 pb-2">
                      <div className="flex items-center gap-1.5 font-heading font-bold text-sm text-cyan-400">
                        {getSensorIcon(node.sensor_type)}
                        <span>{node.pole_name}</span>
                      </div>
                      <StatusBadge level={node.alert_level || 'Safe'} size="sm" />
                    </div>

                    <div className="space-y-1 text-xs text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Sensor Type:</span>
                        <span className="font-mono-metric capitalize font-semibold text-slate-200">{node.sensor_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Water Level:</span>
                        <span className="font-mono-metric font-bold text-cyan-300">{node.water_level || '0.00'} m</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Primary Cause:</span>
                        <span className="font-mono-metric text-slate-300 truncate max-w-[140px]">{node.cause || 'Nominal'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800 font-mono-metric text-slate-400">
                      <span className="flex items-center gap-1">
                        <Battery className="h-3 w-3 text-emerald-400" />
                        {node.battery_percent}%
                      </span>
                      <span className="flex items-center gap-1">
                        <Signal className="h-3 w-3 text-cyan-400" />
                        {node.signal_strength} dBm
                      </span>
                    </div>

                    <Link
                      to={`/nodes/${node.id}`}
                      className="mt-2 flex items-center justify-center gap-1.5 w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs py-1.5 rounded transition-colors"
                    >
                      <span>View Pole Telemetry</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </Popup>
              </CircleMarker>
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
};
