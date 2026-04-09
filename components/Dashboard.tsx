import React, { useEffect, useState } from 'react';
import { 
  AreaChart, Area 
} from 'recharts';
import { FleetStats, RevenueData } from '../types';
import { 
  Car, Wrench, Wallet, Activity, TrendingUp, AlertCircle, 
  Share2, Copy, Check, MapPinned, Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

interface DashboardProps {
  stats?: FleetStats & { availableVehicles?: number; totalParkings?: number };
  revenueData?: RevenueData[];
}

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  color: 'indigo' | 'green' | 'amber' | 'rose';
}> = ({ title, value, icon: Icon, trend, color }) => {
  const colorClasses = {
    indigo: 'bg-indigo-50 text-indigo-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
          {trend && (
            <p className="text-xs font-medium text-green-600 mt-2 flex items-center gap-1">
              <TrendingUp size={12} />
              {trend} depuis le mois dernier
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ stats, revenueData }) => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<FleetStats & { availableVehicles?: number; totalParkings?: number } | null>(stats ?? null);
  const [dashboardRevenueData, setDashboardRevenueData] = useState<RevenueData[]>(revenueData ?? []);
  const [isLoading, setIsLoading] = useState(!stats || !revenueData);
  const [error, setError] = useState('');
  
  // Create a URL-friendly slug from user name or fallback
  const agencySlug = user?.name 
    ? user.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') 
    : 'ma-flotte';
  
  // Construct the full URL (using current origin + hash router structure)
  const storeUrl = `${window.location.origin}/#/store/${agencySlug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (stats && revenueData) {
      return;
    }

    let isMounted = true;

    const loadDashboard = async () => {
      try {
        setIsLoading(true);
        const response = await api.getDashboardOverview();
        if (!isMounted) {
          return;
        }
        setDashboardStats(response.stats);
        setDashboardRevenueData(response.revenueData);
        setError('');
      } catch (loadError) {
        if (!isMounted) {
          return;
        }
        setError('Impossible de charger les indicateurs en temps réel.');
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
  }, [revenueData, stats]);

  if (isLoading && !dashboardStats) {
    return (
      <div className="min-h-[320px] flex items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 size={20} className="animate-spin text-indigo-600" />
          <span>Chargement du tableau de bord...</span>
        </div>
      </div>
    );
  }

  if (!dashboardStats) {
    return (
      <div className="rounded-2xl border border-rose-100 bg-rose-50 p-6 text-rose-700">
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Véhicules" 
          value={dashboardStats.totalVehicles} 
          icon={Car} 
          color="indigo"
          trend="+2"
        />
        <StatCard 
          title="Locations Actives" 
          value={dashboardStats.activeRentals} 
          icon={Activity} 
          color="green"
          trend="+12%"
        />
        <StatCard 
          title="En Maintenance" 
          value={dashboardStats.inMaintenance} 
          icon={Wrench} 
          color="amber"
        />
        <StatCard 
          title="Revenu Total" 
          value={`${dashboardStats.totalRevenue.toLocaleString()} FCFA`} 
          icon={Wallet} 
          color="rose"
          trend="+8%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Public Store Link Banner - Replaces GPS Banner for now or adds to it */}
          <div className="lg:col-span-2 relative overflow-hidden rounded-xl bg-slate-900 p-8 shadow-lg text-white group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/30 transition-all duration-500"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-lg">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-medium backdrop-blur-sm">
                  <Share2 size={14} />
                  <span>Nouveau : Boutique en ligne</span>
                </div>
                <h2 className="text-2xl font-bold leading-tight">
                  Votre site de réservation est prêt !
                </h2>
                <p className="text-slate-400 text-sm">
                  Partagez ce lien unique avec vos clients. Ils pourront consulter vos véhicules disponibles et faire une demande de réservation directement en ligne.
                </p>
                <div className="flex items-center gap-2 pt-2">
                    <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-400 font-mono truncate max-w-[250px] md:max-w-xs select-all">
                        {storeUrl}
                    </div>
                    <button 
                        onClick={handleCopyLink}
                        className="p-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white transition-colors"
                        title="Copier le lien"
                    >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                </div>
              </div>
              
              <div className="hidden md:block">
                  <div className="w-32 h-32 bg-slate-800 rounded-xl border border-slate-700 flex flex-col items-center justify-center text-center p-2 shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500">
                     <Car className="text-indigo-500 mb-2" size={32} />
                     <span className="text-[10px] text-slate-500 uppercase font-bold">{agencySlug}</span>
                     <div className="w-16 h-2 bg-indigo-600 rounded-full mt-2"></div>
                  </div>
              </div>
            </div>
          </div>

          {/* Alert Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Visibilite operationnelle</h3>
            <div className="flex-1 space-y-4">
              <div className="flex gap-3 items-start p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                  <Car className="text-emerald-600 shrink-0 mt-0.5" size={18} />
                  <div>
                    <h4 className="text-sm font-semibold text-emerald-900">Vehicules disponibles</h4>
                    <p className="text-xs text-emerald-700 mt-1">{dashboardStats.availableVehicles ?? 0} vehicule(s) peuvent etre proposes immediatement.</p>
                  </div>
              </div>
              <div className="flex gap-3 items-start p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <MapPinned className="text-blue-600 shrink-0 mt-0.5" size={18} />
                  <div>
                    <h4 className="text-sm font-semibold text-blue-900">Parkings suivis</h4>
                    <p className="text-xs text-blue-700 mt-1">{dashboardStats.totalParkings ?? 0} parking(s) remontent dans le dashboard.</p>
                  </div>
              </div>
              <div className="flex gap-3 items-start p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={18} />
                  <div>
                    <h4 className="text-sm font-semibold text-amber-900">Locations en cours</h4>
                    <p className="text-xs text-amber-700 mt-1">{dashboardStats.activeRentals} vehicule(s) sont actuellement engages.</p>
                  </div>
              </div>
            </div>
          </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Analyse des Revenus</h3>
            <select className="text-sm border border-slate-200 rounded-lg px-3 py-1 text-slate-600 outline-none focus:border-indigo-500">
              <option>6 Derniers Mois</option>
              <option>Cette Année</option>
            </select>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboardRevenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={(value) => `${Math.round(value/1000)}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`${value.toLocaleString()} FCFA`, 'Revenu']}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#4f46e5" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
    </div>
  );
};