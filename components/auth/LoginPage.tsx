import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Car, Lock, Mail, ArrowRight, Loader2, ChevronLeft, Search, CheckCircle2 } from 'lucide-react';
import { BrandLogo } from '../BrandLogo';

const LOGIN_ILLUSTRATION_SRC = new URL('../../login-images.jpg', import.meta.url).href;

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/app/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec de la connexion. Vérifiez vos identifiants.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f7f5f0] font-sans">
      <div className="flex-1 flex flex-col justify-center py-8 px-4 sm:px-6 lg:flex-none lg:w-[42%] lg:px-14 xl:px-20 bg-[radial-gradient(circle_at_top,#ffffff_0%,#f8f5ef_52%,#f2eee7_100%)] z-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'linear-gradient(rgba(15,23,42,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.04) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <Link to="/" className="absolute top-6 left-6 flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors text-sm font-medium z-10">
            <ChevronLeft size={16} />
            Retour
        </Link>

        <div className="mx-auto w-full max-w-sm lg:w-full lg:max-w-[430px] relative z-10">
          <div className="mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-600 mb-2">FleetCommand Plus</p>
            <h1 className="text-3xl lg:text-[2rem] font-extrabold text-slate-900 tracking-tight">Connexion plus compacte et immediate.</h1>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">On garde le ton premium, mais avec moins de hauteur et un acces plus direct au compte.</p>
          </div>

          <div className="mt-5 bg-white/92 backdrop-blur-xl py-6 px-4 shadow-[0_30px_100px_rgba(15,23,42,0.12)] rounded-[28px] sm:px-7 border border-white/80">
            
            <div className="text-center mb-6">
                <div className="flex items-center justify-center mb-4">
                  <BrandLogo size="sm" subtitle="L'app FleetCommand" />
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Connexion
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                Accedez a votre espace de gestion
                </p>
            </div>

             <button
                  type="button"
                  className="w-full inline-flex justify-center items-center py-3 px-4 border border-slate-200 rounded-2xl shadow-sm bg-[#fbfaf7] text-sm font-semibold text-slate-700 hover:bg-white hover:border-slate-300 transition-all duration-200"
                >
                  <svg className="h-5 w-5 mr-3" aria-hidden="true" viewBox="0 0 24 24">
                    <path
                      d="M12.0003 20.45c-4.6667 0-8.45-3.7833-8.45-8.45 0-4.6667 3.7833-8.45 8.45-8.45 4.6667 0 8.45 3.7833 8.45 8.45 0 4.6667-3.7833 8.45-8.45 8.45Z"
                      fill="#fff"
                    />
                    <path
                      d="M20.108 13.5682c.1591-1.0228.25-2.0682.25-3.1364 0-.5227-.0454-1.0227-.1136-1.5227h-8.2443v3.0681h4.7954c-.25 1.1591-.909 2.1591-1.8409 2.841v2.3182h2.9091c1.7046-1.5682 2.6819-3.8864 2.2443-3.5682Z"
                      fill="#4285F4"
                    />
                    <path
                      d="M11.9998 20.4501c2.2045 0 4.0682-.7273 5.4318-1.9773l-2.9091-2.3182c-.75.5228-1.7273.8182-2.5227.8182-2.2273 0-4.1136-1.5-4.7955-3.5227H4.25v2.3863c1.3864 2.75 4.2273 4.6137 7.7498 4.6137Z"
                      fill="#34A853"
                    />
                    <path
                      d="M7.2044 13.4501c-.1818-.5455-.2727-1.1137-.2727-1.7046s.0909-1.1591.2727-1.7045V7.6546H4.25c-.6136 1.2273-.9545 2.6136-.9545 4.0909s.3409 2.8636.9545 4.0909l2.9544-2.3863Z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M11.9998 6.9046c1.2045 0 2.2727.4318 3.1136 1.2273l2.3182-2.3182C15.9543 4.4955 14.1134 3.5409 11.9998 3.5409c-3.5225 0-6.3634 1.8636-7.7498 4.6136l2.9545 2.3864c.6818-2.0227 2.5682-3.5227 4.7953-3.6363Z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continuer avec Google
                </button>

            <div className="mt-6 relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="px-4 bg-white text-slate-400 font-medium tracking-wider">Ou avec email</span>
                </div>
            </div>

            <div className="mt-6">
              <form className="space-y-4" onSubmit={handleSubmit}>
                {error && (
                    <div className="bg-rose-50 border border-rose-100 text-rose-600 text-sm p-3 rounded-xl flex items-start gap-3 animate-fade-in">
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
                      onChange={(e) => setEmail(e.target.value)}
                      className="appearance-none block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-2xl bg-[#fcfbf8] text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm"
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
                      onChange={(e) => setPassword(e.target.value)}
                      className="appearance-none block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-2xl bg-[#fcfbf8] text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-2xl text-white bg-slate-950 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-slate-400 transition-all duration-300 shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5"
                  >
                    {isSubmitting ? (
                        <Loader2 className="animate-spin h-5 w-5" />
                    ) : (
                        <>
                        Se connecter
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          <p className="mt-5 text-center text-sm text-slate-600">
            Pas encore de compte ?{' '}
            <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
                Créer un compte
            </Link>
          </p>

          {/* Mobile guide */}
          <div className="mt-5 lg:hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-indigo-600 font-semibold text-xs uppercase tracking-[0.18em] mb-2">Simple et rapide</p>
            <h3 className="text-base font-extrabold text-slate-900 mb-3">3 clics pour reserver</h3>
            <div className="space-y-2.5">
              {[
                { step: '1', icon: Search, title: 'Recherchez', desc: 'Choisissez votre ville et le type de vehicule.' },
                { step: '2', icon: Car, title: 'Choisissez', desc: 'Comparez les offres, avis et disponibilites.' },
                { step: '3', icon: CheckCircle2, title: 'Reservez', desc: 'Envoyez la demande. Paiement a la remise.' },
              ].map(({ step, icon: Icon, title, desc }) => (
                <div key={step} className="flex items-start gap-3 rounded-xl border border-slate-100 p-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 font-bold text-sm flex items-center justify-center shrink-0">{step}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Icon size={14} className="text-indigo-600" />
                      <p className="text-sm font-bold text-slate-900">{title}</p>
                    </div>
                    <p className="text-xs text-slate-500">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-6 left-0 w-full text-center lg:text-left lg:pl-24 text-slate-400 text-xs">
            © 2024 FleetCommand
        </div>
      </div>

      <div className="hidden lg:block relative w-0 flex-1 bg-slate-900 overflow-hidden">
        <img className="absolute inset-0 h-full w-full object-cover" src={LOGIN_ILLUSTRATION_SRC} alt="Illustration login FleetCommand" />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/55 via-slate-950/45 to-indigo-950/70"></div>
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '44px 44px' }}></div>
         
         <div className="absolute inset-0 flex flex-col justify-center items-center p-10 text-center z-10">
          <div className="w-full max-w-xl bg-white/10 backdrop-blur-xl border border-white/15 rounded-[28px] shadow-2xl p-6">
              <p className="text-indigo-200 font-semibold text-xs uppercase tracking-[0.2em] mb-3">Simple et rapide</p>
              <h3 className="text-[1.75rem] font-bold text-white mb-2 tracking-tight">3 clics pour reserver</h3>
              <p className="text-indigo-100/80 text-sm mb-5">Une experience limpide de la recherche a la reservation.</p>

              <div className="space-y-3 text-left">
                {[
                  {
                    step: '1',
                    icon: Search,
                    title: 'Recherchez',
                    desc: 'Choisissez votre ville et type de vehicule. Des resultats en une seconde.',
                  },
                  {
                    step: '2',
                    icon: Car,
                    title: 'Choisissez',
                    desc: 'Comparez, lisez les avis, verifiez la disponibilite. Chaque profil est transparent.',
                  },
                  {
                    step: '3',
                    icon: CheckCircle2,
                    title: 'Reservez',
                    desc: 'Envoyez votre demande directement. Paiement a la remise des cles.',
                  },
                ].map(({ step, icon: Icon, title, desc }) => (
                  <div key={step} className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/5 p-3.5 hover:bg-white/10 transition-colors">
                    <div className="w-9 h-9 bg-indigo-500 text-white rounded-xl flex items-center justify-center font-bold text-sm shrink-0">{step}</div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Icon size={15} className="text-indigo-300" />
                        <p className="text-sm font-bold text-white">{title}</p>
                      </div>
                      <p className="text-xs text-indigo-100/75 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
         </div>
      </div>
    </div>
  );
};