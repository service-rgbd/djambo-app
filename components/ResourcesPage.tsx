import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Car, Search, BookOpen, FileText, Video, ArrowRight, Tag, Calendar, Mail, Phone, MapPin, Globe, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export const ResourcesPage: React.FC = () => {
  const [filter, setFilter] = useState('Tous');

  const articles = [
    {
      id: 1,
      title: "Comment optimiser la rentabilité de votre flotte en 2024",
      category: "Guide",
      date: "12 Mars 2024",
      image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=800&auto=format&fit=crop",
      desc: "Découvrez les stratégies clés pour réduire vos coûts de maintenance et augmenter le taux d'occupation de vos véhicules."
    },
    {
      id: 2,
      title: "Législation : Ce qu'il faut savoir sur les contrats de location",
      category: "Juridique",
      date: "05 Mars 2024",
      image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=800&auto=format&fit=crop",
      desc: "Protégez votre agence avec des contrats conformes. Analyse des clauses indispensables pour éviter les impayés."
    },
    {
      id: 3,
      title: "Tuto : Installer un traceur GPS en 5 minutes",
      category: "Tutoriel",
      date: "28 Fév 2024",
      image: "https://images.unsplash.com/photo-1581092921461-eab6245b0264?q=80&w=800&auto=format&fit=crop",
      desc: "Un guide pas à pas pour installer nos boîtiers de télémétrie sur n'importe quel type de véhicule."
    },
    {
      id: 4,
      title: "Maintenance préventive vs curative : Le calcul est vite fait",
      category: "Maintenance",
      date: "15 Fév 2024",
      image: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?q=80&w=800&auto=format&fit=crop",
      desc: "Pourquoi attendre la panne vous coûte 3 fois plus cher que d'anticiper les réparations."
    }
  ];

  const categories = ['Tous', 'Guide', 'Juridique', 'Tutoriel', 'Maintenance'];
  const filteredArticles = filter === 'Tous' ? articles : articles.filter(a => a.category === filter);

  return (
    <div className="bg-slate-50 min-h-screen font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
             <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
               <Car className="text-white" size={24} />
             </div>
             <span className="text-2xl font-bold text-slate-900 tracking-tight">Fleet<span className="text-indigo-600">Command</span></span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to="/#features" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Fonctionnalités</Link>
            <Link to="/pricing" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Tarifs</Link>
            <Link to="/resources" className="text-sm font-bold text-indigo-600 transition-colors">Ressources</Link>
          </div>
          <div className="flex items-center gap-4">
             <Link to="/login" className="text-sm font-bold text-slate-700 hover:text-indigo-600 hidden sm:block px-4 py-2">Connexion</Link>
             <Link to="/register" className="bg-indigo-600 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-indigo-700 transition-all hover:shadow-lg hover:shadow-indigo-200 hover:-translate-y-0.5">
               Commencer
             </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-slate-900 text-white pt-32 pb-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold mb-6">
                <BookOpen size={14} /> CENTRE DE RESSOURCES
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Conseils d'experts pour les loueurs pro</h1>
              <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
                  Tout ce dont vous avez besoin pour gérer, développer et sécuriser votre agence de location de voitures.
              </p>
              
              <div className="relative max-w-lg mx-auto">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                 <input 
                    type="text" 
                    placeholder="Rechercher un article, un guide..." 
                    className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:bg-white/20 focus:border-indigo-500 transition-all"
                 />
              </div>
          </div>
      </div>

      {/* Content */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
             {categories.map(cat => (
                 <button 
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                        filter === cat 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                 >
                     {cat}
                 </button>
             ))}
          </div>

          {/* Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
             {filteredArticles.map(article => (
                 <article key={article.id} className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                     <div className="h-48 overflow-hidden relative">
                         <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                         <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-xs font-bold text-indigo-600 uppercase">
                             {article.category}
                         </div>
                     </div>
                     <div className="p-6">
                         <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                             <Calendar size={14} /> {article.date}
                         </div>
                         <h3 className="text-xl font-bold text-slate-900 mb-3 leading-tight group-hover:text-indigo-600 transition-colors">
                             {article.title}
                         </h3>
                         <p className="text-slate-600 text-sm mb-6 line-clamp-3">
                             {article.desc}
                         </p>
                         <a href="#" className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:gap-3 transition-all">
                             Lire l'article <ArrowRight size={16} />
                         </a>
                     </div>
                 </article>
             ))}
             
             {/* Newsletter Card */}
             <div className="bg-indigo-600 rounded-2xl p-8 text-white flex flex-col justify-center text-center">
                 <Mail size={40} className="mx-auto mb-4 text-indigo-200" />
                 <h3 className="text-2xl font-bold mb-2">Restez informé</h3>
                 <p className="text-indigo-100 text-sm mb-6">Recevez nos derniers conseils directement dans votre boîte mail chaque semaine.</p>
                 <div className="space-y-3">
                     <input type="email" placeholder="Votre email pro" className="w-full px-4 py-3 rounded-xl bg-white/10 border border-indigo-400 placeholder-indigo-200 text-white focus:outline-none focus:bg-white/20" />
                     <button className="w-full py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-colors">M'inscrire</button>
                 </div>
             </div>
          </div>
      </section>

      {/* Footer (Reused) */}
      <footer className="bg-slate-950 text-slate-300 pt-20 pb-10 border-t border-slate-800 font-sans mt-24">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
               <div className="lg:col-span-4">
                   <div className="flex items-center gap-2 mb-6">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/20">
                            <Car className="text-white" size={20} />
                        </div>
                        <span className="text-2xl font-bold text-white tracking-tight">Fleet<span className="text-indigo-500">Command</span></span>
                   </div>
                   <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-sm">
                     La solution tout-en-un pour moderniser la gestion de votre parc automobile en Afrique.
                   </p>
               </div>
               <div className="lg:col-span-8 flex flex-wrap gap-8 lg:justify-end">
                    <Link to="/pricing" className="text-slate-400 hover:text-white">Tarifs</Link>
                    <Link to="/resources" className="text-slate-400 hover:text-white">Ressources</Link>
                    <Link to="/login" className="text-slate-400 hover:text-white">Connexion</Link>
               </div>
           </div>
           <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
             <p className="text-slate-500 text-sm">© 2024 FleetCommand SaaS.</p>
           </div>
         </div>
      </footer>
    </div>
  );
};