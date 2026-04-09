import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft, Star, MapPin, BadgeCheck, CheckCircle2,
  Clock, MessageCircle, Car, Calendar, Users, Zap
} from 'lucide-react';
import { BrandLogo } from '../../components/BrandLogo';
import { PublicSiteHeader } from '../../components/PublicSiteHeader';
import { ownerProfiles, marketplaceVehicles, reviews } from '../../services/mockData';

const StarRating = ({ rating, size = 14 }: { rating: number; size?: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(s => (
      <Star key={s} size={size} className={s <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'} />
    ))}
  </div>
);

export const OwnerProfilePage: React.FC = () => {
  const { profileId } = useParams<{ profileId: string }>();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [activeLanguage, setActiveLanguage] = React.useState('FR');

  const profile = ownerProfiles.find(p => p.id === profileId);
  const ownerVehicles = marketplaceVehicles.filter(v => v.ownerId === profileId);
  const ownerReviews = reviews.filter(r => r.ownerId === profileId);

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Profil introuvable.</p>
          <button onClick={() => navigate('/vehicles')} className="text-indigo-600 font-semibold">
            Retour a la recherche
          </button>
        </div>
      </div>
    );
  }

  const isParcAuto = profile.type === 'PARC_AUTO';

  return (
    <div className="min-h-screen bg-[#f7f5f0] font-sans">
      <PublicSiteHeader
        theme="light"
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen((value) => !value)}
        navLinks={[{ label: 'Accueil', to: '/' }, { label: 'La flotte', to: '/vehicles' }, { label: 'OK Help', to: '#top' }]}
        activeLanguage={activeLanguage}
        onLanguageChange={setActiveLanguage}
        subtitle="L'app FleetCommand"
      />

      {/* Header nav */}
      <div className="bg-white/90 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-4 pt-20 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-medium text-sm"
          >
            <ChevronLeft size={18} /> Retour
          </button>
          <BrandLogo size="sm" subtitle="L'app FleetCommand" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6 rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600 mb-2">Profil premium</p>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">Un profil clair, fiable et plus vendeur.</h1>
          <p className="text-sm text-slate-600 max-w-3xl">Chaque proprietaire gagne en credibilite avec une presentation mieux structuree, des stats plus lisibles et des vehicules mieux mis en scene.</p>
        </div>
        
        {/* Profile card */}
        <div className="bg-white rounded-[30px] border border-slate-200 shadow-sm overflow-hidden mb-6">
          {/* Cover bar */}
          <div className={`h-24 ${isParcAuto ? 'bg-gradient-to-r from-indigo-600 to-indigo-700' : 'bg-gradient-to-r from-slate-700 to-slate-800'}`} />

          <div className="px-6 pb-6">
            {/* Avatar */}
            <div className="-mt-10 mb-4 flex items-end justify-between">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-extrabold text-white shadow-xl border-4 border-white ${isParcAuto ? 'bg-indigo-600' : 'bg-slate-700'}`}>
                {profile.displayName.substring(0, 2).toUpperCase()}
              </div>
              {profile.whatsapp && (
                <a
                  href={'https://wa.me/' + profile.whatsapp.replace(/\s+/g, '').replace('+', '')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-600 transition-colors"
                >
                  <MessageCircle size={15} /> WhatsApp
                </a>
              )}
            </div>

            {/* Name & badges */}
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-extrabold text-slate-900">{profile.displayName}</h1>
                  {profile.verified && (
                    <BadgeCheck size={20} className="text-indigo-500 shrink-0" />
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${isParcAuto ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}>
                    {isParcAuto ? 'Agence Professionnelle' : 'Particulier'}
                  </span>
                  <div className="flex items-center gap-1">
                    <MapPin size={13} />
                    <span>{profile.city}, {profile.country}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={13} />
                    <span>{profile.responseTime}</span>
                  </div>
                </div>
              </div>

              {/* Rating summary */}
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end mb-1">
                  <StarRating rating={profile.rating} size={16} />
                  <span className="text-xl font-extrabold text-slate-900">{profile.rating.toFixed(1)}</span>
                </div>
                <p className="text-xs text-slate-500">{profile.reviewCount} avis</p>
              </div>
            </div>

            {/* Description */}
            <p className="mt-4 text-slate-600 text-sm leading-relaxed">{profile.description}</p>

            {/* Quick stats */}
            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                { icon: Car, label: 'Vehicules', value: profile.vehicleCount },
                { icon: Calendar, label: 'Membre depuis', value: new Date(profile.memberSince).getFullYear() },
                { icon: Users, label: 'Avis clients', value: profile.reviewCount },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                  <Icon size={16} className="text-indigo-500 mx-auto mb-1" />
                  <p className="font-bold text-slate-900 text-sm">{value}</p>
                  <p className="text-xs text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          {/* Vehicles */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              Vehicules disponibles{' '}
              <span className="text-slate-400 font-normal text-sm">({ownerVehicles.length})</span>
            </h2>

            {ownerVehicles.length > 0 ? (
              <div className="space-y-4">
                {ownerVehicles.map(v => (
                  <div
                    key={v.id}
                    onClick={() => navigate('/vehicles/' + v.id)}
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group overflow-hidden flex"
                  >
                    <div className="w-32 sm:w-44 aspect-[4/3] overflow-hidden bg-slate-100 shrink-0">
                      <img
                        src={v.images[0]?.url}
                        alt={v.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1 p-4 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{v.title}</h3>
                        <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${v.isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                          {v.isAvailable ? 'Disponible' : 'Indispo'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mb-2">
                        <MapPin size={10} />
                        <span>{v.city}</span>
                        <span className="mx-1 text-slate-200">·</span>
                        <span>{v.category}</span>
                        {v.isFeatured && (
                          <>
                            <span className="mx-1 text-slate-200">·</span>
                            <Zap size={10} className="text-amber-500" />
                            <span className="text-amber-600 font-semibold">en vedette</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-900">{v.pricePerDay.toLocaleString()}</span>
                          <span className="text-xs text-slate-500 ml-1">FCFA/jour</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star size={11} className="text-amber-400 fill-amber-400" />
                          <span className="text-xs font-bold text-slate-700">{v.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
                <Car size={32} className="text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">Aucun vehicule liste pour le moment.</p>
              </div>
            )}
          </div>

          {/* Reviews sidebar */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              Avis recus{' '}
              <span className="text-slate-400 font-normal text-sm">({ownerReviews.length})</span>
            </h2>

            {ownerReviews.length > 0 ? (
              <div className="space-y-3">
                {ownerReviews.map(r => (
                  <div key={r.id} className="bg-white rounded-2xl border border-slate-100 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold text-xs shrink-0">
                          {r.userInitials}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{r.userName}</p>
                          <p className="text-xs text-slate-400">
                            {new Date(r.createdAt).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <StarRating rating={r.rating} size={12} />
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{r.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center">
                <Star size={28} className="text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">Pas encore d'avis.</p>
              </div>
            )}

            {/* Trust card */}
            <div className="mt-4 bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-indigo-800 font-semibold text-sm mb-2">
                <CheckCircle2 size={15} className="text-indigo-600" />
                FleetCommand garantit
              </div>
              <ul className="space-y-1.5 text-xs text-indigo-700">
                <li>Profils verifies par notre equipe</li>
                <li>Avis clients authentiques</li>
                <li>Paiement securise a la remise</li>
                <li>Support en cas de litige</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
