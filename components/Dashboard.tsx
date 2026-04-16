import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Activity,
  ArrowUpRight,
  BellRing,
  Car,
  Clock3,
  Check,
  Copy,
  Loader2,
  MapPinned,
  Share2,
  ShieldCheck,
  Wallet,
  Wrench,
} from 'lucide-react';
import { FleetStats, RevenueData } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { api, OwnerNotificationSummary, OwnerVehicleSummary, PrivateAppSettings } from '../services/api';

interface DashboardProps {
  stats?: FleetStats & { availableVehicles?: number; totalParkings?: number };
  revenueData?: RevenueData[];
}

const formatCurrency = (value: number) => `${value.toLocaleString()} FCFA`;

const formatDelta = (value: number) => {
  if (!Number.isFinite(value) || value === 0) {
    return 'Stable';
  }

  const prefix = value > 0 ? '+' : '';
  return `${prefix}${value.toFixed(0)}%`;
};

const OverviewCard: React.FC<{
  title: string;
  value: string;
  support: string;
  icon: React.ElementType;
  tone: 'indigo' | 'emerald' | 'amber' | 'rose';
}> = ({ title, value, support, icon: Icon, tone }) => {
  const tones = {
    indigo: 'border-indigo-100 bg-indigo-50/70 text-indigo-700',
    emerald: 'border-emerald-100 bg-emerald-50/70 text-emerald-700',
    amber: 'border-amber-100 bg-amber-50/70 text-amber-700',
    rose: 'border-rose-100 bg-rose-50/70 text-rose-700',
  };

  return (
    <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{title}</p>
          <p className="mt-3 text-2xl font-extrabold tracking-tight text-slate-950">{value}</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">{support}</p>
        </div>
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${tones[tone]}`}>
          <Icon size={20} />
        </div>
      </div>
    </article>
  );
};

const SignalRow: React.FC<{
  label: string;
  value: string;
  percent: number;
  tone: 'indigo' | 'emerald' | 'amber';
}> = ({ label, value, percent, tone }) => {
  const bars = {
    indigo: 'bg-indigo-600',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-700">{label}</p>
        <p className="text-sm font-bold text-slate-950">{value}</p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${bars[tone]}`} style={{ width: `${Math.max(8, Math.min(percent, 100))}%` }} />
      </div>
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ stats, revenueData }) => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [isChartReady, setIsChartReady] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<FleetStats & { availableVehicles?: number; totalParkings?: number } | null>(stats ?? null);
  const [dashboardRevenueData, setDashboardRevenueData] = useState<RevenueData[]>(revenueData ?? []);
  const [dashboardVehicles, setDashboardVehicles] = useState<OwnerVehicleSummary[]>([]);
  const [notifications, setNotifications] = useState<OwnerNotificationSummary[]>([]);
  const [publicSettings, setPublicSettings] = useState<Pick<PrivateAppSettings, 'publicStoreUrl' | 'storeSlug'> | null>(null);
  const [isLoading, setIsLoading] = useState(!stats || !revenueData);
  const [error, setError] = useState('');

  const isOwnerSpace = user?.role === 'PARC_AUTO' || user?.role === 'PARTICULIER';

  const fallbackAgencySlug = user?.name
    ? user.name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
    : 'ma-flotte';

  const storeUrl = publicSettings?.publicStoreUrl || `${window.location.origin}/#/store/${fallbackAgencySlug || 'ma-flotte'}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    setIsChartReady(true);
  }, []);

  useEffect(() => {
    if (stats && revenueData && !isOwnerSpace) {
      return;
    }

    let isMounted = true;

    const loadDashboard = async () => {
      try {
        setIsLoading(true);
        const [overviewResponse, ownerResponse, settingsResponse, notificationsResponse] = await Promise.all([
          stats && revenueData
            ? Promise.resolve({ stats, revenueData })
            : api.getDashboardOverview(),
          isOwnerSpace
            ? api.getOwnerDashboard().catch(() => null)
            : Promise.resolve(null),
          isOwnerSpace
            ? api.getPrivateSettings().catch(() => null)
            : Promise.resolve(null),
          user
            ? api.getNotifications().catch(() => [])
            : Promise.resolve([]),
        ]);
        if (!isMounted) {
          return;
        }
        setDashboardStats(overviewResponse.stats);
        setDashboardRevenueData(overviewResponse.revenueData);
        setDashboardVehicles(ownerResponse?.vehicles.slice(0, 4) || []);
        setNotifications(notificationsResponse);
        setPublicSettings(settingsResponse ? {
          publicStoreUrl: settingsResponse.publicStoreUrl,
          storeSlug: settingsResponse.storeSlug,
        } : null);
        setError('');
      } catch {
        if (!isMounted) {
          return;
        }
        setError('Impossible de charger les indicateurs en temps reel.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [isOwnerSpace, revenueData, stats, user]);

  const formatVehicleAvailability = (vehicle: OwnerVehicleSummary) => {
    if (!vehicle.occupiedUntil) {
      return 'Disponible immediatement';
    }

    return `Disponible le ${new Date(vehicle.occupiedUntil).toLocaleDateString('fr-FR')} a ${vehicle.nextAvailabilityTime || '10:00'}`;
  };

  const metrics = useMemo(() => {
    if (!dashboardStats) {
      return null;
    }

    const totalVehicles = dashboardStats.totalVehicles || 0;
    const availableVehicles = dashboardStats.availableVehicles ?? 0;
    const activeRentals = dashboardStats.activeRentals || 0;
    const inMaintenance = dashboardStats.inMaintenance || 0;
    const parkedSites = dashboardStats.totalParkings ?? 0;

    const availabilityRate = totalVehicles > 0 ? (availableVehicles / totalVehicles) * 100 : 0;
    const rentalRate = totalVehicles > 0 ? (activeRentals / totalVehicles) * 100 : 0;
    const maintenanceRate = totalVehicles > 0 ? (inMaintenance / totalVehicles) * 100 : 0;

    const lastMonth = dashboardRevenueData[dashboardRevenueData.length - 1]?.revenue ?? 0;
    const previousMonth = dashboardRevenueData[dashboardRevenueData.length - 2]?.revenue ?? 0;
    const revenueDelta = previousMonth > 0 ? ((lastMonth - previousMonth) / previousMonth) * 100 : 0;

    return {
      totalVehicles,
      availableVehicles,
      activeRentals,
      inMaintenance,
      parkedSites,
      availabilityRate,
      rentalRate,
      maintenanceRate,
      revenueDelta,
      latestRevenue: lastMonth,
    };
  }, [dashboardRevenueData, dashboardStats]);

  if (isLoading && !dashboardStats) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-[28px] border border-slate-200 bg-white">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 size={20} className="animate-spin text-indigo-600" />
          <span>Chargement du tableau de bord...</span>
        </div>
      </div>
    );
  }

  if (!dashboardStats || !metrics) {
    return (
      <div className="rounded-[28px] border border-rose-100 bg-rose-50 p-6 text-rose-700">
        {error || 'Le tableau de bord est indisponible.'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {error}
        </div>
      )}

      <section className="border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr] xl:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-600">Pilotage utilisateur</p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              Vue claire de votre activite, sans cartes qui se repetent.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-base">
              Bonjour {user?.name?.split(' ')[0] || 'Djambo'}. Cette vue priorise ce qui doit etre decide vite: disponibilite de la flotte, occupation, maintenance et performance recente.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <span className="border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                {metrics.availableVehicles} vehicule(s) disponible(s)
              </span>
              <span className="border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                {metrics.parkedSites} parking(s) suivis
              </span>
              <span className="border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                Revenu mensuel {formatDelta(metrics.revenueDelta)}
              </span>
            </div>
          </div>

          <div className="border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Boutique publique</p>
                <h2 className="mt-2 text-xl font-extrabold text-slate-950">Votre lien de reservation</h2>
              </div>
              <div className="flex h-11 w-11 items-center justify-center bg-indigo-100 text-indigo-700">
                <Share2 size={18} />
              </div>
            </div>

            <div className="mt-4 border border-slate-200 bg-white px-4 py-3 font-mono text-xs text-slate-600">
              {storeUrl}
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-2 bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-700"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Lien copie' : 'Copier le lien'}
              </button>
              <Link
                to="/app/vehicles"
                className="inline-flex items-center gap-2 border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
              >
                Gerer les vehicules
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="grid gap-4 md:grid-cols-2">
          <OverviewCard
            title="Mes voitures"
            value={`${metrics.totalVehicles} vehicule${metrics.totalVehicles > 1 ? 's' : ''}`}
            support={`${metrics.availableVehicles} pret(s) a etre proposes immediatement.`}
            icon={Car}
            tone="indigo"
          />
          <OverviewCard
            title="Occupation"
            value={`${Math.round(metrics.rentalRate)}%`}
            support={`${metrics.activeRentals} location(s) en cours sur l ensemble de la flotte.`}
            icon={Activity}
            tone="emerald"
          />
          <OverviewCard
            title="Maintenance"
            value={`${metrics.inMaintenance}`}
            support={metrics.inMaintenance > 0 ? 'Vehicules a surveiller avant de les remettre en ligne.' : 'Aucun vehicule bloque en maintenance.'}
            icon={Wrench}
            tone="amber"
          />
          <OverviewCard
            title="Revenu cumule"
            value={formatCurrency(dashboardStats.totalRevenue)}
            support={metrics.latestRevenue > 0 ? `${formatCurrency(metrics.latestRevenue)} sur la derniere periode.` : 'Aucune remontee de revenu recente.'}
            icon={Wallet}
            tone="rose"
          />
        </div>

        <aside className="border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Sante operationnelle</p>
              <h2 className="mt-2 text-xl font-extrabold text-slate-950">Lecture rapide de la flotte</h2>
            </div>
            <div className="flex h-11 w-11 items-center justify-center bg-emerald-50 text-emerald-700">
              <ShieldCheck size={18} />
            </div>
          </div>

          <div className="mt-6 space-y-5">
            <SignalRow
              label="Disponibilite immediate"
              value={`${Math.round(metrics.availabilityRate)}%`}
              percent={metrics.availabilityRate}
              tone="emerald"
            />
            <SignalRow
              label="Flotte engagee"
              value={`${Math.round(metrics.rentalRate)}%`}
              percent={metrics.rentalRate}
              tone="indigo"
            />
            <SignalRow
              label="Part en maintenance"
              value={`${Math.round(metrics.maintenanceRate)}%`}
              percent={metrics.maintenanceRate}
              tone="amber"
            />
          </div>

          <div className="mt-6 bg-slate-50 p-4">
            <div className="flex items-start gap-3">
              <MapPinned size={18} className="mt-0.5 text-indigo-600" />
              <div>
                <p className="text-sm font-bold text-slate-900">Couverture terrain</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">
                  {metrics.parkedSites > 0
                    ? `${metrics.parkedSites} point(s) de stationnement alimentent le suivi des disponibilites.`
                    : 'Aucun parking remonte actuellement dans le suivi.'}
                </p>
              </div>
            </div>
          </div>
        </aside>
      </section>

      {isOwnerSpace && (
        <section className="border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Mes voitures</p>
              <h2 className="mt-2 text-xl font-extrabold text-slate-950">Une lecture plus nette du parc disponible et des indisponibilites.</h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-500">Chaque voiture affiche son statut reel, son affectation parking et sa prochaine fenetre de disponibilite.</p>
            </div>
            <Link to="/app/owner-dashboard" className="inline-flex items-center gap-2 bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700">
              Voir le parc auto
              <ArrowUpRight size={15} />
            </Link>
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-2">
            {dashboardVehicles.length > 0 ? dashboardVehicles.map((vehicle) => (
              <article key={vehicle.id} className="overflow-hidden border border-slate-200 bg-slate-50">
                <div className="grid md:grid-cols-[180px_1fr]">
                  <div className="h-full min-h-[180px] bg-slate-100">
                    <img
                      src={vehicle.imageUrl || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=900&q=80&auto=format&fit=crop'}
                      alt={vehicle.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="bg-white p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-extrabold text-slate-950">{vehicle.title}</p>
                        <p className="mt-1 text-sm text-slate-500">{vehicle.city} • {vehicle.parkingName || 'Sans parking affecte'}</p>
                      </div>
                      <span className={`px-3 py-1 text-[11px] font-bold ${vehicle.occupiedUntil ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {vehicle.occupiedUntil ? 'Occupee' : 'Disponible'}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="border border-slate-200 bg-slate-50 px-4 py-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Prix journalier</p>
                        <p className="mt-1 text-sm font-bold text-slate-900">{vehicle.pricePerDay.toLocaleString()} FCFA / jour</p>
                      </div>
                      <div className="border border-slate-200 bg-slate-50 px-4 py-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Fenetre</p>
                        <p className="mt-1 inline-flex items-center gap-2 text-sm font-bold text-slate-900"><Clock3 size={13} /> {formatVehicleAvailability(vehicle)}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="text-slate-500">{vehicle.viewCount} vues • {vehicle.reviewCount} avis</span>
                      <Link to="/app/vehicles" className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-700">
                        Mettre a jour
                        <ArrowUpRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            )) : (
              <div className="border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center text-slate-500 xl:col-span-2">
                Aucune voiture proprietaire n est encore remontee dans ce dashboard.
              </div>
            )}
          </div>
        </section>
      )}

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="min-w-0 border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Performance</p>
              <h2 className="mt-2 text-xl font-extrabold text-slate-950">Evolution des revenus</h2>
            </div>
            <div className="border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600">
              6 derniers mois
            </div>
          </div>

          <div className="mt-6 h-72 w-full min-w-0 sm:h-80">
            {isChartReady ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={280}>
                <AreaChart data={dashboardRevenueData} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dashboardRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} tickFormatter={(value) => `${Math.round(value / 1000)}k`} />
                  <Tooltip
                    contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 20px 45px rgba(15,23,42,0.08)' }}
                    formatter={(value: number) => [formatCurrency(value), 'Revenu']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#dashboardRevenueGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center border border-slate-200 bg-slate-50 text-sm text-slate-500">
                Initialisation du graphique...
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Notifications</p>
                <h2 className="mt-2 text-lg font-extrabold text-slate-950">Ce qui attend une action</h2>
              </div>
              <BellRing size={18} className="text-indigo-600" />
            </div>
            <div className="mt-4 space-y-3">
              {notifications.length > 0 ? notifications.slice(0, 5).map((notification) => (
                <article key={notification.id} className={`border px-4 py-3 ${notification.isRead ? 'border-slate-200 bg-slate-50' : 'border-indigo-200 bg-indigo-50/60'}`}>
                  <p className="text-sm font-bold text-slate-900">{notification.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{notification.detail}</p>
                  <p className="mt-2 text-[11px] font-semibold text-slate-400">{new Date(notification.createdAt).toLocaleString('fr-FR')}</p>
                </article>
              )) : (
                <p className="text-sm text-slate-500">Aucune notification recente.</p>
              )}
            </div>
          </div>

          <div className="border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Resume financier</p>
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-sm text-slate-500">Derniere periode</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-950">{formatCurrency(metrics.latestRevenue)}</p>
              </div>
              <div className="border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                Variation recente: <span className="font-bold text-slate-950">{formatDelta(metrics.revenueDelta)}</span>
              </div>
            </div>
          </div>

          <div className="border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Actions utiles</p>
            <div className="mt-4 space-y-3">
              <Link to="/app/vehicles" className="flex items-center justify-between border border-slate-200 px-4 py-4 transition-colors hover:bg-slate-50">
                <div>
                  <p className="text-sm font-bold text-slate-900">Mettre a jour la flotte</p>
                  <p className="mt-1 text-sm text-slate-500">Verifier disponibilites, prix et fiches.</p>
                </div>
                <ArrowUpRight size={16} className="text-slate-400" />
              </Link>
              <Link to="/app/contracts" className="flex items-center justify-between border border-slate-200 px-4 py-4 transition-colors hover:bg-slate-50">
                <div>
                  <p className="text-sm font-bold text-slate-900">Suivre les contrats</p>
                  <p className="mt-1 text-sm text-slate-500">Retrouver les dossiers actifs et termines.</p>
                </div>
                <ArrowUpRight size={16} className="text-slate-400" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};