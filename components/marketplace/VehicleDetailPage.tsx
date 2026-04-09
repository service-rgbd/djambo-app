import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, Star, MapPin, CheckCircle2, Calendar,
  MessageCircle, Phone, Shield, Fuel, Users, Gauge, Settings2, Zap,
  Share2, Heart, ArrowRight, Clock, BadgeCheck
} from 'lucide-react';
import { BrandLogo } from '../../components/BrandLogo';
import { PublicSiteHeader } from '../../components/PublicSiteHeader';
import { marketplaceVehicles, reviews } from '../../services/mockData';
import { useAuth } from '../../contexts/AuthContext';

const StarRating = ({ rating, size = 14 }: { rating: number; size?: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star key={s} size={size} className={s <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'} />
    ))}
  </div>
);

export const VehicleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState('FR');

  const vehicle = marketplaceVehicles.find(v => v.id === id);
  const [currentImg, setCurrentImg] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [message, setMessage] = useState('');
  const [bookingDone, setBookingDone] = useState(false);
  const [liked, setLiked] = useState(false);

  const vehicleReviews = reviews.filter(r => r.vehicleId === id);
  const relatedVehicles = marketplaceVehicles.filter(v => v.id !== id && v.city === vehicle?.city).slice(0, 3);

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Véhicule introuvable.</p>
          <button onClick={() => navigate('/vehicles')} className="text-indigo-600 font-semibold">← Retour à la recherche</button>
        </div>
      </div>
    );
  }

  const days = startDate && endDate
    ? Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000))
    : 1;
  const total = days * vehicle.pricePerDay;

  const handleBook = () => {
    if (!user) { navigate('/login'); return; }
    setBookingDone(true);
  };

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

      {/* Top Nav */}
      <div className="bg-white/90 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-4 pt-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-medium text-sm shrink-0">
              <ChevronLeft size={18} /> Retour
            </button>
            <BrandLogo size="sm" subtitle="L'app FleetCommand" />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setLiked(!liked)} className={`p-2 rounded-full border transition-all ${liked ? 'border-rose-200 bg-rose-50 text-rose-500' : 'border-slate-200 text-slate-400 hover:text-rose-400'}`}>
              <Heart size={16} className={liked ? 'fill-rose-500' : ''} />
            </button>
            <button className="p-2 rounded-full border border-slate-200 text-slate-400 hover:text-slate-700 transition-all">
              <Share2 size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-[1fr_360px] gap-8">
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            {/* Gallery */}
            <div className="space-y-2">
              <div className="relative rounded-2xl overflow-hidden aspect-[16/9] bg-slate-200">
                <img
                  src={vehicle.images[currentImg]?.url}
                  alt={vehicle.title}
                  className="w-full h-full object-cover"
                />
                {vehicle.images.length > 1 && (
                  <>
                    <button onClick={() => setCurrentImg(i => Math.max(0, i - 1))} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-all">
                      <ChevronLeft size={18} />
                    </button>
                    <button onClick={() => setCurrentImg(i => Math.min(vehicle.images.length - 1, i + 1))} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-all">
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}
                {vehicle.isFeatured && (
                  <span className="absolute top-4 left-4 bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <Zap size={11} className="fill-white" /> En vedette
                  </span>
                )}
                <span className={`absolute top-4 right-4 text-xs font-bold px-3 py-1.5 rounded-full ${vehicle.isAvailable ? 'bg-emerald-500 text-white' : 'bg-slate-700/80 text-slate-200'}`}>
                  {vehicle.isAvailable ? 'Disponible' : 'Indisponible'}
                </span>
              </div>

              {vehicle.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {vehicle.images.map((img, i) => (
                    <button key={img.id} onClick={() => setCurrentImg(i)} className={`shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition-all ${i === currentImg ? 'border-indigo-500' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                      <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Vehicle Info */}
            <div className="bg-white rounded-[30px] border border-slate-200 p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 mb-1">{vehicle.title}</h1>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <MapPin size={13} />
                    <span>{vehicle.location}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1.5 justify-end mb-1">
                    <StarRating rating={vehicle.rating} />
                    <span className="font-bold text-slate-900">{vehicle.rating.toFixed(1)}</span>
                  </div>
                  <p className="text-xs text-slate-500">{vehicle.reviewCount} avis</p>
                </div>
              </div>

              {/* Specs row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                {[
                  { icon: Settings2, label: vehicle.transmission },
                  { icon: Fuel, label: vehicle.fuelType },
                  { icon: Users, label: `${vehicle.seats} places` },
                  { icon: Gauge, label: `${vehicle.mileage.toLocaleString()} km` },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 bg-slate-50 rounded-xl p-3">
                    <Icon size={15} className="text-indigo-500 shrink-0" />
                    <span className="text-sm font-medium text-slate-700">{label}</span>
                  </div>
                ))}
              </div>

              {/* Category & Color */}
              <div className="flex flex-wrap gap-2 mb-5">
                <span className="text-xs font-semibold px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full">{vehicle.category}</span>
                <span className="text-xs font-semibold px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full">{vehicle.color}</span>
                <span className="text-xs font-semibold px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full">{vehicle.year}</span>
                {vehicle.isForSale && vehicle.priceSale && (
                  <span className="text-xs font-semibold px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full">
                    À vendre : {(vehicle.priceSale / 1000000).toFixed(1)}M FCFA
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="mb-5">
                <h3 className="font-bold text-slate-900 mb-2">Description</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{vehicle.description}</p>
              </div>

              {/* Features */}
              <div className="mb-5">
                <h3 className="font-bold text-slate-900 mb-3">Équipements</h3>
                <div className="flex flex-wrap gap-2">
                  {vehicle.features.map(f => (
                    <span key={f} className="flex items-center gap-1.5 text-xs bg-slate-50 border border-slate-100 text-slate-700 px-3 py-1.5 rounded-xl font-medium">
                      <CheckCircle2 size={11} className="text-emerald-500" /> {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Conditions */}
              {vehicle.conditions && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-amber-800 font-semibold text-sm mb-1">
                    <Shield size={14} /> Conditions de location
                  </div>
                  <p className="text-amber-700 text-sm">{vehicle.conditions}</p>
                </div>
              )}
            </div>

            {/* Owner Card */}
            <div className="bg-white rounded-[30px] border border-slate-200 p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Proposé par</h3>
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-700 font-bold text-xl shrink-0">
                  {vehicle.ownerProfile.displayName.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Link to={`/profile/${vehicle.ownerProfile.id}`} className="font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                      {vehicle.ownerProfile.displayName}
                    </Link>
                    {vehicle.ownerProfile.verified && (
                      <BadgeCheck size={16} className="text-indigo-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mb-1">{vehicle.ownerProfile.type === 'PARC_AUTO' ? 'Agence professionnelle' : 'Particulier'} · {vehicle.ownerProfile.city}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Star size={11} className="text-amber-400 fill-amber-400" /> {vehicle.ownerProfile.rating.toFixed(1)} ({vehicle.ownerProfile.reviewCount} avis)</span>
                    <span className="flex items-center gap-1"><Clock size={11} /> {vehicle.ownerProfile.responseTime}</span>
                  </div>
                </div>
              </div>
              <Link to={`/profile/${vehicle.ownerProfile.id}`} className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                Voir le profil <ArrowRight size={14} />
              </Link>
            </div>

            {/* Reviews */}
            {vehicleReviews.length > 0 && (
              <div className="bg-white rounded-[30px] border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-slate-900">
                    Avis clients <span className="text-slate-400 font-normal text-sm">({vehicleReviews.length})</span>
                  </h3>
                  <div className="flex items-center gap-2">
                    <StarRating rating={vehicle.rating} size={16} />
                    <span className="font-bold text-slate-900">{vehicle.rating.toFixed(1)}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  {vehicleReviews.map(r => (
                    <div key={r.id} className="pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold text-xs shrink-0">
                            {r.userInitials}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{r.userName}</p>
                            <p className="text-xs text-slate-400">{new Date(r.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</p>
                          </div>
                        </div>
                        <StarRating rating={r.rating} size={12} />
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">{r.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Related vehicles */}
            {relatedVehicles.length > 0 && (
              <div>
                <h3 className="font-bold text-slate-900 mb-4">Autres véhicules à {vehicle.city}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {relatedVehicles.map(rv => (
                    <div key={rv.id} onClick={() => navigate(`/vehicles/${rv.id}`)} className="bg-white rounded-xl border border-slate-100 overflow-hidden cursor-pointer hover:shadow-md transition-all group">
                      <div className="aspect-[3/2] overflow-hidden bg-slate-100">
                        <img src={rv.images[0]?.url} alt={rv.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-semibold text-slate-800 line-clamp-1">{rv.title}</p>
                        <p className="text-xs text-slate-500">{rv.pricePerDay.toLocaleString()} FCFA/jour</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN — Booking panel (sticky) */}
          <div className="lg:block">
            <div className="sticky top-20">
              <div className="bg-white rounded-[30px] border border-slate-200 shadow-lg p-6">
                {/* Price */}
                <div className="mb-5">
                  {vehicle.isForRent && (
                    <div className="mb-2">
                      <span className="text-3xl font-extrabold text-slate-900">{vehicle.pricePerDay.toLocaleString()}</span>
                      <span className="text-slate-500 text-sm font-medium ml-1">FCFA / jour</span>
                    </div>
                  )}
                  {vehicle.isForSale && vehicle.priceSale && (
                    <p className="text-sm text-indigo-600 font-semibold">
                      Prix de vente : {(vehicle.priceSale / 1000000).toFixed(1)}M FCFA
                    </p>
                  )}
                </div>

                {bookingDone ? (
                  <div className="text-center py-6">
                    <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle2 size={28} className="text-emerald-600" />
                    </div>
                    <p className="font-bold text-slate-900 mb-1">Demande envoyée !</p>
                    <p className="text-sm text-slate-500">Le propriétaire vous répondra dans les meilleurs délais.</p>
                  </div>
                ) : (
                  <>
                    {vehicle.isForRent && (
                      <>
                        <div className="space-y-3 mb-4">
                          <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">Date de début</label>
                            <input
                              type="date" value={startDate}
                              min={new Date().toISOString().split('T')[0]}
                              onChange={e => setStartDate(e.target.value)}
                              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-400"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">Date de fin</label>
                            <input
                              type="date" value={endDate}
                              min={startDate || new Date().toISOString().split('T')[0]}
                              onChange={e => setEndDate(e.target.value)}
                              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-400"
                            />
                          </div>
                        </div>

                        {startDate && endDate && (
                          <div className="bg-slate-50 rounded-xl p-3 mb-4 space-y-1.5 text-sm">
                            <div className="flex justify-between text-slate-600">
                              <span>{vehicle.pricePerDay.toLocaleString()} × {days} jour{days > 1 ? 's' : ''}</span>
                              <span className="font-semibold">{(vehicle.pricePerDay * days).toLocaleString()} FCFA</span>
                            </div>
                            <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                              <span>Total</span>
                              <span>{total.toLocaleString()} FCFA</span>
                            </div>
                          </div>
                        )}

                        <div className="mb-4">
                          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">Message (optionnel)</label>
                          <textarea
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            rows={2}
                            placeholder="Précisez votre demande..."
                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-400 resize-none"
                          />
                        </div>

                        <button
                          onClick={handleBook}
                          disabled={!vehicle.isAvailable}
                          className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all ${vehicle.isAvailable ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 hover:-translate-y-0.5' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                        >
                          {vehicle.isAvailable ? (startDate && endDate ? `Réserver — ${total.toLocaleString()} FCFA` : 'Réserver maintenant') : 'Non disponible'}
                        </button>
                      </>
                    )}

                    {vehicle.ownerProfile.whatsapp && (
                      <a
                        href={`https://wa.me/${vehicle.ownerProfile.whatsapp.replace(/\s+/g, '').replace('+', '')}`}
                        target="_blank" rel="noopener noreferrer"
                        className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
                      >
                        <MessageCircle size={16} className="text-emerald-500" />
                        Contacter sur WhatsApp
                      </a>
                    )}
                  </>
                )}

                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Shield size={12} className="text-indigo-400" />
                    <span>Paiement sécurisé à la remise des clés</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Calendar size={12} className="text-indigo-400" />
                    <span>Annulation gratuite sous 24h</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
