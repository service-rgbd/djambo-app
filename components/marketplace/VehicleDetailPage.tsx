import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, Star, MapPin, CheckCircle2, Calendar,
  MessageCircle, Shield, Fuel, Users, Gauge, Settings2, Zap,
  Share2, Heart, ArrowRight, Clock, BadgeCheck
} from 'lucide-react';
import { PublicSiteHeader } from '../../components/PublicSiteHeader';
import { useAuth } from '../../contexts/AuthContext';
import { api, isRealUserMarketplaceVehicle, MarketplacePublicReview, MarketplacePublicVehicle } from '../../services/api';
import { HeroBlock } from './HeroBlock';

const StarRating = ({ rating, size = 14 }: { rating: number; size?: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star key={s} size={size} className={s <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'} />
    ))}
  </div>
);

const VEHICLE_DECISION_HINTS: Record<string, string> = {
  Luxe: 'A privilegier pour un rendez-vous premium, une ceremonie ou une arrivee qui compte.',
  SUV: 'Le bon choix pour combiner image, confort et routes moins simples.',
  Berline: 'Format adapte aux transferts, rendez-vous et trajets professionnels reguliers.',
  Economique: 'Solution directe pour circuler avec un budget mieux maitrise.',
  Pickup: 'Pense pour les missions, les zones moins faciles et les besoins robustes.',
  Utilitaire: 'Convient aux groupes, navettes et besoins de capacite plus large.',
  Cabriolet: 'Plus adapte a une experience, un sejour ou une sortie plus desirante.',
  Monospace: 'Ideal quand l espace interieur compte autant que le trajet.',
};

const getOwnerTypeBadge = (vehicle: MarketplacePublicVehicle) => vehicle.ownerProfile.type === 'PARC_AUTO'
  ? {
      label: 'Parc auto',
      className: 'border border-sky-100 bg-sky-50 text-sky-700',
    }
  : {
      label: 'Particulier',
      className: 'border border-orange-100 bg-orange-50 text-orange-700',
    };

