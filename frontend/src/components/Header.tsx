import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Activity,
  MapPin,
  Bell,
  BarChart3,
  FileSpreadsheet,
  Settings,
  Shield,
  FilePlus,
  Info,
  Volume2,
  VolumeX,
  User,
  LogOut,
  Radio
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { sosSoundService } from '../services/sosSoundService';

interface HeaderProps {
  activeCriticalCount?: number;
}

export const Header: React.FC<HeaderProps> = ({ activeCriticalCount = 0 }) => {
  const location = useLocation();
  const { user, logout, role } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [isMuted, setIsMuted] = useState(sosSoundService.getIsMuted());

  const toggleAudioMute = () => {
    const nextState = !isMuted;
    sosSoundService.setMuted(nextState);
    setIsMuted(nextState);
  };

  const navItems = [
    { path: '/dashboard', labelKey: 'live_dashboard', icon: Activity, protected: true },
    { path: '/map', labelKey: 'regional_map', icon: MapPin },
    { path: '/alerts', labelKey: 'alerts_center', icon: Bell, badge: activeCriticalCount > 0 ? activeCriticalCount : undefined },
    { path: '/analytics', labelKey: 'analytics', icon: BarChart3 },
    { path: '/reports', labelKey: 'reports', icon: FileSpreadsheet },
    { path: '/admin', labelKey: 'admin_panel', icon: Shield, adminOnly: true },
    { path: '/report-incident', labelKey: 'report_incident', icon: FilePlus },
    { path: '/about', labelKey: 'about', icon: Info },
    { path: '/settings', labelKey: 'settings', icon: Settings }
  ];

  const filteredNav = navItems.filter(item => {
    if (item.adminOnly && role !== 'admin') return false;
    return true;
  });

  return (
    <header className="sticky top-0 z-50 bg-[#030712]/90 backdrop-blur-xl border-b border-[#1E293B]">
      {/* Top Telemetry & Control Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-4">
        
        {/* Brand Logo & Name */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#38BDF8] to-[#818CF8] p-2 text-[#030712] flex items-center justify-center shadow-lg shadow-[#38BDF8]/30 group-hover:scale-105 transition-transform">
            <Radio className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading text-lg font-bold text-[#F8FAFC] tracking-tight">
                {t('app_name')}
              </span>
              <span className="bg-[#38BDF8]/15 text-[#38BDF8] text-[10px] font-mono-metric px-2 py-0.5 rounded border border-[#38BDF8]/40 uppercase tracking-widest font-bold">
                EDGE-AI v3.4
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] font-body hidden sm:block">
              {t('tagline')}
            </p>
          </div>
        </Link>

        {/* Global Controls & User Info */}
        <div className="flex items-center gap-3">
          
          {/* Audio Siren Toggle */}
          <button
            onClick={toggleAudioMute}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono-metric border transition-colors cursor-pointer ${
              isMuted
                ? 'bg-[#0B132B] text-[#94A3B8] border-[#1E293B]'
                : 'bg-[#38BDF8]/15 text-[#38BDF8] border-[#38BDF8]/40 shadow-sm'
            }`}
            title={isMuted ? t('unmute_sound') : t('mute_sound')}
          >
            {isMuted ? <VolumeX className="h-4 w-4 text-[#64748B]" /> : <Volume2 className="h-4 w-4 text-[#38BDF8] animate-pulse" />}
            <span className="hidden md:inline">{isMuted ? 'AUDIO OFF' : 'AUDIO LIVE'}</span>
          </button>

          {/* Bilingual Switcher (English / हिंदी) */}
          <div className="flex items-center bg-[#0B132B] border border-[#1E293B] rounded-lg p-0.5 text-xs font-mono-metric">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                language === 'en'
                  ? 'bg-[#38BDF8] text-[#030712] font-extrabold shadow'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                language === 'hi'
                  ? 'bg-[#38BDF8] text-[#030712] font-extrabold shadow'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              हिंदी
            </button>
          </div>

          {/* Role / User Badge */}
          {user ? (
            <div className="flex items-center gap-2 border-l border-[#1E293B] pl-3">
              <div className="hidden lg:block text-right">
                <div className="text-xs font-bold text-[#F8FAFC]">{user.name}</div>
                <div className="text-[10px] font-mono-metric uppercase text-[#38BDF8] font-semibold">{user.role}</div>
              </div>
              <button
                onClick={logout}
                className="p-2 text-[#94A3B8] hover:text-[#DC2626] hover:bg-[#0F172A] rounded-lg transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 bg-[#38BDF8] hover:bg-[#7DD3FC] text-[#030712] font-bold text-xs px-3.5 py-1.5 rounded-lg transition-all shadow-md cursor-pointer font-body"
            >
              <User className="h-4 w-4" />
              <span>Login</span>
            </Link>
          )}

        </div>
      </div>

      {/* Main Route Navigation Bar */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-[#1E293B]/80 overflow-x-auto scrollbar-none">
        <div className="flex items-center space-x-1 py-1.5">
          {filteredNav.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#38BDF8]/20 text-[#38BDF8] font-bold border border-[#38BDF8]/40'
                    : 'text-[#F8FAFC] hover:text-white hover:bg-[#0F172A]/60'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-[#38BDF8]' : 'text-[#64748B]'}`} />
                <span>{t(item.labelKey)}</span>
                {item.badge !== undefined && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-mono-metric font-bold bg-[#DC2626] text-white animate-pulse">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
};
