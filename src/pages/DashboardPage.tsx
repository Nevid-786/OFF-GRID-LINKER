import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Activity, ShieldAlert, WifiOff, Waves, Search, Filter, Volume2, Radio, Clock } from 'lucide-react';
import { fetchNodes, fetchAlerts, acknowledgeAlert, resolveAlert } from '../services/api';
import type { NodeItem, AlertItem } from '../types';
import { MapComponent } from '../components/MapComponent';
import { StatusBadge } from '../components/StatusBadge';
import { EmergencyBanner } from '../components/EmergencyBanner';
import { sosSoundService } from '../services/sosSoundService';

export const DashboardPage: React.FC = () => {
  const [nodes, setNodes] = useState<NodeItem[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSensorFilter, setSelectedSensorFilter] = useState<string>('all');
  const [selectedNode, setSelectedNode] = useState<NodeItem | null>(null);

  const loadData = async () => {
    try {
      const [fetchedNodes, fetchedAlerts] = await Promise.all([
        fetchNodes(),
        fetchAlerts()
      ]);
      setNodes(fetchedNodes);
      setAlerts(fetchedAlerts);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    }
  };

  useEffect(() => {
    loadData();

    // Connect to Socket.io real-time telemetry stream
    const socket = io();

    socket.on('telemetry_update', (data: { node_id: number; water_level: number; alert_level: string; cause: string; timestamp: string }) => {
      setNodes(prev =>
        prev.map(n => {
          if (n.id === data.node_id) {
            return {
              ...n,
              water_level: data.water_level,
              alert_level: data.alert_level as NodeItem['alert_level'],
              cause: data.cause,
              last_reading_time: data.timestamp
            };
          }
          return n;
        })
      );
      sosSoundService.playBeep(880, 150);
    });

    socket.on('emergency_sos_alert', () => {
      loadData();
      sosSoundService.startSiren();
    });

    socket.on('alert_acknowledged', loadData);
    socket.on('alert_resolved', loadData);

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleAcknowledge = async (id: number) => {
    try {
      await acknowledgeAlert(id, 'Command Center Officer');
      sosSoundService.stopSiren();
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolve = async (id: number) => {
    try {
      await resolveAlert(id);
      sosSoundService.stopSiren();
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Metrics calculation
  const totalNodes = nodes.length;
  const activeCriticalAlerts = alerts.filter(a => a.status === 'active' && (a.alert_level === 'Critical' || a.alert_level === 'Warning'));
  const offlineNodes = nodes.filter(n => n.status === 'offline').length;
  const avgWaterLevel = (
    nodes.reduce((acc, curr) => acc + (curr.water_level || 0), 0) / (nodes.length || 1)
  ).toFixed(2);

  // Active top alert for banner
  const highestActiveAlert = activeCriticalAlerts[0] || null;

  // Filtered nodes for search
  const filteredNodes = nodes.filter(n => {
    const matchesSearch = n.pole_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (n.cause && n.cause.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSensor = selectedSensorFilter === 'all' || n.sensor_type === selectedSensorFilter;
    return matchesSearch && matchesSensor;
  });

  return (
    <div className="min-h-screen bg-[#030712] text-[#F8FAFC] p-4 sm:p-6 space-y-6 font-body">
      
      {/* Top Banner if Critical SOS active */}
      {highestActiveAlert && (
        <EmergencyBanner
          alert={highestActiveAlert}
          onAcknowledge={handleAcknowledge}
          onResolve={handleResolve}
        />
      )}

      {/* Metric Summary Cards — ui-ux-pro-max Cyber Command Tokens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-panel p-5 rounded-2xl border border-[#1E293B] space-y-2">
          <div className="flex items-center justify-between text-[#94A3B8] text-xs font-mono-metric">
            <span>TOTAL SENSOR POLES</span>
            <Activity className="h-4 w-4 text-[#38BDF8]" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-mono-metric font-extrabold text-[#F8FAFC]">{totalNodes}</span>
            <span className="text-xs text-[#10B981] font-mono-metric font-semibold">100% ONLINE MESH</span>
          </div>
          <div className="text-[11px] text-[#64748B]">Deployed across 5 Indian river basins & zones</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-[#1E293B] space-y-2">
          <div className="flex items-center justify-between text-[#94A3B8] text-xs font-mono-metric">
            <span>ACTIVE EMERGENCY ALERTS</span>
            <ShieldAlert className="h-4 w-4 text-[#DC2626] animate-pulse" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className={`text-3xl font-mono-metric font-extrabold ${activeCriticalAlerts.length > 0 ? 'text-[#DC2626]' : 'text-[#F8FAFC]'}`}>
              {activeCriticalAlerts.length}
            </span>
            <span className={`text-xs font-mono-metric font-semibold ${activeCriticalAlerts.length > 0 ? 'text-[#DC2626] animate-pulse' : 'text-[#10B981]'}`}>
              {activeCriticalAlerts.length > 0 ? 'ACTION REQUIRED' : 'NOMINAL'}
            </span>
          </div>
          <div className="text-[11px] text-[#64748B]">Warning or Critical tier edge alarms</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-[#1E293B] space-y-2">
          <div className="flex items-center justify-between text-[#94A3B8] text-xs font-mono-metric">
            <span>OFFLINE POLES</span>
            <WifiOff className="h-4 w-4 text-[#F97316]" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-mono-metric font-extrabold text-[#F8FAFC]">{offlineNodes}</span>
            <span className="text-xs text-[#64748B] font-mono-metric">Chamoli Sector</span>
          </div>
          <div className="text-[11px] text-[#64748B]">Maintenance dispatch scheduled</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-[#1E293B] space-y-2">
          <div className="flex items-center justify-between text-[#94A3B8] text-xs font-mono-metric">
            <span>AVG WATER DISCHARGE</span>
            <Waves className="h-4 w-4 text-[#38BDF8]" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-mono-metric font-extrabold text-[#38BDF8]">{avgWaterLevel} m</span>
            <span className="text-xs text-[#10B981] font-mono-metric">+0.12m/24h</span>
          </div>
          <div className="text-[11px] text-[#64748B]">Mean discharge level across river nodes</div>
        </div>

      </div>

      {/* Main Command Console Grid (Map + Real-Time Telemetry Feed) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Leaflet GIS Map */}
        <div className="lg:col-span-8 flex flex-col space-y-3">
          
          {/* Filter Chips & Search Bar */}
          <div className="glass-panel p-3 rounded-2xl border border-[#1E293B] flex flex-wrap items-center justify-between gap-3">
            
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
              <span className="text-xs font-mono-metric text-[#94A3B8] mr-1 flex items-center gap-1">
                <Filter className="h-3.5 w-3.5" /> Filter:
              </span>
              {['all', 'water', 'fire', 'air', 'landslide', 'industrial'].map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedSensorFilter(type)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono-metric capitalize transition-all cursor-pointer ${
                    selectedSensorFilter === type
                      ? 'bg-[#38BDF8] text-[#030712] font-bold shadow'
                      : 'bg-[#0B132B] text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#0F172A]'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="relative shrink-0 w-full sm:w-56">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#64748B]" />
              <input
                type="text"
                placeholder="Search pole or river..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-[#0B132B] border border-[#1E293B] rounded-xl py-1.5 pl-8 pr-3 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#38BDF8] font-body"
              />
            </div>

          </div>

          {/* Map Viewport Container */}
          <div className="h-[520px] rounded-2xl overflow-hidden glass-panel border border-[#1E293B] relative">
            <MapComponent
              nodes={filteredNodes}
              selectedSensorFilter={selectedSensorFilter}
              onNodeSelect={setSelectedNode}
            />
          </div>
        </div>

        {/* Right Column: Live Scrolling Telemetry & Alert Stream */}
        <div className="lg:col-span-4 glass-panel rounded-2xl border border-[#1E293B] p-4 flex flex-col h-[600px]">
          
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-3 mb-3">
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-[#38BDF8] animate-pulse" />
              <h3 className="font-heading font-bold text-sm text-[#F8FAFC] uppercase tracking-wider">
                Live Sensor Telemetry Stream
              </h3>
            </div>
            <span className="text-[10px] font-mono-metric text-[#10B981] bg-[#10B981]/15 px-2 py-0.5 rounded border border-[#10B981]/30">
              SOCKET LIVE
            </span>
          </div>

          {/* Scrolling Sensor Feed */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {filteredNodes.map(node => (
              <div
                key={node.id}
                onClick={() => setSelectedNode(node)}
                className={`p-3 rounded-xl border transition-all cursor-pointer space-y-2 ${
                  selectedNode?.id === node.id
                    ? 'bg-[#38BDF8]/20 border-[#38BDF8] shadow-md'
                    : 'bg-[#0B132B]/80 border-[#1E293B] hover:border-[#334155]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-heading font-bold text-xs text-[#38BDF8]">
                    {node.pole_name}
                  </span>
                  <StatusBadge level={node.alert_level || 'Safe'} size="sm" />
                </div>

                <div className="text-xs text-[#F8FAFC] font-body line-clamp-1">
                  {node.cause || 'Nominal status'}
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#94A3B8] font-mono-metric pt-1 border-t border-[#1E293B]/60">
                  <span>Water: <strong className="text-white">{node.water_level || '0.00'}m</strong></span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-[#64748B]" />
                    {new Date(node.last_reading_time || Date.now()).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Manual SOS Siren Test Trigger */}
          <div className="pt-3 border-t border-[#1E293B] mt-2">
            <button
              onClick={() => {
                sosSoundService.startSiren();
                setTimeout(() => sosSoundService.stopSiren(), 3000);
              }}
              className="w-full bg-[#0B132B] hover:bg-[#0F172A] text-[#38BDF8] border border-[#38BDF8]/40 font-mono-metric text-xs py-2 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Volume2 className="h-4 w-4 animate-pulse" />
              <span>Simulate 3s SOS Warning Siren</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
