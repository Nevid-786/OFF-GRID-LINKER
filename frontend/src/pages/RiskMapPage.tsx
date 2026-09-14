import React, { useState, useEffect } from 'react';
import { Layers, Play, Pause, RotateCcw, Filter, Waves, Flame, Wind, Mountain, Factory, ShieldAlert } from 'lucide-react';
import { fetchNodes } from '../services/api';
import type { NodeItem } from '../types';
import { MapComponent } from '../components/MapComponent';

export const RiskMapPage: React.FC = () => {
  const [nodes, setNodes] = useState<NodeItem[]>([]);
  const [activeDomain, setActiveDomain] = useState<string>('all');
  const [isPlayingTimeline, setIsPlayingTimeline] = useState<boolean>(false);
  const [timeStep, setTimeStep] = useState<number>(3); // 0..5 corresponding to hours

  const timelineHours = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'];

  useEffect(() => {
    fetchNodes().then(setNodes).catch(console.error);
  }, []);

  // Timeline replay simulator effect
  useEffect(() => {
    let interval: number;
    if (isPlayingTimeline) {
      interval = window.setInterval(() => {
        setTimeStep(prev => (prev + 1) % timelineHours.length);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isPlayingTimeline]);

  const hazardLayers = [
    { key: 'all', label: 'All Hazards', icon: Layers, color: 'text-slate-200' },
    { key: 'water', label: 'Flood / Hydro', icon: Waves, color: 'text-cyan-400' },
    { key: 'fire', label: 'Wildfire', icon: Flame, color: 'text-rose-400' },
    { key: 'air', label: 'AQI / Atmospheric', icon: Wind, color: 'text-purple-400' },
    { key: 'landslide', label: 'Geological Slope', icon: Mountain, color: 'text-amber-400' },
    { key: 'industrial', label: 'Chemical / Toxic', icon: Factory, color: 'text-lime-400' }
  ];

  return (
    <div className="h-[calc(100vh-65px)] bg-[#0B111E] text-slate-100 flex flex-col relative font-body overflow-hidden">
      
      {/* Top Floating Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-4 pointer-events-none">
        
        {/* Layer Toggles */}
        <div className="pointer-events-auto glass-panel p-2 rounded-2xl border border-slate-800 flex items-center gap-1.5 shadow-2xl overflow-x-auto scrollbar-none">
          <span className="text-xs font-mono-metric text-slate-400 px-2 flex items-center gap-1 font-bold">
            <Filter className="h-3.5 w-3.5" /> DOMAIN LAYERS:
          </span>
          {hazardLayers.map((layer) => {
            const Icon = layer.icon;
            const isSelected = activeDomain === layer.key;
            return (
              <button
                key={layer.key}
                onClick={() => setActiveDomain(layer.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono-metric transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                    : 'bg-slate-900/90 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isSelected ? 'text-slate-950' : layer.color}`} />
                <span>{layer.label}</span>
              </button>
            );
          })}
        </div>

        {/* Status Indicator */}
        <div className="pointer-events-auto glass-panel px-4 py-2 rounded-2xl border border-slate-800 flex items-center gap-2 text-xs font-mono-metric text-emerald-400">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>GIS HEATMAP ENGINE ACTIVE</span>
        </div>

      </div>

      {/* Full Screen GIS Map */}
      <div className="flex-1 w-full h-full">
        <MapComponent
          nodes={nodes}
          selectedSensorFilter={activeDomain}
          zoom={5}
        />
      </div>

      {/* Bottom Timeline Scrubber Control */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 w-11/12 max-w-3xl glass-panel p-4 rounded-2xl border border-slate-800 shadow-2xl space-y-3">
        <div className="flex items-center justify-between text-xs font-mono-metric">
          <div className="flex items-center gap-2 text-cyan-400 font-bold">
            <ShieldAlert className="h-4 w-4" />
            <span>RISK EVOLUTION REPLAY TIMELINE (24H)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlayingTimeline(!isPlayingTimeline)}
              className="flex items-center gap-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-3 py-1 rounded-lg text-xs transition-colors cursor-pointer"
            >
              {isPlayingTimeline ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              <span>{isPlayingTimeline ? 'PAUSE' : 'REPLAY'}</span>
            </button>
            <button
              onClick={() => {
                setIsPlayingTimeline(false);
                setTimeStep(0);
              }}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              title="Reset Timeline"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Timeline Slider Track */}
        <div className="space-y-1">
          <input
            type="range"
            min={0}
            max={timelineHours.length - 1}
            value={timeStep}
            onChange={(e) => setTimeStep(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <div className="flex justify-between text-[11px] font-mono-metric text-slate-400">
            {timelineHours.map((hour, idx) => (
              <span
                key={hour}
                className={idx === timeStep ? 'text-cyan-400 font-extrabold underline' : ''}
              >
                {hour}
              </span>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};
