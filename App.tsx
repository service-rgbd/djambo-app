import React, { useState, useEffect, Suspense } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, Car, Wrench, Settings, Bell, Search, 
  Menu, X, LogOut, FileText, Users, Satellite, Database, Wifi, Loader2
} from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AIAssistant } from './components/AIAssistant';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './components/auth/ResetPasswordPage';
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
    { path: '/app/vehicles', label: 'Véhicules', icon: Car },
    { path: '/app/clients', label: 'Clients', icon: Users },
    { path: '/app/contracts', label: 'Contrats', icon: FileText },
    { path: '/app/maintenance', label: 'Maintenance', icon: Wrench },
    { path: '/app/settings', label: 'Paramètres', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 z-20 bg-black/50 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={toggleSidebar}
      />

      {/* Sidebar Panel */}
      <aside className={`fixed top-0 left-0 z-30 h-full w-64 bg-slate-900 text-white transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center h-16 px-6 border-b border-slate-800">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center mr-3">
             <Car size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Fleet<span className="text-indigo-400">Command</span></span>
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
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
              >
                <Icon size={20} />
                <span className="font-medium text-sm">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <button 
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
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
  const { user } = useAuth();
  
  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-10 px-4 lg:px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
          <Menu size={24} />
        </button>
        <div className="hidden md:flex items-center gap-2 text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
           <Search size={16} />
           <input type="text" placeholder="Rechercher..." className="bg-transparent border-none outline-none text-sm w-48" />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-sm border-2 border-indigo-200">
            {user?.name ? user.name.substring(0,2).toUpperCase() : 'JD'}
            </div>
            <span className="hidden md:block text-sm font-medium text-slate-700">{user?.name}</span>
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
      
      <div className="lg:pl-64 flex flex-col min-h-screen">
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
      'Chargement de la flotte...',
      'Synchronisation GPS...',
      'Analyse des données...',
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
            Fleet<span className="text-indigo-500">Command</span>
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
        v2.4.0-RC • SECURE CONNECTION
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
            <Route path="settings" element={<div className="p-8 text-center">Paramètres</div>} />
            <Route path="owner-dashboard" element={<OwnerDashboard />} />
            <Route index element={<Navigate to="dashboard" />} />
          </Route>
        </Route>
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
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