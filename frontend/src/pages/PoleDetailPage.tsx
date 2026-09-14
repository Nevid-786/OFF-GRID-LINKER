import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { ArrowLeft, Battery, Signal, Navigation, Waves, ShieldAlert, Activity } from 'lucide-react';
import { fetchNodeDetail } from '../services/api';
import type { NodeItem, Reading, AlertItem } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { MapComponent } from '../components/MapComponent';

export const PoleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [nodeData, setNodeData] = useState<(NodeItem & { readings: Reading[]; alerts: AlertItem[]; nearby: NodeItem[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

  useEffect(() => {
    if (id) {
      setLoading(true);
      fetchNodeDetail(id)
        .then(data => {
          setNodeData(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B111E] text-slate-100 p-8 flex items-center justify-center font-mono-metric text-cyan-400">
        <Activity className="h-6 w-6 animate-spin mr-2" />
        Fetching Pole Telemetry & History...
      </div>
    );
  }

  if (!nodeData) {
    return (
      <div className="min-h-screen bg-[#0B111E] text-slate-100 p-8 text-center space-y-4">
        <div className="text-xl text-red-400 font-heading">Pole Station Not Found</div>
        <Link to="/dashboard" className="text-cyan-400 underline font-body">Return to Command Dashboard</Link>
      </div>
    );
  }

  // Formatting chart data for Recharts
  const chartData = (nodeData.readings || []).slice(0, 20).reverse().map(r => ({
    time: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    water_level: r.water_level,
    confidence: (r.confidence_score * 100).toFixed(0)
  }));

  return (
    <div className="min-h-screen bg-[#0B111E] text-slate-100 p-4 sm:p-6 space-y-6 font-body">
      
      {/* Back button & Pole Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-all cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white">
                {nodeData.pole_name}
              </h1>
              <StatusBadge level={nodeData.readings?.[0]?.alert_level || nodeData.alert_level || 'Safe'} size="lg" />
            </div>
            <p className="text-xs text-slate-400 font-mono-metric flex items-center gap-3 pt-1">
              <span className="flex items-center gap-1 text-amber-300">
                <Navigation className="h-3.5 w-3.5" />
                {nodeData.latitude.toFixed(4)}° N, {nodeData.longitude.toFixed(4)}° E
              </span>
              <span>Sensor Type: <strong className="uppercase text-cyan-400">{nodeData.sensor_type}</strong></span>
              <span>Deployed: {nodeData.deployed_date}</span>
            </p>
          </div>
        </div>

        {/* Health Stats */}
        <div className="flex items-center gap-3">
          <div className="glass-panel px-3.5 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400 font-mono-metric">BATTERY</div>
            <div className="text-sm font-mono-metric font-bold text-emerald-400 flex items-center gap-1">
              <Battery className="h-4 w-4" />
              {nodeData.battery_percent}%
            </div>
          </div>

          <div className="glass-panel px-3.5 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400 font-mono-metric">SIGNAL</div>
            <div className="text-sm font-mono-metric font-bold text-cyan-400 flex items-center gap-1">
              <Signal className="h-4 w-4" />
              {nodeData.signal_strength} dBm
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Telemetry Graph + Mini Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Recharts Line Graph */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Waves className="h-5 w-5 text-cyan-400" />
                <h3 className="text-base font-heading font-bold text-white">
                  Water Discharge & Level Trend
                </h3>
              </div>

              {/* Time Range Toggle */}
              <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-xs font-mono-metric">
                {(['24h', '7d', '30d'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                      timeRange === range
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            {/* Line Chart */}
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis dataKey="time" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} unit="m" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', color: '#F8FAFC' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="water_level"
                    stroke="#46C6DC"
                    strokeWidth={3}
                    dot={{ fill: '#46C6DC', r: 4 }}
                    activeDot={{ r: 6, fill: '#68E2F9' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cause History Log Table */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-heading font-bold text-white flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-400" />
              <span>Historical Sensor Cause Log</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-body">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono-metric">
                    <th className="pb-2">TIMESTAMP</th>
                    <th className="pb-2">ALERT LEVEL</th>
                    <th className="pb-2">WATER LEVEL</th>
                    <th className="pb-2">CAUSE / ANOMALY REASON</th>
                    <th className="pb-2">CONFIDENCE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {(nodeData.readings || []).slice(0, 10).map((r) => (
                    <tr key={r.id} className="hover:bg-slate-900/40">
                      <td className="py-2.5 font-mono-metric text-slate-300">
                        {new Date(r.timestamp).toLocaleString()}
                      </td>
                      <td className="py-2.5">
                        <StatusBadge level={r.alert_level} size="sm" />
                      </td>
                      <td className="py-2.5 font-mono-metric text-cyan-300 font-bold">
                        {r.water_level} m
                      </td>
                      <td className="py-2.5 text-slate-200">
                        {r.cause}
                      </td>
                      <td className="py-2.5 font-mono-metric text-emerald-400 font-semibold">
                        {(r.confidence_score * 100).toFixed(0)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column: Mini Map & Nearby Poles */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-sm font-heading font-bold text-white flex items-center gap-2">
              <Navigation className="h-4 w-4 text-cyan-400" />
              <span>Geospatial Location & Nearby Poles</span>
            </h3>
            <div className="h-64 rounded-xl overflow-hidden border border-slate-800">
              <MapComponent
                nodes={[nodeData, ...(nodeData.nearby || [])]}
                center={[nodeData.latitude, nodeData.longitude]}
                zoom={10}
              />
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-sm font-heading font-bold text-slate-300 uppercase tracking-wider font-mono-metric">
              Neighboring Mesh Sensor Poles
            </h3>
            <div className="space-y-2">
              {(nodeData.nearby || []).map((np) => (
                <Link
                  key={np.id}
                  to={`/nodes/${np.id}`}
                  className="block p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-all text-xs space-y-1"
                >
                  <div className="flex items-center justify-between font-bold text-cyan-300">
                    <span>{np.pole_name}</span>
                    <span className="uppercase text-[10px] text-slate-400">{np.sensor_type}</span>
                  </div>
                  <div className="text-slate-400 font-mono-metric">
                    {np.latitude.toFixed(3)}° N, {np.longitude.toFixed(3)}° E
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
