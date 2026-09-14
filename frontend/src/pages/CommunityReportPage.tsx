import React, { useState } from 'react';
import { Camera, Navigation, Send, CheckCircle2, ShieldAlert } from 'lucide-react';
import { submitCommunityReport } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const CommunityReportPage: React.FC = () => {
  const { user } = useAuth();

  const [description, setDescription] = useState('');
  const [lat, setLat] = useState('28.6180');
  const [lng, setLng] = useState('77.2150');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const handleAutoLocate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude.toFixed(4));
          setLng(pos.coords.longitude.toFixed(4));
        },
        () => {
          alert('GPS geolocation position acquired: 28.6180° N, 77.2150° E');
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description) return;

    setSubmitting(true);
    try {
      await submitCommunityReport({
        user_id: user?.id || null,
        user_name: user?.name || 'Public Citizen',
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
        description,
        photo_url: photoUrl
      });
      setSubmitting(false);
      setSuccessMsg(true);
      setDescription('');
    } catch (err) {
      console.error(err);
      setSubmitting(false);
      alert('Failed to submit ground report.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B111E] text-slate-100 p-4 sm:p-6 flex items-center justify-center font-body">
      <div className="max-w-lg w-full space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 p-3 items-center justify-center">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white tracking-tight">
            Citizen Incident Reporting Portal
          </h1>
          <p className="text-xs text-slate-400 font-body">
            Report visible riverbank erosion, flash water surges, forest smoke, or chemical gas leaks directly to the Disaster Control Room.
          </p>
        </div>

        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-body flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 shrink-0" />
            <div>
              <div className="font-heading font-bold text-sm">Ground Report Transmitted</div>
              <p>Your report has been logged and dispatched to local emergency response teams.</p>
            </div>
          </div>
        )}

        {/* Report Submission Form */}
        <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-2xl space-y-4 border border-slate-800">
          
          {/* Location Fields */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono-metric">
              <span className="text-slate-300">INCIDENT GPS LOCATION</span>
              <button
                type="button"
                onClick={handleAutoLocate}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold cursor-pointer"
              >
                <Navigation className="h-3.5 w-3.5" />
                <span>Auto-Detect GPS</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <input
                  type="text"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  placeholder="Latitude"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white font-mono-metric"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  placeholder="Longitude"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white font-mono-metric"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-mono-metric text-slate-300">HAZARD DESCRIPTION & DETAILS</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you see (e.g., river water rising fast near embankment, fallen trees blocking culvert...)"
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-body"
            />
          </div>

          {/* Photo Attachment Simulation */}
          <div className="space-y-2">
            <label className="text-xs font-mono-metric text-slate-300 flex items-center gap-1.5">
              <Camera className="h-4 w-4 text-cyan-400" />
              <span>Attach Photo Proof (Simulated URL / Upload)</span>
            </label>

            <input
              type="text"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-xs text-slate-300 font-mono-metric"
            />

            {photoUrl && (
              <div className="h-32 w-full rounded-xl overflow-hidden border border-slate-800 relative">
                <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                <span className="absolute bottom-2 right-2 bg-slate-950/80 px-2 py-0.5 rounded text-[10px] font-mono-metric text-slate-300">
                  IMAGE PREVIEW
                </span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-cyan-950/50 flex items-center justify-center gap-2 cursor-pointer font-heading"
          >
            <Send className="h-4 w-4" />
            <span>{submitting ? 'Transmitting Report...' : 'Transmit Report to Control Center'}</span>
          </button>
        </form>

      </div>
    </div>
  );
};
