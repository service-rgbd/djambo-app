import React, { useState, useEffect, Suspense } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, Car, Wrench, Settings, Bell, Search, 
  Menu, X, LogOut, FileText, Users, Satellite, Database, Wifi, Loader2, Globe
} from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AIAssistant } from './components/AIAssistant';
import { BrandLogo } from './components/BrandLogo';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './components/auth/ResetPasswordPage';
import { CookieConsentBanner } from './components/legal/CookieConsentBanner';
import { vehicles } from './services/mockData';

// Lazy loading heavy components to optimize initial load time
const Dashboard = React.lazy(() => import('./components/Dashboard').then(module => ({ default: module.Dashboard })));
const VehicleList = React.lazy(() => import('./components/VehicleList').then(module => ({ default: module.VehicleList })));
const ClientList = React.lazy(() => import('./components/ClientList').then(module => ({ default: module.ClientList })));
const ContractManager = React.lazy(() => import('./components/ContractManager').then(module => ({ default: module.ContractManager })));
const PublicStorefront = React.lazy(() => import('./components/PublicStorefront').then(module => ({ default: module.PublicStorefront })));
const PricingPage = React.lazy(() => import('./components/PricingPage').then(module => ({ default: module.PricingPage })));
const ResourcesPage = React.lazy(() => import('./components/ResourcesPage').then(module => ({ default: module.ResourcesPage })));
const VehicleSearchPage = React.lazy(() => import('./components/marketplace/VehicleSearchPage').then(module => ({ default: module.VehicleSearchPage })));
const VehicleDetailPage = React.lazy(() => import('./components/marketplace/VehicleDetailPage').then(module => ({ default: module.VehicleDetailPage })));
const OwnerProfilePage = React.lazy(() => import('./components/marketplace/OwnerProfilePage').then(module => ({ default: module.OwnerProfilePage })));
const OwnerDashboard = React.lazy(() => import('./components/owner/OwnerDashboard').then(module => ({ default: module.OwnerDashboard })));
const SettingsPage = React.lazy(() => import('./components/SettingsPage').then(module => ({ default: module.SettingsPage })));
const CookiePolicyPage = React.lazy(() => import('./components/legal/CookiePolicyPage').then(module => ({ default: module.CookiePolicyPage })));
const PrivacyPolicyPage = React.lazy(() => import('./components/legal/PrivacyPolicyPage').then(module => ({ default: module.PrivacyPolicyPage })));
const TermsOfUsePage = React.lazy(() => import('./components/legal/TermsOfUsePage').then(module => ({ default: module.TermsOfUsePage })));

// Loading Component for Suspense
const PageLoader = () => (
  <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-indigo-600">
    <Loader2 size={40} className="animate-spin mb-4" />
    <p className="text-slate-500 font-medium animate-pulse">Chargement du module...</p>
  </div>
);

// Protected Route Component
const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>;
  }
  
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

