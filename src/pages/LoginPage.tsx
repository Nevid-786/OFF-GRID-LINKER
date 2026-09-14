import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, UserCheck, Users, Lock, Mail, Radio, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../services/api';
import type { UserRole } from '../types';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('admin@ein.gov.in');
  const [password, setPassword] = useState('admin123');
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const roles = [
    {
      role: 'admin' as UserRole,
      title: 'Administrator / Director',
      email: 'admin@ein.gov.in',
      password: 'admin123',
      icon: Shield,
      desc: 'Full system control, node configuration, threshold controls.'
    },
    {
      role: 'field_officer' as UserRole,
      title: 'District Field Officer',
      email: 'officer@ein.gov.in',
      password: 'officer123',
      icon: UserCheck,
      desc: 'Alert acknowledgement, incident dispatch, situation logs.'
    },
    {
      role: 'public' as UserRole,
      title: 'Public Citizen',
      email: 'citizen@ein.gov.in',
      password: 'citizen123',
      icon: Users,
      desc: 'View public advisories and submit ground incident reports.'
    }
  ];

  const handleRoleSelect = (r: typeof roles[0]) => {
    setSelectedRole(r.role);
    setEmail(r.email);
    setPassword(r.password);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await loginUser(email, password);
      login(res.token, res.user);
      if (res.user.role === 'public') {
        navigate('/report-incident');
      } else {
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid credentials';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B111E] text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        
        {/* Brand Top Card */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 p-3 text-slate-950 items-center justify-center shadow-lg shadow-cyan-950/60">
            <Radio className="h-8 w-8 animate-pulse" />
          </div>
          <h1 className="text-2xl font-heading font-extrabold text-white tracking-tight">
            Environmental Intelligence Network
          </h1>
          <p className="text-xs text-slate-400 font-body">
            Role-Based Command Portal Access
          </p>
        </div>

        {/* Demo Role Selector Cards */}
        <div className="space-y-2">
          <label className="text-xs font-mono-metric font-semibold text-slate-400 uppercase tracking-wider block">
            Select Role for Quick Demo Log-in
          </label>
          <div className="grid grid-cols-3 gap-2">
            {roles.map((r) => {
              const Icon = r.icon;
              const isSelected = selectedRole === r.role;
              return (
                <button
                  key={r.role}
                  type="button"
                  onClick={() => handleRoleSelect(r)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col items-center text-center gap-1.5 ${
                    isSelected
                      ? 'bg-cyan-500/15 border-cyan-400 text-cyan-300 font-bold shadow-md'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span className="text-[11px] font-heading capitalize font-bold leading-tight">
                    {r.role.replace('_', ' ')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-2xl space-y-4 border border-slate-800">
          
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono-metric">
              ⚠️ {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-mono-metric text-slate-300">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono-metric"
                placeholder="user@ein.gov.in"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono-metric text-slate-300">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono-metric"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-bold py-3 rounded-xl text-sm transition-all shadow-lg shadow-cyan-950/50 flex items-center justify-center gap-2 cursor-pointer font-heading"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Enter Command System</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>

          <div className="pt-2 text-center text-[11px] text-slate-400">
            Demo Credentials: Password is <code className="text-cyan-400">admin123</code> / <code className="text-cyan-400">officer123</code> / <code className="text-cyan-400">citizen123</code>
          </div>
        </form>

      </div>
    </div>
  );
};
