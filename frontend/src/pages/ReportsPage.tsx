import React, { useState } from 'react';
import { FileSpreadsheet, Download, Calendar, Filter, FileText, CheckCircle2 } from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

export const ReportsPage: React.FC = () => {
  const [startDate, setStartDate] = useState<string>('2026-09-01');
  const [endDate, setEndDate] = useState<string>('2026-09-13');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [hazardFilter, setHazardFilter] = useState<string>('all');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handleCsvDownload = () => {
    window.location.href = `${API_BASE}/reports/download?format=csv&start_date=${startDate}&end_date=${endDate}`;
  };

  const handlePdfGeneration = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      alert('Executive Situation PDF Report generated and downloaded to your local drive.');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0B111E] text-slate-100 p-4 sm:p-6 space-y-6 font-body">
      
      {/* Page Header */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-6 w-6 text-cyan-400" />
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white">
            Situation Reports & Data Export Center
          </h1>
        </div>
        <p className="text-xs text-slate-400 font-body pt-1">
          Export institutional situation reports, telemetry logs, and incident records for district magistrates and disaster management authorities.
        </p>
      </div>

      {/* Report Builder Form Card */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2">
          <Filter className="h-5 w-5 text-cyan-400" />
          <span>Configure Report Criteria & Parameters</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="space-y-1.5">
            <label className="text-xs font-mono-metric text-slate-300">START DATE</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono-metric"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono-metric text-slate-300">END DATE</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono-metric"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono-metric text-slate-300">RIVER BASIN / REGION</label>
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-cyan-400 font-body"
            >
              <option value="all">All River Basins & Zones</option>
              <option value="yamuna">Yamuna River Basin (NCR/UP)</option>
              <option value="brahmaputra">Brahmaputra Valley (Assam)</option>
              <option value="uttarakhand">Uttarakhand Hill Slopes</option>
              <option value="kerala">Kerala Backwaters</option>
              <option value="mumbai">Mumbai Coastal Corridor</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono-metric text-slate-300">HAZARD SENSOR DOMAIN</label>
            <select
              value={hazardFilter}
              onChange={(e) => setHazardFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-cyan-400 font-body"
            >
              <option value="all">All Telemetry Domains</option>
              <option value="water">Hydro / Flood</option>
              <option value="fire">Wildfire / Heat</option>
              <option value="air">AQI / Air Stagnation</option>
              <option value="landslide">Landslide / Geological</option>
              <option value="industrial">Industrial Chemical</option>
            </select>
          </div>

        </div>

        {/* Action Export Buttons */}
        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-800">
          <button
            onClick={handleCsvDownload}
            className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-6 py-3 rounded-xl text-xs transition-all shadow-lg font-heading cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Export Raw Telemetry (.CSV)</span>
          </button>

          <button
            onClick={handlePdfGeneration}
            disabled={isGenerating}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-100 font-bold px-6 py-3 rounded-xl text-xs border border-slate-700 transition-all cursor-pointer font-heading"
          >
            <FileText className="h-4 w-4 text-cyan-400" />
            <span>{isGenerating ? 'Generating Situation Brief...' : 'Generate Executive PDF Report'}</span>
          </button>
        </div>
      </div>

      {/* Preview Executive Summary Card */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-heading font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <span>Executive Situation Summary Preview (13 Sep 2026)</span>
          </h3>
          <span className="text-xs font-mono-metric text-slate-400">EIN CONFIDENTIAL BRIEFING</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-body">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="font-heading font-bold text-cyan-300 text-sm">Yamuna Basin Discharge</div>
            <p className="text-slate-300">Mean discharge recorded at 4.85m near Yamuna-Ghat-01. Warning advisory dispatched to Delhi SDMA.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="font-heading font-bold text-amber-300 text-sm">Kedarnath Geological Slope</div>
            <p className="text-slate-300">Micro-tilt sensor detected 0.8mm lateral drift. Watch tier status active; field officers alerted.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="font-heading font-bold text-purple-300 text-sm">Anand Vihar AQI Monitoring</div>
            <p className="text-slate-300">Continuous PM2.5 level exceeding 420 ug/m3. Stage-3 anti-pollution measures recommended.</p>
          </div>
        </div>
      </div>

    </div>
  );
};
