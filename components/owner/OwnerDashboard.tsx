import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Car, Calendar, TrendingUp, Star, Plus, Edit3, Trash2,
  MapPin, Eye, Clock, CheckCircle2, ChevronDown, ChevronRight, Loader2, Warehouse, BellRing, MessageSquareText
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Parking, UserRole } from '../../types';
import { api, OwnerDashboardResponse } from '../../services/api';

const defaultReleaseTime = '10:00';

const StatCard: React.FC<{
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
  bg: string;
}> = ({ icon: Icon, label, value, color, bg }) => (
  <div className="bg-white border border-slate-200 p-5">
    <div className={`w-10 h-10 ${bg} flex items-center justify-center mb-3`}>
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
  return <span className={'text-xs font-bold px-2.5 py-1 ' + s.class}>{s.label}</span>;
};

export const OwnerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<OwnerDashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedParkingId, setExpandedParkingId] = useState<string | null>(null);
  const [requestActionId, setRequestActionId] = useState<string | null>(null);
  const [notificationActionId, setNotificationActionId] = useState<string | null>(null);

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
        setExpandedParkingId(response.parkings[0]?.id || null);
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
    latitude: parking.latitude,
    longitude: parking.longitude,
    locationConfirmedAt: parking.location_confirmed_at,
    locationUpdatedAt: parking.location_updated_at,
    locationEditableAfter: parking.location_editable_after,
    accessType: parking.access_type,
    openingHours: parking.opening_hours,
    securityFeatures: parking.security_features,
    capacityTotal: parking.capacity_total,
    vehicleCount: parking.vehicle_count,
    availableSpots: parking.available_spots,
  }));
  const unassignedVehicles = myVehicles.filter((vehicle) => !vehicle.parkingId);
  const parkingSections = (data?.parkings ?? []).map((parking) => ({
    ...parking,
    vehicles: Array.isArray(parking.vehicles) ? parking.vehicles : [],
  }));

  const formatAvailability = (occupiedUntil: string | null, nextAvailabilityTime: string | null) => {
    if (!occupiedUntil) {
      return 'Disponible maintenant';
    }

    return `Disponible le ${new Date(occupiedUntil).toLocaleDateString('fr-FR')} a ${nextAvailabilityTime || defaultReleaseTime}`;
  };

  const formatEditableAfter = (value?: string | null) => {
    if (!value) {
      return 'modifiable maintenant';
    }

    const date = new Date(value);
    return date.getTime() > Date.now()
      ? `modifiable le ${date.toLocaleDateString('fr-FR')}`
      : 'modifiable maintenant';
  };

  const requestBadge = (request: OwnerDashboardResponse['requestInbox'][number]) => {
    const accent = request.booking_channel === 'ON_SITE'
      ? 'bg-amber-100 text-amber-700'
      : request.offered_price
        ? 'bg-emerald-100 text-emerald-700'
        : 'bg-indigo-100 text-indigo-700';
    const label = request.booking_channel === 'ON_SITE'
      ? 'Sur place'
      : request.offered_price
        ? 'Offre'
        : 'Direct';

    return <span className={`px-2.5 py-1 text-[11px] font-bold ${accent}`}>{label}</span>;
  };

  const handleRequestUpdate = async (requestId: string, status: 'CONTACTED' | 'APPROVED' | 'REJECTED') => {
    const responseMessage = window.prompt('Message de reponse a envoyer au client (optionnel) :', '') || '';

    try {
      setRequestActionId(requestId);
      const updatedRequest = await api.updateVehicleRequest(requestId, { status, responseMessage });
      setData((current) => current ? {
        ...current,
        requestInbox: current.requestInbox.map((request) => request.id === requestId ? {
          ...request,
          status: updatedRequest.status,
          response_message: updatedRequest.responseMessage ?? null,
          responded_at: updatedRequest.respondedAt ?? null,
          responded_by_user_id: updatedRequest.respondedByUserId ?? null,
        } : request),
      } : current);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Impossible de repondre a la demande.');
    } finally {
      setRequestActionId(null);
    }
  };

  const handleNotificationRead = async (notificationId: string) => {
    try {
      setNotificationActionId(notificationId);
      const updated = await api.markNotificationRead(notificationId);
      setData((current) => current ? {
        ...current,
        notifications: current.notifications.map((notification) => notification.id === notificationId ? {
          ...notification,
          isRead: updated.isRead,
          readAt: updated.readAt ?? null,
        } : notification),
      } : current);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Impossible de marquer la notification comme lue.');
    } finally {
      setNotificationActionId(null);
    }
  };

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
          <div className="mb-6 border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
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
              <span className={`text-xs font-bold px-3 py-1 ${isParcAuto ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}>
                {isParcAuto ? 'Agence Professionnelle' : 'Proprietaire particulier'}
              </span>
              <span>·</span>
              <MapPin size={13} />
              <span>{ownerProfile.city}, {ownerProfile.country}</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/app/vehicles?new=1')}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 font-bold text-sm hover:bg-indigo-700 transition-colors"
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
              <h2 className="text-lg font-bold text-slate-900">Mes voitures</h2>
              <Link to={'/profile/' + ownerProfile.id} className="text-sm text-indigo-600 font-semibold flex items-center gap-1 hover:underline">
                Voir mon profil <ChevronRight size={14} />
              </Link>
            </div>

            {myVehicles.length > 0 ? (
              <div className="grid gap-4 xl:grid-cols-2">
                {myVehicles.map(v => (
                  <article key={v.id} className="overflow-hidden border border-slate-200 bg-white transition-colors hover:border-slate-300">
                    <div className="aspect-[16/10] bg-slate-100">
                      <img
                        src={v.imageUrl || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=900&q=80&auto=format&fit=crop'}
                        alt={v.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-slate-900 text-base line-clamp-1">{v.title}</h3>
                          <p className="mt-1 text-sm text-slate-500">{v.city} • {v.parkingName || 'Sans affectation parking'}</p>
                        </div>
                        <span className={`shrink-0 px-3 py-1 text-[11px] font-bold ${v.occupiedUntil ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {v.occupiedUntil ? 'Occupee' : 'Disponible'}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                        <MapPin size={10} /> {v.city}
                        <span className="text-slate-200">·</span>
                        <Star size={10} className="text-amber-400 fill-amber-400" />
                        {v.rating.toFixed(1)} ({v.reviewCount} avis)
                        <span className="text-slate-200">·</span>
                        <Eye size={10} /> {v.viewCount} vues
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="bg-slate-50 px-4 py-3 border border-slate-200">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Tarif</p>
                          <p className="mt-1 text-sm font-bold text-slate-900">{v.pricePerDay.toLocaleString()} FCFA / jour</p>
                        </div>
                        <div className="bg-slate-50 px-4 py-3 border border-slate-200">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Disponibilite</p>
                          <p className="mt-1 text-sm font-bold text-slate-900">{formatAvailability(v.occupiedUntil, v.nextAvailabilityTime)}</p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-sm text-slate-500">Reservation anticipee {v.occupiedUntil ? 'possible' : 'ouverte immediatement'}</span>
                        <div className="flex items-center gap-3">
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
                  </article>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-dashed border-slate-200 p-10 text-center">
                <Car size={36} className="text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm mb-4">Vous n'avez pas encore de vehicule liste.</p>
                <button
                  onClick={() => navigate('/app/vehicles?new=1')}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 font-bold text-sm hover:bg-indigo-700 transition-colors mx-auto"
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
                    <div key={b.id} className="bg-white border border-slate-200 p-4">
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
              <div className="bg-white border border-slate-200 p-6 text-center">
                <Calendar size={28} className="text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">Aucune reservation pour l'instant.</p>
              </div>
            )}

            {/* Tips card */}
            <div className="mt-4 bg-indigo-600 p-4 text-white">
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

            <div className="mt-4 bg-white border border-slate-200 p-4">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900 mb-3">
                <Warehouse size={16} className="text-indigo-600" /> Parkings
              </div>
              <div className="space-y-3">
                {myParkings.map((parking) => (
                  <div key={parking.id} className="border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{parking.name}</p>
                        <p className="text-xs text-slate-500 mt-1">{parking.city} • {parking.address}</p>
                        <p className="mt-2 text-[11px] text-slate-500">
                          {parking.locationConfirmedAt ? 'Adresse confirmee' : 'Adresse a confirmer'} • {formatEditableAfter(parking.locationEditableAfter)}
                        </p>
                      </div>
                      <span className="bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700">
                        {parking.availableSpots}/{parking.capacityTotal} places libres
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-600">
                      <span className="bg-white px-2.5 py-1 border border-slate-200">{parking.vehicleCount} vehicule(s)</span>
                      {parking.accessType && <span className="bg-white px-2.5 py-1 border border-slate-200">Acces {parking.accessType}</span>}
                      {parking.openingHours && <span className="bg-white px-2.5 py-1 border border-slate-200">{parking.openingHours}</span>}
                    </div>
                  </div>
                ))}
                {unassignedVehicles.length > 0 && (
                  <div className="border border-dashed border-slate-200 bg-white p-3 text-sm text-slate-600">
                    {unassignedVehicles.length} voiture(s) sans affectation parking.
                  </div>
                )}
                {myParkings.length === 0 && (
                  <p className="text-sm text-slate-500">Aucun parking n'est encore configure.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {myParkings.length > 0 && (
          <section className="mt-8 border border-slate-200 bg-white p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Parcs auto</p>
                <h2 className="mt-2 text-xl font-extrabold text-slate-950">Verifier exactement ce que contient chaque parc.</h2>
                <p className="mt-2 max-w-2xl text-sm text-slate-500">Chaque parc affiche ses voitures, leur statut, leur prochaine heure de remise a disposition et la possibilite de reserver en avance.</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {parkingSections.map((parking) => {
                const isExpanded = expandedParkingId === parking.id;
                return (
                  <article key={parking.id} className="overflow-hidden border border-slate-200 bg-slate-50">
                    <button
                      type="button"
                      onClick={() => setExpandedParkingId(isExpanded ? null : parking.id)}
                      className="flex w-full items-center justify-between gap-4 bg-white px-5 py-4 text-left"
                    >
                      <div>
                        <p className="text-base font-extrabold text-slate-950">{parking.name}</p>
                        <p className="mt-1 text-sm text-slate-500">{parking.city} • {parking.address}</p>
                        <p className="mt-2 text-[11px] font-semibold text-slate-500">
                          {parking.location_confirmed_at ? 'Adresse confirmee' : 'Adresse a confirmer'} • {formatEditableAfter(parking.location_editable_after)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                          {parking.vehicles.length} voiture(s)
                        </span>
                        <ChevronDown size={18} className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-slate-200 p-5">
                        <div className="mb-4 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-600">
                          <span className="bg-white px-3 py-1 border border-slate-200">{parking.available_spots}/{parking.capacity_total} places libres</span>
                          {parking.access_type && <span className="bg-white px-3 py-1 border border-slate-200">Acces {parking.access_type}</span>}
                          {parking.opening_hours && <span className="bg-white px-3 py-1 border border-slate-200">{parking.opening_hours}</span>}
                          {parking.latitude !== null && parking.longitude !== null && (
                            <span className="bg-white px-3 py-1 border border-slate-200">{parking.latitude}, {parking.longitude}</span>
                          )}
                        </div>

                        {parking.vehicles.length > 0 ? (
                          <div className="grid gap-4 xl:grid-cols-2">
                            {parking.vehicles.map((vehicle) => (
                              <div key={vehicle.id} className="overflow-hidden border border-slate-200 bg-white">
                                <div className="grid md:grid-cols-[140px_1fr]">
                                  <div className="min-h-[140px] bg-slate-100">
                                    <img
                                      src={vehicle.imageUrl || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=900&q=80&auto=format&fit=crop'}
                                      alt={vehicle.title}
                                      className="h-full w-full object-cover"
                                      loading="lazy"
                                    />
                                  </div>
                                  <div className="p-4">
                                    <div className="flex items-start justify-between gap-3">
                                      <div>
                                        <p className="text-sm font-extrabold text-slate-950">{vehicle.title}</p>
                                        <p className="mt-1 text-xs text-slate-500">{vehicle.city} • {vehicle.pricePerDay.toLocaleString()} FCFA / jour</p>
                                      </div>
                                      <span className={`px-2.5 py-1 text-[10px] font-bold ${vehicle.occupiedUntil ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                        {vehicle.occupiedUntil ? 'Occupee' : 'Disponible'}
                                      </span>
                                    </div>

                                    <div className="mt-4 space-y-2 text-sm text-slate-600">
                                      <p>{formatAvailability(vehicle.occupiedUntil, vehicle.nextAvailabilityTime)}</p>
                                      <p className="text-xs text-slate-500">Reservation en avance {vehicle.occupiedUntil ? 'possible des maintenant' : 'ouverte'}.</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500">Aucune voiture n est actuellement affectee a ce parc.</p>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        )}

        <section className="mt-8 grid gap-6 xl:grid-cols-3">
          <div className="border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Demandes et offres</p>
                <h2 className="mt-2 text-lg font-extrabold text-slate-950">Tout remonte dans votre espace.</h2>
              </div>
              <MessageSquareText size={18} className="text-indigo-600" />
            </div>
            <div className="mt-5 space-y-3">
              {(data.requestInbox ?? []).length > 0 ? data.requestInbox.map((request) => (
                <article key={request.id} className="border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{request.vehicle_title}</p>
                      <p className="mt-1 text-xs text-slate-500">{request.customer_name} • {new Date(request.created_at).toLocaleDateString('fr-FR')}</p>
                    </div>
                    {requestBadge(request)}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-600">
                    <span className="border border-slate-200 bg-white px-2.5 py-1">{request.request_type === 'BUY' ? 'Achat' : 'Location'}</span>
                    {request.estimated_total !== null && <span className="border border-slate-200 bg-white px-2.5 py-1">{request.estimated_total.toLocaleString()} FCFA</span>}
                    {request.offered_price !== null && <span className="border border-slate-200 bg-white px-2.5 py-1">Offre {request.offered_price.toLocaleString()} FCFA</span>}
                    {request.contact_preference && <span className="border border-slate-200 bg-white px-2.5 py-1">Contact {request.contact_preference}</span>}
                  </div>
                  {(request.message || request.customer_phone) && (
                    <div className="mt-3 space-y-1 text-xs text-slate-600">
                      {request.customer_phone && <p>Telephone: {request.customer_phone}</p>}
                      {request.identity_number && <p>Piece: {request.identity_number}</p>}
                      {request.license_number && <p>Permis: {request.license_number}</p>}
                      {request.message && <p className="italic">"{request.message}"</p>}
                    </div>
                  )}
                  {(request.response_message || request.responded_at) && (
                    <div className="mt-3 border-t border-slate-200 pt-3 text-xs text-slate-600">
                      {request.response_message && <p>Reponse: {request.response_message}</p>}
                      {request.responded_at && <p className="mt-1 text-slate-500">Mis a jour le {new Date(request.responded_at).toLocaleString('fr-FR')}</p>}
                    </div>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleRequestUpdate(request.id, 'CONTACTED')}
                      disabled={requestActionId === request.id}
                      className="border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-700 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Contacter
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRequestUpdate(request.id, 'APPROVED')}
                      disabled={requestActionId === request.id}
                      className="bg-emerald-600 px-3 py-2 text-[11px] font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Accepter
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRequestUpdate(request.id, 'REJECTED')}
                      disabled={requestActionId === request.id}
                      className="bg-rose-600 px-3 py-2 text-[11px] font-bold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Refuser
                    </button>
                  </div>
                </article>
              )) : (
                <p className="text-sm text-slate-500">Aucune demande, aucun message ou aucune offre pour le moment.</p>
              )}
            </div>
          </div>

          <div className="border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Avis recus</p>
                <h2 className="mt-2 text-lg font-extrabold text-slate-950">Les retours clients restent visibles ici.</h2>
              </div>
              <Star size={18} className="text-amber-500" />
            </div>
            <div className="mt-5 space-y-3">
              {(data.reviewFeed ?? []).length > 0 ? data.reviewFeed.map((review) => (
                <article key={review.id} className="border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{review.user_name}</p>
                      <p className="mt-1 text-xs text-slate-500">{review.vehicle_title}</p>
                    </div>
                    <span className="bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-700">{review.rating}/5</span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{review.comment}</p>
                </article>
              )) : (
                <p className="text-sm text-slate-500">Aucun avis recu pour l instant.</p>
              )}
            </div>
          </div>

          <div className="border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Notifications</p>
                <h2 className="mt-2 text-lg font-extrabold text-slate-950">Reservations, avis et demandes.</h2>
              </div>
              <BellRing size={18} className="text-indigo-600" />
            </div>
            <div className="mt-5 space-y-3">
              {(data.notifications ?? []).length > 0 ? data.notifications.map((notification) => (
                <article key={notification.id} className={`border p-4 ${notification.isRead ? 'border-slate-200 bg-slate-50' : 'border-indigo-200 bg-indigo-50/60'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{notification.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{notification.detail}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-semibold text-slate-400">{new Date(notification.createdAt).toLocaleDateString('fr-FR')}</span>
                      {!notification.isRead && (
                        <button
                          type="button"
                          onClick={() => handleNotificationRead(notification.id)}
                          disabled={notificationActionId === notification.id}
                          className="mt-2 block text-[11px] font-bold text-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Marquer comme lue
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              )) : (
                <p className="text-sm text-slate-500">Aucune notification recente.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
