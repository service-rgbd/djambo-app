import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Search, Filter, MapPin, Star, ChevronDown, X, SlidersHorizontal,
  Car, Fuel, Users, Zap, CheckCircle2, ChevronLeft
} from 'lucide-react';
import { BrandLogo } from '../../components/BrandLogo';
import { PublicSiteHeader } from '../../components/PublicSiteHeader';
import { marketplaceVehicles } from '../../services/mockData';
import { MarketplaceVehicle, VehicleCategory, FuelType, SearchFilters } from '../../types';

const CITIES = ['Dakar', 'Abidjan', 'Bamako', 'Lomé', 'Cotonou', 'Conakry'];
const MAX_PRICE = 150000;

const defaultFilters: SearchFilters = {
  city: '', category: '', minPrice: 0, maxPrice: MAX_PRICE,
  fuelType: '', isForRent: true, isForSale: false, transmission: '',
};

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star key={s} size={12} className={s <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'} />
    ))}
  </div>
);

const VehicleCard = ({ v, onClick }: { v: MarketplaceVehicle; onClick: () => void }) => (
  <div onClick={onClick} className="bg-[#fcfbf8] rounded-[28px] border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer group overflow-hidden">
    <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
      <img src={v.images[0]?.url} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
      {v.isFeatured && (
        <span className="absolute top-3 left-3 bg-amber-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
          <Zap size={10} className="fill-white" /> En vedette
        </span>
      )}
      <span className={`absolute top-3 right-3 text-[11px] font-semibold px-2.5 py-1 rounded-full ${v.isAvailable ? 'bg-emerald-500 text-white' : 'bg-slate-700/80 text-slate-300'}`}>
        {v.isAvailable ? 'Disponible' : 'Indisponible'}
      </span>
    </div>

    <div className="p-5">
      <div className="flex items-start justify-between gap-2 mb-1">
        <h3 className="font-extrabold text-slate-900 text-base leading-snug line-clamp-1">{v.title}</h3>
        <div className="shrink-0 flex items-center gap-1">
          <StarRating rating={v.rating} />
          <span className="text-xs font-bold text-slate-700">{v.rating.toFixed(1)}</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
        <MapPin size={11} />
        <span>{v.city}</span>
        <span className="text-slate-300">·</span>
        <span>{v.category}</span>
        <span className="text-slate-300">·</span>
        <span>{v.seats} places</span>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <div>
          {v.isForRent && (
            <p className="text-slate-900 font-bold text-base">
              {v.pricePerDay.toLocaleString()} <span className="text-xs font-normal text-slate-500">FCFA/jour</span>
            </p>
          )}
          {v.isForSale && v.priceSale && (
            <p className="text-xs text-indigo-600 font-medium mt-0.5">
              Vente : {(v.priceSale / 1000000).toFixed(1)}M FCFA
            </p>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {v.ownerProfile.verified && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <CheckCircle2 size={9} /> Vérifié
            </span>
          )}
        </div>
      </div>
    </div>
  </div>
);

export const VehicleSearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState('FR');
  const [filters, setFilters] = useState<SearchFilters>({
    ...defaultFilters,
    city: searchParams.get('city') || '',
    category: (searchParams.get('category') as VehicleCategory) || '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'rating' | 'newest'>('rating');
  const [searchInput, setSearchInput] = useState(searchParams.get('city') || '');

  const filtered = useMemo(() => {
    let list = [...marketplaceVehicles];
    if (filters.city) list = list.filter(v => v.city.toLowerCase().includes(filters.city.toLowerCase()));
    if (filters.category) list = list.filter(v => v.category === filters.category);
    if (filters.fuelType) list = list.filter(v => v.fuelType === filters.fuelType);
    if (filters.transmission) list = list.filter(v => v.transmission === filters.transmission);
    if (filters.isForRent && !filters.isForSale) list = list.filter(v => v.isForRent);
    if (filters.isForSale && !filters.isForRent) list = list.filter(v => v.isForSale);
    list = list.filter(v => v.pricePerDay >= filters.minPrice && v.pricePerDay <= filters.maxPrice);

    if (sortBy === 'price_asc') list.sort((a, b) => a.pricePerDay - b.pricePerDay);
    else if (sortBy === 'price_desc') list.sort((a, b) => b.pricePerDay - a.pricePerDay);
    else if (sortBy === 'rating') list.sort((a, b) => b.rating - a.rating);
    else list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    return list;
  }, [filters, sortBy]);

  const setFilter = <K extends keyof SearchFilters>(key: K, val: SearchFilters[K]) =>
    setFilters(prev => ({ ...prev, [key]: val }));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilter('city', searchInput);
  };

  const activeFilterCount = [
    filters.city, filters.category, filters.fuelType, filters.transmission,
    filters.maxPrice < MAX_PRICE,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#f7f5f0] font-sans">
      <PublicSiteHeader
        theme="light"
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen((value) => !value)}
        navLinks={[{ label: 'La flotte', to: '/vehicles' }, { label: 'Accueil', to: '/' }, { label: 'OK Help', to: '#top' }]}
        activeLanguage={activeLanguage}
        onLanguageChange={setActiveLanguage}
        subtitle="L'app FleetCommand"
      />

      {/* Top bar */}
      <div className="bg-white/90 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4 pt-20">
          <div className="flex items-center gap-3 mb-4">
            <Link to="/" className="text-slate-400 hover:text-slate-700 shrink-0">
              <ChevronLeft size={20} />
            </Link>
            <BrandLogo size="sm" subtitle="L'app FleetCommand" />
            <div className="ml-auto hidden md:flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-[0.18em]">
              100% premium
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-[#fcfbf8] p-3 shadow-sm">
            <div className="flex items-center gap-3">

            <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2 bg-white rounded-2xl px-3 py-3 border border-slate-200">
              <Search size={16} className="text-slate-400 shrink-0" />
              <input
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Ville, marque, modèle..."
                className="bg-transparent flex-1 outline-none text-sm text-slate-700 placeholder-slate-400"
              />
              {searchInput && (
                <button type="button" onClick={() => { setSearchInput(''); setFilter('city', ''); }}>
                  <X size={14} className="text-slate-400 hover:text-slate-700" />
                </button>
              )}
            </form>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl border text-sm font-semibold transition-all shrink-0 ${showFilters || activeFilterCount > 0 ? 'bg-slate-950 text-white border-slate-950' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'}`}
            >
              <SlidersHorizontal size={15} />
              Filtres
              {activeFilterCount > 0 && (
                <span className={`text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center ${showFilters ? 'bg-white text-indigo-600' : 'bg-indigo-600 text-white'}`}>
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="border-t border-slate-100 bg-white px-4 py-4 max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {/* Category */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Catégorie</label>
                <select
                  value={filters.category}
                  onChange={e => setFilter('category', e.target.value as VehicleCategory | '')}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400 bg-white text-slate-700"
                >
                  <option value="">Toutes</option>
                  {Object.values(VehicleCategory).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Fuel */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Carburant</label>
                <select
                  value={filters.fuelType}
                  onChange={e => setFilter('fuelType', e.target.value as FuelType | '')}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400 bg-white text-slate-700"
                >
                  <option value="">Tous</option>
                  {Object.values(FuelType).map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>

              {/* Transmission */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Transmission</label>
                <select
                  value={filters.transmission}
                  onChange={e => setFilter('transmission', e.target.value as 'Manuelle' | 'Automatique' | '')}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400 bg-white text-slate-700"
                >
                  <option value="">Toutes</option>
                  <option value="Automatique">Automatique</option>
                  <option value="Manuelle">Manuelle</option>
                </select>
              </div>

              {/* Price */}
              <div className="col-span-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
                  Prix max : {filters.maxPrice.toLocaleString()} FCFA/jour
                </label>
                <input
                  type="range" min={0} max={MAX_PRICE} step={5000}
                  value={filters.maxPrice}
                  onChange={e => setFilter('maxPrice', Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              {/* Type */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Type</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setFilter('isForRent', true); setFilter('isForSale', false); }}
                    className={`flex-1 text-xs py-2 rounded-lg border font-semibold transition-all ${filters.isForRent && !filters.isForSale ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                  >Location</button>
                  <button
                    onClick={() => { setFilter('isForSale', true); setFilter('isForRent', false); }}
                    className={`flex-1 text-xs py-2 rounded-lg border font-semibold transition-all ${filters.isForSale && !filters.isForRent ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                  >Vente</button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
              <button onClick={() => setFilters(defaultFilters)} className="text-sm text-slate-500 hover:text-slate-800 font-medium">
                Réinitialiser
              </button>
              <button onClick={() => setShowFilters(false)} className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
                Appliquer
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6 rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600 mb-2">Selection premium</p>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">Flotte garantie, filtres clairs, fiches plus credibles.</h1>
          <p className="text-sm text-slate-600 max-w-3xl">La recherche met en avant les modeles les plus desirables avec une lecture immediate du prix, de la disponibilite et du niveau de confiance.</p>
        </div>
        {/* Category pills */}
        <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
          {['', ...Object.values(VehicleCategory)].map(cat => (
            <button
              key={cat || 'all'}
              onClick={() => setFilter('category', cat as VehicleCategory | '')}
              className={`shrink-0 text-sm px-4 py-2 rounded-full border font-medium transition-all ${filters.category === cat ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}
            >
              {cat || 'Tous'}
            </button>
          ))}
        </div>

        {/* Results header */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-600">
            <span className="font-bold text-slate-900">{filtered.length}</span> véhicule{filtered.length !== 1 ? 's' : ''} trouvé{filtered.length !== 1 ? 's' : ''}
            {filters.city && <span className="text-slate-500"> à <span className="font-semibold text-slate-700">{filters.city}</span></span>}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 hidden sm:block">Trier :</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as typeof sortBy)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:border-indigo-400 bg-white text-slate-700"
            >
              <option value="rating">Mieux notés</option>
              <option value="price_asc">Prix croissant</option>
              <option value="price_desc">Prix décroissant</option>
              <option value="newest">Les plus récents</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map(v => (
              <React.Fragment key={v.id}>
                <VehicleCard v={v} onClick={() => { navigate(`/vehicles/${v.id}`); }} />
              </React.Fragment>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <Car size={28} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Aucun véhicule trouvé</h3>
            <p className="text-slate-500 text-sm max-w-xs">Modifiez vos filtres ou élargissez votre recherche pour voir plus de véhicules.</p>
            <button onClick={() => setFilters(defaultFilters)} className="mt-5 text-indigo-600 font-semibold text-sm hover:text-indigo-700">
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