// Sidebar Component
const Sidebar = ({ isOpen, toggleSidebar }: { isOpen: boolean; toggleSidebar: () => void }) => {
  const location = useLocation();
  const { logout, user } = useAuth();
  
  const links = [
    { path: '/app/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    ...(user?.role === 'PARC_AUTO' || user?.role === 'PARTICULIER'
      ? [{ path: '/app/owner-dashboard', label: user.role === 'PARC_AUTO' ? 'Mon parc auto' : 'Mon espace proprietaire', icon: Globe }]
      : []),
    { path: '/app/vehicles', label: 'Véhicules', icon: Car },
    { path: '/app/clients', label: 'Clients', icon: Users },
    { path: '/app/contracts', label: 'Contrats', icon: FileText },
    { path: '/app/maintenance', label: 'Maintenance', icon: Wrench },
    { path: '/app/settings', label: 'Paramètres', icon: Settings },
  ];

  const userRoleLabel = user?.role === 'PARC_AUTO' ? 'Espace parc auto' : user?.role === 'PARTICULIER' ? 'Espace proprietaire' : 'Espace utilisateur';
  const publicLinks = [
    { path: '/', label: 'Landing page', icon: Globe },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 z-20 bg-black/50 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={toggleSidebar}
      />

      {/* Sidebar Panel */}
      <aside className={`fixed top-0 left-0 z-30 h-full w-72 bg-slate-950 text-white transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="border-b border-white/10 px-6 py-5">
          <BrandLogo theme="light" size="md" useFullLogo />
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{userRoleLabel}</p>
        </div>

        <nav className="p-4 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link 
                key={link.path} 
                to={link.path}
                onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                className={`flex items-center gap-3 px-4 py-3 transition-colors ${isActive ? 'bg-white text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                <Icon size={20} />
                <span className="font-medium text-sm">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-4 pt-2">
          <p className="px-4 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Pages publiques</p>
          <div className="space-y-1">
            {publicLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                  className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Icon size={20} />
                  <span className="font-medium text-sm">{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <button 
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium text-sm">Déconnexion</span>
          </button>
        </div>
      </aside>
    </>
  );
};

// Header Component
const Header = ({ toggleSidebar }: { toggleSidebar: () => void }) => {
  const location = useLocation();
  const { user } = useAuth();

  const routeMeta = React.useMemo(() => {
    if (location.pathname.includes('/app/contracts')) {
      return { title: 'Contrats', description: 'Dossiers actifs, chauffeur a la demande, suivi et paiement.' };
    }
    if (location.pathname.includes('/app/vehicles')) {
      return { title: 'Vehicules', description: 'Inventaire, visuels et disponibilites.' };
    }
    if (location.pathname.includes('/app/owner-dashboard')) {
      return { title: user?.role === 'PARC_AUTO' ? 'Parc auto' : 'Espace proprietaire', description: 'Parkings, voitures, occupation et reservations a venir.' };
    }
    if (location.pathname.includes('/app/settings')) {
      return { title: 'Parametres', description: 'Identite, uploads, services et liens publics.' };
    }
    if (location.pathname.includes('/app/clients')) {
      return { title: 'Clients', description: 'Relations, profils et suivi commercial.' };
    }
    return { title: 'Tableau de bord', description: 'Vue d ensemble des operations, revenus et disponibilites.' };
  }, [location.pathname]);
  
  return (
    <header className="sticky top-0 z-10 bg-[linear-gradient(180deg,rgba(248,250,252,0.96),rgba(248,250,252,0.86))] px-4 shadow-[0_10px_35px_rgba(15,23,42,0.06)] backdrop-blur-xl lg:px-8">
      <div className="flex min-h-[96px] items-center justify-between gap-5">
      <div className="flex min-w-0 items-center gap-4">
        <button onClick={toggleSidebar} className="p-2 text-slate-500 transition-colors hover:bg-white/70 hover:text-slate-900 lg:hidden">
          <Menu size={24} />
        </button>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-extrabold tracking-tight text-slate-950">{routeMeta.title}</h1>
          <p className="hidden max-w-xl truncate text-sm text-slate-500 md:block">{routeMeta.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden xl:flex items-center gap-2 bg-white/80 px-4 py-2 text-slate-400 shadow-sm">
           <Search size={15} />
           <input type="text" placeholder="Rechercher contrat, client, vehicule..." className="w-56 bg-transparent border-none text-sm outline-none placeholder:text-slate-400" />
        </div>
        <nav className="hidden items-center gap-4 lg:flex">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-950">
          <Globe size={16} />
          Landing page
        </Link>
        <Link to="/vehicles" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-950">
          <Car size={16} />
          Catalogue public
        </Link>
        <Link to="/app/contracts" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-950">
          <FileText size={16} />
          Contrats
        </Link>
        <Link to="/app/settings" className="inline-flex items-center gap-2 bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800">
          <Settings size={16} />
          Parametres
        </Link>
        </nav>
        <button className="relative bg-white/80 p-2.5 text-slate-500 shadow-sm transition-colors hover:text-slate-900">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="flex items-center gap-3 bg-white/80 px-2.5 py-2 shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center bg-indigo-100 text-sm font-bold text-indigo-700">
            {user?.name ? user.name.substring(0,2).toUpperCase() : 'JD'}
            </div>
            <div className="hidden min-w-0 md:block">
              <p className="truncate text-sm font-semibold text-slate-900">{user?.name}</p>
              <p className="truncate text-xs text-slate-500">Session active</p>
            </div>
        </div>
      </div>
      </div>
    </header>
  );
};

const MaintenanceView = () => (
  <div className="p-8 text-center text-slate-500">
    <Wrench className="mx-auto mb-4 text-slate-300" size={64} />
    <h2 className="text-xl font-bold text-slate-700">Module Maintenance</h2>
    <p>Ce module suit l'historique et les plannings de service.</p>
  </div>
);

// Layout for the Dashboard App
const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(false)} />
      
      <div className="lg:pl-72 flex flex-col min-h-screen">
        <Header toggleSidebar={() => setSidebarOpen(true)} />
        
        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
           <Suspense fallback={<PageLoader />}>
              <Outlet />
           </Suspense>
        </main>
      </div>
      <AIAssistant />
    </div>
  );
};

// High-Tech Splash Screen Component
const SplashScreen = ({ isFadingOut }: { isFadingOut: boolean }) => {
  const [loadingText, setLoadingText] = useState('Initialisation...');
  
  useEffect(() => {
    const texts = [
      'Connexion sécurisée...',
      'Chargement de l espace Djambo...',
      'Synchronisation des disponibilites...',
      'Preparation de la vitrine...',
      'Prêt'
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i < texts.length) {
        setLoadingText(texts[i]);
        i++;
      }
    }, 450); // Change text every 450ms
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center font-sans transition-opacity duration-700 ease-out ${isFadingOut ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`}>
      
      {/* Technical Grid Background */}
      <div className="absolute inset-0 z-0 opacity-10" 
           style={{ backgroundImage: 'linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(to right, #6366f1 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-slate-950/50 to-slate-950"></div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center">
        
        {/* Animated Logo Container */}
        <div className="relative mb-12">
           <div className="absolute inset-0 bg-indigo-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
           <div className="w-24 h-24 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent animate-[shimmer_2s_infinite]"></div>
              <Car className="text-indigo-500 relative z-10" size={40} strokeWidth={1.5} />
              
              {/* Corner Accents */}
              <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-indigo-500/50"></div>
              <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-indigo-500/50"></div>
           </div>
        </div>

        {/* Brand Name */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white tracking-tight mb-2">
            Djam<span className="text-indigo-500">bo</span>
          </h1>
          <div className="flex items-center justify-center gap-2 text-slate-500 text-xs uppercase tracking-[0.2em]">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            System Online
          </div>
        </div>

        {/* Loading Bar & Text */}
        <div className="w-64 space-y-3">
          <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
             <div className="h-full bg-indigo-500 animate-[loading_2.5s_ease-in-out_forwards] w-0"></div>
             <style>{`
               @keyframes loading {
                 0% { width: 0%; }
                 50% { width: 70%; }
                 100% { width: 100%; }
               }
             `}</style>
          </div>
          <div className="flex justify-between items-center text-xs font-mono text-indigo-300/80 h-4">
             <span>{loadingText}</span>
             <span className="flex gap-1">
               <Wifi size={10} className={loadingText === 'Prêt' ? 'text-green-500' : 'animate-pulse'} />
               <Database size={10} className={loadingText === 'Prêt' ? 'text-green-500' : 'animate-pulse delay-75'} />
               <Satellite size={10} className={loadingText === 'Prêt' ? 'text-green-500' : 'animate-pulse delay-150'} />
             </span>
          </div>
        </div>
      </div>
      
      {/* Version Number */}
      <div className="absolute bottom-6 text-slate-700 text-[10px] font-mono">
        DJAMBO APP • SECURE CONNECTION
      </div>
    </div>
  );
};

// Main App Content with Logic for Splash
const AppContent = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const { isLoading } = useAuth();

  useEffect(() => {
    // Start fade out slightly before removing component
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 2200);

    // Remove component
    const removeTimer = setTimeout(() => {
      setShowSplash(false);
    }, 2800); // 2200ms + 600ms transition

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  // Show splash if timer is running OR if auth is still loading (but allow fade out if just waiting for auth)
  if (showSplash || (isLoading && !isFadingOut)) {
    return <SplashScreen isFadingOut={isFadingOut} />;
  }

  return (
    <HashRouter>
      <Routes>
        {/* Public Routes - Keep static for instant load */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/cookies" element={
          <Suspense fallback={<PageLoader />}>
            <CookiePolicyPage />
          </Suspense>
        } />
        <Route path="/privacy" element={
          <Suspense fallback={<PageLoader />}>
            <PrivacyPolicyPage />
          </Suspense>
        } />
        <Route path="/terms" element={
          <Suspense fallback={<PageLoader />}>
            <TermsOfUsePage />
          </Suspense>
        } />
        
        {/* Marketplace public routes */}
        <Route path="/vehicles" element={
          <Suspense fallback={<PageLoader />}>
            <VehicleSearchPage />
          </Suspense>
        } />
        <Route path="/vehicles/:id" element={
          <Suspense fallback={<PageLoader />}>
            <VehicleDetailPage />
          </Suspense>
        } />
        <Route path="/profile/:profileId" element={
          <Suspense fallback={<PageLoader />}>
            <OwnerProfilePage />
          </Suspense>
        } />

        {/* Lazy Loaded Routes wrapped in Suspense */}
        <Route path="/pricing" element={
          <Suspense fallback={<PageLoader />}>
            <PricingPage />
          </Suspense>
        } />
        <Route path="/resources" element={
          <Suspense fallback={<PageLoader />}>
            <ResourcesPage />
          </Suspense>
        } />
        <Route path="/store/:agencySlug" element={
          <Suspense fallback={<PageLoader />}>
            <PublicStorefront />
          </Suspense>
        } />

        {/* Protected Routes */}
        <Route path="/app" element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="vehicles" element={<VehicleList vehicles={vehicles} />} />
            <Route path="clients" element={<ClientList />} />
            <Route path="contracts" element={<ContractManager />} />
            <Route path="maintenance" element={<MaintenanceView />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="owner-dashboard" element={<OwnerDashboard />} />
            <Route index element={<Navigate to="dashboard" />} />
          </Route>
        </Route>
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <CookieConsentBanner />
    </HashRouter>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}