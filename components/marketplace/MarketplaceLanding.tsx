import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Car,
  ChevronLeft,
  ChevronRight,
  Globe,
  Headphones,
  MapPin,
  Pause,
  Play,
  Search,
  Shield,
  Sparkles,
  Users,
} from 'lucide-react';
import { BrandLogo } from '../../components/BrandLogo';
import { PublicSiteHeader } from '../../components/PublicSiteHeader';
import { HeroBlock } from './HeroBlock';
import { marketplaceVehicles } from '../../services/mockData';
import { VehicleCategory } from '../../types';

const CATEGORIES = [
  { label: 'SUV', value: VehicleCategory.SUV },
  { label: 'Berline', value: VehicleCategory.BERLINE },
  { label: 'Luxe', value: VehicleCategory.LUXE },
  { label: 'Economique', value: VehicleCategory.ECONOMIQUE },
  { label: 'Pick-up', value: VehicleCategory.PICKUP },
  { label: 'Utilitaire', value: VehicleCategory.UTILITAIRE },
  { label: 'Cabriolet', value: VehicleCategory.CABRIOLET },
  { label: 'Monospace', value: VehicleCategory.MONOSPACE },
];
const CONTRACT_ILLUSTRATION_SRC = new URL('../../ullustrqtionsectioncontrat.jpg', import.meta.url).href;
const COCODY_RIVIERA_SCENE_SRC = new URL('../../VILLE, RESIDENCE, RENDEZ-VOUS Djambo Cocody Riviera .jpeg', import.meta.url).href;

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const fleetScrollRef = useRef<HTMLDivElement | null>(null);
  const [selectedFleetVehicleId, setSelectedFleetVehicleId] = useState<string | null>(null);
  const [city, setCity] = useState('');
  const [type, setType] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState('FR');

  const featuredVehicles = useMemo(
    () => marketplaceVehicles.filter((vehicle) => vehicle.isAvailable).slice(0, 6),
    []
  );

  const uniqueCities = useMemo(() => [...new Set(marketplaceVehicles.map((vehicle) => vehicle.city))], []);
  const rollingFleet = useMemo(() => [...featuredVehicles, ...featuredVehicles, ...featuredVehicles], [featuredVehicles]);
  const isFleetPaused = Boolean(selectedFleetVehicleId);
  const fleetCenterStartIndex = featuredVehicles.length;
  const heroSpotlightVehicle = useMemo(() => {
    const scopedVehicles = city ? marketplaceVehicles.filter((vehicle) => vehicle.city === city) : marketplaceVehicles;
    const categoryVehicles = type ? scopedVehicles.filter((vehicle) => vehicle.category === type) : scopedVehicles;
    return (categoryVehicles[0] ?? scopedVehicles[0] ?? marketplaceVehicles[0]);
  }, [city, type]);

  useEffect(() => {
    const container = fleetScrollRef.current;
    if (!container || featuredVehicles.length === 0) {
      return;
    }

    container.scrollLeft = container.scrollWidth / 3;
  }, [featuredVehicles.length]);

  useEffect(() => {
    const container = fleetScrollRef.current;
    if (!container || featuredVehicles.length === 0 || isFleetPaused) {
      return;
    }

    const intervalId = window.setInterval(() => {
      const singleLoopWidth = container.scrollWidth / 3;
      const nextLeft = container.scrollLeft + 324;

      if (nextLeft >= singleLoopWidth * 2) {
        container.scrollTo({ left: singleLoopWidth, behavior: 'auto' });
        return;
      }

      container.scrollTo({ left: nextLeft, behavior: 'smooth' });
    }, 2800);

    return () => window.clearInterval(intervalId);
  }, [featuredVehicles.length, isFleetPaused]);

  const shiftFleet = (direction: 'previous' | 'next') => {
    const container = fleetScrollRef.current;
    if (!container) {
      return;
    }

    const singleLoopWidth = container.scrollWidth / 3;
    const offset = direction === 'next' ? 324 : -324;
    let targetLeft = container.scrollLeft + offset;

    if (targetLeft >= singleLoopWidth * 2 || targetLeft <= 0) {
      targetLeft = singleLoopWidth;
    }

    container.scrollTo({ left: targetLeft, behavior: 'smooth' });
  };

  const destinationCards = [
    {
      title: 'Djambo Dakar Aeroport',
      subtitle: 'Arrivees et departs fluides',
      detail: 'Retrait premium, accueil prioritaire et restitution coordonnee selon votre vol.',
      image: featuredVehicles[0]?.images[0]?.url,
      points: ['Voiturier disponible', 'Suivi vol', 'Remise rapide'],
    },
    {
      title: 'Djambo Dakar Almadies',
      subtitle: 'Business et sejours prives',
      detail: 'Point de remise adapte aux sejours executives, rendez-vous et locations image.',
      image: featuredVehicles[1]?.images[0]?.url,
      points: ['Quartier premium', 'Livraison hotel', 'Support concierge'],
    },
    {
      title: 'Djambo Abidjan Aeroport',
      subtitle: 'Accueil corporate',
      detail: 'Prise en charge soignee pour les deplacements rapides et les agendas serres.',
      image: featuredVehicles[2]?.images[0]?.url,
      points: ['Coordination agent', 'Sortie rapide', 'Canal prioritaire'],
    },
    {
      title: 'Djambo Cocody Riviera',
      subtitle: 'Ville, residence, rendez-vous',
      detail: 'Point plus discret pour une remise confortable dans un cadre residentiel premium.',
      image: COCODY_RIVIERA_SCENE_SRC,
      points: ['Cadre calme', 'Retrait flexible', 'Flotte selective'],
    },
    {
      title: 'Djambo Bamako Centre',
      subtitle: 'Mobilite executive',
      detail: 'Une base centrale pour organiser rapidement vos departs et restitutions en ville.',
      image: featuredVehicles[4]?.images[0]?.url,
      points: ['Centre acces direct', 'Contact rapide', 'Service accompagne'],
    },
    {
      title: 'Djambo Plateau Business Lounge',
      subtitle: 'Format lounge et reception',
      detail: 'Presentation plus exclusive pour les profils qui attendent davantage qu un simple comptoir.',
      image: featuredVehicles[5]?.images[0]?.url || featuredVehicles[0]?.images[0]?.url,
      points: ['Lounge dedie', 'Attente confortable', 'Remise soignee'],
    },
  ];

  const premiumPromises = [
    {
      title: 'Flotte courte, desirabilite forte',
      description: 'Chaque selection doit deja donner envie avant meme l ouverture de la fiche.',
      icon: Sparkles,
      metric: 'Selection courte',
      image: featuredVehicles[0]?.images[0]?.url,
      accent: 'Modeles image et verifies',
    },
    {
      title: 'Conditions visibles des le premier regard',
      description: 'Le visiteur doit comprendre le niveau de service sans lire de longs paragraphes.',
      icon: Shield,
      metric: 'Lecture immediate',
      image: CONTRACT_ILLUSTRATION_SRC,
      accent: 'Tarif, remise, couverture',
    },
    {
      title: 'Service accompagne et points de remise mieux tenus',
      description: 'La promesse doit sembler concrete grace aux lieux, aux images et au ton du service.',
      icon: Headphones,
      metric: 'Accompagnement humain',
      image: featuredVehicles[1]?.images[0]?.url,
      accent: 'Livraison, restitution, suivi',
    },
  ];

  const keyFacts = [
    { title: 'Reservation directe', description: 'Acces rapide a la flotte sans parcours charge.', icon: ArrowRight, label: 'Parcours rapide' },
    { title: 'Vehicules premium', description: 'Selection orientee image, confort et disponibilite.', icon: Car, label: 'Flotte qualifiee' },
    { title: 'Remise soignee', description: 'Points de retrait mieux tenus et plus lisibles.', icon: MapPin, label: 'Points de remise' },
    { title: 'Support humain', description: 'Assistance claire avant, pendant et apres la location.', icon: Headphones, label: 'Accompagnement' },
    { title: 'Lecture simple', description: 'Tarifs, categories et usages visibles en quelques secondes.', icon: Search, label: 'Lecture immediate' },
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
    {
      label: 'Explorer',
      items: [
        { label: 'Benefices', to: '#benefices', description: 'Les raisons de choisir la plateforme avant de commencer la recherche.', previewImage: featuredVehicles[0]?.images[0]?.url, previewMeta: 'Vehicule libre', previewTitle: 'Les avantages doivent se voir avant de se lire.' },
        { label: 'Presentation de la flotte', to: '#fleet', description: 'Une vitrine plus claire pour comparer rapidement les meilleurs modeles.', previewImage: featuredVehicles[1]?.images[0]?.url, previewMeta: 'Vehicule libre', previewTitle: 'Une flotte mise en scene comme un vrai catalogue.' },
        { label: 'Toutes les voitures', to: '/vehicles', description: 'Acceder directement au catalogue complet.', previewImage: featuredVehicles[2]?.images[0]?.url, previewMeta: 'Catalogue vehicules', previewTitle: 'Entrer directement dans la collection Djambo.' },
      ],
    },
    {
      label: 'Services',
      items: [
        { label: 'Destinations', to: '#destinations', description: 'Points de retrait premium et zones actives.', previewMeta: 'Parc auto', previewTitle: 'Des points de remise mieux tenus et plus exclusifs.' },
        { label: 'Conciergerie', to: '#help', description: 'Livraison, assistance et restitution accompagnee.', previewMeta: 'Service humain', previewTitle: 'Une experience mieux encadree de bout en bout.' },
      ],
    },
    { label: 'Tarifs', to: '/pricing' },
  ];

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    navigate('/vehicles');
  };

  const fleetHref = '/vehicles';

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-slate-900 font-sans">
      <PublicSiteHeader
        theme="light"
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen((value) => !value)}
        navLinks={navLinks}
        activeLanguage={activeLanguage}
        onLanguageChange={setActiveLanguage}
      />

      <section className="relative overflow-hidden bg-[#f7f5f0] pt-24">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(201,171,114,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.08),transparent_24%)]" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(15,23,42,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.8) 1px, transparent 1px)', backgroundSize: '72px 72px' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 sm:pb-14">
          <div className="grid gap-8 lg:grid-cols-[0.96fr_1.04fr] items-start pt-6 sm:pt-8">
            <div className="max-w-2xl pt-4 sm:pt-8 lg:pt-10">
              <div className="inline-flex items-center gap-2 border border-slate-200 bg-white/75 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700 mb-5 sm:mb-6 backdrop-blur-sm">
                <Sparkles size={12} className="text-amber-600" />
                Location premium simplifiee
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-[3.55rem] font-extrabold tracking-tight leading-[0.98] mb-4 max-w-[12ch] sm:max-w-[13ch] lg:max-w-none text-slate-950">
                Trouvez la bonne voiture, plus vite.
              </h1>

              <p className="text-sm sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                Djambo vous donne un accès simple à une flotte bien présentée, des modèles premium et une réservation plus fluide dès les premiers instants.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to={fleetHref} className="inline-flex min-h-[54px] items-center justify-center gap-2 bg-slate-950 px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-slate-800">
                  Voir la flotte
                  <ArrowRight size={16} />
                </Link>
                <a href="#benefices" className="inline-flex min-h-[54px] items-center justify-center border border-slate-200 bg-white px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-slate-800 transition-colors hover:bg-slate-50">
                  Comprendre le service
                </a>
              </div>
            </div>

            <div className="relative mt-2 lg:mt-0">
              <article className="overflow-hidden border border-slate-200 bg-white p-4 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
                <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                  <div className="relative min-h-[260px] overflow-hidden bg-slate-100">
                    <img src={heroSpotlightVehicle.images[0]?.url ?? COCODY_RIVIERA_SCENE_SRC} alt={heroSpotlightVehicle.title} className="h-full w-full object-cover" />
                    <HeroBlock
                      variant="light"
                      overlayClassName="bg-[linear-gradient(180deg,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0.2)_42%,rgba(0,0,0,0.62)_100%)]"
                    >
                      <div className="absolute left-4 top-4 bg-white/92 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-900">
                        Selection du moment
                      </div>
                      <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(2,6,23,0.2)_0%,rgba(2,6,23,0.34)_100%)] p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/72">{heroSpotlightVehicle.city}</p>
                        <p className="mt-2 text-lg font-extrabold text-white">{heroSpotlightVehicle.title}</p>
                        <p className="mt-2 text-sm text-white/84">{heroSpotlightVehicle.pricePerDay.toLocaleString()} FCFA par jour</p>
                      </div>
                    </HeroBlock>
                  </div>

                  <div className="grid content-start gap-3">
                    <div className="border border-slate-200 bg-[#fbfaf7] p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Ville</p>
                      <div className="mt-2 flex items-center gap-2 text-slate-800">
                        <MapPin size={16} className="text-indigo-600" />
                        <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full bg-transparent outline-none text-sm font-semibold">
                          <option value="">Toutes les villes</option>
                          {uniqueCities.map((value) => (
                            <option key={value} value={value}>{value}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="border border-slate-200 bg-[#fbfaf7] p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Segment</p>
                      <select value={type} onChange={(e) => setType(e.target.value)} className="mt-2 w-full bg-transparent outline-none text-sm font-semibold text-slate-800">
                        <option value="">Tous les segments</option>
                        {CATEGORIES.map((category) => (
                          <option key={category.value} value={category.value}>{category.label}</option>
                        ))}
                      </select>
                    </div>

                    <Link to={fleetHref} className="inline-flex min-h-[52px] items-center justify-center gap-2 bg-slate-950 px-4 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-slate-800">
                      Ouvrir la flotte
                      <ArrowRight size={16} />
                    </Link>
                    <p className="px-1 text-xs leading-relaxed text-slate-500">
                      Par defaut, toute la flotte reste visible. Affinez ensuite par ville ou par segment.
                    </p>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section id="benefices" className="py-16 bg-[#f7f5f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-8">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600 mb-3">Arguments centraux</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight mb-4">
                Montrer d abord la qualite du service, puis seulement demander une recherche.
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Ici, chaque bloc doit faire comprendre en quelques secondes ce que le visiteur gagne vraiment en passant par Djambo.
              </p>
            </div>
            <Link to="/vehicles" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-950 transition-colors w-fit">
              Explorer la collection
              <ChevronRight size={16} />
            </Link>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {premiumPromises.map(({ title, description, icon: Icon, metric, image, accent }) => (
              <article key={title} className="overflow-hidden border border-slate-200 bg-white shadow-sm">
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-200">
                  {image ? <img src={image} alt={title} className="h-full w-full object-cover" loading="lazy" /> : null}
                  <HeroBlock variant="light" overlayClassName="bg-[linear-gradient(180deg,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0.18)_44%,rgba(0,0,0,0.58)_100%)]">
                    <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/65">{metric}</p>
                        <p className="mt-2 text-lg font-extrabold text-white">{accent}</p>
                      </div>
                      <div className="flex h-11 w-11 items-center justify-center bg-white/10 text-white">
                        <Icon size={18} />
                      </div>
                    </div>
                  </HeroBlock>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-extrabold text-slate-900 mb-3">{title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-6">{description}</p>
                  <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="text-xs uppercase tracking-[0.18em] text-slate-400">Djambo standard</span>
                    <ArrowRight size={16} className="text-slate-400" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col gap-3 mb-6">
            <span className="text-xs uppercase tracking-[0.22em] text-slate-400">5 infos utiles</span>
            <h2 className="text-2xl font-extrabold text-slate-950 sm:text-3xl">Ce qu’il faut comprendre immédiatement.</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] snap-x snap-mandatory [&::-webkit-scrollbar]:hidden">
            {keyFacts.map((fact, index) => {
              const Icon = fact.icon;
              return (
                <article key={fact.title} className="group w-[248px] shrink-0 snap-start border border-slate-200 bg-[#fcfbf8] p-5 transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:bg-white hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)] sm:w-[272px]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-11 w-11 items-center justify-center bg-slate-950 text-white">
                      <Icon size={18} />
                    </div>
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-amber-800">
                      <span className="text-sm leading-none">!</span>
                      {fact.label}
                    </div>
                  </div>
                  <h3 className="mt-2 text-base font-extrabold text-slate-950">{fact.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{fact.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="fleet" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-10">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600 mb-3">Presentation de la flotte</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Une vitrine plus propre pour choisir sans effort.</h2>
              <p className="text-slate-600 mt-3 max-w-2xl leading-relaxed">
                On passe d'une simple grille a une lecture en deux temps: un modele phare pour l'envie, puis une selection courte pour comparer le bon niveau de service, de style et de tarif.
              </p>
            </div>
            <div className="flex flex-col items-start gap-3 sm:items-end">
              <div className="flex flex-wrap gap-2.5">
                {CATEGORIES.map((category) => (
                  <span key={category.value} className="border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600">
                    {category.label}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => shiftFleet('previous')}
                  className="inline-flex items-center gap-2 border border-slate-200 bg-white px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-950"
                >
                  <ChevronLeft size={14} />
                  Precedent
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFleetVehicleId((current) => current ? null : 'manual-pause')}
                  className={'inline-flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] transition-colors ' + (isFleetPaused ? 'bg-slate-950 text-white' : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:text-slate-950')}
                >
                  {isFleetPaused ? <Play size={14} /> : <Pause size={14} />}
                  {isFleetPaused ? 'Relancer' : 'Pause'}
                </button>
                <button
                  type="button"
                  onClick={() => shiftFleet('next')}
                  className="inline-flex items-center gap-2 border border-slate-200 bg-white px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-950"
                >
                  Suivant
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>

          {featuredVehicles.length > 0 && (
            <div className="space-y-5">
              <div className="border border-slate-200 bg-[#f8f5ef] py-4">
                <div
                  ref={fleetScrollRef}
                  className="flex gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                >
                  {rollingFleet.map((vehicle, index) => (
                    <article
                      key={`${vehicle.id}-${index}`}
                      onClick={() => setSelectedFleetVehicleId((current) => current === `${vehicle.id}-${index}` ? null : `${vehicle.id}-${index}`)}
                      className={'group w-[300px] shrink-0 cursor-pointer overflow-hidden bg-white shadow-sm transition-transform hover:-translate-y-1 ' + (selectedFleetVehicleId === `${vehicle.id}-${index}` ? 'ring-2 ring-slate-950' : '')}
                    >
                      <div className="relative aspect-[16/8.6] overflow-hidden bg-slate-100 sm:aspect-[16/10]">
                        <img
                          src={vehicle.images[0]?.url}
                          alt={vehicle.title}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading={index >= fleetCenterStartIndex - 1 && index <= fleetCenterStartIndex + 2 ? 'eager' : 'lazy'}
                          fetchPriority={index >= fleetCenterStartIndex - 1 && index <= fleetCenterStartIndex + 2 ? 'high' : 'low'}
                          decoding="async"
                        />
                        <HeroBlock variant="light" overlayClassName="bg-[linear-gradient(180deg,rgba(0,0,0,0.12)_0%,rgba(0,0,0,0.22)_44%,rgba(0,0,0,0.7)_100%)]">
                          <div className="absolute left-4 top-4 flex gap-2">
                            <span className="bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-900">{vehicle.category}</span>
                          </div>
                          <div className="absolute inset-x-4 bottom-4">
                            <h3 className="text-xl font-extrabold text-white">{vehicle.brand} {vehicle.model}</h3>
                            <p className="mt-1 text-xs uppercase tracking-[0.14em] text-white/75">{vehicle.city} • {vehicle.year} • {vehicle.transmission}</p>
                          </div>
                        </HeroBlock>
                      </div>

                      <div className="p-3 sm:p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-bold text-slate-900">{vehicle.pricePerDay.toLocaleString()} FCFA / jour</p>
                          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{vehicle.seats} places</span>
                        </div>
                        <p className="mt-2 text-sm text-slate-500 line-clamp-2">{vehicle.description}</p>
                        {selectedFleetVehicleId === `${vehicle.id}-${index}` && (
                          <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Defilement en pause</span>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                navigate('/vehicles/' + vehicle.id);
                              }}
                              className="inline-flex items-center gap-2 bg-slate-950 px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-slate-800"
                            >
                              Voir le detail
                              <ArrowRight size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <div className="flex justify-start">
                <Link to="/vehicles" className="inline-flex items-center gap-2 bg-slate-950 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800">
                  Voir toute la flotte
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <section id="destinations" className="py-20 bg-[#fbfaf7] text-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600 mb-3">Destinations</p>
              <h2 className="text-3xl md:text-4xl font-extrabold">Ou profiter de Djambo ?</h2>
              <p className="text-slate-600 mt-3 max-w-2xl">Chaque destination doit deja faire sentir le niveau de service: point de remise, ambiance, flexibilite et type d accompagnement disponible.</p>
            </div>
            <div className="text-sm text-slate-400">01 / 06 destinations</div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {destinationCards.map((destination, index) => (
              <article key={destination.title} className="overflow-hidden border border-slate-200 bg-white shadow-sm transition-colors hover:bg-slate-50">
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                  {destination.image ? <img src={destination.image} alt={destination.title} className="h-full w-full object-cover" loading="lazy" /> : null}
                  <HeroBlock variant="light" overlayClassName="bg-[linear-gradient(180deg,rgba(0,0,0,0.12)_0%,rgba(0,0,0,0.24)_46%,rgba(0,0,0,0.66)_100%)]">
                    <div className="absolute left-5 top-5 border border-white/25 bg-white/78 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-900">
                      Destination {String(index + 1).padStart(2, '0')}
                    </div>
                    <div className="absolute inset-x-5 bottom-5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/72">{destination.subtitle}</p>
                      <h3 className="mt-2 text-xl font-extrabold text-white">{destination.title}</h3>
                    </div>
                  </HeroBlock>
                </div>
                <div className="p-6">
                  <p className="text-sm text-slate-600 leading-relaxed">{destination.detail}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {destination.points.map((point) => (
                      <span key={point} className="border border-slate-200 bg-[#fbfaf7] px-3 py-1.5 text-[11px] font-semibold text-slate-600">
                        {point}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
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
              <div key={card.title} className="border border-slate-200 bg-[#fcfbf8] p-6">
                <div className="w-11 h-11 bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                  <CheckCircle2 size={18} />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 mb-2">{card.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="relative overflow-hidden border-t border-slate-200 bg-[#f1ece4] pt-16 pb-10 text-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(201,171,114,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.06),transparent_26%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 border-b border-slate-200 pb-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div>
              <div className="flex flex-wrap items-center gap-4">
                <BrandLogo size="md" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Mobilité premium</span>
              </div>

              <h2 className="mt-8 max-w-2xl text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                Louer une belle voiture doit être simple, net et rassurant.
              </h2>

              <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600">
                Djambo présente une flotte premium avec une lecture plus propre, un parcours plus fluide et un niveau de service plus visible dès la première visite.
              </p>

              <div className="mt-8 grid gap-6 sm:grid-cols-3">
                {[
                  { label: 'Flotte', value: 'Premium et bien présentée' },
                  { label: 'Service', value: 'Direct et humain' },
                  { label: 'Parcours', value: 'Rapide et lisible' },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
                    <p className="mt-2 text-sm font-bold leading-relaxed text-slate-900">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Explorer</p>
                <div className="space-y-3 text-sm text-slate-600">
                  <Link to="/vehicles" className="block transition-colors hover:text-slate-900">Toute la flotte</Link>
                  <Link to="/pricing" className="block transition-colors hover:text-slate-900">Tarifs</Link>
                  <a href="#benefices" className="block transition-colors hover:text-slate-900">Pourquoi Djambo</a>
                  <a href="#fleet" className="block transition-colors hover:text-slate-900">Sélection du moment</a>
                </div>
              </div>

              <div>
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Services</p>
                <div className="space-y-3 text-sm text-slate-600">
                  <a href="#" className="block transition-colors hover:text-slate-900">Conciergerie premium</a>
                  <a href="#" className="block transition-colors hover:text-slate-900">Assistance client</a>
                  <a href="#" className="block transition-colors hover:text-slate-900">Remise soignée</a>
                  <a href="#" className="block transition-colors hover:text-slate-900">Support réservation</a>
                </div>
              </div>

              <div>
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Contact</p>
                <div className="space-y-3 text-sm text-slate-600">
                  <a href="#" className="block transition-colors hover:text-slate-900">Service commercial</a>
                  <a href="#" className="block transition-colors hover:text-slate-900">Support réservation</a>
                  <a href="#" className="block transition-colors hover:text-slate-900">Demandes entreprises</a>
                  <a href="#" className="block transition-colors hover:text-slate-900">Assistance routière</a>
                </div>
              </div>

              <div>
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Informations</p>
                <div className="space-y-3 text-sm text-slate-600">
                  <Link to="/about" className="block transition-colors hover:text-slate-900">A propos de Djambo</Link>
                  <Link to="/terms" className="block transition-colors hover:text-slate-900">Conditions générales</Link>
                  <Link to="/privacy" className="block transition-colors hover:text-slate-900">Politique de confidentialité</Link>
                  <Link to="/legal" className="block transition-colors hover:text-slate-900">Mentions légales</Link>
                  <Link to="/cookies" className="block transition-colors hover:text-slate-900">Cookies et préférences</Link>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-8 py-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Engagement</p>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">
                Une expérience claire, un ton sobre et un accès rapide à l’essentiel: la flotte, le service et la réservation.
              </p>
            </div>

            <div className="flex flex-col gap-4 text-xs text-slate-500 sm:flex-row sm:flex-wrap sm:items-center sm:justify-start lg:justify-end">
              <span className="inline-flex items-center gap-2"><Globe size={12} /> FR active</span>
              <span className="inline-flex items-center gap-2"><Headphones size={12} /> Conciergerie premium</span>
              <span className="inline-flex items-center gap-2"><Users size={12} /> Profils vérifiés</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>2026 Djambo. Tous droits réservés.</p>
            <p>Mobilité premium, réservation simple, service soigné.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
