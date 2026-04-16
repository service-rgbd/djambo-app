import React, { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  CarFront,
  Check,
  Clock3,
  Copy,
  ImagePlus,
  Link as LinkIcon,
  LocateFixed,
  Mail,
  MapPin,
  Phone,
  Save,
  Settings2,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { api, OwnerParkingSummary, PrivateAppSettings, PrivateSettingMediaScope } from '../services/api';
import { ResolvedCurrentLocation, resolveCurrentLocation } from '../services/location';
import { BrowserPushState, clearPushPromptDismissal, disablePushNotifications, enablePushNotifications, getBrowserPushState, syncExistingPushSubscription } from '../services/pushNotifications';

const MAX_MEDIA_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;

const defaultBrowserPushState: BrowserPushState = {
  supported: false,
  permission: 'unsupported',
  subscribed: false,
};

const defaultSettings = (): PrivateAppSettings => {
  const origin = window.location.origin;
  return {
    businessName: 'Djambo Mobility',
    publicEmail: 'contact@djambo-app.com',
    supportPhone: '+221 77 000 00 00',
    city: 'Dakar',
    responseTime: 'Reponse en moins de 30 min',
    storeSlug: 'djambo-mobility',
    publicStoreUrl: `${origin}/#/store/djambo-mobility`,
    publicProfileUrl: `${origin}/#/profile/djambo-mobility`,
    chauffeurOnDemand: true,
    chauffeurDailyRate: '30000',
    deliveryEnabled: true,
    whatsappEnabled: true,
    contractSignatureEnabled: true,
    notificationsEmail: true,
    notificationsSms: false,
  };
};

const copyToClipboard = async (value: string) => {
  await navigator.clipboard.writeText(value);
};

const SettingSection: React.FC<{
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}> = ({ icon: Icon, title, description, children }) => (
  <section className="border border-slate-200 bg-white p-6 shadow-sm">
    <div className="mb-6 flex items-start gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-slate-100 text-slate-700">
        <Icon size={20} />
      </div>
      <div>
        <h2 className="text-xl font-extrabold text-slate-950">{title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-slate-500">{description}</p>
      </div>
    </div>
    {children}
  </section>
);

const SettingGroup: React.FC<{
  title: string;
  description: string;
  children: React.ReactNode;
}> = ({ title, description, children }) => (
  <div className="border border-slate-200 bg-slate-50 p-4">
    <div className="mb-4">
      <h3 className="text-sm font-extrabold uppercase tracking-[0.16em] text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
    {children}
  </div>
);

const ToggleCard: React.FC<{
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}> = ({ title, description, checked, onChange }) => (
  <label className="flex items-center justify-between border border-slate-200 bg-white px-4 py-4">
    <span>
      <span className="block text-sm font-bold text-slate-900">{title}</span>
      <span className="mt-1 block text-sm text-slate-500">{description}</span>
    </span>
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-5 w-5 border-slate-300 text-slate-950" />
  </label>
);

const UploadCard: React.FC<{
  title: string;
  description: string;
  value?: string;
  error?: string;
  uploading?: boolean;
  onUpload: (file: File) => Promise<void>;
}> = ({ title, description, value, error, uploading = false, onUpload }) => {
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    event.target.value = '';
    await onUpload(file);
  };

  return (
    <div className="border border-slate-200 bg-slate-50 p-4">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-slate-900">{title}</p>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100">
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
          {uploading ? 'Upload...' : 'Uploader'}
          <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={(event) => void handleFileChange(event)} disabled={uploading} />
        </label>
      </div>
      <div className="overflow-hidden border border-slate-200 bg-white">
        {value ? (
          <img src={value} alt={title} className="h-40 w-full object-cover" />
        ) : (
          <div className="flex h-40 items-center justify-center text-sm text-slate-400">
            Aucun visuel charge
          </div>
        )}
      </div>
      {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
    </div>
  );
};

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<PrivateAppSettings>(defaultSettings());
  const [ownerParkings, setOwnerParkings] = useState<OwnerParkingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copiedKey, setCopiedKey] = useState('');
  const [error, setError] = useState('');
  const [mediaUploadError, setMediaUploadError] = useState('');
  const [mediaUploadErrorScope, setMediaUploadErrorScope] = useState<PrivateSettingMediaScope | ''>('');
  const [uploadingMediaKey, setUploadingMediaKey] = useState<PrivateSettingMediaScope | ''>('');
  const [parkingLocationError, setParkingLocationError] = useState('');
  const [detectingParkingId, setDetectingParkingId] = useState('');
  const [savingParkingId, setSavingParkingId] = useState('');
  const [locationDraft, setLocationDraft] = useState<(ResolvedCurrentLocation & { parkingId: string }) | null>(null);
  const [browserPushState, setBrowserPushState] = useState<BrowserPushState>(defaultBrowserPushState);
  const [pushBusy, setPushBusy] = useState(false);
  const [pushError, setPushError] = useState('');

  const isParcAuto = user?.role === UserRole.PARC_AUTO;

  useEffect(() => {
    let isMounted = true;

    const loadSettings = async () => {
      try {
        setLoading(true);
        const [settingsResult, dashboardResult] = await Promise.allSettled([
          api.getPrivateSettings(),
          isParcAuto ? api.getOwnerDashboard() : Promise.resolve(null),
        ]);
        if (!isMounted) {
          return;
        }
        if (settingsResult.status === 'fulfilled') {
          setSettings({ ...defaultSettings(), ...settingsResult.value });
          setError('');
        } else {
          setError('Impossible de charger les parametres reels.');
        }

        if (dashboardResult.status === 'fulfilled' && dashboardResult.value?.ownerProfile) {
          setOwnerParkings(dashboardResult.value.parkings);
        } else {
          setOwnerParkings([]);
        }
      } catch {
        if (isMounted) {
          setError('Impossible de charger les parametres reels.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadSettings();

    return () => {
      isMounted = false;
    };
  }, [isParcAuto]);

  useEffect(() => {
    let isMounted = true;

    const syncPushState = async () => {
      if (!user) {
        if (isMounted) {
          setBrowserPushState(defaultBrowserPushState);
        }
        return;
      }

      const currentState = await getBrowserPushState();
      const subscribed = currentState.permission === 'granted'
        ? (await syncExistingPushSubscription().catch(() => false)) || currentState.subscribed
        : currentState.subscribed;

      if (isMounted) {
        setBrowserPushState({ ...currentState, subscribed });
      }
    };

    void syncPushState();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleChange = <K extends keyof PrivateAppSettings>(key: K, value: PrivateAppSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await api.updatePrivateSettings(settings);
      setSettings(response);
      setSaved(true);
      setError('');
      setTimeout(() => setSaved(false), 2200);
    } catch {
      setError('Enregistrement impossible pour le moment.');
    } finally {
      setSaving(false);
    }
  };

  const handleMediaUpload = async (key: keyof Pick<PrivateAppSettings, 'brandLogo' | 'storefrontCover' | 'contractBanner'>, scope: PrivateSettingMediaScope, file: File) => {
    try {
      if (!file.type || !['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type)) {
        throw new Error('Format image non supporte. Utilisez JPG, PNG, WebP ou AVIF.');
      }

      if (file.size > MAX_MEDIA_UPLOAD_SIZE_BYTES) {
        throw new Error('Image trop lourde. Maximum autorise: 10 Mo.');
      }

      setUploadingMediaKey(scope);
      setMediaUploadError('');
      setMediaUploadErrorScope('');
      const upload = await api.uploadPrivateSettingImage(file, scope);
      handleChange(key, upload.url);
    } catch (uploadError) {
      setMediaUploadErrorScope(scope);
      setMediaUploadError(uploadError instanceof Error ? uploadError.message : 'Upload image impossible.');
    } finally {
      setUploadingMediaKey('');
    }
  };

  const publicLinks = useMemo(
    () => [
      { key: 'store', label: 'Boutique publique', value: settings.publicStoreUrl },
      { key: 'profile', label: 'Profil public', value: settings.publicProfileUrl },
    ],
    [settings.publicProfileUrl, settings.publicStoreUrl]
  );

  const formatLockDate = (value?: string | null) => {
    if (!value) {
      return 'modifiable maintenant';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return 'modifiable plus tard';
    }

    return date.getTime() > Date.now()
      ? `modifiable le ${date.toLocaleDateString('fr-FR')}`
      : 'modifiable maintenant';
  };

  const handleDetectParkingLocation = async (parkingId: string) => {
    try {
      setDetectingParkingId(parkingId);
      setParkingLocationError('');
      const resolvedLocation = await resolveCurrentLocation();
      setLocationDraft({ ...resolvedLocation, parkingId });
    } catch (locationError) {
      setParkingLocationError(locationError instanceof Error ? locationError.message : 'Impossible de recuperer votre position actuelle.');
    } finally {
      setDetectingParkingId('');
    }
  };

  const handleConfirmParkingLocation = async () => {
    if (!locationDraft) {
      return;
    }

    try {
      setSavingParkingId(locationDraft.parkingId);
      setParkingLocationError('');
      const updatedParking = await api.updateParkingLocation(locationDraft.parkingId, {
        address: locationDraft.address,
        city: locationDraft.city || settings.city,
        latitude: locationDraft.latitude,
        longitude: locationDraft.longitude,
      });

      setOwnerParkings((currentParkings) => currentParkings.map((parking) => (
        parking.id === updatedParking.id ? { ...parking, ...updatedParking } : parking
      )));
      setLocationDraft(null);
    } catch (locationError) {
      setParkingLocationError(locationError instanceof Error ? locationError.message : 'Impossible d enregistrer cette adresse de parking.');
    } finally {
      setSavingParkingId('');
    }
  };

  const refreshPushState = async () => {
    const currentState = await getBrowserPushState();
    const subscribed = currentState.permission === 'granted'
      ? (await syncExistingPushSubscription().catch(() => false)) || currentState.subscribed
      : currentState.subscribed;

    setBrowserPushState({ ...currentState, subscribed });
  };

  const handleEnableDevicePush = async () => {
    try {
      setPushBusy(true);
      setPushError('');
      await enablePushNotifications();
      if (user) {
        clearPushPromptDismissal(user.id);
      }
      await refreshPushState();
    } catch (error) {
      setPushError(error instanceof Error ? error.message : 'Activation des notifications push impossible.');
    } finally {
      setPushBusy(false);
    }
  };

  const handleDisableDevicePush = async () => {
    try {
      setPushBusy(true);
      setPushError('');
      await disablePushNotifications();
      await refreshPushState();
    } catch (error) {
      setPushError(error instanceof Error ? error.message : 'Desactivation des notifications push impossible.');
    } finally {
      setPushBusy(false);
    }
  };

  const pushPermissionLabel = browserPushState.permission === 'granted'
    ? 'Autorisees'
    : browserPushState.permission === 'denied'
      ? 'Bloquees'
      : browserPushState.permission === 'default'
        ? 'En attente'
        : 'Non supportees';

  return (
    <div className="space-y-6">
      <section className="border border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#f8fafc_55%,#f1f5f9_100%)] p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Parametrage de l espace</p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">Parametres relies au backend et presentes sans surcouche.</h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
              Cette page centralise l identite, les liens publics, les uploads visuels et les options de service pour que la vitrine, les contrats et la flotte racontent la meme chose.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={loading || saving}
            className="inline-flex items-center justify-center gap-2 bg-slate-950 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : <Save size={16} />}
            {saving ? 'Enregistrement...' : saved ? 'Parametres sauvegardes' : 'Enregistrer les parametres'}
          </button>
        </div>
      </section>

      {loading && (
        <div className="flex items-center gap-3 border border-slate-200 bg-white px-5 py-4 text-sm text-slate-500">
          <Loader2 size={16} className="animate-spin text-slate-900" />
          Chargement des parametres reels...
        </div>
      )}

      {error && (
        <div className="border border-rose-100 bg-rose-50 px-5 py-4 text-sm text-rose-700">{error}</div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <SettingSection
          icon={Settings2}
          title="Identite et contacts"
          description="Les informations qui structurent le header, les pages publiques et les signatures de contrat."
        >
          <div className="grid gap-4">
            <SettingGroup title="Marque" description="Les informations qui definissent l identite affichée dans l app et la vitrine.">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-700">Nom commercial</span>
                  <input className="w-full border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-950" value={settings.businessName} onChange={(e) => handleChange('businessName', e.target.value)} />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-700">Ville principale</span>
                  <input className="w-full border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-950" value={settings.city} onChange={(e) => handleChange('city', e.target.value)} />
                </label>
              </div>
            </SettingGroup>

            <SettingGroup title="Contact public" description="Les coordonnees visibles pour les clients et dans les documents.">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700"><Mail size={14} /> Email public</span>
                  <input className="w-full border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-950" value={settings.publicEmail} onChange={(e) => handleChange('publicEmail', e.target.value)} />
                </label>
                <label className="space-y-2">
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700"><Phone size={14} /> Telephone support</span>
                  <input className="w-full border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-950" value={settings.supportPhone} onChange={(e) => handleChange('supportPhone', e.target.value)} />
                </label>
                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-semibold text-slate-700">Temps de reponse affiche</span>
                  <select className="w-full border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-950" value={settings.responseTime} onChange={(e) => handleChange('responseTime', e.target.value)}>
                    <option>Reponse en moins de 30 min</option>
                    <option>Reponse en moins d 1h</option>
                    <option>Reponse dans la journee</option>
                  </select>
                </label>
              </div>
            </SettingGroup>
          </div>
        </SettingSection>

        <SettingSection
          icon={LinkIcon}
          title="Liens publics"
          description="Des liens partageables qui correspondent reellement a la vitrine et au profil public."
        >
          <div className="space-y-4">
            <SettingGroup title="Adresse publique" description="Le slug pilote la boutique publique et le profil public.">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Slug public</span>
                <input
                  className="w-full border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-950"
                  value={settings.storeSlug}
                  onChange={(e) => {
                    const slug = e.target.value.toLowerCase().replace(/\s+/g, '-');
                    handleChange('storeSlug', slug);
                    handleChange('publicStoreUrl', `${window.location.origin}/#/store/${slug}`);
                    handleChange('publicProfileUrl', `${window.location.origin}/#/profile/${slug}`);
                  }}
                />
              </label>
            </SettingGroup>

            <SettingGroup title="Partage" description="Copie rapide des liens frontend réellement générés.">
              <div className="space-y-4">
                {publicLinks.map((item) => (
                  <div key={item.key} className="border border-slate-200 bg-white p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{item.label}</p>
                        <p className="mt-1 break-all text-sm text-slate-500">{item.value}</p>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          await copyToClipboard(item.value);
                          setCopiedKey(item.key);
                          setTimeout(() => setCopiedKey(''), 1600);
                        }}
                        className="inline-flex items-center gap-2 border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        {copiedKey === item.key ? <Check size={16} /> : <Copy size={16} />}
                        {copiedKey === item.key ? 'Copie' : 'Copier'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </SettingGroup>
          </div>
        </SettingSection>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SettingSection
          icon={ImagePlus}
          title="Uploads media"
          description="Les visuels qui alimentent la marque, la vitrine et les objets presentes dans l application."
        >
          <div className="grid gap-4">
            <UploadCard
              title="Logo d interface"
              description="Utilise pour la marque dans les zones privees et publiques."
              value={settings.brandLogo}
              uploading={uploadingMediaKey === 'brand-logo'}
              error={mediaUploadErrorScope === 'brand-logo' ? mediaUploadError : undefined}
              onUpload={(file) => handleMediaUpload('brandLogo', 'brand-logo', file)}
            />
            <UploadCard
              title="Cover storefront"
              description="Affichee dans la vitrine publique et les apercus premium."
              value={settings.storefrontCover}
              uploading={uploadingMediaKey === 'storefront-cover'}
              error={mediaUploadErrorScope === 'storefront-cover' ? mediaUploadError : undefined}
              onUpload={(file) => handleMediaUpload('storefrontCover', 'storefront-cover', file)}
            />
            <UploadCard
              title="Banniere contrat"
              description="Visuel utilise dans le module de contrats et l environnement de signature."
              value={settings.contractBanner}
              uploading={uploadingMediaKey === 'contract-banner'}
              error={mediaUploadErrorScope === 'contract-banner' ? mediaUploadError : undefined}
              onUpload={(file) => handleMediaUpload('contractBanner', 'contract-banner', file)}
            />
          </div>
        </SettingSection>

        <SettingSection
          icon={CarFront}
          title="Options de service"
          description="Les options activables qui doivent se retrouver ensuite dans les fiches et les contrats."
        >
          <div className="space-y-4">
            <SettingGroup title="Services commerciaux" description="Les options visibles pour la reservation et la relation client.">
              <div className="grid gap-4 md:grid-cols-2">
                <ToggleCard title="Chauffeur a la demande" description="Propose une option chauffeur dans les contrats." checked={settings.chauffeurOnDemand} onChange={(checked) => handleChange('chauffeurOnDemand', checked)} />
                <ToggleCard title="Livraison active" description="Autorise remise et restitution hors agence." checked={settings.deliveryEnabled} onChange={(checked) => handleChange('deliveryEnabled', checked)} />
                <ToggleCard title="WhatsApp actif" description="Ajoute un canal direct dans les pages publiques." checked={settings.whatsappEnabled} onChange={(checked) => handleChange('whatsappEnabled', checked)} />
                <ToggleCard title="Signature contrat" description="Conserve une etape de validation contractuelle explicite." checked={settings.contractSignatureEnabled} onChange={(checked) => handleChange('contractSignatureEnabled', checked)} />
              </div>
            </SettingGroup>

            {settings.chauffeurOnDemand && (
              <SettingGroup title="Tarification chauffeur" description="Le montant réutilisé dans les contrats quand le service est activé.">
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-700">Tarif journalier chauffeur</span>
                  <input className="w-full border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-950" value={settings.chauffeurDailyRate} onChange={(e) => handleChange('chauffeurDailyRate', e.target.value)} />
                </label>
              </SettingGroup>
            )}
          </div>
        </SettingSection>
      </div>

      {isParcAuto && ownerParkings.length > 0 && (
        <SettingSection
          icon={MapPin}
          title="Adresse du parc auto"
          description="La position du parc peut etre confirmee depuis votre emplacement actuel. Une fois enregistree, elle reste verrouillee pendant 7 jours."
        >
          <div className="space-y-4">
            {parkingLocationError && (
              <div className="border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{parkingLocationError}</div>
            )}

            {ownerParkings.map((parking) => {
              const isLocked = Boolean(parking.location_editable_after) && new Date(parking.location_editable_after as string).getTime() > Date.now();
              const isDraftForParking = locationDraft?.parkingId === parking.id;

              return (
                <div key={parking.id} className="border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-bold text-slate-900">{parking.name}</p>
                        <span className={`px-2.5 py-1 text-[11px] font-bold ${parking.location_confirmed_at ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {parking.location_confirmed_at ? 'Adresse confirmee' : 'Adresse a confirmer'}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{parking.address}</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-500">
                        <span className="border border-slate-200 bg-white px-2.5 py-1">{parking.city}</span>
                        {parking.latitude !== null && parking.longitude !== null && (
                          <span className="border border-slate-200 bg-white px-2.5 py-1">
                            {parking.latitude}, {parking.longitude}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 border border-slate-200 bg-white px-2.5 py-1">
                          <Clock3 size={12} /> {formatLockDate(parking.location_editable_after)}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => void handleDetectParkingLocation(parking.id)}
                      disabled={isLocked || detectingParkingId === parking.id || savingParkingId === parking.id}
                      className="inline-flex items-center justify-center gap-2 border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      {detectingParkingId === parking.id ? <Loader2 size={16} className="animate-spin" /> : <LocateFixed size={16} />}
                      {detectingParkingId === parking.id ? 'Localisation en cours...' : 'Utiliser ma position actuelle'}
                    </button>
                  </div>

                  {isDraftForParking && (
                    <div className="mt-4 border border-indigo-100 bg-white p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-600">Confirmation requise</p>
                      <p className="mt-2 text-sm font-bold text-slate-900">Confirmez-vous que cette position correspond bien a l adresse du parc auto ?</p>
                      <p className="mt-2 text-sm text-slate-600">{locationDraft.label}</p>
                      <p className="mt-2 text-xs text-slate-500">Coordonnees: {locationDraft.latitude}, {locationDraft.longitude}</p>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => void handleConfirmParkingLocation()}
                          disabled={savingParkingId === parking.id}
                          className="inline-flex items-center gap-2 bg-slate-950 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800 disabled:bg-slate-300"
                        >
                          {savingParkingId === parking.id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                          Oui, enregistrer cette adresse
                        </button>
                        <button
                          type="button"
                          onClick={() => setLocationDraft(null)}
                          className="border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                        >
                          Non, annuler
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </SettingSection>
      )}

      <SettingSection
        icon={Bell}
        title="Notifications et supervision"
        description="Ce qui doit etre remonte au bon moment dans le header et le suivi utilisateur."
      >
        <div className="grid gap-4 xl:grid-cols-[1fr_1fr_1fr_1.2fr]">
          <ToggleCard title="Alertes email" description="Demandes, contrats et activite." checked={settings.notificationsEmail} onChange={(checked) => handleChange('notificationsEmail', checked)} />
          <ToggleCard title="Alertes SMS" description="Pour les validations urgentes." checked={settings.notificationsSms} onChange={(checked) => handleChange('notificationsSms', checked)} />
          <div className="border border-slate-200 bg-slate-50 px-4 py-4">
            <div className="inline-flex items-center gap-2 text-sm font-bold text-slate-900"><ShieldCheck size={16} /> Cohesion</div>
            <p className="mt-2 text-sm text-slate-500">Les options activees ici servent de reference pour l interface privee, les contrats et la vitrine publique.</p>
          </div>
          <div className="border border-slate-200 bg-slate-50 px-4 py-4">
            <div className="inline-flex items-center gap-2 text-sm font-bold text-slate-900"><Bell size={16} /> Presence push sur cet appareil</div>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <p><span className="font-semibold text-slate-900">Support navigateur:</span> {browserPushState.supported ? 'oui' : 'non'}</p>
              <p><span className="font-semibold text-slate-900">Autorisation:</span> {pushPermissionLabel}</p>
              <p><span className="font-semibold text-slate-900">Abonnement actif:</span> {browserPushState.subscribed ? 'oui' : 'non'}</p>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              {browserPushState.permission === 'granted' && browserPushState.subscribed ? (
                <button
                  type="button"
                  onClick={() => void handleDisableDevicePush()}
                  disabled={pushBusy}
                  className="inline-flex items-center justify-center gap-2 border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {pushBusy ? <Loader2 size={16} className="animate-spin" /> : <Bell size={16} />}
                  Desactiver les notifications push
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void handleEnableDevicePush()}
                  disabled={pushBusy || !browserPushState.supported}
                  className="inline-flex items-center justify-center gap-2 bg-slate-950 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {pushBusy ? <Loader2 size={16} className="animate-spin" /> : <Bell size={16} />}
                  Activer les notifications push
                </button>
              )}
            </div>
            {browserPushState.permission === 'denied' && (
              <p className="mt-3 text-sm text-amber-700">Le navigateur bloque actuellement les notifications. Il faut les reautoriser dans les reglages du site.</p>
            )}
            {pushError && (
              <p className="mt-3 text-sm text-rose-600">{pushError}</p>
            )}
          </div>
        </div>
      </SettingSection>
    </div>
  );
};