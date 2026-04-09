import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Car, Calendar, TrendingUp, Star, Plus, Edit3, Trash2,
  MapPin, Eye, Clock, CheckCircle2, ChevronRight, Loader2, Warehouse
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Parking, UserRole } from '../../types';
import { api } from '../../services/api';

const StatCard: React.FC<{
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
  bg: string;
}> = ({ icon: Icon, label, value, color, bg }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
    <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
      <Icon size={18} className={color} />
    </div>
    <p className="text-2xl font-extrabold text-slate-900 mb-0.5">{value}</p>
    <p className="text-sm text-slate-500">{label}</p>
  </div>
);

const statusBadge = (status: string) => {
  const map: Record<string, { label: string; class: string }> = {
    CONFIRMED: { label: 'Confirme', class: 'bg-emerald-100 text-emerald-700' },
    PENDING: { label: 'En attente', class: 'bg-amber-100 text-amber-700' },
    CANCELLED: { label: 'Annule', class: 'bg-red-100 text-red-600' },
    COMPLETED: { label: 'Termine', class: 'bg-slate-100 text-slate-600' },
  };
  const s = map[status] || { label: status, class: 'bg-slate-100 text-slate-600' };
  return <span className={'text-xs font-bold px-2.5 py-1 rounded-full ' + s.class}>{s.label}</span>;
};

