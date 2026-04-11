import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FuelType, VehicleCategory } from '../types';
import { api, CreateOwnerVehiclePayload, OwnerInventoryVehicle, OwnerParkingSummary } from '../services/api';
import {
  Calendar,
  Car,
  Check,
  Droplet,
  Gauge,
  ImagePlus,
  Loader2,
  MapPin,
  Plus,
  Search,
  Trash2,
  Upload,
  Users,
  X,
  Zap,
} from 'lucide-react';

interface VehicleListProps {
  vehicles?: unknown[];
}

type VehicleFormState = CreateOwnerVehiclePayload;

const defaultVehicleState: VehicleFormState = {
  title: '',
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  category: VehicleCategory.BERLINE,
  fuelType: FuelType.Petrol,
  transmission: 'Automatique',
  seats: 5,
  pricePerDay: 30000,
  city: '',
  location: '',
  description: '',
  mileage: 0,
  color: '',
  isAvailable: true,
  parkingId: null,
  imageUrl: '',
};

const MAX_VEHICLE_IMAGE_SIZE_BYTES = 4 * 1024 * 1024;

export const VehicleList: React.FC<VehicleListProps> = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<OwnerInventoryVehicle[]>([]);
  const [filter, setFilter] = useState<string>('Tous');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newVehicle, setNewVehicle] = useState<VehicleFormState>(defaultVehicleState);
  const [uploadedImage, setUploadedImage] = useState<string>('');
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [parkings, setParkings] = useState<OwnerParkingSummary[]>([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadVehicles = async () => {
      try {
        setLoading(true);
        const [vehicleResponse, ownerDashboard] = await Promise.all([
          api.getOwnerVehicles(),
          api.getOwnerDashboard().catch(() => null),
        ]);
        if (!isMounted) {
          return;
        }
        setVehicles(vehicleResponse);
        setParkings(ownerDashboard?.parkings || []);
        setError('');
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : 'Impossible de charger vos voitures depuis le backend.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadVehicles();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('new') === '1') {
      setIsModalOpen(true);
      searchParams.delete('new');
      navigate({ pathname: location.pathname, search: searchParams.toString() }, { replace: true });
    }
  }, [location.pathname, location.search, navigate]);

  const filteredVehicles = useMemo(() => vehicles.filter((vehicle) => {
    const matchesFilter = filter === 'Tous'
      || (filter === 'Disponibles' && vehicle.isAvailable)
      || (filter === 'Occupes' && !vehicle.isAvailable);
    const term = search.toLowerCase();
    const matchesSearch = vehicle.brand.toLowerCase().includes(term)
      || vehicle.model.toLowerCase().includes(term)
      || vehicle.title.toLowerCase().includes(term)
      || vehicle.city.toLowerCase().includes(term);
    return matchesFilter && matchesSearch;
  }), [filter, search, vehicles]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (file.size > MAX_VEHICLE_IMAGE_SIZE_BYTES) {
      setError('Image trop lourde. Utilisez une image de 4 Mo maximum pour l ajout du vehicule.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setError('');
        setSelectedImageFile(file);
        setUploadedImage(reader.result);
        setNewVehicle((current) => ({ ...current, imageUrl: '' }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddVehicle = async () => {
    if (!newVehicle.title || !newVehicle.brand || !newVehicle.model || !newVehicle.city || !newVehicle.location || !newVehicle.description) {
      setError('Completez le titre, la marque, le modele, la ville, le point de retrait et la description.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      const uploadedImageUrl = selectedImageFile
        ? (await api.uploadVehicleImage(selectedImageFile)).url
        : (uploadedImage || newVehicle.imageUrl);

      const createdVehicle = await api.createOwnerVehicle({
        ...newVehicle,
        imageUrl: uploadedImageUrl,
      });
      setVehicles((current) => [createdVehicle, ...current]);
      setIsModalOpen(false);
      setNewVehicle(defaultVehicleState);
      setUploadedImage('');
      setSelectedImageFile(null);
      setError('');
      setNotice('Voiture ajoutee dans votre inventaire reel.');
      window.setTimeout(() => setNotice(''), 2200);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Ajout impossible pour le moment.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    try {
      setDeletingId(vehicleId);
      await api.deleteOwnerVehicle(vehicleId);
      setVehicles((current) => current.filter((vehicle) => vehicle.id !== vehicleId));
      setNotice('Voiture retiree de votre inventaire.');
      window.setTimeout(() => setNotice(''), 2200);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Suppression impossible pour le moment.');
    } finally {
      setDeletingId('');
    }
  };

  const getAvailabilityTone = (isAvailable: boolean) => (isAvailable
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : 'bg-amber-50 text-amber-700 border-amber-200');

  const getFuelIcon = (type: FuelType) => {
    switch (type) {
      case FuelType.Electric:
        return <Zap size={16} className="text-yellow-500" />;
      case FuelType.Hybrid:
        return <Zap size={16} className="text-emerald-500" />;
      default:
        return <Droplet size={16} className="text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Mes voitures</p>
              <h1 className="mt-2 text-2xl font-extrabold text-slate-950">Inventaire branche au backend, presentation plus nette.</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">Recherche, filtres et cartes ont ete resserres pour garder une lecture propre, meme quand les contenus sont longs ou varies.</p>
            </div>
            <div className="grid gap-3 md:grid-cols-[minmax(260px,1fr)_220px_auto] xl:min-w-[720px]">
              <label className="relative block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Marque, modele, ville..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition-colors focus:border-slate-950 focus:bg-white"
                />
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition-colors focus:border-slate-950 focus:bg-white"
              >
                <option value="Tous">Tous les etats</option>
                <option value="Disponibles">Disponibles</option>
                <option value="Occupes">Occupes</option>
              </select>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800"
              >
                <Plus size={16} />
                Ajouter un vehicule
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 border-b border-slate-200 bg-slate-50/70 px-6 py-5 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Total</p>
            <p className="mt-2 text-2xl font-extrabold text-slate-950">{vehicles.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Disponibles</p>
            <p className="mt-2 text-2xl font-extrabold text-slate-950">{vehicles.filter((vehicle) => vehicle.isAvailable).length}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Ticket moyen</p>
            <p className="mt-2 text-2xl font-extrabold text-slate-950">
              {vehicles.length > 0
                ? `${Math.round(vehicles.reduce((sum, vehicle) => sum + vehicle.pricePerDay, 0) / vehicles.length).toLocaleString()} FCFA`
                : '0 FCFA'}
            </p>
          </div>
        </div>

        {notice && (
          <div className="border-b border-emerald-100 bg-emerald-50 px-6 py-3 text-sm text-emerald-700">{notice}</div>
        )}

        {error && (
          <div className="border-b border-rose-100 bg-rose-50 px-6 py-3 text-sm text-rose-700">{error}</div>
        )}

        <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2 xl:grid-cols-3">
          {loading && (
            <div className="col-span-full flex items-center justify-center gap-3 border border-slate-200 bg-slate-50 px-6 py-16 text-sm text-slate-500">
              <Loader2 size={18} className="animate-spin text-slate-900" />
              Chargement de vos voitures...
            </div>
          )}

          {filteredVehicles.map((vehicle) => (
            <article key={vehicle.id} className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                <img src={vehicle.imageUrl || `https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1200&q=80`} alt={`${vehicle.brand} ${vehicle.model}`} className="h-full w-full object-cover" />
                <div className="absolute left-4 top-4 flex items-center gap-2">
                  <span className={`border px-3 py-1 text-[11px] font-bold ${getAvailabilityTone(vehicle.isAvailable)}`}>
                    {vehicle.isAvailable ? 'Vehicule libre' : 'Vehicule occupe'}
                  </span>
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 via-slate-950/25 to-transparent px-4 pb-4 pt-10 text-white">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">{vehicle.category}</p>
                  <h2 className="mt-1 text-lg font-extrabold">{vehicle.brand} {vehicle.model}</h2>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-white/80"><MapPin size={12} /> {vehicle.city} • {vehicle.location}</p>
                </div>
              </div>

              <div className="flex h-full flex-col bg-white p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">{vehicle.year} • {vehicle.transmission}</p>
                    <p className="mt-1 text-xl font-extrabold text-slate-950">{vehicle.pricePerDay.toLocaleString()} FCFA <span className="text-sm font-semibold text-slate-500">/ jour</span></p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center border border-slate-200 bg-slate-50">
                    {getFuelIcon(vehicle.fuelType as FuelType)}
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Kilometrage</p>
                    <p className="mt-1 inline-flex items-center gap-2 text-sm font-bold text-slate-800"><Gauge size={13} /> {vehicle.mileage.toLocaleString()} km</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Places</p>
                    <p className="mt-1 inline-flex items-center gap-2 text-sm font-bold text-slate-800"><Users size={13} /> {vehicle.seats} places</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Carburant</p>
                    <p className="mt-1 inline-flex items-center gap-2 text-sm font-bold text-slate-800">{getFuelIcon(vehicle.fuelType as FuelType)} {vehicle.fuelType}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  <span className="rounded-full bg-slate-100 px-3 py-1">{vehicle.transmission}</span>
                  {vehicle.parkingName && (
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-indigo-700">Parc auto {vehicle.parkingName}</span>
                  )}
                </div>

                <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-slate-600">{vehicle.description}</p>

                <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Retrait</p>
                    <p className="mt-1 text-sm font-bold text-slate-900">{vehicle.location}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleDeleteVehicle(vehicle.id)}
                    disabled={deletingId === vehicle.id}
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
                  >
                    {deletingId === vehicle.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    Retirer
                  </button>
                </div>
              </div>
            </article>
          ))}

          {!loading && filteredVehicles.length === 0 && (
            <div className="col-span-full border border-dashed border-slate-200 bg-white py-14 text-center text-slate-500">
              <Car className="mx-auto mb-3 text-slate-300" size={42} />
              <p>Aucun vehicule ne correspond aux filtres actuels.</p>
            </div>
          )}
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[92vh] w-full max-w-4xl overflow-auto bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-6">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Nouveau vehicule</p>
                <h2 className="mt-1 text-xl font-extrabold text-slate-950">Ajouter une voiture dans votre inventaire reel</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="border border-slate-200 p-2 text-slate-500 hover:bg-slate-50">
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-6 p-6 lg:grid-cols-[1fr_0.9fr]">
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700">Titre commercial</span>
                    <input className="w-full border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-950" value={newVehicle.title} onChange={(e) => setNewVehicle({ ...newVehicle, title: e.target.value })} />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700">Marque</span>
                    <input className="w-full border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-950" value={newVehicle.brand} onChange={(e) => setNewVehicle({ ...newVehicle, brand: e.target.value })} />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700">Modele</span>
                    <input className="w-full border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-950" value={newVehicle.model} onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })} />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700">Annee</span>
                    <input type="number" className="w-full border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-950" value={newVehicle.year} onChange={(e) => setNewVehicle({ ...newVehicle, year: Number(e.target.value) || new Date().getFullYear() })} />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700">Categorie</span>
                    <select className="w-full border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-950" value={newVehicle.category} onChange={(e) => setNewVehicle({ ...newVehicle, category: e.target.value })}>
                      {Object.values(VehicleCategory).map((category) => <option key={category} value={category}>{category}</option>)}
                    </select>
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700">Carburant</span>
                    <select className="w-full border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-950" value={newVehicle.fuelType} onChange={(e) => setNewVehicle({ ...newVehicle, fuelType: e.target.value as FuelType })}>
                      {Object.values(FuelType).map((fuel) => <option key={fuel} value={fuel}>{fuel}</option>)}
                    </select>
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700">Kilometrage</span>
                    <input type="number" className="w-full border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-950" value={newVehicle.mileage} onChange={(e) => setNewVehicle({ ...newVehicle, mileage: Number(e.target.value) || 0 })} />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700">Prix / jour</span>
                    <input type="number" className="w-full border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-950" value={newVehicle.pricePerDay} onChange={(e) => setNewVehicle({ ...newVehicle, pricePerDay: Number(e.target.value) || 0 })} />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700">Ville</span>
                    <input className="w-full border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-950" value={newVehicle.city} onChange={(e) => setNewVehicle({ ...newVehicle, city: e.target.value })} />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700">Point de retrait</span>
                    <input className="w-full border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-950" value={newVehicle.location} onChange={(e) => setNewVehicle({ ...newVehicle, location: e.target.value })} />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700">Transmission</span>
                    <select className="w-full border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-950" value={newVehicle.transmission} onChange={(e) => setNewVehicle({ ...newVehicle, transmission: e.target.value as 'Manuelle' | 'Automatique' })}>
                      <option value="Automatique">Automatique</option>
                      <option value="Manuelle">Manuelle</option>
                    </select>
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700">Places</span>
                    <input type="number" className="w-full border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-950" value={newVehicle.seats} onChange={(e) => setNewVehicle({ ...newVehicle, seats: Number(e.target.value) || 1 })} />
                  </label>
                </div>

                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-700">Affectation parking</span>
                  <select
                    className="w-full border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-950"
                    value={newVehicle.parkingId || ''}
                    onChange={(e) => setNewVehicle({ ...newVehicle, parkingId: e.target.value || null })}
                  >
                    <option value="">Sans affectation pour le moment</option>
                    {parkings.map((parking) => (
                      <option key={parking.id} value={parking.id}>
                        {parking.name} - {parking.city} ({parking.available_spots} place(s) libre(s))
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500">
                    {parkings.length > 0
                      ? 'Choisissez le parc auto de destination pour que la voiture apparaisse directement au bon endroit dans le dashboard.'
                      : 'Aucun parking charge. La voiture sera creee sans affectation tant qu aucun parc auto n est disponible.'}
                  </p>
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-700">Description</span>
                  <textarea className="min-h-[120px] w-full border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-950" value={newVehicle.description} onChange={(e) => setNewVehicle({ ...newVehicle, description: e.target.value })} />
                </label>
              </div>

              <div className="space-y-4">
                <div className="border border-dashed border-slate-300 bg-slate-50 p-4">
                  <label className="flex cursor-pointer flex-col items-center justify-center gap-3 border border-slate-200 bg-white px-4 py-6 text-center">
                    <div className="flex h-12 w-12 items-center justify-center bg-slate-100 text-slate-700">
                      <Upload size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Uploader une photo du vehicule</p>
                      <p className="mt-1 text-sm text-slate-500">Cette image sera reprise directement dans la carte inventaire.</p>
                    </div>
                    <span className="inline-flex items-center gap-2 border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
                      <ImagePlus size={16} />
                      Choisir une image
                    </span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>

                <div className="overflow-hidden border border-slate-200 bg-white">
                  {uploadedImage ? (
                    <img src={uploadedImage} alt="Apercu du vehicule" className="h-64 w-full object-cover" />
                  ) : (
                    <div className="flex h-64 items-center justify-center bg-slate-100 text-sm text-slate-400">
                      Apercu image
                    </div>
                  )}
                </div>

                <label className="flex items-center justify-between border border-slate-200 bg-slate-50 px-4 py-4">
                  <span>
                    <span className="block text-sm font-bold text-slate-900">Disponibilite immediate</span>
                    <span className="mt-1 block text-sm text-slate-500">Permet d afficher cette voiture comme libre.</span>
                  </span>
                  <input type="checkbox" checked={newVehicle.isAvailable} onChange={(e) => setNewVehicle({ ...newVehicle, isAvailable: e.target.checked })} className="h-5 w-5 border-slate-300 text-slate-950" />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-700">Couleur</span>
                  <input className="w-full border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-950" value={newVehicle.color || ''} onChange={(e) => setNewVehicle({ ...newVehicle, color: e.target.value })} />
                </label>
              </div>
            </div>

            <div className="border-t border-slate-200 p-6">
              <button onClick={() => void handleAddVehicle()} disabled={saving} className="inline-flex w-full items-center justify-center gap-2 bg-slate-950 px-5 py-3.5 text-sm font-bold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                {saving ? 'Enregistrement...' : 'Ajouter le vehicule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};