export const VehicleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState('FR');
  const [vehicle, setVehicle] = useState<MarketplacePublicVehicle | null>(null);
  const [vehicleReviews, setVehicleReviews] = useState<MarketplacePublicReview[]>([]);
  const [relatedVehicles, setRelatedVehicles] = useState<MarketplacePublicVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentImg, setCurrentImg] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [message, setMessage] = useState('');
  const [requestType, setRequestType] = useState<'rent' | 'buy'>(vehicle?.isForRent ? 'rent' : 'buy');
  const [reservationMode, setReservationMode] = useState<'direct_app' | 'on_site'>('direct_app');
  const [pickupMode, setPickupMode] = useState<'agency' | 'delivery'>('agency');
  const [contactPreference, setContactPreference] = useState<'platform' | 'whatsapp'>('platform');
  const [bookingDone, setBookingDone] = useState(false);
  const [bookingFeedback, setBookingFeedback] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [offeredPrice, setOfferedPrice] = useState('');
  const [liked, setLiked] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewNotice, setReviewNotice] = useState('');
  const [customerDetails, setCustomerDetails] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    identityNumber: '',
    licenseNumber: '',
  });

  useEffect(() => {
    setCustomerDetails((currentDetails) => ({
      ...currentDetails,
      fullName: currentDetails.fullName || user?.name || '',
      email: currentDetails.email || user?.email || '',
      phone: currentDetails.phone || user?.phone || '',
    }));
  }, [user?.email, user?.name, user?.phone]);

  useEffect(() => {
    let isMounted = true;

    const loadVehicle = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await api.getMarketplaceVehicleById(id);
        if (!isMounted) {
          return;
        }
        setVehicle(response.vehicle);
        setVehicleReviews(response.reviews);
        setRelatedVehicles(response.relatedVehicles);
        setRequestType(response.vehicle.isForRent ? 'rent' : 'buy');
        setError('');
      } catch (loadError) {
        if (!isMounted) {
          return;
        }
        setError(loadError instanceof Error ? loadError.message : 'Vehicule introuvable.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadVehicle();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const visibleReviews = vehicleReviews.slice(0, 2);

  const vehicleGallery = useMemo(() => vehicle?.images ?? [], [vehicle]);

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">Chargement du vehicule...</div>;
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 mb-4">{error || 'Véhicule introuvable.'}</p>
          <button onClick={() => navigate('/vehicles')} className="inline-flex items-center gap-2 border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50">← Retour à la recherche</button>
        </div>
      </div>
    );
  }

  const days = startDate && endDate
    ? Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000))
    : 1;
  const total = days * vehicle.pricePerDay;
  const requestIsReady = requestType === 'buy'
    ? vehicle.isForSale
    : vehicle.isAvailable && Boolean(startDate && endDate);
  const directReservationReady = reservationMode === 'on_site'
    || Boolean(
      customerDetails.fullName
      && customerDetails.email
      && customerDetails.phone
      && customerDetails.identityNumber
      && (requestType === 'buy' || customerDetails.licenseNumber)
    );
  const canSubmitBooking = requestIsReady && directReservationReady;

  const supportsBothRequestTypes = vehicle.isForRent && vehicle.isForSale;

  const updateCustomerDetails = <K extends keyof typeof customerDetails>(key: K, value: (typeof customerDetails)[K]) => {
    setCustomerDetails((currentDetails) => ({
      ...currentDetails,
      [key]: value,
    }));
  };

  const handleSubmitReview = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!reviewComment.trim()) {
      setReviewError('Ajoutez un commentaire avant d envoyer votre avis.');
      return;
    }

    try {
      setReviewSubmitting(true);
      setReviewError('');
      const response = await api.submitVehicleReview({
        vehicleId: vehicle.id,
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      setVehicle(response.vehicle);
      setVehicleReviews(response.reviews);
      setReviewComment('');
      setReviewNotice(response.message);
      window.setTimeout(() => setReviewNotice(''), 2500);
    } catch (submitError) {
      setReviewError(submitError instanceof Error ? submitError.message : 'Impossible d enregistrer votre avis.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleBook = async () => {
    if (!user) { navigate('/login'); return; }
    if (!canSubmitBooking) return;

    try {
      setIsSubmitting(true);
      setBookingError('');

      const response = await api.submitVehicleRequest({
        vehicleId: vehicle.id,
        vehicleTitle: vehicle.title,
        ownerName: vehicle.ownerProfile.displayName,
        requestType,
        reservationMode,
        startDate: requestType === 'rent' ? startDate : undefined,
        endDate: requestType === 'rent' ? endDate : undefined,
        estimatedTotal: requestType === 'rent' ? total : undefined,
        offeredPrice: requestType === 'buy' && offeredPrice ? Number(offeredPrice) : undefined,
        pickupMode: reservationMode === 'direct_app' ? pickupMode : undefined,
        contactPreference,
        message,
        customerDetails: reservationMode === 'direct_app'
          ? {
              fullName: customerDetails.fullName,
              email: customerDetails.email,
              phone: customerDetails.phone,
              identityNumber: customerDetails.identityNumber,
              licenseNumber: requestType === 'rent' ? customerDetails.licenseNumber : undefined,
            }
          : undefined,
      });

      setBookingFeedback(response.message);
      setBookingDone(true);
    } catch (error) {
      setBookingError(error instanceof Error ? error.message : 'Impossible d envoyer la demande.');
    } finally {
      setIsSubmitting(false);
    }
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
      />

      <div className="bg-white/90 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-20">
        <div className="w-full px-2 py-4 pt-20 sm:px-4 lg:px-6 xl:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 border border-slate-200 bg-white px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium text-sm shrink-0 transition-colors">
              <ChevronLeft size={18} /> Retour
            </button>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Detail vehicule</p>
              <p className="text-sm font-bold text-slate-900">Presentation produit Djambo</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setLiked(!liked)} className={`border p-2 transition-all ${liked ? 'border-rose-200 bg-rose-50 text-rose-500' : 'border-slate-200 text-slate-400 hover:text-rose-400 hover:bg-slate-50'}`}>
              <Heart size={16} className={liked ? 'fill-rose-500' : ''} />
            </button>
            <button className="border border-slate-200 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all">
              <Share2 size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="w-full px-2 py-6 sm:px-4 lg:px-6 xl:px-8">
        <div className="mb-6 grid gap-px overflow-hidden border border-slate-200 bg-slate-200 shadow-sm xl:grid-cols-[1.12fr_0.88fr]">
          <div className="relative min-h-[360px] overflow-hidden bg-slate-950 sm:min-h-[440px] xl:min-h-[620px]">
            <img
              src={vehicleGallery[currentImg]?.url}
              alt={vehicle.title}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <HeroBlock
              variant="light"
              overlayClassName="bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_22%),linear-gradient(180deg,rgba(0,0,0,0.18)_0%,rgba(0,0,0,0.28)_24%,rgba(0,0,0,0.64)_100%)]"
              contentClassName="flex h-full flex-col justify-between p-4 sm:p-6 lg:p-8"
            >
              <div className="flex max-w-full flex-wrap items-center gap-2">
                <span className="bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-950 shadow-sm">Vehicule selectionne</span>
                <span className="bg-white/14 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">{vehicle.category}</span>
                <span className={'px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ' + getOwnerTypeBadge(vehicle).className}>{getOwnerTypeBadge(vehicle).label}</span>
                {vehicle.isFeatured && (
                  <span className="inline-flex items-center gap-1 bg-amber-400 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-950">
                    <Zap size={10} /> En vedette
                  </span>
                )}
                {isRealUserMarketplaceVehicle(vehicle) && (
                  <span className="bg-emerald-500 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">Vehicule utilisateur</span>
                )}
              </div>

              <div className="max-w-3xl rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(2,6,23,0.14)_0%,rgba(2,6,23,0.24)_100%)] p-5 shadow-[0_20px_60px_rgba(2,6,23,0.18)] sm:p-6 lg:p-7">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">Detail catalogue</p>
                <h1 className="mt-3 max-w-[14ch] break-words text-3xl font-extrabold leading-[0.95] text-white sm:max-w-[16ch] sm:text-5xl xl:text-6xl">{vehicle.title}</h1>
                <div className="mt-5 flex flex-wrap gap-2">
                  {[
                    vehicle.city,
                    vehicle.transmission,
                    vehicle.fuelType,
                    `${vehicle.seats} places`,
                    `${vehicle.year}`,
                  ].map((item) => (
                    <span key={item} className="max-w-full break-words bg-white/12 px-3 py-2 text-xs font-semibold text-white backdrop-blur-sm">{item}</span>
                  ))}
                </div>
                <div className="mt-6 flex flex-wrap items-end gap-4 border-t border-white/10 pt-5 sm:gap-5">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">Tarif journalier</p>
                    <p className="mt-2 text-2xl font-extrabold text-white sm:text-3xl">{vehicle.pricePerDay.toLocaleString()} FCFA</p>
                  </div>
                  <div className="flex items-center gap-2 bg-white px-4 py-3 text-sm font-bold text-slate-950 shadow-sm">
                    {vehicle.isAvailable ? 'Disponible maintenant' : 'Disponibilite sur demande'}
                    <ArrowRight size={16} />
                  </div>
                </div>
              </div>
            </HeroBlock>
          </div>

          <div className="grid gap-px bg-slate-200 sm:grid-cols-2 xl:grid-cols-1">
            <div className="min-w-0 bg-white p-4 sm:p-5 lg:p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Bon pour</p>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-900">{VEHICLE_DECISION_HINTS[vehicle.category] || 'Vehicule presente pour une decision plus directe.'}</p>
              <p className="mt-4 break-words text-sm leading-relaxed text-slate-500">{vehicle.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-px bg-slate-200">
              {[
                { label: 'Categorie', value: vehicle.category },
                { label: 'Couleur', value: vehicle.color },
                { label: 'Annee', value: String(vehicle.year) },
                { label: 'Avis', value: `${vehicle.rating.toFixed(1)} / 5` },
              ].map((item) => (
                <div key={item.label} className="min-w-0 bg-white p-4 sm:p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
                  <p className="mt-2 break-words text-sm font-bold text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>
            {vehicleGallery.length > 1 && (
              <div className="bg-white p-4 sm:p-5">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Galerie</p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setCurrentImg(i => Math.max(0, i - 1))} className="inline-flex h-9 w-9 items-center justify-center border border-slate-200 bg-white text-slate-500 transition-colors hover:text-slate-900">
                      <ChevronLeft size={16} />
                    </button>
                    <button onClick={() => setCurrentImg(i => Math.min(vehicleGallery.length - 1, i + 1))} className="inline-flex h-9 w-9 items-center justify-center border border-slate-200 bg-white text-slate-500 transition-colors hover:text-slate-900">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {vehicleGallery.map((img, i) => (
                    <button key={img.id} onClick={() => setCurrentImg(i)} className={'aspect-[4/3] overflow-hidden rounded-xl border-2 transition-all ' + (i === currentImg ? 'border-slate-950 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100')}>
                      <img src={img.url} alt={img.alt} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid xl:grid-cols-[minmax(0,1fr)_360px] gap-6 xl:gap-8">
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            {/* Vehicle Info */}
            <div className="overflow-hidden bg-white border border-slate-200 p-5 shadow-sm sm:p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="min-w-0">
                  <h1 className="break-words text-2xl font-bold text-slate-900 mb-1">{vehicle.title}</h1>
                  <div className="flex min-w-0 items-center gap-2 text-sm text-slate-500">
                    <MapPin size={13} />
                    <span className="truncate">{vehicle.location}</span>
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
                  <div key={label} className="min-w-0 flex items-center gap-2 bg-slate-50 rounded-xl p-3">
                    <Icon size={15} className="text-indigo-500 shrink-0" />
                    <span className="truncate text-sm font-medium text-slate-700">{label}</span>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 overflow-hidden border border-slate-200 bg-[#fcfbf8] p-4 lg:grid-cols-[minmax(0,1fr)_240px]">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Bon pour</p>
                  <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-900">
                    {VEHICLE_DECISION_HINTS[vehicle.category] || 'Vehicule presente pour une decision plus directe.'}
                  </p>
                  <p className="mt-3 break-words text-sm leading-relaxed text-slate-600">{vehicle.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
                  {[
                    { label: 'Categorie', value: vehicle.category },
                    { label: 'Couleur', value: vehicle.color },
                    { label: 'Annee', value: String(vehicle.year) },
                    {
                      label: vehicle.isForSale && vehicle.priceSale ? 'Vente' : 'Acces',
                      value: vehicle.isForSale && vehicle.priceSale
                        ? `${(vehicle.priceSale / 1000000).toFixed(1)}M FCFA`
                        : (vehicle.isForRent ? 'Location' : 'Sur demande'),
                    },
                  ].map((item) => (
                    <div key={item.label} className="min-w-0 border border-slate-200 bg-white px-3 py-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
                      <p className="mt-1 break-words text-sm font-bold text-slate-800">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 border-t border-slate-100 pt-5">
                <div className="flex flex-wrap gap-2">
                  {vehicle.features.slice(0, 6).map(f => (
                    <span key={f} className="flex items-center gap-1.5 text-xs bg-slate-50 border border-slate-100 text-slate-700 px-3 py-1.5 rounded-xl font-medium">
                      <CheckCircle2 size={11} className="text-emerald-500" /> {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Conditions */}
              {vehicle.conditions && (
                <div className="mt-5 bg-amber-50 border border-amber-100 p-4">
                  <div className="flex items-center gap-2 text-amber-800 font-semibold text-sm mb-1">
                    <Shield size={14} /> Conditions de location
                  </div>
                  <p className="text-amber-700 text-sm">{vehicle.conditions}</p>
                </div>
              )}
            </div>

            {/* Owner Card */}
            <div className="overflow-hidden bg-white border border-slate-200 p-5 shadow-sm sm:p-6">
              <h3 className="font-bold text-slate-900 mb-4">Proposé par</h3>
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xl shrink-0">
                  {vehicle.ownerProfile.displayName.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Link to={`/profile/${vehicle.ownerProfile.id}`} className="truncate font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                      {vehicle.ownerProfile.displayName}
                    </Link>
                    {vehicle.ownerProfile.verified && (
                      <BadgeCheck size={16} className="text-indigo-500 shrink-0" />
                    )}
                  </div>
                  <div className="mb-2 flex flex-wrap gap-2">
                    <span className={'px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ' + getOwnerTypeBadge(vehicle).className}>{vehicle.ownerProfile.type === 'PARC_AUTO' ? 'Agence professionnelle' : 'Proprietaire particulier'}</span>
                    {isRealUserMarketplaceVehicle(vehicle) && (
                      <span className="bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700">Annonce utilisateur</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mb-1">{vehicle.ownerProfile.city}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
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
            <div className="overflow-hidden bg-white border border-slate-200 p-5 shadow-sm sm:p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-slate-900">
                    Avis clients <span className="text-slate-400 font-normal text-sm">({vehicleReviews.length})</span>
                  </h3>
                  <div className="flex items-center gap-2">
                    <StarRating rating={vehicle.rating} size={16} />
                    <span className="font-bold text-slate-900">{vehicle.rating.toFixed(1)}</span>
                  </div>
                </div>
                <div className="mb-5 border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">Donner votre avis</p>
                      <p className="mt-1 text-xs text-slate-500">Seuls les utilisateurs inscrits peuvent commenter et noter ce vehicule.</p>
                    </div>
                    <StarRating rating={reviewRating} size={16} />
                  </div>
                  {user ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setReviewRating(value)}
                            className="text-amber-400"
                          >
                            <Star size={18} className={value <= reviewRating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'} />
                          </button>
                        ))}
                      </div>
                      <textarea
                        value={reviewComment}
                        onChange={(event) => setReviewComment(event.target.value)}
                        rows={4}
                        placeholder="Partagez votre experience avec cette voiture..."
                        className="w-full border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-400 resize-none"
                      />
                      {reviewError && <div className="text-sm text-rose-600">{reviewError}</div>}
                      {reviewNotice && <div className="text-sm text-emerald-600">{reviewNotice}</div>}
                      <button
                        type="button"
                        onClick={handleSubmitReview}
                        disabled={reviewSubmitting}
                        className="inline-flex items-center gap-2 bg-slate-950 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800 disabled:bg-slate-300"
                      >
                        {reviewSubmitting ? 'Envoi...' : 'Publier mon avis'}
                      </button>
                    </div>
                  ) : (
                    <div className="border border-dashed border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                      <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">Connectez-vous</Link> pour laisser un avis sur cette voiture.
                    </div>
                  )}
                </div>
                {vehicleReviews.length > 0 ? (
                  <div className="space-y-4">
                    {visibleReviews.map(r => (
                      <div key={r.id} className="pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold text-xs shrink-0">
                              {r.userInitials}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-800">{r.userName}</p>
                              <p className="text-xs text-slate-400">{new Date(r.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</p>
                            </div>
                          </div>
                          <StarRating rating={r.rating} size={12} />
                        </div>
                        <p className="break-words text-sm text-slate-600 leading-relaxed">{r.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                    Aucun avis pour le moment. Soyez le premier a partager votre experience.
                  </div>
                )}
              </div>

            {/* Related vehicles */}
            {relatedVehicles.length > 0 && (
              <div>
                <h3 className="font-bold text-slate-900 mb-4">Autres véhicules à {vehicle.city}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {relatedVehicles.map(rv => (
                    <div key={rv.id} onClick={() => navigate(`/vehicles/${rv.id}`)} className="group cursor-pointer overflow-hidden border border-slate-200 bg-white transition-all hover:-translate-y-0.5 hover:shadow-md">
                      <div className="aspect-[16/11] overflow-hidden bg-slate-100">
                        <img src={rv.images[0]?.url} alt={rv.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                      </div>
                      <div className="min-w-0 p-3">
                        <p className="line-clamp-2 break-words text-sm font-semibold text-slate-800">{rv.title}</p>
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
              <div className="bg-white border border-slate-200 shadow-lg p-5 sm:p-6">
                <div className="mb-5 border-b border-slate-100 pb-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600 mb-2">Demande de reservation</p>
                  <h3 className="text-xl font-extrabold text-slate-900 mb-1">Demande rapide.</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">Le strict necessaire pour transformer l interet en echange qualifie.</p>
                </div>

                <div className="mb-5">
                  {supportsBothRequestTypes && (
                    <div className="mb-4 grid grid-cols-2 gap-2 bg-slate-100 p-1">
                      <button
                        type="button"
                        onClick={() => setRequestType('rent')}
                        className={'px-4 py-2.5 text-sm font-semibold transition-colors ' + (requestType === 'rent' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600')}
                      >
                        Louer
                      </button>
                      <button
                        type="button"
                        onClick={() => setRequestType('buy')}
                        className={'px-4 py-2.5 text-sm font-semibold transition-colors ' + (requestType === 'buy' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600')}
                      >
                        Acheter
                      </button>
                    </div>
                  )}

                  {vehicle.isForRent && (
                    <div className="mb-2">
                      <span className="text-3xl font-extrabold text-slate-900">{vehicle.pricePerDay.toLocaleString()}</span>
                      <span className="text-slate-500 text-sm font-medium ml-1">FCFA / jour</span>
                    </div>
                  )}
                  {vehicle.isForSale && vehicle.priceSale && requestType === 'buy' && (
                    <p className="text-sm text-indigo-600 font-semibold">
                      Prix de vente : {(vehicle.priceSale / 1000000).toFixed(1)}M FCFA
                    </p>
                  )}
                </div>

                <div className="mb-4 border border-slate-200 bg-[#fcfbf8] p-4">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <h4 className="text-base font-bold text-slate-900">Comment voulez-vous finaliser ?</h4>
                    <Shield size={16} className="text-indigo-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setReservationMode('direct_app')}
                      className={'border px-3 py-3 text-sm font-semibold transition-colors ' + (reservationMode === 'direct_app' ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-200 bg-white text-slate-700')}
                    >
                      Directement dans l application
                    </button>
                    <button
                      type="button"
                      onClick={() => setReservationMode('on_site')}
                      className={'border px-3 py-3 text-sm font-semibold transition-colors ' + (reservationMode === 'on_site' ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-200 bg-white text-slate-700')}
                    >
                      Je finalise sur place
                    </button>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-slate-500">
                    {reservationMode === 'direct_app'
                      ? 'La reservation directe exige les informations d enregistrement avant l envoi au parc auto.'
                      : 'Le proprietaire recoit votre passage sur place avec vos dates, votre message et votre canal prefere.'}
                  </p>
                </div>

                {bookingDone ? (
                  <div className="text-center py-6">
                    <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle2 size={28} className="text-emerald-600" />
                    </div>
                    <p className="font-bold text-slate-900 mb-1">Demande envoyée !</p>
                    <p className="text-sm text-slate-500">{bookingFeedback || 'Le proprietaire recevra votre demande et vos precisions pour vous repondre dans les meilleurs delais.'}</p>
                  </div>
                ) : (
                  <>
                    {requestType === 'rent' && vehicle.isForRent && (
                      <>
                        <div className="mb-4 border border-slate-200 bg-[#fcfbf8] p-4">
                          <div className="flex items-center justify-between gap-3 mb-3">
                            <h4 className="text-base font-bold text-slate-900">Periode souhaitee</h4>
                            <Calendar size={16} className="text-indigo-500" />
                          </div>
                          <div className="space-y-3">
                            <div>
                              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">Date de debut</label>
                              <input
                                type="date"
                                value={startDate}
                                min={new Date().toISOString().split('T')[0]}
                                onChange={e => setStartDate(e.target.value)}
                                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-400"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">Date de fin</label>
                              <input
                                type="date"
                                value={endDate}
                                min={startDate || new Date().toISOString().split('T')[0]}
                                onChange={e => setEndDate(e.target.value)}
                                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-400"
                              />
                            </div>
                          </div>
                        </div>

                        {startDate && endDate && (
                          <div className="bg-slate-50 p-4 mb-4 space-y-2 text-sm border border-slate-200">
                            <div className="flex justify-between text-slate-600">
                              <span>{vehicle.pricePerDay.toLocaleString()} × {days} jour{days > 1 ? 's' : ''}</span>
                              <span className="font-semibold">{(vehicle.pricePerDay * days).toLocaleString()} FCFA</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                              <span>Mode de remise</span>
                              <span className="font-semibold">{pickupMode === 'agency' ? 'Retrait agence' : 'Livraison'}</span>
                            </div>
                            <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-200">
                              <span>Total</span>
                              <span>{total.toLocaleString()} FCFA</span>
                            </div>
                          </div>
                        )}

                        <div className="mb-4 border border-slate-200 bg-[#fcfbf8] p-4 space-y-4">
                          <div className="flex items-center justify-between gap-3">
                            <h4 className="text-base font-bold text-slate-900">Remise et contact</h4>
                            <MessageCircle size={16} className="text-indigo-500" />
                          </div>

                          {reservationMode === 'direct_app' ? (
                            <div>
                              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">Mode de remise</label>
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  type="button"
                                  onClick={() => setPickupMode('agency')}
                                  className={'border px-3 py-2.5 text-sm font-semibold transition-colors ' + (pickupMode === 'agency' ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-200 bg-white text-slate-700')}
                                >
                                  Retrait agence
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setPickupMode('delivery')}
                                  className={'border px-3 py-2.5 text-sm font-semibold transition-colors ' + (pickupMode === 'delivery' ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-200 bg-white text-slate-700')}
                                >
                                  Livraison
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="border border-dashed border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                              Le proprietaire prepare votre passage sur place et vous recontacte avant le rendez-vous.
                            </div>
                          )}

                          <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">Canal prefere</label>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => setContactPreference('platform')}
                                className={'border px-3 py-2.5 text-sm font-semibold transition-colors ' + (contactPreference === 'platform' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-700')}
                              >
                                Via Djambo
                              </button>
                              <button
                                type="button"
                                onClick={() => setContactPreference('whatsapp')}
                                className={'border px-3 py-2.5 text-sm font-semibold transition-colors ' + (contactPreference === 'whatsapp' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-700')}
                              >
                                WhatsApp
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">Precisions pour le proprietaire</label>
                            <textarea
                              value={message}
                              onChange={e => setMessage(e.target.value)}
                              rows={3}
                              placeholder="Heure approximative, besoin de livraison, contexte du trajet, questions particulières..."
                              className="w-full border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-400 resize-none"
                            />
                          </div>
                        </div>

                        {reservationMode === 'direct_app' && (
                          <div className="mb-4 border border-slate-200 bg-white p-4 space-y-4">
                            <div>
                              <h4 className="text-base font-bold text-slate-900">Informations d enregistrement</h4>
                              <p className="mt-1 text-xs text-slate-500">Ces informations sont requises pour une reservation directe dans l application.</p>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                              <label>
                                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Nom complet</span>
                                <input value={customerDetails.fullName} onChange={(event) => updateCustomerDetails('fullName', event.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-400" />
                              </label>
                              <label>
                                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Email</span>
                                <input type="email" value={customerDetails.email} onChange={(event) => updateCustomerDetails('email', event.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-400" />
                              </label>
                              <label>
                                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Telephone</span>
                                <input value={customerDetails.phone} onChange={(event) => updateCustomerDetails('phone', event.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-400" />
                              </label>
                              <label>
                                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Numero de piece</span>
                                <input value={customerDetails.identityNumber} onChange={(event) => updateCustomerDetails('identityNumber', event.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-400" />
                              </label>
                              <label className="sm:col-span-2">
                                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Numero de permis</span>
                                <input value={customerDetails.licenseNumber} onChange={(event) => updateCustomerDetails('licenseNumber', event.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-400" placeholder="Requis pour valider la location" />
                              </label>
                            </div>
                          </div>
                        )}

                        <button
                          onClick={handleBook}
                          disabled={!canSubmitBooking}
                          className={`w-full py-3.5 font-bold text-sm transition-all ${canSubmitBooking ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 hover:-translate-y-0.5' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                        >
                          {isSubmitting
                            ? 'Envoi en cours...'
                            : vehicle.isAvailable
                              ? reservationMode === 'on_site'
                                ? (startDate && endDate ? 'Demander un rendez-vous sur place' : 'Choisir les dates pour continuer')
                                : (startDate && endDate ? `Envoyer ma reservation directe — ${total.toLocaleString()} FCFA` : 'Choisir les dates pour continuer')
                              : 'Non disponible'}
                        </button>
                      </>
                    )}

                    {requestType === 'buy' && vehicle.isForSale && (
                      <>
                        <div className="mb-4 border border-slate-200 bg-[#fcfbf8] p-4 space-y-4">
                          <div>
                            <h4 className="text-base font-bold text-slate-900">Intention d achat</h4>
                          </div>
                          <div className="border border-slate-200 bg-white p-4">
                            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 mb-1">Prix affiche</p>
                            <p className="text-lg font-extrabold text-slate-900">{vehicle.priceSale ? (vehicle.priceSale / 1000000).toFixed(1) + ' M FCFA' : 'Sur demande'}</p>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">Votre budget ou offre (optionnel)</label>
                            <input
                              type="number"
                              min={0}
                              value={offeredPrice}
                              onChange={(e) => setOfferedPrice(e.target.value)}
                              placeholder="Ex: 28500000"
                              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-400"
                            />
                          </div>
                        </div>

                        <div className="mb-4 border border-slate-200 bg-[#fcfbf8] p-4 space-y-4">
                          <div>
                            <h4 className="text-base font-bold text-slate-900">Echange avec le vendeur</h4>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">Canal prefere</label>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => setContactPreference('platform')}
                                className={'border px-3 py-2.5 text-sm font-semibold transition-colors ' + (contactPreference === 'platform' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-700')}
                              >
                                Via Djambo
                              </button>
                              <button
                                type="button"
                                onClick={() => setContactPreference('whatsapp')}
                                className={'border px-3 py-2.5 text-sm font-semibold transition-colors ' + (contactPreference === 'whatsapp' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-700')}
                              >
                                WhatsApp
                              </button>
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">Precisions pour le vendeur</label>
                            <textarea
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              rows={3}
                              placeholder="Budget, delai souhaite, besoin de documents, question sur l’historique..."
                              className="w-full border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-400 resize-none"
                            />
                          </div>
                        </div>

                        {reservationMode === 'direct_app' && (
                          <div className="mb-4 border border-slate-200 bg-white p-4 space-y-4">
                            <div>
                              <h4 className="text-base font-bold text-slate-900">Informations d enregistrement</h4>
                              <p className="mt-1 text-xs text-slate-500">Ces informations accompagnent votre reservation directe ou votre offre immediate.</p>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                              <label>
                                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Nom complet</span>
                                <input value={customerDetails.fullName} onChange={(event) => updateCustomerDetails('fullName', event.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-400" />
                              </label>
                              <label>
                                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Email</span>
                                <input type="email" value={customerDetails.email} onChange={(event) => updateCustomerDetails('email', event.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-400" />
                              </label>
                              <label>
                                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Telephone</span>
                                <input value={customerDetails.phone} onChange={(event) => updateCustomerDetails('phone', event.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-400" />
                              </label>
                              <label>
                                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Numero de piece</span>
                                <input value={customerDetails.identityNumber} onChange={(event) => updateCustomerDetails('identityNumber', event.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-400" />
                              </label>
                            </div>
                          </div>
                        )}

                        <button
                          onClick={handleBook}
                          disabled={!canSubmitBooking}
                          className={`w-full py-3.5 font-bold text-sm transition-all ${canSubmitBooking ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 hover:-translate-y-0.5' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                        >
                          {isSubmitting ? 'Envoi en cours...' : reservationMode === 'on_site' ? 'Demander un passage sur place' : 'Envoyer ma demande d achat'}
                        </button>
                      </>
                    )}

                    {bookingError && (
                      <div className="mb-4 border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        {bookingError}
                      </div>
                    )}

                    {vehicle.ownerProfile.whatsapp && (
                      <a
                        href={`https://wa.me/${vehicle.ownerProfile.whatsapp.replace(/\s+/g, '').replace('+', '')}`}
                        target="_blank" rel="noopener noreferrer"
                        className="mt-3 w-full flex items-center justify-center gap-2 py-3 border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
                      >
                        <MessageCircle size={16} className="text-emerald-500" />
                        Contacter sur WhatsApp
                      </a>
                    )}
                  </>
                )}

                <div className="mt-4 bg-slate-50 px-4 py-3 text-xs text-slate-500">
                  <div className="flex items-start gap-2">
                    <Shield size={12} className="mt-0.5 text-indigo-400" />
                    <span>
                      {reservationMode === 'on_site'
                        ? 'Votre passage sur place est trace sur la plateforme et remonte directement dans l espace du parc auto.'
                        : requestType === 'buy'
                          ? 'Votre prise de contact reste tracee sur la plateforme avant echange avec le vendeur.'
                          : 'Votre demande est enregistree puis le proprietaire confirme la disponibilite finale.'}
                    </span>
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
