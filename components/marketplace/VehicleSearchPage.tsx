import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  ArrowRight,
  Car,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  X,
  Zap,
} from 'lucide-react';
import { PublicSiteHeader } from '../../components/PublicSiteHeader';
import { api, isRealUserMarketplaceVehicle, MarketplacePublicVehicle } from '../../services/api';
import { VehicleCategory, FuelType, SearchFilters } from '../../types';
import { HeroBlock } from './HeroBlock';

const LUXE_SCENE_SRC = new URL('../../luxe-logo.jpeg', import.meta.url).href;
const SUV_SCENE_SRC = new URL('../../SUV-FAMILLE.webp', import.meta.url).href;
const BERLINE_SCENE_SRC = new URL('../../berline-illustrqtion.jpeg', import.meta.url).href;
const ECONOMIQUE_SCENE_SRC = new URL('../../economique.webp', import.meta.url).href;
const UTILITAIRE_SCENE_SRC = new URL('../../utilitaire.webp', import.meta.url).href;
const DJAMBO_PREMIUM_SCENE_SRC = new URL('../../Marque haut de gamme Djambo.png', import.meta.url).href;

const FALLBACK_MAX_PRICE = 150000;

const buildDefaultFilters = (maxPrice: number): SearchFilters => ({
  city: '',
  category: '',
  minPrice: 0,
  maxPrice,
  fuelType: '',
  isForRent: false,
  isForSale: false,
  transmission: '',
});

const getPriceRangeMax = (vehicles: MarketplacePublicVehicle[]) => {
  const highestPrice = vehicles.reduce((maxPrice, vehicle) => Math.max(maxPrice, vehicle.pricePerDay || 0), 0);
  return Math.max(FALLBACK_MAX_PRICE, highestPrice);
};

const CATEGORY_ORDER: VehicleCategory[] = [
  VehicleCategory.LUXE,
  VehicleCategory.SUV,
  VehicleCategory.BERLINE,
  VehicleCategory.ECONOMIQUE,
  VehicleCategory.PICKUP,
  VehicleCategory.UTILITAIRE,
  VehicleCategory.CABRIOLET,
  VehicleCategory.MONOSPACE,
];

const CATEGORY_META: Record<string, { eyebrow: string; description: string }> = {
  [VehicleCategory.LUXE]: {
    eyebrow: 'Collection signature',
    description: 'VIP, ceremonie, image forte.',
  },
  [VehicleCategory.SUV]: {
    eyebrow: 'Polyvalence premium',
    description: 'Famille, route, confort.',
  },
  [VehicleCategory.BERLINE]: {
    eyebrow: 'Elegance executive',
    description: 'Business, ville, transferts.',
  },
  [VehicleCategory.ECONOMIQUE]: {
    eyebrow: 'Usage quotidien',
    description: 'Budget cadre, usage simple.',
  },
  [VehicleCategory.PICKUP]: {
    eyebrow: 'Terrain et missions',
    description: 'Charge, terrain, mission.',
  },
  [VehicleCategory.UTILITAIRE]: {
    eyebrow: 'Groupes et navettes',
    description: 'Equipe, navette, volume.',
  },
  [VehicleCategory.CABRIOLET]: {
    eyebrow: 'Selection plaisir',
    description: 'Image, sortie, plaisir.',
  },
  [VehicleCategory.MONOSPACE]: {
    eyebrow: 'Confort collectif',
    description: 'Groupe, famille, long trajet.',
  },
};

const CATEGORY_FOCUS: Record<string, string> = {
  [VehicleCategory.LUXE]: 'VIP',
  [VehicleCategory.SUV]: 'Famille et route',
  [VehicleCategory.BERLINE]: 'Business',
  [VehicleCategory.ECONOMIQUE]: 'Quotidien',
  [VehicleCategory.PICKUP]: 'Terrain',
  [VehicleCategory.UTILITAIRE]: 'Navette',
  [VehicleCategory.CABRIOLET]: 'Plaisir',
  [VehicleCategory.MONOSPACE]: 'Groupe',
};

const VEHICLE_USAGE_LABEL: Record<string, string> = {
  [VehicleCategory.LUXE]: 'Pour une presentation forte et immediate',
  [VehicleCategory.SUV]: 'Pour rouler partout avec plus d assurance',
  [VehicleCategory.BERLINE]: 'Pour des deplacements sobres et pro',
  [VehicleCategory.ECONOMIQUE]: 'Pour aller a l essentiel sans friction',
  [VehicleCategory.PICKUP]: 'Pour les usages plus techniques',
  [VehicleCategory.UTILITAIRE]: 'Pour transporter plus de personnes',
  [VehicleCategory.CABRIOLET]: 'Pour une sortie plus image',
  [VehicleCategory.MONOSPACE]: 'Pour privilegier l espace et le confort',
};

const CATEGORY_SCENE_IMAGE: Record<string, string> = {
  [VehicleCategory.LUXE]: LUXE_SCENE_SRC,
  [VehicleCategory.SUV]: SUV_SCENE_SRC,
  [VehicleCategory.BERLINE]: BERLINE_SCENE_SRC,
  [VehicleCategory.ECONOMIQUE]: ECONOMIQUE_SCENE_SRC,
  [VehicleCategory.PICKUP]: SUV_SCENE_SRC,
  [VehicleCategory.UTILITAIRE]: UTILITAIRE_SCENE_SRC,
  [VehicleCategory.CABRIOLET]: DJAMBO_PREMIUM_SCENE_SRC,
  [VehicleCategory.MONOSPACE]: UTILITAIRE_SCENE_SRC,
};

