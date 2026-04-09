import React from 'react';
import { Link } from 'react-router-dom';
import { Headphones, Menu, X } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

type PublicSiteHeaderProps = {
  theme?: 'dark' | 'light';
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  navLinks?: Array<{ label: string; to: string }>;
  showLanguageSelector?: boolean;
  activeLanguage?: string;
  onLanguageChange?: (language: string) => void;
  showAuthButtons?: boolean;
  subtitle?: string;
};

const LANGUAGES = ['ES', 'EN', 'DE', 'FR', 'IT', 'PT'];

export const PublicSiteHeader: React.FC<PublicSiteHeaderProps> = ({
  theme = 'dark',
  mobileMenuOpen,
  onToggleMobileMenu,
  navLinks = [],
  showLanguageSelector = true,
  activeLanguage = 'FR',
  onLanguageChange,
  showAuthButtons = true,
  subtitle = "L'app FleetCommand",
}) => {
  const isDark = theme === 'dark';

  const navClass = isDark
    ? 'border-white/10 bg-slate-950/70 text-white backdrop-blur-xl'
    : 'border-slate-200 bg-white/90 text-slate-950 backdrop-blur-xl';

  const menuButtonClass = isDark
    ? 'border-white/10 bg-white/5 text-white'
    : 'border-slate-200 bg-white text-slate-700';

  const chipClass = isDark
    ? 'border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
    : 'border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-white';

  const helpClass = isDark
    ? 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-white';

  const loginClass = isDark
    ? 'border-white/10 bg-white/5 text-slate-100 hover:bg-white/10'
    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50';

  const signupClass = isDark
    ? 'bg-white text-slate-950 hover:bg-indigo-100'
    : 'bg-slate-950 text-white hover:bg-indigo-700';

  return (
    <nav className={'fixed inset-x-0 top-0 z-50 border-b ' + navClass}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="min-w-0">
          <BrandLogo theme={isDark ? 'light' : 'dark'} size="sm" subtitle={subtitle} />
        </Link>

        <div className={'hidden lg:flex items-center gap-1 rounded-2xl p-1 border ' + (isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-100/80')}>
          {navLinks.map((item) => (
            item.to.startsWith('#') ? (
              <a key={item.label} href={item.to} className={'px-4 py-2 rounded-xl text-sm font-semibold transition-all ' + (isDark ? 'text-slate-300 hover:text-white hover:bg-white/10' : 'text-slate-600 hover:text-slate-950 hover:bg-white')}>
                {item.label}
              </a>
            ) : (
              <Link key={item.label} to={item.to} className={'px-4 py-2 rounded-xl text-sm font-semibold transition-all ' + (isDark ? 'text-slate-300 hover:text-white hover:bg-white/10' : 'text-slate-600 hover:text-slate-950 hover:bg-white')}>
                {item.label}
              </Link>
            )
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          {showAuthButtons && (
            <>
              <Link to="/login" className={'inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ' + loginClass}>
                Connexion
              </Link>
              <Link to="/register" className={'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-colors ' + signupClass}>
                Inscription
              </Link>
            </>
          )}
          <a href="#help" className={'inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ' + helpClass}>
            <Headphones size={14} />
            OK Help
          </a>
          {showLanguageSelector && (
            <div className={'flex items-center gap-1 rounded-2xl p-1 border ' + (isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50')}>
              {LANGUAGES.map((language) => (
                <button
                  key={language}
                  type="button"
                  onClick={() => onLanguageChange?.(language)}
                  className={
                    'rounded-xl px-2.5 py-1.5 text-xs font-bold transition-all ' +
                    (activeLanguage === language
                      ? isDark
                        ? 'bg-white text-slate-950 shadow-sm'
                        : 'bg-slate-950 text-white shadow-sm'
                      : isDark
                        ? 'text-slate-400 hover:text-white'
                        : 'text-slate-500 hover:text-slate-900')
                  }
                >
                  {language}
                </button>
              ))}
            </div>
          )}
        </div>

        <button className={'lg:hidden p-2 rounded-xl border ' + menuButtonClass} onClick={onToggleMobileMenu}>
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className={'lg:hidden px-4 py-4 border-t backdrop-blur-xl ' + (isDark ? 'border-white/10 bg-slate-950/95' : 'border-slate-200 bg-white/95')}>
          <div className="grid gap-2">
            {showAuthButtons && (
              <>
                <Link to="/login" className={'rounded-xl border px-4 py-3 text-sm font-semibold ' + loginClass}>Connexion</Link>
                <Link to="/register" className={'rounded-xl px-4 py-3 text-sm font-semibold ' + signupClass}>Inscription</Link>
              </>
            )}
            {navLinks.map((item) => (
              item.to.startsWith('#') ? (
                <a key={item.label} href={item.to} className={'rounded-xl border px-4 py-3 text-sm font-semibold ' + chipClass}>{item.label}</a>
              ) : (
                <Link key={item.label} to={item.to} className={'rounded-xl border px-4 py-3 text-sm font-semibold ' + chipClass}>{item.label}</Link>
              )
            ))}
          </div>
          {showLanguageSelector && (
            <div className="mt-4 flex flex-wrap gap-2">
              {LANGUAGES.map((language) => (
                <button
                  key={language}
                  type="button"
                  onClick={() => onLanguageChange?.(language)}
                  className={
                    'rounded-lg px-2.5 py-1.5 text-xs font-bold transition-colors ' +
                    (activeLanguage === language
                      ? isDark
                        ? 'bg-white text-slate-950'
                        : 'bg-slate-950 text-white'
                      : isDark
                        ? 'bg-white/5 text-slate-300'
                        : 'bg-slate-100 text-slate-600')
                  }
                >
                  {language}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </nav>
  );
};