export const OwnerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<{
    ownerProfile: {
      id: string;
      userId: string;
      displayName: string;
      city: string;
      country: string;
      responseTime: string;
      rating: number;
      reviewCount: number;
      vehicleCount: number;
      verified: boolean;
      type: UserRole;
    } | null;
    stats: {
      listedVehicles: number;
      activeBookings: number;
      totalRevenue: number;
      averageRating: number;
    } | null;
    vehicles: Array<{
      id: string;
      title: string;
      city: string;
      pricePerDay: number;
      rating: number;
      reviewCount: number;
      viewCount: number;
      isAvailable: boolean;
      occupiedUntil: string | null;
      parkingName: string | null;
      imageUrl: string | null;
    }>;
    recentBookings: Array<{
      id: string;
      vehicle_id: string;
      user_id: string;
      start_date: string;
      end_date: string;
      total_price: number;
      status: string;
      message?: string;
      vehicle_title: string;
      renter_name: string;
    }>;
    parkings: Array<{
      id: string;
      name: string;
      city: string;
      address: string;
      access_type?: string;
      opening_hours?: string;
      security_features?: string[];
      capacity_total: number;
      vehicle_count: number;
      available_spots: number;
    }>;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const isParcAuto = user?.role === UserRole.PARC_AUTO;

  useEffect(() => {
    let isMounted = true;

    const loadOwnerDashboard = async () => {
      try {
        setIsLoading(true);
        const response = await api.getOwnerDashboard();
        if (!isMounted) {
          return;
        }
        setData(response);
        setError('');
      } catch (loadError) {
        if (!isMounted) {
          return;
        }
        setError('Impossible de charger le dashboard proprietaire.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadOwnerDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const ownerProfile = data?.ownerProfile;
  const myVehicles = data?.vehicles ?? [];
  const myBookings = data?.recentBookings ?? [];
  const myParkings: Parking[] = (data?.parkings ?? []).map((parking) => ({
    id: parking.id,
    name: parking.name,
    city: parking.city,
    address: parking.address,
    accessType: parking.access_type,
    openingHours: parking.opening_hours,
    securityFeatures: parking.security_features,
    capacityTotal: parking.capacity_total,
    vehicleCount: parking.vehicle_count,
    availableSpots: parking.available_spots,
  }));

  if (isLoading) {
    return (
      <div className="min-h-[360px] flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 size={20} className="animate-spin text-indigo-600" />
          <span>Chargement du dashboard proprietaire...</span>
        </div>
      </div>
    );
  }

  if (!ownerProfile || !data?.stats) {
    return (
      <div className="min-h-[360px] rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <Warehouse size={32} className="mx-auto mb-4 text-slate-300" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Aucun profil proprietaire actif</h2>
        <p className="text-sm text-slate-500 mb-6">Connectez-vous avec un compte particulier ou parc auto pour administrer vos vehicules et parkings.</p>
        {error && <p className="text-sm text-rose-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {error}
          </div>
        )}

        {/* Welcome header */}
        <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 mb-1">
              Bonjour, {user?.name?.split(' ')[0]} 
            </h1>
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${isParcAuto ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}>
                {isParcAuto ? 'Agence Professionnelle' : 'Proprietaire particulier'}
              </span>
              <span>·</span>
              <MapPin size={13} />
              <span>{ownerProfile.city}, {ownerProfile.country}</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/vehicles/new')}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus size={16} /> Ajouter un vehicule
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Car}
            label="Vehicules listes"
            value={data.stats.listedVehicles}
            color="text-indigo-600"
            bg="bg-indigo-50"
          />
          <StatCard
            icon={Calendar}
            label="Reservations actives"
            value={data.stats.activeBookings}
            color="text-amber-600"
            bg="bg-amber-50"
          />
          <StatCard
            icon={TrendingUp}
            label="Revenus totaux"
            value={data.stats.totalRevenue > 0 ? data.stats.totalRevenue.toLocaleString() + ' FCFA' : '—'}
            color="text-emerald-600"
            bg="bg-emerald-50"
          />
          <StatCard
            icon={Star}
            label="Note moyenne"
            value={data.stats.averageRating.toFixed(1) + ' / 5'}
            color="text-amber-600"
            bg="bg-amber-50"
          />
        </div>

        <div className="grid lg:grid-cols-[1fr_340px] gap-6">

          {/* My vehicles */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Mes vehicules</h2>
              <Link to={'/profile/' + ownerProfile.id} className="text-sm text-indigo-600 font-semibold flex items-center gap-1 hover:underline">
                Voir mon profil <ChevronRight size={14} />
              </Link>
            </div>

            {myVehicles.length > 0 ? (
              <div className="space-y-3">
                {myVehicles.map(v => (
                  <div key={v.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex">
                    <div className="w-28 sm:w-36 shrink-0 bg-slate-100">
                      <img
                        src={v.imageUrl || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=900&q=80&auto=format&fit=crop'}
                        alt={v.title}
                        className="w-full h-full object-cover"
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
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                        <MapPin size={10} /> {v.city}
                        <span className="text-slate-200">·</span>
                        <Star size={10} className="text-amber-400 fill-amber-400" />
                        {v.rating.toFixed(1)} ({v.reviewCount} avis)
                        <span className="text-slate-200">·</span>
                        <Eye size={10} /> {v.viewCount} vues
                      </div>
                      <div className="mb-3 flex flex-wrap gap-2 text-[11px]">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-600">
                          Parking: {v.parkingName || 'Non assigne'}
                        </span>
                        <span className={`rounded-full px-2.5 py-1 font-semibold ${v.occupiedUntil ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {v.occupiedUntil ? `Occupe jusqu'au ${new Date(v.occupiedUntil).toLocaleDateString('fr-FR')}` : 'Disponible maintenant'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm">
                          {v.pricePerDay.toLocaleString()} FCFA<span className="font-normal text-slate-500">/j</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate('/vehicles/' + v.id)}
                            className="flex items-center gap-1 text-xs text-indigo-600 font-semibold hover:underline"
                          >
                            <Edit3 size={12} /> Modifier
                          </button>
                          <button className="flex items-center gap-1 text-xs text-red-400 font-semibold hover:underline">
                            <Trash2 size={12} /> Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center">
                <Car size={36} className="text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm mb-4">Vous n'avez pas encore de vehicule liste.</p>
                <button
                  onClick={() => navigate('/vehicles/new')}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors mx-auto"
                >
                  <Plus size={15} /> Publier mon premier vehicule
                </button>
              </div>
            )}
          </div>

          {/* Recent bookings sidebar */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Reservations recentes</h2>

            {myBookings.length > 0 ? (
              <div className="space-y-3">
                {myBookings.map(b => {
                  return (
                    <div key={b.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 text-sm line-clamp-1">{b.vehicle_title || 'Vehicule'}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{b.renter_name}</p>
                        </div>
                        {statusBadge(b.status)}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
                        <div className="flex items-center gap-1">
                          <Calendar size={11} />
                          <span>{new Date(b.start_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                        </div>
                        <span>—</span>
                        <span>{new Date(b.end_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                        <span className="ml-auto font-bold text-slate-800">{b.total_price.toLocaleString()} FCFA</span>
                      </div>
                      {b.message && (
                        <p className="text-xs text-slate-600 italic border-t border-slate-50 pt-2 line-clamp-2">"{b.message}"</p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center">
                <Calendar size={28} className="text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">Aucune reservation pour l'instant.</p>
              </div>
            )}

            {/* Tips card */}
            <div className="mt-4 bg-indigo-600 rounded-2xl p-4 text-white">
              <div className="flex items-center gap-2 font-bold text-sm mb-2">
                <CheckCircle2 size={15} /> Conseils pour plus de reservations
              </div>
              <ul className="space-y-1.5 text-xs text-indigo-100">
                <li>Ajoutez des photos de qualite</li>
                <li>Repondez rapidement aux messages</li>
                <li>Mettez a jour la disponibilite</li>
                <li>Demandez des avis apres chaque location</li>
              </ul>
            </div>

            <div className="mt-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900 mb-3">
                <Warehouse size={16} className="text-indigo-600" /> Parkings
              </div>
              <div className="space-y-3">
                {myParkings.map((parking) => (
                  <div key={parking.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{parking.name}</p>
                        <p className="text-xs text-slate-500 mt-1">{parking.city} • {parking.address}</p>
                      </div>
                      <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700">
                        {parking.availableSpots}/{parking.capacityTotal} places libres
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-600">
                      <span className="rounded-full bg-white px-2.5 py-1 border border-slate-200">{parking.vehicleCount} vehicule(s)</span>
                      {parking.accessType && <span className="rounded-full bg-white px-2.5 py-1 border border-slate-200">Acces {parking.accessType}</span>}
                      {parking.openingHours && <span className="rounded-full bg-white px-2.5 py-1 border border-slate-200">{parking.openingHours}</span>}
                    </div>
                  </div>
                ))}
                {myParkings.length === 0 && (
                  <p className="text-sm text-slate-500">Aucun parking n'est encore configure.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