const SORT_OPTIONS = [
  { value: 'catalogue', label: 'Ordre Djambo' },
  { value: 'rating', label: 'Mieux notes' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix decroissant' },
  { value: 'newest', label: 'Recents' },
] as const;

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        size={12}
        className={star <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}
      />
    ))}
  </div>
);

const getOwnerTypeBadge = (vehicle: MarketplacePublicVehicle) => vehicle.ownerProfile.type === 'PARC_AUTO'
  ? {
      label: 'Parc auto',
      className: 'border border-sky-100 bg-sky-50 text-sky-700',
    }
  : {
      label: 'Particulier',
      className: 'border border-orange-100 bg-orange-50 text-orange-700',
    };

const handleEnterOrSpace = (event: React.KeyboardEvent<HTMLElement>, onActivate: () => void) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    onActivate();
  }
};

const VehicleCard = ({ vehicle, onClick, onPreview }: { vehicle: MarketplacePublicVehicle; onClick: () => void; onPreview: () => void }) => (
  <article
    onClick={onClick}
    onKeyDown={(event) => handleEnterOrSpace(event, onClick)}
    role="button"
    tabIndex={0}
    className="group cursor-pointer overflow-hidden border border-slate-200 bg-white transition-all hover:-translate-y-0.5 hover:shadow-[0_24px_80px_rgba(15,23,42,0.12)]"
  >
    <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
      <img
        src={vehicle.images[0]?.url}
        alt={vehicle.title}
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        loading="lazy"
      />
      <HeroBlock variant="light" overlayClassName="bg-[linear-gradient(180deg,rgba(0,0,0,0.14)_0%,rgba(0,0,0,0.28)_36%,rgba(0,0,0,0.74)_100%)]">
      <div className="absolute left-3 top-3 flex flex-wrap gap-1.5 sm:left-4 sm:top-4 sm:gap-2">
        <span className="bg-white/96 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-900 sm:px-3 sm:text-[11px]">{vehicle.category}</span>
        <span className={'px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] sm:px-3 sm:text-[11px] ' + getOwnerTypeBadge(vehicle).className}>{getOwnerTypeBadge(vehicle).label}</span>
        {vehicle.isFeatured && (
          <span className="inline-flex items-center gap-1 bg-amber-400 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-950 sm:px-3 sm:text-[11px]">
            <Zap size={10} />
            Signature
          </span>
        )}
        {isRealUserMarketplaceVehicle(vehicle) && (
          <span className="inline-flex items-center gap-1 bg-emerald-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white sm:px-3 sm:text-[11px]">
            Nouveau depot
          </span>
        )}
      </div>
      <span className={
        'absolute right-3 top-3 px-2.5 py-1 text-[10px] font-semibold sm:right-4 sm:top-4 sm:px-3 sm:text-[11px] ' +
        (vehicle.isAvailable ? 'bg-emerald-500 text-white' : 'bg-slate-900/75 text-slate-200')
      }>
        {vehicle.isAvailable ? 'Disponible' : 'Indisponible'}
      </span>
      <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-3 sm:inset-x-4 sm:bottom-4">
        <div className="min-w-0 rounded-2xl bg-slate-950/42 px-3 py-2.5 backdrop-blur-md sm:px-4 sm:py-3">
          <h3 className="line-clamp-1 text-lg font-extrabold text-white sm:text-[1.35rem]">{vehicle.brand} {vehicle.model}</h3>
          <p className="mt-1 line-clamp-1 text-[11px] uppercase tracking-[0.12em] text-white/70 sm:text-xs">{vehicle.city} • {vehicle.year} • {vehicle.ownerProfile.type === 'PARC_AUTO' ? 'Agence' : 'Particulier'}</p>
        </div>
        <div className="shrink-0 rounded-2xl bg-white/12 px-2.5 py-1.5 backdrop-blur-md sm:px-3 sm:py-2">
          <div className="flex items-center gap-1.5">
            <StarRating rating={vehicle.rating} />
            <span className="text-xs font-bold text-white">{vehicle.rating.toFixed(1)}</span>
          </div>
        </div>
      </div>
      </HeroBlock>
    </div>

    <div className="space-y-4 p-3 sm:p-4">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Presentation produit</p>
            <p className="mt-1 text-sm font-bold text-slate-900 sm:text-[15px]">{VEHICLE_USAGE_LABEL[vehicle.category] || 'Presentation claire et directe'}</p>
          </div>
          {vehicle.ownerProfile.verified && (
            <span className="inline-flex items-center gap-1 border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-700">
              <CheckCircle2 size={11} />
              Verifie
            </span>
          )}
        </div>
        <p className="line-clamp-2 text-sm leading-relaxed text-slate-500">{vehicle.description}</p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {[
          { label: 'Boite', value: vehicle.transmission },
          { label: 'Places', value: String(vehicle.seats) },
          { label: 'Carburant', value: vehicle.fuelType },
        ].map((item, index) => (
          <div key={item.label} className={'border border-slate-200 bg-slate-50 px-3 py-2.5 ' + (index === 2 ? 'col-span-2 sm:col-span-1' : '')}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
            <p className="mt-1 line-clamp-1 text-sm font-bold text-slate-800">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="bg-[#f6f2eb] px-3 py-1 text-[11px] font-semibold text-slate-600">{CATEGORY_FOCUS[vehicle.category] || vehicle.category}</span>
        <span className="inline-flex items-center gap-1 bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">
          <MapPin size={11} />
          {vehicle.city}
        </span>
        {vehicle.isForSale && (
          <span className="border border-indigo-100 bg-indigo-50 px-3 py-1 text-[11px] font-bold text-indigo-700">Achat possible</span>
        )}
      </div>

      <div className="flex items-end justify-between gap-3 border-t border-slate-200 pt-4">
        <div className="min-w-0">
          {vehicle.isForRent && (
            <p className="text-lg font-extrabold text-slate-900 sm:text-xl">
              {vehicle.pricePerDay.toLocaleString()} <span className="text-xs font-medium text-slate-500">FCFA / jour</span>
            </p>
          )}
          {vehicle.isForSale && vehicle.priceSale && (
            <p className="mt-1 text-xs font-semibold text-indigo-600">
              Vente : {(vehicle.priceSale / 1000000).toFixed(1)} M FCFA
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onPreview();
            }}
            className="border border-slate-200 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-950"
          >
            Grand apercu
          </button>
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-900 sm:text-sm sm:normal-case sm:tracking-normal">Voir la fiche</span>
        </div>
      </div>
    </div>
  </article>
);

export const VehicleSearchPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState('FR');
  const [filters, setFilters] = useState<SearchFilters>(() => buildDefaultFilters(FALLBACK_MAX_PRICE));
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'catalogue' | 'price_asc' | 'price_desc' | 'rating' | 'newest'>('catalogue');
  const [searchInput, setSearchInput] = useState('');
  const [previewVehicle, setPreviewVehicle] = useState<MarketplacePublicVehicle | null>(null);
  const [marketplaceVehicles, setMarketplaceVehicles] = useState<MarketplacePublicVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const priceRangeMaxRef = React.useRef(FALLBACK_MAX_PRICE);

  useEffect(() => {
    if (!location.search) {
      return;
    }

    navigate(location.pathname, { replace: true });
  }, [location.pathname, location.search, navigate]);

  useEffect(() => {
    let isMounted = true;

    const loadMarketplaceVehicles = async () => {
      try {
        setLoading(true);
        const vehicles = await api.getMarketplaceVehicles();
        if (!isMounted) {
          return;
        }
        setMarketplaceVehicles(vehicles);
        setError('');
      } catch (loadError) {
        if (!isMounted) {
          return;
        }
        setError(loadError instanceof Error ? loadError.message : 'Impossible de charger la flotte publique.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadMarketplaceVehicles();

    return () => {
      isMounted = false;
    };
  }, []);

  const priceRangeMax = useMemo(
    () => getPriceRangeMax(marketplaceVehicles),
    [marketplaceVehicles]
  );

  useEffect(() => {
    const previousPriceRangeMax = priceRangeMaxRef.current;

    setFilters((currentFilters) => {
      const shouldTrackDefaultRange = currentFilters.maxPrice === previousPriceRangeMax;
      const nextMaxPrice = shouldTrackDefaultRange
        ? priceRangeMax
        : Math.min(currentFilters.maxPrice, priceRangeMax);

      if (nextMaxPrice === currentFilters.maxPrice) {
        return currentFilters;
      }

      return {
        ...currentFilters,
        maxPrice: nextMaxPrice,
      };
    });

    priceRangeMaxRef.current = priceRangeMax;
  }, [priceRangeMax]);

  const cityOptions = useMemo(() => [...new Set(marketplaceVehicles.map((vehicle) => vehicle.city))], [marketplaceVehicles]);

  const setFilter = <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleOfferFilter = (mode: 'rent' | 'sale') => {
    setFilters((prev) => {
      if (mode === 'rent') {
        const nextRent = !prev.isForRent;
        return {
          ...prev,
          isForRent: nextRent,
          isForSale: nextRent ? false : prev.isForSale,
        };
      }

      const nextSale = !prev.isForSale;
      return {
        ...prev,
        isForSale: nextSale,
        isForRent: nextSale ? false : prev.isForRent,
      };
    });
  };

  const resetFilters = () => {
    setFilters(buildDefaultFilters(priceRangeMax));
    setSearchInput('');
  };

  const filtered = useMemo(() => {
    const term = searchInput.trim().toLowerCase();
    let list = [...marketplaceVehicles];

    if (term) {
      list = list.filter((vehicle) => (
        [vehicle.title, vehicle.brand, vehicle.model, vehicle.city, vehicle.ownerProfile.displayName]
          .join(' ')
          .toLowerCase()
          .includes(term)
      ));
    }

    if (filters.city) list = list.filter((vehicle) => vehicle.city === filters.city);
    if (filters.category) list = list.filter((vehicle) => vehicle.category === filters.category);
    if (filters.fuelType) list = list.filter((vehicle) => vehicle.fuelType === filters.fuelType);
    if (filters.transmission) list = list.filter((vehicle) => vehicle.transmission === filters.transmission);
    if (filters.isForRent && !filters.isForSale) list = list.filter((vehicle) => vehicle.isForRent);
    if (filters.isForSale && !filters.isForRent) list = list.filter((vehicle) => vehicle.isForSale);
    list = list.filter((vehicle) => vehicle.pricePerDay >= filters.minPrice && vehicle.pricePerDay <= filters.maxPrice);

    if (sortBy === 'price_asc') list.sort((a, b) => a.pricePerDay - b.pricePerDay);
    else if (sortBy === 'price_desc') list.sort((a, b) => b.pricePerDay - a.pricePerDay);
    else if (sortBy === 'rating') list.sort((a, b) => b.rating - a.rating);
    else if (sortBy === 'newest') list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    return list;
  }, [filters, searchInput, sortBy]);

  const categorySections = useMemo(
    () => CATEGORY_ORDER.map((category) => ({
      category,
      vehicles: [
        ...filtered.filter((vehicle) => vehicle.category === category && isRealUserMarketplaceVehicle(vehicle)),
        ...filtered.filter((vehicle) => vehicle.category === category && !isRealUserMarketplaceVehicle(vehicle)),
      ],
    })).filter((section) => section.vehicles.length > 0),
    [filtered, marketplaceVehicles]
  );

  const showcaseSourceVehicles = useMemo(() => {
    const source = filtered.length > 0 ? filtered : marketplaceVehicles;
    return [
      ...source.filter((vehicle) => isRealUserMarketplaceVehicle(vehicle)),
      ...source.filter((vehicle) => !isRealUserMarketplaceVehicle(vehicle)),
    ];
  }, [filtered, marketplaceVehicles]);

  const categoryOverview = useMemo(
    () => CATEGORY_ORDER.map((category) => ({
      category,
      count: marketplaceVehicles.filter((vehicle) => vehicle.category === category).length,
      availableCount: marketplaceVehicles.filter((vehicle) => vehicle.category === category && vehicle.isAvailable).length,
    })).filter((item) => item.count > 0),
    [marketplaceVehicles]
  );

  const showcaseVehicles = useMemo(
    () => showcaseSourceVehicles.slice(0, 3),
    [showcaseSourceVehicles]
  );

  const editorialVehicles = useMemo(
    () => showcaseSourceVehicles.slice(0, 5),
    [showcaseSourceVehicles]
  );

  const leadVehicle = editorialVehicles[0];
  const supportingVehicles = editorialVehicles.slice(1, 5);

  const availableCount = filtered.filter((vehicle) => vehicle.isAvailable).length;
  const hasActiveFilters = Boolean(
    searchInput.trim() ||
    filters.city ||
    filters.category ||
    filters.fuelType ||
    filters.transmission ||
    filters.maxPrice < priceRangeMax ||
    filters.isForRent ||
    filters.isForSale
  );

  const activeFilterCount = [
    Boolean(searchInput.trim()),
    Boolean(filters.city),
    Boolean(filters.category),
    Boolean(filters.fuelType),
    Boolean(filters.transmission),
    filters.maxPrice < priceRangeMax,
    filters.isForRent,
    filters.isForSale,
  ].filter(Boolean).length;

  const activeFilterChips = [
    searchInput.trim() ? { key: 'search', label: `Recherche: ${searchInput.trim()}`, onRemove: () => setSearchInput('') } : null,
    filters.city ? { key: 'city', label: `Ville: ${filters.city}`, onRemove: () => setFilter('city', '') } : null,
    filters.category ? { key: 'category', label: `Categorie: ${filters.category}`, onRemove: () => setFilter('category', '') } : null,
    filters.fuelType ? { key: 'fuelType', label: `Carburant: ${filters.fuelType}`, onRemove: () => setFilter('fuelType', '') } : null,
    filters.transmission ? { key: 'transmission', label: `Boite: ${filters.transmission}`, onRemove: () => setFilter('transmission', '') } : null,
    filters.maxPrice < priceRangeMax ? { key: 'price', label: `Budget max: ${filters.maxPrice.toLocaleString()} FCFA`, onRemove: () => setFilter('maxPrice', priceRangeMax) } : null,
    filters.isForRent ? {
      key: 'rent',
      label: 'Mode: Location',
      onRemove: () => setFilter('isForRent', false),
    } : null,
    filters.isForSale ? {
      key: 'sale',
      label: 'Mode: Vente',
      onRemove: () => setFilter('isForSale', false),
    } : null,
  ].filter((chip): chip is { key: string; label: string; onRemove: () => void } => Boolean(chip));

  const navLinks = [
    {
      label: 'Catalogue',
      items: [
        { label: 'Toutes les categories', to: '#categories', description: 'Explorer la collection Djambo par familles de vehicules.', previewImage: showcaseVehicles[0]?.images[0]?.url, previewMeta: 'Vue rapide', previewTitle: 'Entrer dans la collection par besoin.' },
        { label: 'Resultats', to: '#results', description: 'Voir les modeles disponibles et leurs fiches.', previewImage: showcaseVehicles[1]?.images[0]?.url || showcaseVehicles[0]?.images[0]?.url, previewMeta: 'Disponibles', previewTitle: 'Des apercus qui montrent deja les vehicules.' },
        { label: 'Retour accueil', to: '/', description: 'Revenir a la page d’accueil publique.', previewImage: showcaseVehicles[2]?.images[0]?.url || showcaseVehicles[0]?.images[0]?.url, previewMeta: 'Djambo', previewTitle: 'Revenir a la vitrine principale.' },
      ],
    },
    {
      label: 'Pages',
      items: [
        { label: 'Landing page', to: '/', description: 'Revenir a la vitrine principale Djambo.', previewImage: showcaseVehicles[0]?.images[0]?.url, previewMeta: 'Accueil', previewTitle: 'Voir la mise en scene complete de la marque.' },
        { label: 'Tarifs', to: '/pricing', description: 'Consulter les offres et niveaux de service.', previewImage: showcaseVehicles[1]?.images[0]?.url || showcaseVehicles[0]?.images[0]?.url, previewMeta: 'Tarifs', previewTitle: 'Comprendre le niveau de service et les offres.' },
      ],
    },
    { label: 'Assistance', to: '#results' },
  ];

  return (
    <div className="min-h-screen bg-[#f6f2eb] font-sans text-slate-900">
      <PublicSiteHeader
        theme="light"
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen((value) => !value)}
        navLinks={navLinks}
        activeLanguage={activeLanguage}
        onLanguageChange={setActiveLanguage}
      />

      <section className="bg-[#f6f2eb] pt-20 pb-5 sm:pb-8">
        <div className="w-full px-1.5 sm:px-4 lg:px-6 xl:px-8">
          {leadVehicle && (
            <div className="mb-5 grid gap-px overflow-hidden bg-slate-200 lg:grid-cols-[1.08fr_0.92fr] xl:max-h-[700px]">
              <article
                onClick={() => navigate('/vehicles/' + leadVehicle.id)}
                onKeyDown={(event) => handleEnterOrSpace(event, () => navigate('/vehicles/' + leadVehicle.id))}
                role="button"
                tabIndex={0}
                className="group relative min-h-[380px] overflow-hidden bg-slate-950 text-left sm:min-h-[440px] xl:min-h-[560px]"
              >
                <img
                  src={leadVehicle.images[0]?.url}
                  alt={leadVehicle.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  loading="eager"
                />
                <HeroBlock
                  variant="light"
                  overlayClassName="bg-[linear-gradient(180deg,rgba(0,0,0,0.18)_0%,rgba(0,0,0,0.42)_38%,rgba(0,0,0,0.76)_100%)]"
                  contentClassName="flex h-full flex-col justify-between p-4 sm:p-6 lg:p-8"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-950">Selection Djambo</span>
                    <span className="bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-sm">{leadVehicle.category}</span>
                    <span className={'px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ' + getOwnerTypeBadge(leadVehicle).className}>{getOwnerTypeBadge(leadVehicle).label}</span>
                    {isRealUserMarketplaceVehicle(leadVehicle) && (
                      <span className="bg-emerald-500 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">Vehicule utilisateur</span>
                    )}
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setPreviewVehicle(leadVehicle);
                      }}
                      className="ml-auto border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                    >
                      Grand apercu
                    </button>
                  </div>

                  <div className="max-w-3xl">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">Catalogue premium</p>
                    <h1 className="mt-3 max-w-[11ch] text-4xl font-extrabold leading-[0.94] text-white sm:max-w-none sm:text-5xl lg:text-[3.4rem] xl:text-[4.15rem]">
                      {leadVehicle.brand} {leadVehicle.model}
                    </h1>
                    <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/78 sm:text-base">
                      Une fiche produit plus franche: photo dominante, details utiles, lecture rapide et mise en avant du vehicule avant le reste.
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {[
                        `${leadVehicle.city}`,
                        `${leadVehicle.transmission}`,
                        `${leadVehicle.fuelType}`,
                        `${leadVehicle.seats} places`,
                      ].map((item) => (
                        <span key={item} className="bg-white/10 px-3 py-2 text-xs font-semibold text-white backdrop-blur-sm">
                          {item}
                        </span>
                      ))}
                    </div>
                    <div className="mt-6 flex flex-wrap items-end gap-4 sm:gap-6">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">Tarif journalier</p>
                        <p className="mt-2 text-2xl font-extrabold text-white sm:text-3xl">{leadVehicle.pricePerDay.toLocaleString()} FCFA</p>
                      </div>
                      <div className="inline-flex items-center gap-2 bg-white px-4 py-3 text-sm font-bold text-slate-950">
                        Voir la fiche
                        <ArrowRight size={16} />
                      </div>
                    </div>
                  </div>
                </HeroBlock>
              </article>

              <div className="grid gap-px bg-slate-200 sm:grid-cols-2 lg:grid-cols-1 xl:max-h-[700px]">
                {supportingVehicles.map((vehicle) => (
                  <article
                    key={vehicle.id}
                    onClick={() => navigate('/vehicles/' + vehicle.id)}
                    onKeyDown={(event) => handleEnterOrSpace(event, () => navigate('/vehicles/' + vehicle.id))}
                    role="button"
                    tabIndex={0}
                    className="group grid min-h-[190px] grid-cols-[0.95fr_1.05fr] bg-white text-left sm:min-h-[220px] xl:min-h-0 xl:grid-cols-[0.88fr_1.12fr]"
                  >
                    <div className="relative overflow-hidden bg-slate-100">
                      <img
                        src={vehicle.images[0]?.url}
                        alt={vehicle.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex flex-col justify-between p-4 sm:p-5">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">{vehicle.category}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className={'px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ' + getOwnerTypeBadge(vehicle).className}>{getOwnerTypeBadge(vehicle).label}</span>
                          {isRealUserMarketplaceVehicle(vehicle) && (
                            <span className="bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700">Nouveau depot</span>
                          )}
                        </div>
                        <h2 className="mt-2 text-lg font-extrabold text-slate-900 sm:text-xl">{vehicle.brand} {vehicle.model}</h2>
                        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">{vehicle.description}</p>
                      </div>
                      <div className="border-t border-slate-100 pt-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Disponible</p>
                            <p className="mt-1 text-sm font-bold text-slate-900">{vehicle.pricePerDay.toLocaleString()} FCFA / jour</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                setPreviewVehicle(vehicle);
                              }}
                              className="border border-slate-200 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-950"
                            >
                              Apercu
                            </button>
                            <ArrowRight size={16} className="text-slate-400 transition-colors group-hover:text-slate-900" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          <div className="mb-5 border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
            {error && (
              <div className="mb-3 border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                {error}
              </div>
            )}
            {loading && (
              <div className="mb-3 border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                Chargement de la flotte publique...
              </div>
            )}
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.45fr)_220px_220px_160px]">
              <div className="flex items-center gap-3 border border-slate-200 bg-white px-4 py-3">
                <Search size={16} className="shrink-0 text-slate-400" />
                <input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Ville, marque, modele, proprietaire..."
                  className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
              </div>

              <select
                value={filters.city}
                onChange={(event) => setFilter('city', event.target.value)}
                className="border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-500"
              >
                <option value="">Toutes les villes</option>
                {cityOptions.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>

              <select
                value={filters.category}
                onChange={(event) => setFilter('category', event.target.value as VehicleCategory | '')}
                className="border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-500"
              >
                <option value="">Toutes les categories</option>
                {CATEGORY_ORDER.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setShowFilters((value) => !value)}
                className={
                  'inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-colors sm:min-h-[52px] ' +
                  (showFilters || activeFilterCount > 0
                    ? 'bg-slate-950 text-white'
                    : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300')
                }
              >
                <SlidersHorizontal size={15} />
                Filtres
                {activeFilterCount > 0 && <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs font-bold">{activeFilterCount}</span>}
              </button>
            </div>

            <div className="mt-3 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex min-w-max gap-2">
                {CATEGORY_ORDER.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setFilter('category', filters.category === category ? '' : category)}
                  className={
                    'px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] transition-colors ' +
                    (filters.category === category
                      ? 'bg-slate-950 text-white'
                      : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900')
                  }
                >
                  {category}
                </button>
                ))}
              </div>
            </div>

            {showFilters && (
              <div className="mt-3 grid gap-2 border-t border-slate-200 pt-3 md:grid-cols-2 xl:grid-cols-5">
                <select
                  value={filters.fuelType}
                  onChange={(event) => setFilter('fuelType', event.target.value as FuelType | '')}
                  className="border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-500"
                >
                  <option value="">Tous les carburants</option>
                  {Object.values(FuelType).map((fuelType) => (
                    <option key={fuelType} value={fuelType}>{fuelType}</option>
                  ))}
                </select>

                <select
                  value={filters.transmission}
                  onChange={(event) => setFilter('transmission', event.target.value as 'Automatique' | 'Manuelle' | '')}
                  className="border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-500"
                >
                  <option value="">Toutes les transmissions</option>
                  <option value="Automatique">Automatique</option>
                  <option value="Manuelle">Manuelle</option>
                </select>

                <div className="border border-slate-200 bg-white px-4 py-3">
                  <div className="mb-2 flex items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    <span>Prix max</span>
                    <span>{filters.maxPrice.toLocaleString()} FCFA</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={priceRangeMax}
                    step={5000}
                    value={filters.maxPrice}
                    onChange={(event) => setFilter('maxPrice', Number(event.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 xl:col-span-2">
                  <button
                    type="button"
                    onClick={() => toggleOfferFilter('rent')}
                    className={
                      'border px-4 py-3 text-sm font-semibold transition-colors ' +
                      (filters.isForRent && !filters.isForSale
                        ? 'border-slate-950 bg-slate-950 text-white'
                        : 'border-slate-200 bg-white text-slate-700')
                    }
                  >
                    Location
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleOfferFilter('sale')}
                    className={
                      'border px-4 py-3 text-sm font-semibold transition-colors ' +
                      (filters.isForSale && !filters.isForRent
                        ? 'border-slate-950 bg-slate-950 text-white'
                        : 'border-slate-200 bg-white text-slate-700')
                    }
                  >
                    Vente
                  </button>
                </div>

                <div className="md:col-span-2 xl:col-span-5 flex items-center justify-between gap-3 border-t border-slate-200 pt-3">
                  <p className="text-xs font-medium text-slate-500">Affinage secondaire seulement quand necessaire.</p>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="text-sm font-semibold text-slate-500 transition-colors hover:text-slate-900"
                  >
                    Reinitialiser
                  </button>
                </div>
              </div>
            )}

            {activeFilterChips.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-3">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Actifs</span>
                {activeFilterChips.map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={chip.onRemove}
                    className="inline-flex items-center gap-2 border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-950"
                  >
                    {chip.label}
                    <X size={12} />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500 transition-colors hover:text-slate-900"
                >
                  Tout effacer
                </button>
              </div>
            )}
          </div>

          <div className="mb-5 flex items-center gap-3 sm:mb-6">
            <Link to="/" className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-500 transition-colors hover:text-slate-900">
              <ChevronLeft size={18} />
            </Link>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Catalogue Djambo</p>
              <p className="text-sm font-bold text-slate-900">Mise en scene produit et lecture rapide</p>
            </div>
            <div className="ml-auto hidden items-center gap-2 bg-[#f6f2eb] px-3 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 md:inline-flex">
              <span>{filtered.length} produits visibles</span>
              <span className="text-slate-300">/</span>
              <span>{availableCount} disponibles</span>
            </div>
          </div>

          <div className="border border-slate-200 bg-[#fbf8f2] p-4 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 sm:mb-4">
                  <Sparkles size={12} className="text-amber-500" />
                  Conference visuelle
                </div>
                <h1 className="max-w-3xl text-xl font-extrabold leading-tight text-slate-900 sm:text-4xl">
                  Entrer par besoin. Comparer vite.
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 sm:mt-3">
                  Peu de texte, plus d image, puis un tri clair par categories.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value as typeof sortBy)}
                  className="border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-500"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  className="inline-flex items-center gap-2 border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-950"
                >
                  Voir les produits
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:gap-4 lg:grid-cols-[1.15fr_0.85fr] lg:mt-5">
              {showcaseVehicles[0] && (
                <article
                  onClick={() => navigate('/vehicles/' + showcaseVehicles[0].id)}
                  onKeyDown={(event) => handleEnterOrSpace(event, () => navigate('/vehicles/' + showcaseVehicles[0].id))}
                  role="button"
                  tabIndex={0}
                  className="group relative overflow-hidden border border-slate-200 bg-slate-200 text-left"
                >
                  <div className="relative aspect-[4/3] overflow-hidden sm:aspect-[16/10]">
                    <img src={showcaseVehicles[0].images[0]?.url} alt={showcaseVehicles[0].title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                    <HeroBlock variant="light" overlayClassName="bg-[linear-gradient(180deg,rgba(0,0,0,0.12)_0%,rgba(0,0,0,0.2)_40%,rgba(0,0,0,0.68)_100%)]">
                    <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3 sm:inset-x-5 sm:bottom-5 sm:gap-4">
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/65">Produit vedette</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className={'px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ' + getOwnerTypeBadge(showcaseVehicles[0]).className}>{getOwnerTypeBadge(showcaseVehicles[0]).label}</span>
                          {isRealUserMarketplaceVehicle(showcaseVehicles[0]) && (
                            <span className="bg-emerald-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white">Mis en avant</span>
                          )}
                        </div>
                        <h3 className="mt-1.5 line-clamp-2 text-xl font-extrabold text-white sm:mt-2 sm:text-2xl">{showcaseVehicles[0].brand} {showcaseVehicles[0].model}</h3>
                        <p className="mt-1.5 line-clamp-2 text-xs text-white/80 sm:mt-2 sm:text-sm">{showcaseVehicles[0].city} • {showcaseVehicles[0].category} • {showcaseVehicles[0].pricePerDay.toLocaleString()} FCFA / jour</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setPreviewVehicle(showcaseVehicles[0]);
                          }}
                          className="bg-white px-3 py-2 text-[11px] font-bold text-slate-950 transition-colors hover:bg-slate-100"
                        >
                          Grand apercu
                        </button>
                        <span className="bg-white/10 px-3 py-2 text-[11px] font-semibold text-white backdrop-blur-sm">Voir la fiche</span>
                      </div>
                    </div>
                    </HeroBlock>
                  </div>
                </article>
              )}

              <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-1">
                {showcaseVehicles.slice(1, 3).map((vehicle) => (
                  <button
                    key={vehicle.id}
                    type="button"
                    onClick={() => navigate('/vehicles/' + vehicle.id)}
                    className="group grid grid-cols-[96px_1fr] items-center gap-3 overflow-hidden border border-slate-200 bg-white p-2.5 text-left shadow-sm sm:grid-cols-[110px_1fr] sm:gap-4 sm:p-3"
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                      <img src={vehicle.images[0]?.url} alt={vehicle.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Produit associe</p>
                      <h3 className="mt-1 line-clamp-1 text-base font-extrabold text-slate-900 sm:text-lg">{vehicle.brand} {vehicle.model}</h3>
                      <p className="mt-1 text-xs text-slate-500 sm:text-sm">{vehicle.city} • {vehicle.category}</p>
                      <p className="mt-2 text-xs font-semibold text-slate-900 sm:mt-3 sm:text-sm">{VEHICLE_USAGE_LABEL[vehicle.category] || 'Vehicule selectionne'}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="categories" className="py-8">
        <div className="w-full px-1.5 sm:px-4 lg:px-6 xl:px-8">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">Conference par categories</p>
              <h2 className="text-2xl font-extrabold text-slate-900">Entrer par besoin, puis comparer rapidement.</h2>
            </div>
            <div className="text-sm text-slate-500">Une lecture courte, puis les produits.</div>
          </div>

          <div className="overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex min-w-max gap-3 pr-2 sm:gap-4 sm:pr-4">
              {categoryOverview.map((item) => (
                <button
                  key={item.category}
                  type="button"
                  onClick={() => setFilter('category', filters.category === item.category ? '' : item.category)}
                  className={
                    'relative min-h-[200px] w-[90vw] shrink-0 overflow-hidden border p-4 text-left transition-all sm:min-h-[220px] sm:w-[320px] ' +
                    (filters.category === item.category
                      ? 'border-slate-950 bg-slate-950 text-white shadow-lg'
                      : 'border-slate-200 bg-white text-slate-900 shadow-sm hover:shadow-md')
                  }
                >
                  <img
                    src={CATEGORY_SCENE_IMAGE[item.category] || DJAMBO_PREMIUM_SCENE_SRC}
                    alt={item.category}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                  />
                  <div className={
                    'absolute inset-0 ' +
                    (filters.category === item.category
                      ? 'bg-[linear-gradient(180deg,rgba(0,0,0,0.3)_0%,rgba(0,0,0,0.56)_56%,rgba(0,0,0,0.82)_100%)]'
                      : 'bg-[linear-gradient(180deg,rgba(0,0,0,0.22)_0%,rgba(0,0,0,0.5)_56%,rgba(0,0,0,0.76)_100%)]')
                  } />
                  <div className="relative flex h-full flex-col justify-between">
                    <div>
                      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/68">
                        {CATEGORY_META[item.category]?.eyebrow || 'Collection'}
                      </p>
                      <h3 className="mb-2 text-xl font-extrabold text-white">{item.category}</h3>
                      <p className="max-w-[24ch] text-sm font-medium text-white/80">
                        {CATEGORY_META[item.category]?.description || CATEGORY_FOCUS[item.category] || 'Selection'}
                      </p>
                    </div>
                    <div className="border-t border-white/10 pt-3">
                      <div className="flex items-center justify-between gap-3 text-white">
                        <span className="text-sm font-bold">{item.availableCount}/{item.count} disponibles</span>
                        <ArrowRight size={16} className="text-white/70" />
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="results" className="pb-14">
        <div className="w-full px-1.5 sm:px-4 lg:px-6 xl:px-8">
          <div className="mb-6 border border-slate-200 bg-white p-4 shadow-sm sm:mb-8 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">Resultats Djambo</p>
                <h2 className="text-2xl font-extrabold text-slate-900">
                  {filtered.length} vehicule{filtered.length > 1 ? 's' : ''} retenu{filtered.length > 1 ? 's' : ' '}
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  {hasActiveFilters
                    ? 'Les produits se reclassent selon vos criteres.'
                    : 'Les produits restent groupes par besoin.'}
                </p>
              </div>
              <div className="inline-flex items-start gap-2 bg-[#f6f2eb] px-4 py-3 text-sm text-slate-600">
                <CheckCircle2 size={16} className="mt-0.5 text-emerald-600" />
                {availableCount} produit{availableCount > 1 ? 's' : ''} actuellement disponible{availableCount > 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {categorySections.length > 0 ? (
            <div className="space-y-8 sm:space-y-12">
              {categorySections.map((section) => (
                <div key={section.category} className="space-y-4 sm:space-y-5">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-2xl">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">
                        {CATEGORY_META[section.category]?.eyebrow || 'Collection'}
                      </p>
                      <h3 className="text-2xl font-extrabold text-slate-900">{section.category}</h3>
                      <p className="mt-2 text-sm text-slate-500">{CATEGORY_FOCUS[section.category] || 'Selection ciblee'}</p>
                    </div>
                    <div className="inline-flex items-center gap-2 border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600">
                      <Car size={15} className="text-slate-400" />
                      {section.vehicles.length} modele{section.vehicles.length > 1 ? 's' : ''}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {section.vehicles.map((vehicle) => (
                      <div key={vehicle.id}>
                        <VehicleCard vehicle={vehicle} onClick={() => navigate('/vehicles/' + vehicle.id)} onPreview={() => setPreviewVehicle(vehicle)} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center border border-slate-200 bg-white py-24 text-center shadow-sm">
              <div className="mb-4 flex h-16 w-16 items-center justify-center bg-slate-100">
                <Car size={28} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Aucun vehicule ne correspond a cette selection</h3>
              <p className="mt-2 max-w-sm text-sm text-slate-500">
                Elargissez la ville, la categorie ou le budget pour retrouver une presentation plus complete.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-5 text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-700"
              >
                Reinitialiser les filtres
              </button>
            </div>
          )}

        </div>
      </section>

      {previewVehicle && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/82 p-3 sm:p-6"
          onClick={() => setPreviewVehicle(null)}
        >
          <div
            className="w-full max-w-6xl overflow-hidden border border-white/10 bg-white shadow-[0_30px_120px_rgba(2,6,23,0.45)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 sm:px-6 sm:py-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Grand apercu</p>
                <h3 className="mt-1 text-lg font-extrabold text-slate-950 sm:text-xl">{previewVehicle.brand} {previewVehicle.model}</h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewVehicle(null)}
                className="border border-slate-200 p-2 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-950"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-px bg-slate-200 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="bg-slate-100">
                <img
                  src={previewVehicle.images[0]?.url}
                  alt={previewVehicle.title}
                  className="h-full max-h-[78vh] w-full object-cover"
                />
              </div>
              <div className="bg-white p-4 sm:p-6">
                <div className="flex flex-wrap gap-2">
                  <span className="bg-slate-950 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white">{previewVehicle.category}</span>
                  <span className="border border-slate-200 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">{previewVehicle.city}</span>
                </div>

                <p className="mt-5 text-3xl font-extrabold text-slate-950">{previewVehicle.pricePerDay.toLocaleString()} FCFA</p>
                <p className="mt-1 text-sm text-slate-500">Tarif journalier</p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Boite</p>
                    <p className="mt-1 text-sm font-bold text-slate-900">{previewVehicle.transmission}</p>
                  </div>
                  <div className="border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Carburant</p>
                    <p className="mt-1 text-sm font-bold text-slate-900">{previewVehicle.fuelType}</p>
                  </div>
                  <div className="border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Places</p>
                    <p className="mt-1 text-sm font-bold text-slate-900">{previewVehicle.seats} places</p>
                  </div>
                  <div className="border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Note</p>
                    <p className="mt-1 text-sm font-bold text-slate-900">{previewVehicle.rating.toFixed(1)} / 5</p>
                  </div>
                </div>

                <p className="mt-6 text-sm leading-relaxed text-slate-600">{previewVehicle.description}</p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewVehicle(null);
                      navigate('/vehicles/' + previewVehicle.id);
                    }}
                    className="inline-flex items-center gap-2 bg-slate-950 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800"
                  >
                    Voir la fiche complete
                    <ArrowRight size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewVehicle(null)}
                    className="border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
