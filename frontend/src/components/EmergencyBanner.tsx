import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, Volume2, VolumeX, Radio, Navigation, Clock } from 'lucide-react';
import type { AlertItem } from '../types';
import { sosSoundService } from '../services/sosSoundService';

interface EmergencyBannerProps {
  alert: AlertItem;
  onAcknowledge: (id: number) => void;
  onResolve: (id: number) => void;
}

export const EmergencyBanner: React.FC<EmergencyBannerProps> = ({
  alert,
  onAcknowledge,
  onResolve
}) => {
  const [isPlayingSiren, setIsPlayingSiren] = useState(false);

  const toggleSiren = () => {
    if (isPlayingSiren) {
      sosSoundService.stopSiren();
      setIsPlayingSiren(false);
    } else {
      sosSoundService.startSiren();
      setIsPlayingSiren(true);
    }
  };

  const isCritical = alert.alert_level === 'Critical';

  return (
    <div className={`mb-6 rounded-2xl border-2 p-5 shadow-2xl text-white backdrop-blur-xl transition-all ${
      isCritical
        ? 'border-red-500 bg-gradient-to-r from-red-950 via-red-900 to-amber-950 animate-emergency-pulse'
        : 'border-orange-500 bg-gradient-to-r from-orange-950 via-amber-950 to-slate-900'
    }`}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        
        {/* Left Section: SOS Telemetry Details */}
        <div className="flex items-start gap-4">
          <div className={`rounded-xl p-3 shrink-0 animate-pulse border shadow-inner ${
            isCritical ? 'bg-red-500/30 border-red-400/50' : 'bg-orange-500/30 border-orange-400/50'
          }`}>
            <ShieldAlert className="h-8 w-8 text-red-400" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`rounded-full px-3 py-0.5 text-[11px] font-mono-metric font-extrabold uppercase tracking-wider shadow-sm ${
                isCritical ? 'bg-red-500 text-white' : 'bg-orange-500 text-slate-950'
              }`}>
                🚨 {alert.alert_level} SENSOR ALARM
              </span>
              <span className="text-xs text-slate-300 font-mono-metric bg-black/40 px-2.5 py-0.5 rounded-full border border-white/10">
                ALERT ID #{alert.id}
              </span>
              <span className="rounded-full bg-cyan-500/20 text-cyan-300 px-2.5 py-0.5 text-[11px] font-mono-metric uppercase border border-cyan-500/30">
                {alert.sensor_type || 'water'} sensor
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-heading font-extrabold tracking-tight pt-1">
              Pole <span className="text-cyan-400">{alert.pole_name || `Node #${alert.node_id}`}</span>: {alert.cause}
            </h2>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-slate-300 pt-1 font-body">
              {alert.latitude && alert.longitude && (
                <div className="flex items-center gap-1.5 text-amber-300 font-mono-metric">
                  <Navigation className="h-3.5 w-3.5" />
                  <span>GPS: <strong>{alert.latitude.toFixed(4)}°N, {alert.longitude.toFixed(4)}°E</strong></span>
                </div>
              )}
              <div className="flex items-center gap-1.5 font-mono-metric">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span>Raised: <strong>{new Date(alert.raised_at).toLocaleTimeString()}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-cyan-300">
                <Radio className="h-3.5 w-3.5" />
                <span>Status: <strong className="uppercase">{alert.status}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: Interactive Actions */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 lg:pt-0">
          <button
            onClick={toggleSiren}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer border ${
              isPlayingSiren
                ? 'bg-red-600 hover:bg-red-700 text-white border-red-400 animate-pulse shadow-lg shadow-red-950/50'
                : 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 border-white/10'
            }`}
            title="Toggle Web Audio API SOS Siren Simulator"
          >
            {isPlayingSiren ? (
              <>
                <VolumeX className="h-4 w-4 text-white" />
                <span>Stop Siren</span>
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4 text-cyan-400" />
                <span>Simulate Siren</span>
              </>
            )}
          </button>

          {alert.status === 'active' && (
            <button
              onClick={() => onAcknowledge(alert.id)}
              className="flex items-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-4 py-2.5 text-xs transition-all shadow-md active:scale-95 cursor-pointer font-body"
            >
              <AlertTriangle className="h-4 w-4" />
              Acknowledge Alert
            </button>
          )}

          <button
            onClick={() => onResolve(alert.id)}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 text-xs transition-all shadow-md shadow-emerald-950/30 active:scale-95 cursor-pointer border border-emerald-400/40 font-body"
          >
            <CheckCircle className="h-4 w-4" />
            Resolve Incident
          </button>
        </div>

      </div>
    </div>
  );
};
