import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Loader2, Mail, MailCheck } from 'lucide-react';
import { BrandLogo } from '../BrandLogo';
import { api } from '../../services/api';

const LOGIN_ILLUSTRATION_SRC = new URL('../../login-images.jpg', import.meta.url).href;

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      const response = await api.forgotPassword(email);
      setSuccess(response.message);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Impossible de lancer la reinitialisation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f7f5f0] font-sans">
      <div className="flex-1 flex flex-col justify-center py-8 px-4 sm:px-6 lg:flex-none lg:w-[42%] lg:px-14 xl:px-20 bg-[radial-gradient(circle_at_top,#ffffff_0%,#f8f5ef_52%,#f2eee7_100%)] relative overflow-hidden">
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'linear-gradient(rgba(15,23,42,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.04) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <Link to="/login" className="absolute top-6 left-6 flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors text-sm font-medium z-10">
          <ChevronLeft size={16} />
          Retour a la connexion
        </Link>

        <div className="mx-auto w-full max-w-sm lg:w-full lg:max-w-[430px] relative z-10">
          <div className="mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-600 mb-2">Djambo</p>
            <h1 className="text-3xl lg:text-[2rem] font-extrabold text-slate-900 tracking-tight">Reinitialisation de mot de passe</h1>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">Entrez votre email pour recevoir automatiquement un lien securise de reinitialisation.</p>
          </div>

          <div className="mt-5 bg-white/92 backdrop-blur-xl py-6 px-4 shadow-[0_30px_100px_rgba(15,23,42,0.12)] rounded-[28px] sm:px-7 border border-white/80">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center mb-4">
                <BrandLogo size="sm" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Mot de passe oublie</h2>
              <p className="mt-1 text-sm text-slate-500">Nous vous enverrons un lien de reinitialisation par email.</p>
            </div>

            {success ? (
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <MailCheck size={24} />
                </div>
                <p className="text-sm leading-relaxed text-slate-600">{success}</p>
                <Link to="/login" className="inline-flex rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-600">
                  Retour a la connexion
                </Link>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                {error && <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div>}
                <div className="space-y-1">
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-700">Email</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500">
                      <Mail className="h-5 w-5" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="appearance-none block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-2xl bg-[#fcfbf8] text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm"
                      placeholder="nom@entreprise.com"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-2xl text-white bg-slate-950 hover:bg-indigo-600 disabled:bg-slate-400 transition-all duration-300"
                >
                  {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : 'Envoyer le lien'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <div className="hidden lg:block relative w-0 flex-1 bg-slate-900 overflow-hidden">
        <img className="absolute inset-0 h-full w-full object-cover" src={LOGIN_ILLUSTRATION_SRC} alt="Illustration recuperation de mot de passe" />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/55 via-slate-950/45 to-indigo-950/70"></div>
      </div>
    </div>
  );
};