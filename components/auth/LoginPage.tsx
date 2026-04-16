import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Lock, Mail, ArrowRight, Loader2, ChevronLeft } from 'lucide-react';
import { BrandLogo } from '../BrandLogo';
import { TurnstileField, useTurnstileConfig } from './TurnstileField';

const LOGIN_ILLUSTRATION_SRC = new URL('../../login-images.jpg', import.meta.url).href;

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { enabled: turnstileEnabled, isLoading: isTurnstileLoading, siteKey: runtimeTurnstileSiteKey } = useTurnstileConfig();

  useEffect(() => {
    if (!turnstileEnabled) {
      setTurnstileToken('');
    }
  }, [turnstileEnabled]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (turnstileEnabled && !turnstileToken) {
      setError('Veuillez valider la verification Cloudflare avant de continuer.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password, turnstileToken || undefined);
      navigate('/app/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec de la connexion. Vérifiez vos identifiants.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="notranslate min-h-screen bg-[#f7f5f0] font-sans lg:flex lg:h-screen lg:overflow-hidden" translate="no">
      <div className="relative z-10 flex flex-1 flex-col overflow-hidden bg-[radial-gradient(circle_at_top,#ffffff_0%,#f8f5ef_52%,#f2eee7_100%)] px-4 py-4 sm:px-6 lg:w-[42%] lg:flex-none lg:px-12 xl:px-16">
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'linear-gradient(rgba(15,23,42,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.04) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <Link to="/" className="relative z-10 inline-flex w-fit items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600">
            <ChevronLeft size={16} />
            Retour
        </Link>

        <div className="relative z-10 mx-auto flex h-full w-full max-w-[410px] flex-col justify-center py-6 lg:max-w-[430px]">
          <div className="mb-8">
            <BrandLogo size="sm" />
            <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Connexion</h1>
            <p className="mt-2 text-sm text-slate-500">Email et mot de passe.</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit} translate="no">
                {error && (
                    <div className="flex items-start gap-3 rounded-2xl bg-rose-50 p-3 text-sm text-rose-600 animate-fade-in">
                        <div className="p-0.5 mt-0.5"><div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div></div>
                        <p>{error}</p>
                    </div>
                )}
                
                <div className="space-y-1">
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                    Email
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-indigo-500 text-slate-400">
                        <Mail className="h-5 w-5" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                      className="block w-full rounded-2xl bg-white px-3 py-3 pl-10 text-slate-900 outline-none ring-1 ring-slate-200 transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/30 sm:text-sm"
                      placeholder="nom@entreprise.com"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                        Mot de passe
                    </label>
                    <div className="text-sm">
                        <Link to="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                        Oublié ?
                        </Link>
                    </div>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-indigo-500 text-slate-400">
                        <Lock className="h-5 w-5" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                      className="block w-full rounded-2xl bg-white px-3 py-3 pl-10 text-slate-900 outline-none ring-1 ring-slate-200 transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/30 sm:text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <TurnstileField
                  action="login"
                  isLoading={isTurnstileLoading}
                  onTokenChange={(token) => setTurnstileToken(token)}
                  onTokenExpired={() => setTurnstileToken('')}
                  siteKey={runtimeTurnstileSiteKey}
                />

                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting || isTurnstileLoading}
                    translate="no"
                    className="group relative flex w-full justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-slate-400"
                  >
                    <span className="inline-flex items-center justify-center gap-2">
                      <Loader2 className={'h-5 w-5 ' + (isSubmitting ? 'animate-spin' : 'hidden')} />
                      <span>{isSubmitting ? 'Connexion...' : 'Se connecter'}</span>
                      <ArrowRight className={'h-4 w-4 transition-transform group-hover:translate-x-1 ' + (isSubmitting ? 'hidden' : '')} />
                    </span>
                  </button>
                </div>
          </form>
          
          <p className="mt-5 text-center text-sm text-slate-600">
            Pas encore de compte ?{' '}
            <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
                Créer un compte
            </Link>
          </p>
        </div>
        
        <div className="relative z-10 mt-6 text-center lg:text-left lg:pl-0 text-slate-400 text-xs">
            © 2024 Djambo
        </div>
      </div>

      <div className="relative hidden flex-1 items-center justify-center overflow-hidden bg-slate-950 lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.24),transparent_34%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.08),transparent_38%)]" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '44px 44px' }}></div>
        <img className="h-full w-full object-cover object-center" src={LOGIN_ILLUSTRATION_SRC} alt="Illustration login Djambo" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.26)_0%,rgba(2,6,23,0.18)_28%,rgba(2,6,23,0.4)_100%)]"></div>
      </div>
    </div>
  );
};