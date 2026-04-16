import React from 'react';
import { Turnstile } from '@marsidev/react-turnstile';

const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;

type TurnstileFieldProps = {
  action: 'login' | 'register';
  onTokenChange: (token: string) => void;
  onTokenExpired: () => void;
};

export const TurnstileField: React.FC<TurnstileFieldProps> = ({ action, onTokenChange, onTokenExpired }) => {
  if (!turnstileSiteKey) {
    return null;
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-slate-700">Verification Cloudflare</p>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white px-3 py-3">
        <Turnstile
          siteKey={turnstileSiteKey}
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