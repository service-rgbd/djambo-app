import React, { useState } from 'react';
import { Customer, Vehicle, Contract, VehicleStatus } from '../types';
import { customers, vehicles as initialVehicles } from '../services/mockData';
import { FileText, CreditCard, CheckCircle, Car, Calendar, DollarSign, User } from 'lucide-react';

const CONTRACT_ILLUSTRATION_SRC = new URL('../ullustrqtionsectioncontrat.jpg', import.meta.url).href;

export const ContractManager: React.FC = () => {
  const [step, setStep] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Available vehicles
  const availableVehicles = initialVehicles.filter(v => v.status === VehicleStatus.Active);
  
  // Calculations
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const dailyRate = 30000; // Mock rate in CFA roughly ($50)
  const totalAmount = days * dailyRate;

  const handleCreateContract = () => {
    setShowPayment(true);
  };

  const handlePayment = () => {
    setProcessing(true);
    setTimeout(() => {
        setProcessing(false);
        setPaymentSuccess(true);
    }, 2000);
  };

  const reset = () => {
    setStep(1);
    setSelectedCustomer('');
    setSelectedVehicle('');
    setStartDate('');
    setEndDate('');
    setShowPayment(false);
    setPaymentSuccess(false);
  };

  if (paymentSuccess) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[500px] bg-white rounded-xl shadow-sm p-8 text-center animate-fade-in-up">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6">
          <CheckCircle size={40} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Paiement Réussi !</h2>
        <p className="text-slate-500 mb-8 max-w-md">Le contrat a été généré et le paiement de {totalAmount.toLocaleString()} FCFA a été traité avec succès. Une copie a été envoyée au client.</p>
        <button onClick={reset} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">
          Créer un Autre Contrat
        </button>
      </div>
    );
  }

  if (showPayment) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden mt-10">
        <div className="bg-slate-50 p-6 border-b border-slate-200">
           <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
             <CreditCard className="text-indigo-600" size={20} /> Paiement Sécurisé
           </h3>
           <p className="text-sm text-slate-500 mt-1">Complétez le paiement pour finaliser le contrat</p>
        </div>
        
        <div className="p-6 space-y-6">
           <div className="flex justify-between items-center bg-indigo-50 p-4 rounded-lg">
              <span className="text-sm font-medium text-indigo-900">Montant Total</span>
              <span className="text-2xl font-bold text-indigo-600">{totalAmount.toLocaleString()} FCFA</span>
           </div>

           <div className="space-y-4">
              <div className="space-y-1">
                 <label className="text-xs font-medium text-slate-700">Numéro de Carte</label>
                 <div className="relative">
                   <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                   <input type="text" placeholder="0000 0000 0000 0000" className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm font-mono" />
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                   <label className="text-xs font-medium text-slate-700">Expiration</label>
                   <input type="text" placeholder="MM/AA" className="w-full px-4 py-2 border rounded-lg text-sm text-center" />
                </div>
                <div className="space-y-1">
                   <label className="text-xs font-medium text-slate-700">CVC</label>
                   <input type="text" placeholder="123" className="w-full px-4 py-2 border rounded-lg text-sm text-center" />
                </div>
              </div>
           </div>

           <button 
             onClick={handlePayment} 
             disabled={processing}
             className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
           >
             {processing ? 'Traitement...' : `Payer ${totalAmount.toLocaleString()} FCFA`}
           </button>
           
           <button onClick={() => setShowPayment(false)} className="w-full text-center text-sm text-slate-500 hover:text-slate-700">
             Annuler la Transaction
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm overflow-hidden">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6 items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600 mb-2">Contrats FleetCommand</p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-3">Un contrat plus clair, plus rassurant et plus facile a signer.</h2>
            <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">L'illustration sert ici de repere visuel pour mieux expliquer la logique du contrat, du choix du client jusqu'au paiement securise et a l'activation.</p>
          </div>
          <div className="rounded-[24px] overflow-hidden border border-slate-200 bg-slate-100 shadow-sm">
            <img src={CONTRACT_ILLUSTRATION_SRC} alt="Illustration explicative du contrat" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Form Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <FileText className="text-indigo-600"/> Nouveau Contrat de Location
        </h2>
        
        <div className="space-y-6">
          <div className="space-y-2">
             <label className="text-sm font-medium text-slate-700">1. Sélectionner Client</label>
             <div className="relative">
               <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
               <select 
                 className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none bg-white"
                 value={selectedCustomer}
                 onChange={(e) => setSelectedCustomer(e.target.value)}
               >
                 <option value="">Choisir un client...</option>
                 {customers.map(c => (
                   <option key={c.id} value={c.id}>{c.firstName} {c.lastName} ({c.licenseNumber})</option>
                 ))}
               </select>
             </div>
          </div>

          <div className="space-y-2">
             <label className="text-sm font-medium text-slate-700">2. Sélectionner Véhicule</label>
             <div className="relative">
               <Car className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
               <select 
                 className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none bg-white"
                 value={selectedVehicle}
                 onChange={(e) => setSelectedVehicle(e.target.value)}
               >
                 <option value="">Choisir un véhicule...</option>
                 {availableVehicles.map(v => (
                   <option key={v.id} value={v.id}>{v.make} {v.model} - {v.licensePlate}</option>
                 ))}
               </select>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <label className="text-sm font-medium text-slate-700">Date Début</label>
               <input type="date" className="w-full px-3 py-3 border border-slate-200 rounded-lg text-sm" value={startDate} onChange={e => setStartDate(e.target.value)}/>
             </div>
             <div className="space-y-2">
               <label className="text-sm font-medium text-slate-700">Date Fin</label>
               <input type="date" className="w-full px-3 py-3 border border-slate-200 rounded-lg text-sm" value={endDate} onChange={e => setEndDate(e.target.value)}/>
             </div>
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 flex flex-col h-full">
        <h3 className="font-bold text-slate-800 mb-4">Résumé du Contrat</h3>
        
        <div className="flex-1 space-y-4">
           {selectedCustomer && (
             <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold">Client</p>
                  <p className="font-medium text-slate-900">
                    {customers.find(c => c.id === selectedCustomer)?.firstName} {customers.find(c => c.id === selectedCustomer)?.lastName}
                  </p>
                </div>
                <User className="text-indigo-400" size={20} />
             </div>
           )}
           
           {selectedVehicle && (
             <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold">Véhicule</p>
                  <p className="font-medium text-slate-900">
                    {initialVehicles.find(v => v.id === selectedVehicle)?.make} {initialVehicles.find(v => v.id === selectedVehicle)?.model}
                  </p>
                </div>
                <Car className="text-indigo-400" size={20} />
             </div>
           )}

           {startDate && endDate && (
             <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                   <p className="text-xs text-slate-500 uppercase font-semibold">Durée</p>
                   <p className="font-medium text-slate-900">{days} Jours</p>
                </div>
                <div className="flex justify-between items-center mb-2">
                   <p className="text-xs text-slate-500 uppercase font-semibold">Tarif</p>
                   <p className="font-medium text-slate-900">{dailyRate.toLocaleString()} / jour</p>
                </div>
                <div className="border-t border-slate-100 mt-2 pt-2 flex justify-between items-center">
                   <p className="font-bold text-slate-800">Total</p>
                   <p className="font-bold text-indigo-600 text-lg">{totalAmount.toLocaleString()} FCFA</p>
                </div>
             </div>
           )}
        </div>

        <button 
          disabled={!selectedCustomer || !selectedVehicle || !startDate || !endDate}
          onClick={handleCreateContract}
          className="w-full mt-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors shadow-lg shadow-indigo-200"
        >
          Générer & Payer
        </button>
      </div>
      </div>
    </div>
  );
};