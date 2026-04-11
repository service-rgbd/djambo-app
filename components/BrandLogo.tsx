import React from 'react';

const DJAMBO_LOGO_ICON_SRC = new URL('../assets/djambo-logo-compact.png', import.meta.url).href;
const DJAMBO_LOGO_FULL_SRC = new URL('../logo.png', import.meta.url).href;

type BrandLogoProps = {
  theme?: 'light' | 'dark';
  size?: 'sm' | 'md';
  subtitle?: string;
  showIcon?: boolean;
  useFullLogo?: boolean;
};

export const BrandLogo: React.FC<BrandLogoProps> = ({ theme = 'dark', size = 'md', subtitle, showIcon = false, useFullLogo = false }) => {
  const isLight = theme === 'light';
  const iconFrameClass = size === 'sm'
    ? 'h-12 w-[4.25rem] rounded-2xl'
    : 'h-14 w-[5rem] rounded-[20px]';
  const fullLogoClass = size === 'sm'
    ? 'h-12 w-[9.75rem]'
    : 'h-16 w-[12.5rem]';
  const wordmarkClass = size === 'sm'
    ? 'text-[1.7rem] leading-none'
    : 'text-[2rem] leading-none';
  const subtitleClass = size === 'sm'
    ? 'mt-1 text-[9px]'
    : 'mt-1 text-[10px]';

  if (useFullLogo) {
    return (
      <div className="flex items-center gap-3 min-w-0" aria-label={subtitle ? `Djambo ${subtitle}` : 'Djambo'} title="Djambo">
        <img
          src={DJAMBO_LOGO_FULL_SRC}
          alt="Djambo"
          className={fullLogoClass + ' shrink-0 object-contain object-left'}
        />
        {subtitle ? (
          <p className={subtitleClass + ' truncate uppercase tracking-[0.22em] ' + (isLight ? 'text-slate-400' : 'text-slate-500')}>
            {subtitle}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 min-w-0" aria-label={subtitle ? `Djambo ${subtitle}` : 'Djambo'} title="Djambo">
      {showIcon && (
        <div className={iconFrameClass + ' relative shrink-0 overflow-hidden border ' + (isLight ? 'border-white/10 bg-black shadow-[0_16px_32px_rgba(0,0,0,0.28)]' : 'border-slate-200 bg-black shadow-[0_16px_32px_rgba(15,23,42,0.16)]')}>
          <img
            src={DJAMBO_LOGO_ICON_SRC}
            alt="Djambo"
            className="h-full w-full object-contain object-center p-1.5"
          />
        </div>
      )}
      <div className="min-w-0">
        <p className={wordmarkClass + ' font-black tracking-[-0.06em] ' + (isLight ? 'text-white' : 'text-slate-950')}>
          Djam<span className="text-amber-400">bo</span>
        </p>
        {subtitle ? (
          <p className={subtitleClass + ' truncate uppercase tracking-[0.22em] ' + (isLight ? 'text-slate-400' : 'text-slate-500')}>
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );
};