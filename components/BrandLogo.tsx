import React from 'react';

const DJAMBO_APP_LOGO_SRC = new URL('../assets/jambo_violet_gold.png', import.meta.url).href;

type BrandLogoProps = {
  theme?: 'light' | 'dark';
  size?: 'sm' | 'md';
  subtitle?: string;
  showIcon?: boolean;
  useFullLogo?: boolean;
};

export const BrandLogo: React.FC<BrandLogoProps> = ({ theme = 'dark', size = 'md', subtitle, showIcon = false, useFullLogo = false }) => {
  const isLight = theme === 'light';
  const fullLogoClass = size === 'sm'
    ? 'h-12 w-[11.75rem]'
    : 'h-16 w-[15.5rem]';
  const compactLogoClass = size === 'sm'
    ? 'h-12 w-[11.75rem]'
    : 'h-14 w-[13.75rem]';
  const subtitleClass = size === 'sm'
    ? 'mt-1 text-[9px]'
    : 'mt-1 text-[10px]';

  const logoClass = useFullLogo ? fullLogoClass : compactLogoClass;

  return (
    <div className="flex items-center gap-3 min-w-0" aria-label={subtitle ? `Djambo ${subtitle}` : 'Djambo'} title="Djambo">
      {(showIcon || useFullLogo || !showIcon) && (
        <img
          src={DJAMBO_APP_LOGO_SRC}
          alt="Djambo"
          className={logoClass + ' shrink-0 object-contain object-left'}
        />
      )}
      {subtitle ? (
        <p className={subtitleClass + ' min-w-0 truncate uppercase tracking-[0.22em] ' + (isLight ? 'text-slate-400' : 'text-slate-500')}>
          {subtitle}
        </p>
      ) : null}
    </div>
  );
};