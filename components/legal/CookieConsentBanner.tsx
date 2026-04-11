import React from 'react';
import { Link } from 'react-router-dom';

type ConsentPreferences = {
  essential: true;
  preferences: boolean;
  locationServices: boolean;
  status: 'accepted' | 'essential-only';
  updatedAt: string;
};

const CONSENT_STORAGE_KEY = 'djambo_cookie_consent';

export const readCookieConsent = (): ConsentPreferences | null => {
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    return raw ? JSON.parse(raw) as ConsentPreferences : null;
  } catch {
    return null;
  }
};

const saveCookieConsent = (preferences: ConsentPreferences) => {
  window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(preferences));
};

export const CookieConsentBanner: React.FC = () => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [showDetails, setShowDetails] = React.useState(false);

  React.useEffect(() => {
    setIsVisible(!readCookieConsent());
  }, []);

  const persist = React.useCallback((preferences: Omit<ConsentPreferences, 'updatedAt' | 'essential'> & { essential?: true }) => {
    saveCookieConsent({
      essential: true,
      preferences: preferences.preferences,
      locationServices: preferences.locationServices,
      status: preferences.status,
      updatedAt: new Date().toISOString(),
    });
    setIsVisible(false);
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-4xl rounded-[28px] border border-slate-300 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.28)] ring-1 ring-slate-200/90">
        <div className="flex flex-col gap-4 px-5 py-5 sm:px-6 sm:py-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
          <div className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-600">Cookies et consentement</p>
          <h2 className="mt-2 text-lg font-extrabold text-slate-950 sm:text-xl">Djambo utilise uniquement les cookies et stockages utiles au service, au cache et a vos preferences.</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Les elements essentiels gardent votre session, vos preferences de navigation et la stabilite du frontend Cloudflare. La geolocalisation reste declenchee uniquement lorsque vous la demandez pour un parking ou une adresse.
          </p>
          <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold text-slate-500">
            <Link to="/cookies" className="transition-colors hover:text-slate-900">Cookies et preferences</Link>
            <Link to="/privacy" className="transition-colors hover:text-slate-900">Politique de confidentialite</Link>
            <Link to="/terms" className="transition-colors hover:text-slate-900">Conditions d utilisation</Link>
            <button type="button" onClick={() => setShowDetails((value) => !value)} className="transition-colors hover:text-slate-900">
              {showDetails ? 'Masquer le detail' : 'Voir le detail'}
            </button>
          </div>
          {showDetails && (
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="border border-slate-200 bg-slate-50 px-3 py-3">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-900">Essentiels</p>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">Connexion, securite, routage, cache applicatif et maintien de session.</p>
              </div>
              <div className="border border-slate-200 bg-slate-50 px-3 py-3">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-900">Preferences</p>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">Langue, filtres, choix d interface et confort de navigation.</p>
              </div>
              <div className="border border-slate-200 bg-slate-50 px-3 py-3">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-900">Localisation</p>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">Seulement apres action explicite pour detecter une adresse de parking ou une position courante.</p>
              </div>
            </div>
          )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
            <button
              type="button"
              onClick={() => persist({ preferences: false, locationServices: false, status: 'essential-only' })}
              className="inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Refuser l optionnel
            </button>
            <button
              type="button"
              onClick={() => persist({ preferences: true, locationServices: true, status: 'accepted' })}
              className="inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800"
            >
              Tout accepter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};