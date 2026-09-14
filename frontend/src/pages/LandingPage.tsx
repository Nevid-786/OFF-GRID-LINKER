import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Waves, Flame, Wind, Mountain, Factory, ArrowRight, PhoneCall, Cpu, Activity } from 'lucide-react';
import { fetchNodes } from '../services/api';
import type { NodeItem } from '../types';
import { MapComponent } from '../components/MapComponent';

export const LandingPage: React.FC = () => {
  const [nodes, setNodes] = useState<NodeItem[]>([]);

  useEffect(() => {
    fetchNodes().then(setNodes).catch(console.error);
  }, []);

  const hazardCards = [
    {
      title: 'Hydro-Inundation & Flood Surge',
      icon: Waves,
      color: 'from-cyan-500/20 to-cyan-600/5 text-cyan-400 border-cyan-500/30',
      desc: 'Real-time river level tracking, flow rate delta, and downstream inundation modeling across Yamuna, Brahmaputra & Kerala backwaters.'
    },
    {
      title: 'Wildfire & Thermal Anomaly',
      icon: Flame,
      color: 'from-rose-500/20 to-rose-600/5 text-rose-400 border-rose-500/30',
      desc: 'Infrared forest canopy temperature sensor arrays detecting spot ignition risk before visible smoke blooms in Himalayan pine belts.'
    },
    {
      title: 'Atmospheric & AQI Monitoring',
      icon: Wind,
      color: 'from-purple-500/20 to-purple-600/5 text-purple-400 border-purple-500/30',
      desc: 'Hyper-local PM2.5, PM10, NOx, and VOC multi-gas telemetry mapping hazardous air stagnation vectors across major urban centers.'
    },
    {
      title: 'Geological Slope & Landslide',
      icon: Mountain,
      color: 'from-amber-500/20 to-amber-600/5 text-amber-400 border-amber-500/30',
      desc: 'Sub-surface inclinometer arrays and micro-seismic sensors providing early warning for hill-slope slope failures in Kedarnath and Wayanad.'
    },
    {
      title: 'Industrial & Toxic Gas Leak',
      icon: Factory,
      color: 'from-lime-500/20 to-lime-600/5 text-lime-400 border-lime-500/30',
      desc: 'Perimeter toxic emission detectors monitoring chemical processing corridors in Chembur, Peenya, and Bhopal industrial complexes.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0B111E] text-slate-100 font-body space-y-16 pb-20">
      
      {/* Emergency Helpline Banner */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 px-4 py-2 text-white font-mono-metric text-xs flex flex-wrap items-center justify-between gap-4 border-b border-red-400/30">
        <div className="flex items-center gap-2 font-bold">
          <PhoneCall className="h-4 w-4 animate-pulse text-white" />
          <span>NATIONAL EMERGENCY HELPLINES: NDRF 1078 // NATIONAL DISASTER RESPONSE: 112</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] opacity-90">
          <span>DISASTER CONTROL ROOM: 011-23438252</span>
          <Link to="/report-incident" className="underline font-bold hover:text-cyan-200">
            Submit Citizen Incident Report &rarr;
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-mono-metric font-semibold">
              <Activity className="h-3.5 w-3.5 animate-pulse" />
              <span>AI-POWERED EDGE SENSOR NETWORK ACROSS INDIA</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-white tracking-tight leading-tight">
              Predictive Environmental Intelligence & <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500">Disaster Early-Warning</span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
              EIN deploys autonomous solar edge sensor poles across India’s river basins, alpine slopes, forest zones, and industrial hubs to stream sub-second telemetry, predict flash floods, and protect millions.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-bold text-sm px-6 py-3.5 rounded-xl shadow-lg shadow-cyan-950/60 transition-all active:scale-95 cursor-pointer font-heading"
              >
                <span>Launch Live Command Console</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                to="/about"
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-sm px-5 py-3.5 rounded-xl border border-slate-700 transition-all cursor-pointer"
              >
                <Cpu className="h-4 w-4 text-cyan-400" />
                <span>How Edge AI Works</span>
              </Link>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800">
              <div>
                <div className="text-2xl sm:text-3xl font-mono-metric font-bold text-cyan-400">30+</div>
                <div className="text-xs text-slate-400">Deployed AI Poles</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-mono-metric font-bold text-emerald-400">&lt;10s</div>
                <div className="text-xs text-slate-400">Telemetry Refresh</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-mono-metric font-bold text-amber-400">5 Domains</div>
                <div className="text-xs text-slate-400">Hazard Detection</div>
              </div>
            </div>
          </div>

          {/* Interactive National Map Preview */}
          <div className="lg:col-span-5 h-[420px] rounded-2xl glass-panel p-2 shadow-2xl relative border border-slate-800">
            <div className="absolute top-4 left-4 z-20 bg-slate-900/90 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-mono-metric text-cyan-300 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              NATIONAL DEPLOYMENT SNAPSHOT
            </div>
            <MapComponent nodes={nodes} zoom={4} />
          </div>

        </div>
      </section>

      {/* Hazard Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="text-center space-y-3 mb-10">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white">
            Multi-Domain Sensor Surveillance Capabilities
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Edge poles continuously compute anomaly vectors and send synchronized alerts to district magistrates and response forces.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hazardCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className={`rounded-2xl border p-6 bg-gradient-to-b ${card.color} glass-panel transition-all hover:scale-[1.02] space-y-4`}
              >
                <div className="h-12 w-12 rounded-xl bg-slate-900/80 p-3 border border-white/10 flex items-center justify-center">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-heading font-bold text-white">
                  {card.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-body">
                  {card.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Call To Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border border-cyan-500/30 p-8 sm:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl font-heading font-bold text-white">
              Ready to Monitor Emergency Telemetry in Real-Time?
            </h2>
            <p className="text-slate-300 text-sm">
              Access live pole metrics, acknowledge active emergency alerts, view regional GIS heatmaps, or submit citizen ground reports.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-4">
              <Link
                to="/dashboard"
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-lg font-heading"
              >
                Enter Command Console &rarr;
              </Link>
              <Link
                to="/report-incident"
                className="bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold px-6 py-3 rounded-xl text-sm border border-slate-700 transition-all font-body"
              >
                Report Citizen Hazard
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
