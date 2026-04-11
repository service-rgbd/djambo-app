import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, MarketplacePublicOwnerProfile, MarketplacePublicVehicle } from '../services/api';
import { FuelType } from '../types';
import { BrandLogo } from './BrandLogo';
import { 
  Car, Calendar, CheckCircle, MapPin, Star, Filter, 
  ArrowRight, Zap, Droplet, Battery, Gauge, X, Phone, Users 
} from 'lucide-react';

export const PublicStorefront: React.FC = () => {
  const { agencySlug } = useParams<{ agencySlug: string }>();
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
    const [ownerProfile, setOwnerProfile] = useState<MarketplacePublicOwnerProfile | null>(null);
    const [allVehicles, setAllVehicles] = useState<MarketplacePublicVehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let isMounted = true;

        const loadStorefront = async () => {
            if (!agencySlug) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await api.getStorefrontBySlug(agencySlug);
                if (!isMounted) {
                    return;
                }
                setOwnerProfile(response.ownerProfile);
                setAllVehicles(response.vehicles);
                setError('');
            } catch (loadError) {
                if (!isMounted) {
                    return;
                }
                setError(loadError instanceof Error ? loadError.message : 'Impossible de charger cette vitrine.');
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        void loadStorefront();

        return () => {
            isMounted = false;
        };
    }, [agencySlug]);

    const availableVehicles = allVehicles.filter((vehicle) => vehicle.isAvailable);
    const agencyName = ownerProfile?.displayName || (agencySlug ? agencySlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Agence');

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
        setSelectedVehicleId(null);
        setShowSuccess(true);
    }, 1000);
  };

    const getFuelIcon = (type: FuelType | string) => {
    switch (type) {
            case FuelType.Electric:
            case 'Electric':
            case 'Electrique':
            case 'Électrique':
                return <Zap size={14} className="text-yellow-500" />;
            case FuelType.Hybrid:
            case 'Hybrid':
            case 'Hybride':
                return <Battery size={14} className="text-emerald-500" />;
      default: return <Droplet size={14} className="text-blue-500" />;
    }
  };

  if (showSuccess) {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
                <CheckCircle className="text-emerald-600" size={40} />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Demande Envoyée !</h2>
            <p className="text-slate-600 max-w-md mb-8">
                L'agence <strong>{agencyName}</strong> a bien reçu votre demande de réservation. Ils vous contacteront très prochainement par téléphone pour confirmer.
            </p>
            <button 
                onClick={() => setShowSuccess(false)}
                className="px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
            >
                Retour au catalogue
            </button>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Public Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <BrandLogo size="sm" subtitle={agencyName} useFullLogo />
              <div>
                  <h1 className="text-xl font-bold text-slate-900 leading-none">{agencyName}</h1>
                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                      <MapPin size={10} />
                      <span>{ownerProfile?.city || 'Dakar'}, {ownerProfile?.country || 'Senegal'}</span>
                      <span className="mx-1">•</span>
                      <Star size={10} className="text-yellow-400 fill-yellow-400" />
                      <span>{ownerProfile ? `${ownerProfile.rating.toFixed(1)} (${ownerProfile.reviewCount} avis)` : 'Chargement...'}</span>
                  </div>
              </div>
           </div>
           
           <div className="hidden sm:flex items-center gap-4 text-sm font-medium text-slate-600">
               <a href="#" className="hover:text-slate-900">À propos</a>
               <Link to="/terms" className="hover:text-slate-900">Conditions</Link>
               <a href="#" className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">
                   <Phone size={16} className="inline mr-2" />
                   Contact
               </a>
           </div>
        </div>
      </header>

      {/* Hero / Filter Area */}
      <div className="bg-slate-900 text-white py-12 px-4">
          <div className="max-w-7xl mx-auto text-center">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Trouvez le véhicule parfait</h2>
              <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
                  Découvrez notre flotte de véhicules premium disponibles immédiatement. Réservation simple, rapide et sans frais cachés.
              </p>
              
              <div className="bg-white/10 backdrop-blur-md p-2 rounded-2xl inline-flex flex-wrap gap-2 max-w-full justify-center border border-white/20">
                  <button className="px-4 py-2 bg-white text-slate-900 rounded-xl font-bold text-sm shadow-lg">Tout voir</button>
                  <button className="px-4 py-2 hover:bg-white/10 rounded-xl font-medium text-sm transition-colors">SUV</button>
                  <button className="px-4 py-2 hover:bg-white/10 rounded-xl font-medium text-sm transition-colors">Berlines</button>
                  <button className="px-4 py-2 hover:bg-white/10 rounded-xl font-medium text-sm transition-colors">Électriques</button>
                  <button className="px-4 py-2 hover:bg-white/10 rounded-xl font-medium text-sm transition-colors flex items-center gap-2"><Filter size={14}/> Filtres</button>
              </div>
          </div>
      </div>

      {/* Vehicle Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
         {error && <div className="mb-6 border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">{error}</div>}
         {loading && <div className="mb-6 border border-slate-200 bg-white px-4 py-4 text-sm text-slate-500">Chargement de la vitrine...</div>}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {availableVehicles.map((vehicle) => (
                <div key={vehicle.id} className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                    <div className="h-48 relative overflow-hidden">
                        <img 
                            src={vehicle.images[0]?.url || ''} 
                            alt={`${vehicle.brand} ${vehicle.model}`} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-slate-800 shadow-sm">
                            {vehicle.year}
                        </div>
                    </div>
                    <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">{vehicle.brand} {vehicle.model}</h3>
                                <p className="text-sm text-slate-500">{vehicle.fuelType}</p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                                {getFuelIcon(vehicle.fuelType)}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 my-4 text-xs text-slate-600">
                             <div className="bg-slate-50 p-2 rounded-lg flex items-center gap-2">
                                 <Gauge size={14} className="text-slate-400" /> Auto
                             </div>
                             <div className="bg-slate-50 p-2 rounded-lg flex items-center gap-2">
                                 <Users size={14} className="text-slate-400" /> 5 Places
                             </div>
                        </div>

                        <div className="flex items-end justify-between border-t border-slate-100 pt-4 mt-2">
                             <div>
                                 <p className="text-xs text-slate-400 font-medium uppercase">À partir de</p>
                                 <p className="text-xl font-bold text-indigo-600">{vehicle.pricePerDay.toLocaleString()} <span className="text-sm text-slate-600 font-normal">F/jour</span></p>
                             </div>
                             <button 
                                onClick={() => setSelectedVehicleId(vehicle.id)}
                                className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white hover:bg-indigo-600 transition-colors shadow-lg"
                             >
                                 <ArrowRight size={20} />
                             </button>
                        </div>
                    </div>
                </div>
            ))}
         </div>
      </main>

      {/* Booking Modal */}
      {selectedVehicleId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl scale-100 animate-scale-up">
                <div className="relative h-32 bg-slate-900">
                    <img 
                        src={availableVehicles.find(v => v.id === selectedVehicleId)?.images[0]?.url || ''} 
                        className="w-full h-full object-cover opacity-50"
                    />
                    <button 
                        onClick={() => setSelectedVehicleId(null)}
                        className="absolute top-4 right-4 w-8 h-8 bg-black/20 text-white rounded-full flex items-center justify-center hover:bg-black/40 transition-colors"
                    >
                        <X size={18} />
                    </button>
                    <div className="absolute bottom-4 left-6 text-white">
                        <p className="text-sm opacity-80">Réserver</p>
                        <h3 className="text-2xl font-bold">
                            {availableVehicles.find(v => v.id === selectedVehicleId)?.brand} {availableVehicles.find(v => v.id === selectedVehicleId)?.model}
                        </h3>
                    </div>
                </div>

                <form onSubmit={handleBooking} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700 uppercase">Départ</label>
                            <input type="date" required className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-0 text-sm" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700 uppercase">Retour</label>
                            <input type="date" required className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-0 text-sm" />
                        </div>
                    </div>
                    
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 uppercase">Nom Complet</label>
                        <input type="text" placeholder="Ex: Jean Dupont" required className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-0 text-sm" />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 uppercase">Téléphone (WhatsApp)</label>
                        <input type="tel" placeholder="+221 ..." required className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-0 text-sm" />
                    </div>

                    <div className="pt-4">
                        <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2">
                            Envoyer la demande <ArrowRight size={18} />
                        </button>
                        <p className="text-xs text-center text-slate-400 mt-3">Aucun paiement requis pour le moment.</p>
                    </div>
                </form>
            </div>
        </div>
      )}

      <footer className="bg-slate-900 text-slate-500 py-8 text-center text-sm">
          <p>Propulse par <Link to="/" className="text-indigo-400 hover:text-white transition-colors">Djambo</Link></p>
      </footer>
    </div>
  );
};