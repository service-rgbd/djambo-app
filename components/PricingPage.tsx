import React from 'react';
import { Link } from 'react-router-dom';
import { Check, X, HelpCircle, ChevronDown, Car, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Globe } from 'lucide-react';

export const PricingPage: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navbar (Duplicated for consistency - normally extracted to Layout) */}
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
            <Link to="/pricing" className="text-sm font-bold text-indigo-600 transition-colors">Tarifs</Link>
            <Link to="/resources" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Ressources</Link>
          </div>
          <div className="flex items-center gap-4">
             <Link to="/login" className="text-sm font-bold text-slate-700 hover:text-indigo-600 hidden sm:block px-4 py-2">Connexion</Link>
             <Link to="/register" className="bg-indigo-600 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-indigo-700 transition-all hover:shadow-lg hover:shadow-indigo-200 hover:-translate-y-0.5">
               Commencer
             </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="pt-32 pb-16 bg-white text-center px-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">Investissez dans votre croissance</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Des tarifs transparents, sans frais cachés. Changez de plan ou annulez à tout moment.
          </p>
      </div>

      {/* Pricing Cards */}
      <section className="py-12 px-4 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-24">
            {/* Starter */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-shadow relative flex flex-col">
                <h3 className="text-xl font-bold text-slate-900">Démarrage</h3>
                <p className="text-slate-500 text-sm mt-2">Pour lancer votre activité.</p>
                <div className="my-6">
                    <span className="text-4xl font-bold text-slate-900">12,000</span>
                    <span className="text-slate-500"> FCFA/mois</span>
                </div>
                <Link to="/register" className="block w-full py-3 px-4 bg-indigo-50 text-indigo-700 font-bold text-center rounded-xl hover:bg-indigo-100 transition-colors mb-8">Essai Gratuit</Link>
                <div className="space-y-4 flex-1">
                    {['Jusqu\'à 10 Véhicules', 'Contrats Illimités', 'Planning de base', 'Support Email'].map(f => (
                        <div key={f} className="flex items-center gap-3 text-sm text-slate-700">
                            <Check size={16} className="text-indigo-600 shrink-0" /> {f}
                        </div>
                    ))}
                </div>
            </div>

            {/* Pro */}
            <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl relative transform md:-translate-y-4 flex flex-col">
                <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">RECOMMANDÉ</div>
                <h3 className="text-xl font-bold text-white">Professionnel</h3>
                <p className="text-indigo-200 text-sm mt-2">L'essentiel pour automatiser.</p>
                <div className="my-6">
                    <span className="text-4xl font-bold text-white">25,000</span>
                    <span className="text-indigo-200"> FCFA/mois</span>
                </div>
                <Link to="/register" className="block w-full py-3 px-4 bg-indigo-600 text-white font-bold text-center rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-900/50 mb-8">Essai Gratuit</Link>
                <div className="space-y-4 flex-1">
                    {['Jusqu\'à 50 Véhicules', 'Suivi GPS Temps Réel', 'Gestion Financière', 'Alertes SMS Clients', 'Site Web de Réservation', 'Support WhatsApp Prioritaire'].map(f => (
                        <div key={f} className="flex items-center gap-3 text-sm text-slate-300">
                            <Check size={16} className="text-indigo-400 shrink-0" /> {f}
                        </div>
                    ))}
                </div>
            </div>

            {/* Enterprise */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-shadow relative flex flex-col">
                <h3 className="text-xl font-bold text-slate-900">Grand Compte</h3>
                <p className="text-slate-500 text-sm mt-2">Performance maximale.</p>
                <div className="my-6">
                    <span className="text-4xl font-bold text-slate-900">Sur Devis</span>
                </div>
                <button className="block w-full py-3 px-4 bg-white border-2 border-slate-900 text-slate-900 font-bold text-center rounded-xl hover:bg-slate-50 transition-colors mb-8">Contacter l'équipe</button>
                <div className="space-y-4 flex-1">
                    {['Véhicules Illimités', 'Comptes Multi-Utilisateurs', 'API & Intégrations', 'Marque Blanche', 'Formation sur site', 'Account Manager Dédié'].map(f => (
                        <div key={f} className="flex items-center gap-3 text-sm text-slate-700">
                            <Check size={16} className="text-slate-900 shrink-0" /> {f}
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Feature Comparison Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-24">
            <div className="p-8 border-b border-slate-100">
                <h2 className="text-2xl font-bold text-slate-900">Comparatif détaillé</h2>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50">
                            <th className="p-6 text-sm font-semibold text-slate-500 w-1/3">Fonctionnalité</th>
                            <th className="p-6 text-sm font-bold text-slate-900 text-center w-1/5">Démarrage</th>
                            <th className="p-6 text-sm font-bold text-indigo-600 text-center w-1/5 bg-indigo-50/30">Professionnel</th>
                            <th className="p-6 text-sm font-bold text-slate-900 text-center w-1/5">Grand Compte</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {[
                            { name: 'Nombre de Véhicules', s: '10', p: '50', e: 'Illimité' },
                            { name: 'Contrats Numériques', s: true, p: true, e: true },
                            { name: 'Gestion Clients', s: true, p: true, e: true },
                            { name: 'Suivi GPS', s: false, p: true, e: true },
                            { name: 'Site de Réservation', s: false, p: true, e: true },
                            { name: 'Gestion Caisse', s: 'Basique', p: 'Avancé', e: 'Complet' },
                            { name: 'Multi-Agences', s: false, p: false, e: true },
                            { name: 'Export Comptable', s: false, p: true, e: true },
                            { name: 'Support', s: 'Email', p: 'WhatsApp', e: 'Dédié 24/7' },
                        ].map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-6 text-sm font-medium text-slate-700">{row.name}</td>
                                <td className="p-6 text-center">
                                    {typeof row.s === 'boolean' ? (
                                        row.s ? <Check size={20} className="mx-auto text-emerald-500" /> : <X size={20} className="mx-auto text-slate-300" />
                                    ) : <span className="text-sm text-slate-600">{row.s}</span>}
                                </td>
                                <td className="p-6 text-center bg-indigo-50/10">
                                    {typeof row.p === 'boolean' ? (
                                        row.p ? <Check size={20} className="mx-auto text-indigo-600" /> : <X size={20} className="mx-auto text-slate-300" />
                                    ) : <span className="text-sm font-bold text-indigo-900">{row.p}</span>}
                                </td>
                                <td className="p-6 text-center">
                                    {typeof row.e === 'boolean' ? (
                                        row.e ? <Check size={20} className="mx-auto text-emerald-500" /> : <X size={20} className="mx-auto text-slate-300" />
                                    ) : <span className="text-sm text-slate-600">{row.e}</span>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Questions Fréquentes</h2>
            <div className="space-y-4">
                {[
                    { q: "Puis-je changer de plan plus tard ?", a: "Oui, vous pouvez passer au plan supérieur ou inférieur à tout moment depuis vos paramètres. Le changement est immédiat." },
                    { q: "Comment fonctionne le suivi GPS ?", a: "Nous vous fournissons des traceurs compatibles ou nous intégrons vos traceurs existants. Les données remontent directement dans l'application." },
                    { q: "Mes données sont-elles sécurisées ?", a: "Absolument. Nous utilisons un chiffrement bancaire et des sauvegardes quotidiennes pour protéger les informations de vos clients et de votre flotte." },
                    { q: "Y a-t-il des frais d'installation ?", a: "Non, l'installation est gratuite. Pour le plan Grand Compte nécessitant une configuration sur site, des frais de déplacement peuvent s'appliquer." }
                ].map((item, i) => (
                    <div key={i} className="bg-white border border-slate-200 rounded-xl p-6 hover:border-indigo-200 transition-colors">
                        <h4 className="text-lg font-bold text-slate-900 mb-2 flex items-start gap-3">
                            <HelpCircle className="text-indigo-500 shrink-0 mt-1" size={20} />
                            {item.q}
                        </h4>
                        <p className="text-slate-600 ml-8">{item.a}</p>
                    </div>
                ))}
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
               {/* Footer links placeholder to keep it short */}
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