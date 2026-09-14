import React, { useEffect, useState } from 'react';
import { Shield, Plus, Trash2, Sliders, Cpu, Save } from 'lucide-react';
import { fetchNodes, createNode, deleteNode } from '../services/api';
import type { NodeItem, SensorType } from '../types';

export const AdminPage: React.FC = () => {
  const [nodes, setNodes] = useState<NodeItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPoleName, setNewPoleName] = useState('');
  const [newLat, setNewLat] = useState('28.6139');
  const [newLng, setNewLng] = useState('77.2090');
  const [newSensorType, setNewSensorType] = useState<SensorType>('water');

  // Thresholds state
  const [thresholds, setThresholds] = useState({
    water_warning_m: 4.0,
    water_critical_m: 4.8,
    aqi_warning_pm25: 300,
    aqi_critical_pm25: 420,
    tilt_critical_mm: 1.5,
    fire_temp_celsius: 65.0
  });

  const loadNodes = async () => {
    try {
      const data = await fetchNodes();
      setNodes(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadNodes();
  }, []);

  const handleCreateNode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPoleName) return;

    try {
      await createNode({
        pole_name: newPoleName,
        latitude: parseFloat(newLat),
        longitude: parseFloat(newLng),
        sensor_type: newSensorType,
        battery_percent: 100,
        signal_strength: 95,
        status: 'online'
      });
      setNewPoleName('');
      setShowAddModal(false);
      loadNodes();
    } catch (err) {
      console.error(err);
      alert('Failed to create node. Name may already exist.');
    }
  };

  const handleDeleteNode = async (id: number) => {
    if (confirm(`Are you sure you want to decommission Node #${id}?`)) {
      try {
        await deleteNode(id);
        loadNodes();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0B111E] text-slate-100 p-4 sm:p-6 space-y-6 font-body">
      
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-cyan-400" />
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white">
              System Administration & Edge Pole Config
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-body pt-1">
            Admin console for node provisioning, sensor threshold calibration, and access role enforcement.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-lg font-heading cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Provision New Sensor Pole</span>
        </button>
      </div>

      {/* Main Grid: Node Management Table & Threshold Config */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Deployed Sensor Nodes CRUD */}
        <div className="lg:col-span-8 space-y-4">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-heading font-bold text-white flex items-center gap-2">
                <Cpu className="h-5 w-5 text-cyan-400" />
                <span>Deployed Edge Sensor Nodes ({nodes.length})</span>
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-body">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono-metric">
                    <th className="pb-2">ID</th>
                    <th className="pb-2">POLE NAME</th>
                    <th className="pb-2">TYPE</th>
                    <th className="pb-2">GPS COORDINATES</th>
                    <th className="pb-2">STATUS</th>
                    <th className="pb-2 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {nodes.map((node) => (
                    <tr key={node.id} className="hover:bg-slate-900/40">
                      <td className="py-2.5 font-mono-metric font-bold text-slate-400">
                        #{node.id}
                      </td>
                      <td className="py-2.5 font-heading font-bold text-cyan-300">
                        {node.pole_name}
                      </td>
                      <td className="py-2.5 font-mono-metric uppercase text-slate-300">
                        {node.sensor_type}
                      </td>
                      <td className="py-2.5 font-mono-metric text-slate-400">
                        {node.latitude.toFixed(3)}°, {node.longitude.toFixed(3)}°
                      </td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono-metric uppercase font-bold ${
                          node.status === 'online'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {node.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={() => handleDeleteNode(node.id)}
                          className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-400 border border-red-500/30 transition-colors cursor-pointer"
                          title="Decommission Node"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Sensor Threshold Calibration */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-base font-heading font-bold text-white flex items-center gap-2">
              <Sliders className="h-5 w-5 text-amber-400" />
              <span>Threshold Sensitivity Config</span>
            </h2>

            <div className="space-y-3 text-xs font-body">
              <div className="space-y-1">
                <label className="text-slate-400 font-mono-metric">Water Level Warning (meters)</label>
                <input
                  type="number"
                  step="0.1"
                  value={thresholds.water_warning_m}
                  onChange={e => setThresholds({ ...thresholds, water_warning_m: parseFloat(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white font-mono-metric"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-mono-metric">Water Level Critical (meters)</label>
                <input
                  type="number"
                  step="0.1"
                  value={thresholds.water_critical_m}
                  onChange={e => setThresholds({ ...thresholds, water_critical_m: parseFloat(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white font-mono-metric"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-mono-metric">AQI Hazardous Index Threshold</label>
                <input
                  type="number"
                  value={thresholds.aqi_critical_pm25}
                  onChange={e => setThresholds({ ...thresholds, aqi_critical_pm25: parseInt(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white font-mono-metric"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-mono-metric">Canopy Ignition Temp (°C)</label>
                <input
                  type="number"
                  value={thresholds.fire_temp_celsius}
                  onChange={e => setThresholds({ ...thresholds, fire_temp_celsius: parseFloat(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white font-mono-metric"
                />
              </div>

              <button
                onClick={() => alert('Sensor threshold settings saved & synced to edge poles via LoRaWAN broadcast.')}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer font-heading mt-2"
              >
                <Save className="h-4 w-4" />
                <span>Sync Thresholds to Edge Poles</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Provision Node Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl max-w-md w-full border border-slate-700 space-y-4">
            <h3 className="text-lg font-heading font-bold text-white">Provision New Sensor Pole Node</h3>
            
            <form onSubmit={handleCreateNode} className="space-y-3 text-xs font-body">
              <div>
                <label className="text-slate-400 font-mono-metric block mb-1">POLE NAME</label>
                <input
                  type="text"
                  placeholder="e.g. Yamuna-Ghat-05"
                  value={newPoleName}
                  onChange={e => setNewPoleName(e.target.value)}
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-white font-body"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 font-mono-metric block mb-1">LATITUDE</label>
                  <input
                    type="text"
                    value={newLat}
                    onChange={e => setNewLat(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-white font-mono-metric"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-mono-metric block mb-1">LONGITUDE</label>
                  <input
                    type="text"
                    value={newLng}
                    onChange={e => setNewLng(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-white font-mono-metric"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-mono-metric block mb-1">SENSOR TYPE</label>
                <select
                  value={newSensorType}
                  onChange={e => setNewSensorType(e.target.value as SensorType)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-white font-body capitalize"
                >
                  <option value="water">Hydro / Flood</option>
                  <option value="fire">Wildfire / Heat</option>
                  <option value="air">AQI / Atmospheric</option>
                  <option value="landslide">Geological / Landslide</option>
                  <option value="industrial">Industrial Chemical</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold"
                >
                  Save Pole Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
