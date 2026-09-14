import React, { useState } from 'react';
import { Settings, Bell, Globe, Sliders, Save, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const { user } = useAuth();

  const [smsAlerts, setSmsAlerts] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [sensitivity, setSensitivity] = useState('high');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#0B111E] text-slate-100 p-4 sm:p-6 space-y-6 font-body max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <Settings className="h-6 w-6 text-cyan-400" />
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white">
            Command Center Settings & Preferences
          </h1>
        </div>
        <p className="text-xs text-slate-400 font-body pt-1">
          Customize emergency alert notification channels, interface language, and role-based threshold sensitivity.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs flex items-center gap-2 font-mono-metric">
          <CheckCircle2 className="h-5 w-5" />
          <span>Settings saved & dynamic configurations applied successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Language Selection */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-base font-heading font-bold text-white flex items-center gap-2">
            <Globe className="h-5 w-5 text-cyan-400" />
            <span>Interface Language / भाषा चयन</span>
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                language === 'en'
                  ? 'bg-cyan-500/15 border-cyan-400 text-cyan-300 font-bold shadow'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="font-heading text-sm">English (Default)</div>
              <div className="text-xs text-slate-400 font-body mt-1">Standard technical terms & international telemetry</div>
            </button>

            <button
              type="button"
              onClick={() => setLanguage('hi')}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                language === 'hi'
                  ? 'bg-cyan-500/15 border-cyan-400 text-cyan-300 font-bold shadow'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="font-heading text-sm">हिंदी (Devanagari)</div>
              <div className="text-xs text-slate-400 font-body mt-1">आपदा चेतावनी एवं स्थानीय अलर्ट अनुवाद</div>
            </button>
          </div>
        </div>

        {/* Notification Channels */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-base font-heading font-bold text-white flex items-center gap-2">
            <Bell className="h-5 w-5 text-amber-400" />
            <span>Emergency Notification Dispatches</span>
          </h2>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
              <div>
                <div className="font-bold text-slate-200">SMS Instant Gateway</div>
                <div className="text-slate-400 text-[11px]">Send direct SMS alerts for Critical tier events to on-duty officers.</div>
              </div>
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={e => setSmsAlerts(e.target.checked)}
                className="h-4 w-4 accent-cyan-400 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
              <div>
                <div className="font-bold text-slate-200">Email Situation Reports</div>
                <div className="text-slate-400 text-[11px]">Daily automated telemetry digest and alert logs.</div>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={e => setEmailAlerts(e.target.checked)}
                className="h-4 w-4 accent-cyan-400 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
              <div>
                <div className="font-bold text-slate-200">Browser & Web Push Sirens</div>
                <div className="text-slate-400 text-[11px]">Synthesize Web Audio siren alarms during active command center sessions.</div>
              </div>
              <input
                type="checkbox"
                checked={pushNotifications}
                onChange={e => setPushNotifications(e.target.checked)}
                className="h-4 w-4 accent-cyan-400 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Role Sensitivity */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-base font-heading font-bold text-white flex items-center gap-2">
            <Sliders className="h-5 w-5 text-emerald-400" />
            <span>Alert Sensitivity Threshold ({user?.role || 'admin'})</span>
          </h2>

          <div className="space-y-2 text-xs">
            <div className="grid grid-cols-3 gap-3">
              {['low', 'medium', 'high'].map(level => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setSensitivity(level)}
                  className={`p-3 rounded-xl border font-mono-metric uppercase text-center transition-all cursor-pointer ${
                    sensitivity === level
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  {level} Sensitivity
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-6 py-3 rounded-xl text-xs transition-all shadow-lg font-heading flex items-center gap-2 cursor-pointer"
        >
          <Save className="h-4 w-4" />
          <span>Save Preferences</span>
        </button>

      </form>

    </div>
  );
};
