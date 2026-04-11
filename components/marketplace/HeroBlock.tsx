import React from 'react';

type HeroBlockProps = {
  variant?: 'light' | 'dark';
  overlayClassName?: string;
  contentClassName?: string;
  children: React.ReactNode;
};

const VARIANT_OVERLAYS: Record<NonNullable<HeroBlockProps['variant']>, string> = {
  light: 'bg-[linear-gradient(180deg,rgba(0,0,0,0.42)_0%,rgba(0,0,0,0.72)_100%)]',
  dark: 'bg-[linear-gradient(180deg,rgba(0,0,0,0.2)_0%,rgba(0,0,0,0.48)_100%)]',
};

export const HeroBlock: React.FC<HeroBlockProps> = ({
  variant = 'light',
  overlayClassName = '',
  contentClassName = '',
  children,
}) => {
  const overlayClasses = [
    'absolute inset-0 pointer-events-none',
    VARIANT_OVERLAYS[variant],
    overlayClassName,
  ].filter(Boolean).join(' ');

  const contentClasses = ['relative z-10', contentClassName].filter(Boolean).join(' ');

  return (
    <>
      <div className={overlayClasses} />
      <div className={contentClasses}>{children}</div>
    </>
  );
};