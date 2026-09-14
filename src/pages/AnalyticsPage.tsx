import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { BarChart3, Waves, Flame, Wind, Droplets, Activity } from 'lucide-react';
import { fetchAnalytics } from '../services/api';
import type { AnalyticsTrends } from '../types';

export const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsTrends | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics()
      .then(data => {
        setAnalytics(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading || !analytics) {
    return (
      <div className="min-h-screen bg-[#0B111E] text-slate-100 p-8 flex items-center justify-center font-mono-metric text-cyan-400">
        <Activity className="h-6 w-6 animate-spin mr-2" />
        Computing Aggregated Telemetry Trends...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B111E] text-slate-100 p-4 sm:p-6 space-y-6 font-body">
      
      {/* Top Header */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-cyan-400" />
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white">
            Analytics & Multi-Hazard Trends
          </h1>
        </div>
        <p className="text-xs text-slate-400 font-body pt-1">
          Historical aggregate models for river discharge, forest wildfire seasonality, AQI pollution trends, and rainfall correlation.
        </p>
      </div>

      {/* Grid of 4 High-Density Recharts Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. Basin Water Level Trends */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Waves className="h-5 w-5 text-cyan-400" />
              <h3 className="font-heading font-bold text-base text-white">
                Water Discharge Levels per River Basin
              </h3>
            </div>
            <span className="text-[10px] font-mono-metric text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              JAN - SEP 2026
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.basinTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} unit="m" />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px' }} />
                <Legend />
                <Area type="monotone" dataKey="Yamuna" stroke="#46C6DC" fill="#46C6DC" fillOpacity={0.2} strokeWidth={2} />
                <Area type="monotone" dataKey="Brahmaputra" stroke="#10B981" fill="#10B981" fillOpacity={0.2} strokeWidth={2} />
                <Area type="monotone" dataKey="Kerala" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.2} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. AQI Trend by City */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wind className="h-5 w-5 text-purple-400" />
              <h3 className="font-heading font-bold text-base text-white">
                Diurnal AQI Pollution Trend (PM2.5 Index)
              </h3>
            </div>
            <span className="text-[10px] font-mono-metric text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/30">
              URBAN CENTERS
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.aqiTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="time" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px' }} />
                <Legend />
                <Line type="monotone" dataKey="Delhi" stroke="#EF4444" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Mumbai" stroke="#F97316" strokeWidth={2} />
                <Line type="monotone" dataKey="Guwahati" stroke="#8B5CF6" strokeWidth={2} />
                <Line type="monotone" dataKey="Rishikesh" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Wildfire Incident Seasonality */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-rose-400" />
              <h3 className="font-heading font-bold text-base text-white">
                Wildfire Anomaly Seasonality Breakdown
              </h3>
            </div>
            <span className="text-[10px] font-mono-metric text-rose-300 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-500/30">
              FOREST CANOPY
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.fireSeasonality}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="season" stroke="#64748B" fontSize={10} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px' }} />
                <Bar dataKey="incidents" fill="#F43F5E" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Rainfall vs Flood Correlation */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-cyan-400" />
              <h3 className="font-heading font-bold text-base text-white">
                Precipitation vs Flood Risk Index Correlation
              </h3>
            </div>
            <span className="text-[10px] font-mono-metric text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
              PREDICTIVE AI
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.rainfallCorrelation}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="rainfall_mm" stroke="#64748B" fontSize={11} unit="mm" />
                <YAxis stroke="#64748B" fontSize={11} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="flood_risk" stroke="#68E2F9" strokeWidth={3} name="Flood Risk %" />
                <Line type="monotone" dataKey="water_level" stroke="#D97706" strokeWidth={2} name="Water Level (m)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
