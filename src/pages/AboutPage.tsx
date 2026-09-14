import React from 'react';
import { Cpu, Radio, Server, Zap, Network } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const steps = [
    {
      title: '1. Multi-Sensor Edge Pole',
      icon: Cpu,
      color: 'border-cyan-500/40 text-cyan-400 bg-cyan-950/40',
      desc: 'Each pole features ultrasonic water level gauges, IR thermal cameras, optical tilt inclinometers, and multi-gas atmospheric probes powered by solar + battery storage.'
    },
    {
      title: '2. On-Device Edge AI Inference',
      icon: Zap,
      color: 'border-amber-500/40 text-amber-400 bg-amber-950/40',
      desc: 'Local microprocessors process raw telemetry at 10Hz, detecting micro-tremors, rapid water level surges, or canopy ignition without relying on cloud availability.'
    },
    {
      title: '3. Redundant Mesh & LoRaWAN Transport',
      icon: Radio,
      color: 'border-purple-500/40 text-purple-400 bg-purple-950/40',
      desc: 'Telemetry packets are hop-transmitted across pole-to-pole mesh networks using sub-GHz LoRaWAN and satellite fallback if cellular towers fail.'
    },
    {
      title: '4. EIN Command Dashboard',
      icon: Server,
      color: 'border-emerald-500/40 text-emerald-400 bg-emerald-950/40',
      desc: 'Central WebSocket servers ingest telemetry, trigger Web Audio emergency warning sirens, update Leaflet GIS risk maps, and dispatch alert notifications.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0B111E] text-slate-100 p-4 sm:p-6 space-y-8 font-body max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-mono-metric font-semibold">
          <Network className="h-3.5 w-3.5" />
          <span>AUTONOMOUS DISASTER PREVENTION INFRASTRUCTURE</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-white">
          How the Environmental Intelligence Network Works
        </h1>
        <p className="text-slate-400 text-sm">
          A high-level architectural walkthrough of our distributed AI edge sensor deployment across Indian river basins, hill slopes, and industrial complexes.
        </p>
      </div>

      {/* Interactive System Flow Diagram */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        <h2 className="text-lg font-heading font-bold text-white text-center">
          End-to-End Edge Telemetry Architecture Flow
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className={`p-6 rounded-2xl border ${step.color} glass-panel space-y-3 relative flex flex-col justify-between`}
              >
                <div className="space-y-3">
                  <div className="h-12 w-12 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-heading font-bold text-base text-white">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-body">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hardware Specifications */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="text-xs font-mono-metric text-cyan-400 font-bold">SOLAR HARVESTING</div>
          <h3 className="text-base font-heading font-bold text-white">Continuous Off-Grid Power</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            50W industrial solar panel with 12Ah LiFePO4 battery backup guaranteeing 14 days of operation in complete monsoon darkness.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="text-xs font-mono-metric text-emerald-400 font-bold">HARDENED ENCLOSURE</div>
          <h3 className="text-base font-heading font-bold text-white">IP68 Marine-Grade Casing</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Anodized aluminum alloy housing resistant to high river velocity, debris strikes, and extreme temperatures from -10°C to 55°C.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="text-xs font-mono-metric text-purple-400 font-bold">SUB-SECOND LATENCY</div>
          <h3 className="text-base font-heading font-bold text-white">WebSocket Push & Audio Sirens</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Real-time dual-frequency Web Audio siren synthesized instantly in command rooms upon receiving Critical tier threshold pushes.
          </p>
        </div>
      </div>

    </div>
  );
};
