import React from 'react';

type BrandLogoProps = {
  theme?: 'light' | 'dark';
  size?: 'sm' | 'md';
  subtitle?: string;
};

export const BrandLogo: React.FC<BrandLogoProps> = ({ theme = 'dark', size = 'md', subtitle = 'Fleet mobility premium' }) => {
  const isLight = theme === 'light';
  const boxSize = size === 'sm' ? 'w-10 h-10' : 'w-12 h-12';
  const titleSize = size === 'sm' ? 'text-base' : 'text-lg';
  const subtitleSize = size === 'sm' ? 'text-[10px]' : 'text-[11px]';

  return (
    <div className="flex items-center gap-3 min-w-0">
      <div className={boxSize + ' relative shrink-0 rounded-2xl overflow-hidden border ' + (isLight ? 'border-white/20 bg-white/10' : 'border-slate-200 bg-white shadow-lg shadow-slate-200/80')}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#818cf8_0%,#312e81_45%,#020617_100%)]" />
        <div className="absolute inset-[1px] rounded-[15px] bg-[linear-gradient(135deg,rgba(255,255,255,0.24),transparent_42%,rgba(255,255,255,0.08))]" />
        <svg viewBox="0 0 48 48" className="relative z-10 w-full h-full p-2.5" aria-hidden="true">
          <path d="M11 31.5h11.5l3.5-6H14.8l1.9-3.2h10.9l3.3-5.8H20.2L11 31.5Z" fill="white" />
          <path d="M28.5 31.5H35c4 0 6-1.8 7.2-4.2 1-2 1-4.6-.3-6.6-1.3-2.2-3.6-3.7-7.8-3.7h-4.8l-2.8 4.9h7.1c1.8 0 2.7.5 3.2 1.2.4.6.4 1.4 0 2.1-.5.9-1.4 1.4-3 1.4h-2.3l-3 4.9Z" fill="#fbbf24" />
        </svg>
      </div>
      <div className="min-w-0">
        <p className={subtitleSize + ' uppercase tracking-[0.22em] ' + (isLight ? 'text-slate-400' : 'text-slate-500')}>{subtitle}</p>
        <p className={titleSize + ' font-extrabold tracking-tight truncate ' + (isLight ? 'text-white' : 'text-slate-950')}>
          Fleet<span className={isLight ? 'text-indigo-300' : 'text-indigo-600'}>Command</span>
        </p>
      </div>
    </div>
  );
};