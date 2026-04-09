import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarDays,
  Car,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Globe,
  Headphones,
  MapPin,
  Menu,
  Search,
  Shield,
  SlidersHorizontal,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';
import { BrandLogo } from '../../components/BrandLogo';
import { PublicSiteHeader } from '../../components/PublicSiteHeader';
import { marketplaceVehicles } from '../../services/mockData';
import { VehicleCategory } from '../../types';

const CATEGORIES = [
  { label: 'SUV', value: VehicleCategory.SUV },
  { label: 'Berline', value: VehicleCategory.BERLINE },
  { label: 'Luxe', value: VehicleCategory.LUXE },
  { label: 'Economique', value: VehicleCategory.ECONOMIQUE },
  { label: 'Pick-up', value: VehicleCategory.PICKUP },
  { label: 'Utilitaire', value: VehicleCategory.UTILITAIRE },
];

const LANGUAGES = ['ES', 'EN', 'DE', 'FR', 'IT', 'PT'];
const BRANDS = ['Toyota', 'Mercedes', 'BMW', 'Range Rover', 'Porsche', 'Audi', 'Volkswagen', 'Honda'];
const HERO_IMAGE_SRC = new URL('../../login-images.jpg', import.meta.url).href;
const HERO_VIDEO_SRC = '/media/0_Business_Meeting_3840x2160.mp4';

