import React from 'react';
import type { AlertLevel } from '../types';

interface StatusBadgeProps {
  level: AlertLevel | string;
  size?: 'sm' | 'md' | 'lg';
  showPulse?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ level, size = 'md', showPulse = true }) => {
  const normLevel = level as AlertLevel;

  let bg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  let dotBg = 'bg-emerald-400';
  let pulseClass = '';

  if (normLevel === 'Watch') {
    bg = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    dotBg = 'bg-amber-400';
  } else if (normLevel === 'Warning') {
    bg = 'bg-orange-500/15 text-orange-400 border-orange-500/40';
    dotBg = 'bg-orange-500';
    if (showPulse) pulseClass = 'animate-warning-pulse';
  } else if (normLevel === 'Critical') {
    bg = 'bg-red-500/20 text-red-400 border-red-500/50 shadow-lg shadow-red-950/40';
    dotBg = 'bg-red-500';
    if (showPulse) pulseClass = 'animate-emergency-pulse';
  }

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 font-mono-metric',
    md: 'text-xs px-2.5 py-1 font-mono-metric',
    lg: 'text-sm px-3 py-1.5 font-mono-metric font-bold'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border uppercase tracking-wider font-semibold ${bg} ${sizeStyles[size]} ${pulseClass}`}
    >
      <span className={`h-2 w-2 rounded-full ${dotBg} shrink-0 animate-pulse`} />
      {normLevel}
    </span>
  );
};
