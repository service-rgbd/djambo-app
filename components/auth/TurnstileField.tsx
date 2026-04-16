import React, { useEffect, useState } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import { api } from '../../services/api';

const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;

type TurnstileConfigState = {
  enabled: boolean;
  isLoading: boolean;
  siteKey: string;
};

type TurnstileFieldProps = {
  action: 'login' | 'register';
  isLoading?: boolean;
  onTokenChange: (token: string) => void;
  onTokenExpired: () => void;
  siteKey?: string;
};

export const useTurnstileConfig = (): TurnstileConfigState => {
  const [state, setState] = useState<TurnstileConfigState>(() => ({
    enabled: Boolean(turnstileSiteKey),
    isLoading: !turnstileSiteKey,
    siteKey: turnstileSiteKey || '',
  }));

  useEffect(() => {
    if (turnstileSiteKey) {
      return;
    }

    let cancelled = false;

    api.getTurnstileConfig()
      .then((config) => {
        if (cancelled) {
          return;
        }

        setState({
          enabled: Boolean(config.enabled && config.siteKey),
          isLoading: false,
          siteKey: config.siteKey || '',
        });
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        setState({ enabled: false, isLoading: false, siteKey: '' });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
};

export const TurnstileField: React.FC<TurnstileFieldProps> = ({ action, isLoading = false, onTokenChange, onTokenExpired, siteKey = '' }) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-700">Verification Cloudflare</p>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
          Chargement de la verification en cours...
        </div>
      </div>
    );
  }

  if (!siteKey) {
    return null;
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-slate-700">Verification Cloudflare</p>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white px-3 py-3">
        <Turnstile
          siteKey={siteKey}
          options={{ action, theme: 'light', size: 'flexible' }}
          onSuccess={(token) => onTokenChange(token)}
          onExpire={onTokenExpired}
          onError={onTokenExpired}
        />
      </div>
      <p className="text-xs text-slate-500">Cette verification protege la connexion et l inscription contre les abus automatises.</p>
    </div>
  );
};