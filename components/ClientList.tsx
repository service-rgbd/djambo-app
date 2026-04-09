import React, { useState } from 'react';
import { Customer } from '../types';
import { Search, Plus, User, Phone, Mail, FileBadge, MoreHorizontal } from 'lucide-react';
import { customers as initialCustomers } from '../services/mockData';

export const ClientList: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({});

  const filteredCustomers = customers.filter(c => 
    c.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCustomer = () => {
    if (newCustomer.firstName && newCustomer.lastName && newCustomer.email) {
      setCustomers([...customers, {
        id: `c${Date.now()}`,
        firstName: newCustomer.firstName,
        lastName: newCustomer.lastName,
        email: newCustomer.email,
        phone: newCustomer.phone || '',
        licenseNumber: newCustomer.licenseNumber || '',
        status: 'Actif'
      }]);
      setIsModalOpen(false);
      setNewCustomer({});
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-lg font-bold text-slate-800">Gestion des Clients</h2>
          <div className="flex gap-3 w-full sm:w-auto">
             <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Rechercher clients..." 
                  className="pl-9 pr-4 py-2 border rounded-lg text-sm w-full"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
             </div>
             <button 
               onClick={() => setIsModalOpen(true)}
               className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2"
             >
               <Plus size={16} /> Nouveau Client
             </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 font-medium text-slate-900">
              <tr>
                <th className="px-6 py-4">Nom</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Permis</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map(customer => (
                <tr key={customer.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                        {customer.firstName[0]}{customer.lastName[0]}
                      </div>
                      <span className="font-medium text-slate-900">{customer.firstName} {customer.lastName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-2"><Mail size={12} className="text-slate-400"/> {customer.email}</span>
                      <span className="flex items-center gap-2"><Phone size={12} className="text-slate-400"/> {customer.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-2"><FileBadge size={14} className="text-slate-400"/> {customer.licenseNumber}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${customer.status === 'Actif' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-slate-400 hover:text-indigo-600"><MoreHorizontal size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Ajouter un Client</h3>
            <div className="space-y-3">
               <div className="grid grid-cols-2 gap-3">
                 <input className="border p-2 rounded-lg text-sm" placeholder="Prénom" value={newCustomer.firstName || ''} onChange={e => setNewCustomer({...newCustomer, firstName: e.target.value})} />
                 <input className="border p-2 rounded-lg text-sm" placeholder="Nom" value={newCustomer.lastName || ''} onChange={e => setNewCustomer({...newCustomer, lastName: e.target.value})} />
               </div>
               <input className="border p-2 rounded-lg text-sm w-full" placeholder="Email" value={newCustomer.email || ''} onChange={e => setNewCustomer({...newCustomer, email: e.target.value})} />
               <input className="border p-2 rounded-lg text-sm w-full" placeholder="Téléphone" value={newCustomer.phone || ''} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} />
               <input className="border p-2 rounded-lg text-sm w-full" placeholder="Numéro Permis" value={newCustomer.licenseNumber || ''} onChange={e => setNewCustomer({...newCustomer, licenseNumber: e.target.value})} />
               
               <div className="flex gap-2 mt-4">
                 <button onClick={() => setIsModalOpen(false)} className="flex-1 py-2 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200">Annuler</button>
                 <button onClick={handleAddCustomer} className="flex-1 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Enregistrer</button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};