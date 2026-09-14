import React, { useEffect, useState } from 'react';
import { Bell, Search, CheckCircle, AlertTriangle, Volume2, Navigation, Clock } from 'lucide-react';
import { fetchAlerts, acknowledgeAlert, resolveAlert } from '../services/api';
import type { AlertItem } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { sosSoundService } from '../services/sosSoundService';

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const loadAlerts = async () => {
    try {
      const data = await fetchAlerts();
      setAlerts(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleAcknowledge = async (id: number) => {
    try {
      await acknowledgeAlert(id, 'Incident Commander');
      sosSoundService.playBeep(1200, 150);
      loadAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolve = async (id: number) => {
    try {
      await resolveAlert(id);
      sosSoundService.playBeep(440, 200);
      loadAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredAlerts = alerts.filter(a => {
    const matchesLevel = levelFilter === 'all' || a.alert_level === levelFilter;
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    const matchesSearch = (a.pole_name && a.pole_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (a.cause && a.cause.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesLevel && matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#0B111E] text-slate-100 p-4 sm:p-6 space-y-6 font-body">
      
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="h-6 w-6 text-red-400 animate-pulse" />
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white">
              Alerts & Notifications Command Center
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-body pt-1">
            Real-time filterable telemetry alarms, emergency escalation logs, and authority dispatch records.
          </p>
        </div>

        <button
          onClick={() => {
            sosSoundService.startSiren();
            setTimeout(() => sosSoundService.stopSiren(), 2500);
          }}
          className="flex items-center gap-2 bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-500/40 font-mono-metric text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shadow-lg shadow-red-950/50"
        >
          <Volume2 className="h-4 w-4 animate-pulse" />
          <span>Test Emergency Alarm Siren</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Level Filter */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-mono-metric">
            <span className="text-slate-400 px-2 font-bold">LEVEL:</span>
            {['all', 'Critical', 'Warning', 'Watch', 'Safe'].map(lvl => (
              <button
                key={lvl}
                onClick={() => setLevelFilter(lvl)}
                className={`px-2.5 py-1 rounded-lg capitalize transition-all cursor-pointer ${
                  levelFilter === lvl
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-mono-metric">
            <span className="text-slate-400 px-2 font-bold">STATUS:</span>
            {['all', 'active', 'acknowledged', 'resolved'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg capitalize transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Filter cause or pole..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

      </div>

      {/* Alerts Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-body">
            <thead>
              <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-mono-metric uppercase tracking-wider">
                <th className="p-4">Alert ID</th>
                <th className="p-4">Pole Station</th>
                <th className="p-4">Severity Tier</th>
                <th className="p-4">Cause / Anomaly Vector</th>
                <th className="p-4">Raised Time</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 font-mono-metric">
                    No matching alerts found for selected filters.
                  </td>
                </tr>
              ) : (
                filteredAlerts.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-4 font-mono-metric font-bold text-cyan-400">
                      #{item.id}
                    </td>
                    <td className="p-4 font-heading font-bold text-slate-100">
                      {item.pole_name || `Node #${item.node_id}`}
                      {item.latitude && item.longitude && (
                        <div className="text-[10px] text-slate-400 font-mono-metric font-normal flex items-center gap-1 pt-0.5">
                          <Navigation className="h-3 w-3 text-amber-300" />
                          {item.latitude.toFixed(3)}°, {item.longitude.toFixed(3)}°
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <StatusBadge level={item.alert_level} size="sm" />
                    </td>
                    <td className="p-4 text-slate-200 font-medium max-w-xs">
                      {item.cause}
                    </td>
                    <td className="p-4 font-mono-metric text-slate-400">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-slate-500" />
                        {new Date(item.raised_at).toLocaleString()}
                      </div>
                    </td>
                    <td className="p-4 font-mono-metric uppercase text-[11px] font-bold">
                      <span className={`px-2 py-0.5 rounded ${
                        item.status === 'active' ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse' :
                        item.status === 'acknowledged' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                        'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {item.status === 'active' && (
                          <button
                            onClick={() => handleAcknowledge(item.id)}
                            className="flex items-center gap-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs transition-all shadow cursor-pointer font-body"
                          >
                            <AlertTriangle className="h-3.5 w-3.5" />
                            <span>Acknowledge</span>
                          </button>
                        )}
                        {item.status !== 'resolved' && (
                          <button
                            onClick={() => handleResolve(item.id)}
                            className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-all shadow cursor-pointer font-body border border-emerald-400/40"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            <span>Resolve</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