const StarRow = ({ rating, count }: { rating: number; count: number }) => (
  <div className="flex items-center gap-1.5">
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={12}
          className={star <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-300 fill-slate-300'}
        />
      ))}
    </div>
    <span className="text-xs font-bold text-slate-700">{rating.toFixed(1)}</span>
    <span className="text-xs text-slate-400">({count})</span>
  </div>
);

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [city, setCity] = useState('Dakar');
  const [type, setType] = useState('');
  const [pickupDate, setPickupDate] = useState('2026-04-12');
  const [returnDate, setReturnDate] = useState('2026-04-15');
  const [pickupTime, setPickupTime] = useState('10:00');
  const [returnTime, setReturnTime] = useState('10:00');
  const [returnDifferent, setReturnDifferent] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState('FR');
  const [heroVideoReady, setHeroVideoReady] = useState(true);

  const featuredVehicles = useMemo(
    () => marketplaceVehicles.filter((vehicle) => vehicle.isAvailable).slice(0, 6),
    []
  );

  const uniqueCities = useMemo(() => [...new Set(marketplaceVehicles.map((vehicle) => vehicle.city))], []);

  const destinationCards = [
    'FleetCommand Dakar Aeroport',
    'FleetCommand Dakar Almadies',
    'FleetCommand Abidjan Aeroport',
    'FleetCommand Cocody Riviera',
    'FleetCommand Bamako Centre',
    'FleetCommand Plateau Business Lounge',
  ];

  const premiumPromises = [
    {
      title: '100% marques premium',
      description: 'Une flotte volontairement courte, plus selective, composee de modeles fiables, desirables et verifies.',
      icon: Sparkles,
    },
    {
      title: 'Tarifs complets et lisibles',
      description: 'Assistance, couverture et informations essentielles mises en avant avant la demande de reservation.',
      icon: Shield,
    },
    {
      title: 'Service concierge personnalise',
      description: 'Livraison, restitution, accompagnement prioritaire et proprietaires mieux qualifies pour une experience fluide.',
      icon: Headphones,
    },
  ];

  const editorialCards = [
    {
      title: 'Service de livraison et restitution',
      description: 'Une option premium configurable lors de la reservation, avec anticipation recommandee de 48 h.',
    },
    {
      title: 'Modeles garantis et profils transparents',
      description: 'Chaque fiche expose les photos, conditions, avis et disponibilites de facon nette.',
    },
    {
      title: 'Accueil prioritaire et experience soignee',
      description: 'Un ton haut de gamme, une navigation epuree, et des points de remise plus exclusifs.',
    },
  ];

  const navLinks = [
    { label: 'La flotte', to: '/vehicles' },
    { label: 'Destinations', to: '#destinations' },
    { label: 'OK Help', to: '#help' },
  ];

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (type) params.set('category', type);
    navigate('/vehicles?' + params.toString());
  };

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-slate-900 font-sans">
      <PublicSiteHeader
        theme="dark"
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen((value) => !value)}
        navLinks={navLinks}
        activeLanguage={activeLanguage}
        onLanguageChange={setActiveLanguage}
        subtitle="L'app FleetCommand"
      />

      <section className="relative overflow-hidden bg-slate-950 pt-24 text-white">
        <div className="absolute inset-0">
          {heroVideoReady ? (
            <video
              className="w-full h-full object-cover scale-[1.03]"
              autoPlay
              muted
              loop
              playsInline
              onError={() => setHeroVideoReady(false)}
            >
              <source src={HERO_VIDEO_SRC} type="video/mp4" />
            </video>
          ) : HERO_IMAGE_SRC ? (
            <img
              src={HERO_IMAGE_SRC}
              alt="Presentation premium FleetCommand"
              className="w-full h-full object-cover scale-[1.03]"
            />
          ) : (
            <div className="h-full w-full bg-[radial-gradient(circle_at_top,#334155_0%,#0f172a_45%,#020617_100%)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/18 via-slate-950/38 to-[#f7f5f0]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.18),transparent_30%)]" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)', backgroundSize: '72px 72px' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 sm:pb-16">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-10 items-end min-h-[680px] lg:min-h-[760px] pt-6 sm:pt-8">
            <div className="max-w-2xl pt-6 sm:pt-10 lg:pt-20">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200 mb-6">
                <Sparkles size={12} className="text-amber-300" />
                Conduisez une nouvelle experience
              </div>

              <p className="text-sm text-slate-300 mb-4">La flotte la plus selective avec les tarifs les plus complets.</p>

              <h1 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-[0.95] mb-5 sm:mb-6">
                <span className="text-white">100%</span>{' '}
                <span className="text-amber-300">marques premium</span>
                <br />
                <span className="text-white">et</span>{' '}
                <span className="text-indigo-300">modeles garantis</span>
              </h1>

              <p className="text-sm sm:text-lg text-slate-300 max-w-xl leading-relaxed mb-6 sm:mb-8">
                Une presentation editorialisee pour les voyageurs et dirigeants qui veulent davantage qu'une simple location: plus de transparence, plus de service, plus de desirabilite.
              </p>

              <div className="flex flex-wrap gap-2.5 sm:gap-3 mb-6 sm:mb-8">
                {['Dakar', 'Abidjan', 'Bamako', 'Plateau', 'Almadies'].map((label) => (
                  <span key={label} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200">
                    {label}
                  </span>
                ))}
              </div>

              <div className="grid sm:grid-cols-3 gap-3 max-w-xl">
                {[
                  { value: '100%', label: 'premium' },
                  { value: '48 h', label: 'minimum pour delivery' },
                  { value: uniqueCities.length + '+', label: 'destinations actives' },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                    <p className="text-2xl font-extrabold text-white">{stat.value}</p>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative lg:pb-8">
              <form onSubmit={handleSearch} className="rounded-[24px] sm:rounded-[28px] border border-white/10 bg-white text-slate-900 shadow-[0_32px_120px_rgba(2,6,23,0.45)] overflow-hidden">
                <div className="border-b border-slate-200 px-4 sm:px-6 py-4 sm:py-5">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Recherche premium</p>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">Reservez en un seul module</h2>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      <BadgeCheck size={12} className="text-emerald-600" />
                      Couverture et conditions visibles
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-6 grid sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 sm:p-4">
                    <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Store depart</label>
                    <div className="mt-2 flex items-center gap-2 text-slate-800">
                      <MapPin size={16} className="text-indigo-600" />
                      <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full bg-transparent outline-none text-sm font-semibold">
                        {uniqueCities.map((value) => (
                          <option key={value} value={value}>{value}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 sm:p-4">
                    <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Store retour</label>
                    <div className="mt-2 flex items-center gap-2 text-slate-800">
                      <Building2 size={16} className="text-indigo-600" />
                      <span className="text-sm font-semibold">{returnDifferent ? 'Selection personnalisee' : city}</span>
                    </div>
                    <button type="button" onClick={() => setReturnDifferent((value) => !value)} className="mt-3 text-xs font-semibold text-indigo-600 hover:text-indigo-500">
                      {returnDifferent ? 'Restitution identique' : 'Differente restitution'}
                    </button>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 sm:p-4">
                    <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Depart</label>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 border border-slate-200">
                        <CalendarDays size={15} className="text-indigo-600" />
                        <input type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} className="w-full bg-transparent outline-none text-sm" />
                      </div>
                      <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 border border-slate-200">
                        <Clock3 size={15} className="text-indigo-600" />
                        <input type="time" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} className="w-full bg-transparent outline-none text-sm" />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Retour</label>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 border border-slate-200">
                        <CalendarDays size={15} className="text-indigo-600" />
                        <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} className="w-full bg-transparent outline-none text-sm" />
                      </div>
                      <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 border border-slate-200">
                        <Clock3 size={15} className="text-indigo-600" />
                        <input type="time" value={returnTime} onChange={(e) => setReturnTime(e.target.value)} className="w-full bg-transparent outline-none text-sm" />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <input id="ageConfirmed" type="checkbox" checked={ageConfirmed} onChange={(e) => setAgeConfirmed(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                        <label htmlFor="ageConfirmed" className="text-sm font-semibold text-slate-700">26 ans ou plus</label>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Type</label>
                        <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-indigo-500">
                          <option value="">Tous les segments</option>
                          {CATEGORIES.map((category) => (
                            <option key={category.value} value={category.value}>{category.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200 bg-slate-50 px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 mb-1">Delivery</p>
                    <p className="text-sm text-slate-600 max-w-xl">
                      Service de livraison et de restitution personnalise. L'option se finalise sur la page des extras avec 48 h d'anticipation conseillees.
                    </p>
                  </div>
                  <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-4 text-sm font-bold uppercase tracking-[0.16em] text-white hover:bg-indigo-700 transition-colors">
                    Chercher
                    <ArrowRight size={16} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-semibold text-slate-500">
            <span className="text-xs uppercase tracking-[0.22em] text-slate-400">Marques partenaires</span>
            {BRANDS.map((brand) => (
              <span key={brand} className="text-slate-700">{brand}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#f7f5f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-12 items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600 mb-3">Arguments centraux</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight mb-4">
                Les benefices d'abord, les details ensuite.
              </h2>
              <p className="text-slate-600 leading-relaxed max-w-md">
                Cette presentation ne cherche pas le volume. Elle cherche la confiance, la clarte tarifaire et le desir d'une experience plus exclusive.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {premiumPromises.map(({ title, description, icon: Icon }) => (
                <div key={title} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-2xl bg-slate-950 text-white flex items-center justify-center mb-4">
                    <Icon size={18} />
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 mb-2">{title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600 mb-3">La flotte la plus selective</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Modeles garantis, couverture visible, positionnement premium.</h2>
              <p className="text-slate-600 mt-3 max-w-2xl">
                Chaque carte insiste sur ce qui compte vraiment: le modele, les garanties, la couverture incluse et un prix lisible des le premier regard.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button type="button" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 bg-slate-50">
                <SlidersHorizontal size={16} />
                Filtres
              </button>
              <Link to="/vehicles" className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors">
                Voir la flotte
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {featuredVehicles.map((vehicle) => (
              <article
                key={vehicle.id}
                onClick={() => navigate('/vehicles/' + vehicle.id)}
                className="group cursor-pointer overflow-hidden rounded-[28px] border border-slate-200 bg-[#fcfbf8] shadow-sm hover:shadow-xl transition-all"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                  <img src={vehicle.images[0]?.url} alt={vehicle.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                  <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold text-slate-900">Modele garanti</span>
                    <span className="rounded-full bg-amber-400 px-3 py-1 text-[11px] font-bold text-slate-950">Premium</span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="text-xl font-extrabold text-slate-900">{vehicle.brand} {vehicle.model}</h3>
                      <p className="text-sm text-slate-500">{vehicle.year} • {vehicle.transmission} • {vehicle.fuelType}</p>
                    </div>
                    <StarRow rating={vehicle.rating} count={vehicle.reviewCount} />
                  </div>

                  <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-slate-500 mb-4">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1">{vehicle.category}</span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1">{vehicle.seats} places</span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1">Couverture incluse</span>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed mb-5 line-clamp-2">{vehicle.description}</p>

                  <div className="flex items-end justify-between pt-4 border-t border-slate-200">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400 mb-1">A partir de</p>
                      <p className="text-2xl font-extrabold text-slate-900">{vehicle.pricePerDay.toLocaleString()} FCFA</p>
                      <p className="text-xs text-slate-500">/ jour • TVA incluse</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500 mb-1">{vehicle.city}</p>
                      <p className="text-xs font-semibold text-indigo-600">Voir les details</p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="destinations" className="py-20 bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300 mb-3">Destinations</p>
              <h2 className="text-3xl md:text-4xl font-extrabold">Ou profiter de FleetCommand Plus ?</h2>
              <p className="text-slate-400 mt-3 max-w-xl">Votre prochaine destination est a portee de clic, avec un langage de service plus exclusif et des points de remise plus soignes.</p>
            </div>
            <div className="text-sm text-slate-500">01 / 06 destinations</div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {destinationCards.map((destination, index) => (
              <div key={destination} className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-sm hover:bg-white/10 transition-colors">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-8">Destination {String(index + 1).padStart(2, '0')}</p>
                <h3 className="text-xl font-bold text-white mb-3">{destination}</h3>
                <p className="text-sm text-slate-400 mb-5">Point de location premium, accueil simplifie et restitution plus flexible selon disponibilite.</p>
                <button type="button" className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-300 hover:text-white transition-colors">
                  Explorer
                  <ArrowRight size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#f7f5f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[0.95fr_1.05fr] gap-12 items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600 mb-3">FleetCommand Plus</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight mb-4">Redefinissez votre facon de voyager.</h2>
            <p className="text-slate-600 leading-relaxed mb-5">
              Vivez une experience plus exclusive avec une flotte premium, des informations plus completes et une sensation de fluidite de la recherche jusqu'a la remise des cles.
            </p>
            <p className="text-slate-600 leading-relaxed mb-8">
              Prenez le volant de votre agenda, fixez vos standards, laissez la plateforme travailler votre presentation pour donner envie avant meme le premier contact.
            </p>
            <Link to="/vehicles" className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700 transition-colors">
              Decouvrir la flotte
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {featuredVehicles.slice(0, 4).map((vehicle, index) => (
              <div key={vehicle.id} className={(index === 0 || index === 3 ? 'translate-y-6 ' : '') + 'overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm'}>
                <img src={vehicle.images[1]?.url || vehicle.images[0]?.url} alt={vehicle.title} className="aspect-[4/5] w-full object-cover" loading="lazy" />
                <div className="p-4">
                  <p className="text-sm font-bold text-slate-900 line-clamp-1">{vehicle.title}</p>
                  <p className="text-xs text-slate-500 mt-1">{vehicle.city} • {vehicle.color}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="help" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600 mb-3">Une experience exceptionnelle</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Chaque voyage merite un service plus complet.</h2>
            <p className="text-slate-600 leading-relaxed">
              Livraison, restitution, couverture, clarte tarifaire et presentation mieux cadree: tout est pense pour faire monter la valeur percue sans diluer le message.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {editorialCards.map((card) => (
              <div key={card.title} className="rounded-[28px] border border-slate-200 bg-[#fcfbf8] p-6">
                <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                  <CheckCircle2 size={18} />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 mb-2">{card.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-slate-950 text-white pt-16 pb-10 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr] gap-10 pb-10 border-b border-white/10">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-2xl bg-white text-slate-950 flex items-center justify-center">
                  <Car size={20} />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Le titre</p>
                  <p className="text-xl font-extrabold">FleetCommand Plus</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 max-w-md leading-relaxed mb-5">
                Une marketplace premium pour louer, vendre et presenter une flotte automobile avec plus d'elegance, plus de clarte et une meilleure profondeur de service.
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                <span className="rounded-full border border-white/10 px-3 py-1.5">Visa</span>
                <span className="rounded-full border border-white/10 px-3 py-1.5">Mastercard</span>
                <span className="rounded-full border border-white/10 px-3 py-1.5">American Express</span>
                <span className="rounded-full border border-white/10 px-3 py-1.5">Bizum</span>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 mb-4">Contact</p>
              <div className="space-y-3 text-sm text-slate-300">
                <a href="#" className="block hover:text-white transition-colors">Ventes telephoniques</a>
                <a href="#" className="block hover:text-white transition-colors">Service client</a>
                <a href="#" className="block hover:text-white transition-colors">Assistance routiere</a>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 mb-4">Reseaux</p>
              <div className="space-y-3 text-sm text-slate-300">
                <a href="#" className="block hover:text-white transition-colors">Instagram</a>
                <a href="#" className="block hover:text-white transition-colors">YouTube</a>
                <a href="#" className="block hover:text-white transition-colors">OK Help</a>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 mb-4">Information</p>
              <div className="space-y-3 text-sm text-slate-300">
                <a href="#" className="block hover:text-white transition-colors">Conditions generales</a>
                <a href="#" className="block hover:text-white transition-colors">Politique de confidentialite</a>
                <a href="#" className="block hover:text-white transition-colors">Informations legales</a>
                <a href="#" className="block hover:text-white transition-colors">Cookies</a>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-xs text-slate-500">
            <p>2026 - FleetCommand Plus. Tous droits reserves.</p>
            <div className="flex items-center gap-4 flex-wrap">
              <span className="inline-flex items-center gap-2"><Globe size={12} /> FR active</span>
              <span className="inline-flex items-center gap-2"><Headphones size={12} /> Conciergerie premium</span>
              <span className="inline-flex items-center gap-2"><Users size={12} /> Profils verifies</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
