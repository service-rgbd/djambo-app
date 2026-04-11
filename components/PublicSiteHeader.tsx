import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Headphones, Menu, X } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { useAuth } from '../contexts/AuthContext';

type PublicNavItem = {
  label: string;
  to?: string;
  items?: Array<{
    label: string;
    to: string;
    description?: string;
    previewImage?: string;
    previewMeta?: string;
    previewTitle?: string;
  }>;
};

type PublicSiteHeaderProps = {
  theme?: 'dark' | 'light';
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  navLinks?: PublicNavItem[];
  showLanguageSelector?: boolean;
  activeLanguage?: string;
  onLanguageChange?: (language: string) => void;
  showAuthButtons?: boolean;
  subtitle?: string;
};

const LANGUAGES = ['FR', 'EN'];

export const PublicSiteHeader: React.FC<PublicSiteHeaderProps> = ({
  theme = 'dark',
  mobileMenuOpen,
  onToggleMobileMenu,
  navLinks = [],
  showLanguageSelector = true,
  activeLanguage = 'FR',
  onLanguageChange,
  showAuthButtons = true,
  subtitle,
}) => {
  const [openMobileSection, setOpenMobileSection] = React.useState<string | null>(null);
  const [activePreviewByMenu, setActivePreviewByMenu] = React.useState<Record<string, number>>({});
  const { isAuthenticated } = useAuth();
  const isDark = theme === 'dark';

  const navClass = isDark
    ? 'border-white/10 bg-slate-950/82 text-white backdrop-blur-xl'
    : 'bg-white text-slate-950';

  const menuButtonClass = isDark
    ? 'text-white'
    : 'text-slate-700';

  const chipClass = isDark
    ? 'border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
    : 'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50';

  const helpClass = isDark
    ? 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
    : 'bg-transparent text-slate-700 hover:bg-slate-50';

  const loginClass = isDark
    ? 'border-white/10 bg-white/5 text-slate-100 hover:bg-white/10'
    : 'bg-transparent text-slate-700 hover:bg-slate-50';

  const signupClass = isDark
    ? 'bg-white text-slate-950 hover:bg-indigo-100'
    : 'bg-slate-950 text-white hover:bg-slate-800';

  const appClass = isDark
    ? 'bg-amber-300 text-slate-950 hover:bg-amber-200'
    : 'bg-slate-950 text-white hover:bg-slate-800';

  const dropdownPanelClass = isDark
    ? 'border-white/10 bg-slate-950/98 text-white shadow-[0_24px_90px_rgba(2,6,23,0.45)]'
    : 'border-slate-200 bg-white text-slate-950 shadow-[0_20px_50px_rgba(15,23,42,0.10)]';

  const dropdownItemClass = isDark
    ? 'border-white/10 bg-white/[0.03] hover:bg-white/10'
    : 'border-slate-200 bg-slate-50/80 hover:bg-slate-100';

  const scrollToAnchor = React.useCallback((anchor: string) => {
    const targetId = anchor.replace(/^#/, '');

    if (!targetId || targetId === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        const topOffset = 96;
        const targetTop = Math.max(0, window.scrollY + targetElement.getBoundingClientRect().top - topOffset);
        window.scrollTo({ top: targetTop, behavior: 'smooth' });
      }
    }

    if (mobileMenuOpen) {
      onToggleMobileMenu();
    }
  }, [mobileMenuOpen, onToggleMobileMenu]);

  const handleAnchorClick = (anchor: string) => (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    scrollToAnchor(anchor);
  };

  return (
    <nav className={'fixed inset-x-0 top-0 z-50 shadow-[0_12px_30px_rgba(15,23,42,0.06)] ' + navClass}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-16 py-2 lg:py-0 flex items-center justify-between gap-3">
        <Link to="/" className="min-w-0 flex-1 lg:flex-none">
          <BrandLogo theme={isDark ? 'light' : 'dark'} size="sm" subtitle={subtitle} useFullLogo={!isDark} />
        </Link>

        <div className="hidden lg:flex items-center gap-1 px-1 py-1">
          {navLinks.map((item) => (
            item.items?.length ? (
              <div key={item.label} className="group relative" onMouseLeave={() => setActivePreviewByMenu((current) => ({ ...current, [item.label]: 0 }))}>
                <button
                  type="button"
                  aria-haspopup="menu"
                  className={'inline-flex items-center gap-2 px-3 py-2 text-[13px] font-semibold transition-all ' + (isDark ? 'text-slate-300 hover:text-white hover:bg-white/10' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50')}
                >
                  {item.label}
                  <ChevronDown size={14} className="transition-transform group-hover:rotate-180 group-focus-within:rotate-180" />
                </button>
                <div className="pointer-events-none absolute left-0 top-full pt-3 opacity-0 translate-y-2 transition-all duration-200 group-hover:pointer-events-auto group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-focus-within:translate-y-0">
                  <div className={'w-[720px] border p-4 backdrop-blur-xl ' + dropdownPanelClass}>
                    <div className="mb-3 border-b border-slate-200/70 px-1 pb-3 pt-1">
                      <p className={'text-[11px] font-semibold uppercase tracking-[0.18em] ' + (isDark ? 'text-slate-500' : 'text-slate-400')}>{item.label}</p>
                      <p className={'mt-1 text-sm font-semibold ' + (isDark ? 'text-slate-200' : 'text-slate-700')}>Legendes rapides pour entrer directement dans la bonne section.</p>
                    </div>
                    <div className="grid grid-cols-[300px_1fr] gap-4">
                      <div className={'overflow-hidden border ' + (isDark ? 'border-white/10 bg-white/[0.04]' : 'border-slate-200 bg-slate-50')}>
                        {item.items[activePreviewByMenu[item.label] ?? 0]?.previewImage ? (
                          <div className="relative aspect-[4/4.8] overflow-hidden">
                            <img src={item.items[activePreviewByMenu[item.label] ?? 0].previewImage} alt={item.items[activePreviewByMenu[item.label] ?? 0].label} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                            <div className="absolute inset-x-4 bottom-4">
                              <div className="inline-flex bg-white/90 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-900">
                                {item.items[activePreviewByMenu[item.label] ?? 0].previewMeta || 'Legende'}
                              </div>
                              <p className="mt-2 text-[1.4rem] font-extrabold leading-tight text-white">{item.items[activePreviewByMenu[item.label] ?? 0].previewTitle || item.items[activePreviewByMenu[item.label] ?? 0].label}</p>
                              {item.items[activePreviewByMenu[item.label] ?? 0].description && <p className="mt-2 text-sm leading-relaxed text-white/80">{item.items[activePreviewByMenu[item.label] ?? 0].description}</p>}
                            </div>
                          </div>
                        ) : (
                          <div className="flex h-full min-h-[320px] items-end p-5">
                            <div>
                              <p className={'text-[11px] font-semibold uppercase tracking-[0.18em] ' + (isDark ? 'text-slate-500' : 'text-slate-400')}>{item.label}</p>
                              <p className={'mt-3 text-[1.4rem] font-extrabold leading-tight ' + (isDark ? 'text-white' : 'text-slate-950')}>{item.items[activePreviewByMenu[item.label] ?? 0]?.previewTitle || item.items[activePreviewByMenu[item.label] ?? 0]?.label}</p>
                              {item.items[activePreviewByMenu[item.label] ?? 0]?.description && <p className={'mt-2 text-sm leading-relaxed ' + (isDark ? 'text-slate-400' : 'text-slate-500')}>{item.items[activePreviewByMenu[item.label] ?? 0].description}</p>}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="grid gap-2">
                        {item.items.map((subItem, index) => {
                          const content = (
                            <>
                              <div className="flex items-start gap-3">
                                {subItem.previewImage && (
                                  <div className="h-20 w-28 shrink-0 overflow-hidden bg-slate-200">
                                    <img src={subItem.previewImage} alt={subItem.label} className="h-full w-full object-cover" />
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-3">
                                    <p className={'text-sm font-semibold ' + (isDark ? 'text-white' : 'text-slate-900')}>{subItem.label}</p>
                                    <span className={'text-[10px] font-semibold uppercase tracking-[0.18em] ' + (isDark ? 'text-slate-500' : 'text-slate-400')}>
                                      {subItem.previewMeta || `0${index + 1}`}
                                    </span>
                                  </div>
                                  {subItem.description && <p className={'mt-1 text-xs leading-relaxed ' + (isDark ? 'text-slate-400' : 'text-slate-500')}>{subItem.description}</p>}
                                </div>
                              </div>
                            </>
                          );

                          return subItem.to.startsWith('#') ? (
                            <button key={subItem.label} type="button" onMouseEnter={() => setActivePreviewByMenu((current) => ({ ...current, [item.label]: index }))} onFocus={() => setActivePreviewByMenu((current) => ({ ...current, [item.label]: index }))} onClick={handleAnchorClick(subItem.to)} className={'w-full border px-4 py-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ' + dropdownItemClass}>
                              {content}
                            </button>
                          ) : (
                            <Link key={subItem.label} to={subItem.to} onMouseEnter={() => setActivePreviewByMenu((current) => ({ ...current, [item.label]: index }))} onFocus={() => setActivePreviewByMenu((current) => ({ ...current, [item.label]: index }))} className={'border px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ' + dropdownItemClass}>
                              {content}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : item.to?.startsWith('#') ? (
              <button key={item.label} type="button" onClick={handleAnchorClick(item.to)} className={'px-3 py-2 text-[13px] font-semibold transition-all ' + (isDark ? 'text-slate-300 hover:text-white hover:bg-white/10' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50')}>
                {item.label}
              </button>
            ) : (
              <Link key={item.label} to={item.to || '/'} className={'px-3 py-2 text-[13px] font-semibold transition-all ' + (isDark ? 'text-slate-300 hover:text-white hover:bg-white/10' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50')}>
                {item.label}
              </Link>
            )
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-2.5">
          {showAuthButtons && !isAuthenticated && (
            <>
              <Link to="/login" className={'inline-flex items-center gap-2 px-3 py-2 text-[13px] font-semibold transition-colors ' + loginClass}>
                Connexion
              </Link>
              <Link to="/register" className={'inline-flex items-center gap-2 px-3 py-2 text-[13px] font-bold transition-colors ' + signupClass}>
                Inscription
              </Link>
            </>
          )}
          {isAuthenticated && (
            <Link to="/app/dashboard" className={'inline-flex items-center gap-2 px-3 py-2 text-[13px] font-bold transition-colors ' + appClass}>
              Mon espace
            </Link>
          )}
          <button type="button" onClick={handleAnchorClick('#help')} className={'inline-flex items-center gap-2 px-3 py-2 text-[13px] font-semibold transition-colors ' + helpClass}>
            <Headphones size={14} />
            Assistance
          </button>
          {showLanguageSelector && (
            <div className="flex items-center gap-1 p-1">
              {LANGUAGES.map((language) => (
                <button
                  key={language}
                  type="button"
                  onClick={() => onLanguageChange?.(language)}
                  className={
                    'px-2.5 py-1.5 text-[11px] font-bold transition-all ' +
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

        <button className={'lg:hidden shrink-0 p-2.5 ' + menuButtonClass} onClick={onToggleMobileMenu}>
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className={'lg:hidden px-4 py-4 ' + (isDark ? 'bg-slate-950' : 'bg-white')}>
          <div className="grid gap-2">
            {showAuthButtons && !isAuthenticated && (
              <>
                <Link to="/login" className={'px-4 py-3 text-sm font-semibold ' + loginClass}>Connexion</Link>
                <Link to="/register" className={'px-4 py-3 text-sm font-semibold ' + signupClass}>Inscription</Link>
              </>
            )}
            {isAuthenticated && (
              <Link to="/app/dashboard" className={'px-4 py-3 text-sm font-semibold ' + appClass}>Mon espace</Link>
            )}
            {navLinks.map((item) => (
              item.items?.length ? (
                <div key={item.label} className={isDark ? 'bg-white/5 p-1' : 'bg-slate-50 p-1'}>
                  <button
                    type="button"
                    onClick={() => setOpenMobileSection((value) => value === item.label ? null : item.label)}
                    className={'flex w-full items-center justify-between px-3 py-3 text-sm font-semibold transition-colors ' + (isDark ? 'text-white hover:bg-white/10' : 'text-slate-900 hover:bg-white')}
                  >
                    {item.label}
                    <ChevronDown size={16} className={openMobileSection === item.label ? 'rotate-180 transition-transform' : 'transition-transform'} />
                  </button>
                  {openMobileSection === item.label && (
                    <div className="grid gap-2 px-2 pb-2">
                      {item.items.map((subItem) => (
                        subItem.to.startsWith('#') ? (
                          <button key={subItem.label} type="button" onClick={handleAnchorClick(subItem.to)} className={'px-4 py-3 text-left ' + chipClass}>
                            <p className="text-sm font-semibold">{subItem.label}</p>
                            {subItem.description && <p className="mt-1 text-xs opacity-70">{subItem.description}</p>}
                          </button>
                        ) : (
                          <Link key={subItem.label} to={subItem.to} className={'px-4 py-3 ' + chipClass}>
                            <p className="text-sm font-semibold">{subItem.label}</p>
                            {subItem.description && <p className="mt-1 text-xs opacity-70">{subItem.description}</p>}
                          </Link>
                        )
                      ))}
                    </div>
                  )}
                </div>
              ) : item.to?.startsWith('#') ? (
                <button key={item.label} type="button" onClick={handleAnchorClick(item.to)} className={'px-4 py-3 text-left text-sm font-semibold ' + chipClass}>{item.label}</button>
              ) : (
                <Link key={item.label} to={item.to || '/'} className={'px-4 py-3 text-sm font-semibold ' + chipClass}>{item.label}</Link>
              )
            ))}
          </div>
          <button type="button" onClick={handleAnchorClick('#help')} className={'mt-4 inline-flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-colors ' + helpClass}>
            <Headphones size={14} />
            Assistance
          </button>
          {showLanguageSelector && (
            <div className="mt-4 flex flex-wrap gap-2 pt-2">
              {LANGUAGES.map((language) => (
                <button
                  key={language}
                  type="button"
                  onClick={() => onLanguageChange?.(language)}
                  className={
                    'px-2.5 py-1.5 text-xs font-bold transition-colors ' +
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