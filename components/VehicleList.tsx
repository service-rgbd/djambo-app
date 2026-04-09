import React, { useState } from 'react';
import { Vehicle, VehicleStatus, FuelType } from '../types';
import { Search, Plus, X, Zap, Battery, Droplet, Car, Calendar, Gauge } from 'lucide-react';

interface VehicleListProps {
  vehicles: Vehicle[];
}

export const VehicleList: React.FC<VehicleListProps> = ({ vehicles: initialVehicles }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [filter, setFilter] = useState<string>('Tout');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // New Vehicle Form State
  const [newVehicle, setNewVehicle] = useState<Partial<Vehicle>>({
    status: VehicleStatus.Active,
    fuelType: FuelType.Petrol,
    imageUrl: 'https://picsum.photos/400/300?random=' + Math.random()
  });

  const filteredVehicles = vehicles.filter(v => {
    const matchesFilter = filter === 'Tout' || v.status === filter;
    const matchesSearch = 
      v.make.toLowerCase().includes(search.toLowerCase()) || 
      v.model.toLowerCase().includes(search.toLowerCase()) ||
      v.licensePlate.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleAddVehicle = () => {
    if (newVehicle.make && newVehicle.model && newVehicle.licensePlate) {
      const vehicle: Vehicle = {
        id: `v${Date.now()}`,
        make: newVehicle.make,
        model: newVehicle.model,
        year: newVehicle.year || new Date().getFullYear(),
        licensePlate: newVehicle.licensePlate,
        status: newVehicle.status as VehicleStatus,
        fuelType: newVehicle.fuelType as FuelType,
        mileage: newVehicle.mileage || 0,
        lastMaintenanceDate: new Date().toISOString().split('T')[0],
        maintenanceIntervalKm: newVehicle.maintenanceIntervalKm || 10000,
        nextServiceDate: newVehicle.nextServiceDate || '',
        imageUrl: `https://picsum.photos/400/300?random=${Date.now()}`
      };
      setVehicles([...vehicles, vehicle]);
      setIsModalOpen(false);
      setNewVehicle({ status: VehicleStatus.Active, fuelType: FuelType.Petrol });
    }
  };

  const getStatusColor = (status: VehicleStatus) => {
    switch (status) {
      case VehicleStatus.Active: return 'bg-emerald-100 text-emerald-700';
      case VehicleStatus.Maintenance: return 'bg-amber-100 text-amber-700';
      case VehicleStatus.Rented: return 'bg-blue-100 text-blue-700';
      case VehicleStatus.OutOfService: return 'bg-rose-100 text-rose-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getFuelIcon = (type: FuelType) => {
    switch (type) {
      case FuelType.Electric: return <Zap size={16} className="text-yellow-500" />;
      case FuelType.Hybrid: return <Battery size={16} className="text-green-500" />;
      default: return <Droplet size={16} className="text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header Controls */}
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-3">
             <h2 className="text-lg font-bold text-slate-800">Inventaire Flotte</h2>
             <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">{filteredVehicles.length}</span>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Marque, modèle, plaque..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:border-indigo-500 bg-white"
            >
              <option value="Tout">Tous Status</option>
              {Object.values(VehicleStatus).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              <Plus size={18} />
              Ajouter Véhicule
            </button>
          </div>
        </div>

        {/* Grid View */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVehicles.map(vehicle => (
            <div key={vehicle.id} className="group border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow bg-slate-50">
              <div className="h-40 overflow-hidden relative">
                <img 
                  src={vehicle.imageUrl} 
                  alt={`${vehicle.make} ${vehicle.model}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3">
                   <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm ${getStatusColor(vehicle.status)}`}>
                     {vehicle.status}
                   </span>
                </div>
              </div>
              
              <div className="p-4 bg-white">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-slate-800">{vehicle.make} {vehicle.model}</h3>
                    <p className="text-xs text-slate-500">{vehicle.year} • {vehicle.licensePlate}</p>
                  </div>
                  <div className="p-1.5 bg-slate-50 rounded-md">
                     {getFuelIcon(vehicle.fuelType)}
                  </div>
                </div>
                
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between text-xs items-center">
                    <span className="text-slate-500 flex items-center gap-1"><Gauge size={12}/> Kilométrage</span>
                    <span className="font-medium text-slate-700">{vehicle.mileage.toLocaleString()} km</span>
                  </div>
                  <div className="flex justify-between text-xs items-center">
                    <span className="text-slate-500 flex items-center gap-1"><Calendar size={12}/> Prochain Service</span>
                    <span className={`font-medium ${new Date(vehicle.nextServiceDate || '') < new Date() ? 'text-rose-600' : 'text-slate-700'}`}>
                      {vehicle.nextServiceDate || 'Non défini'}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs items-center">
                    <span className="text-slate-500">Intervalle</span>
                    <span className="font-medium text-slate-700">{vehicle.maintenanceIntervalKm.toLocaleString()} km</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                   <button className="flex-1 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                     Historique
                   </button>
                   <button className="flex-1 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">
                     Éditer
                   </button>
                </div>
              </div>
            </div>
          ))}
          
          {filteredVehicles.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500">
               <Car className="mx-auto mb-3 text-slate-300" size={48} />
               <p>Aucun véhicule trouvé correspondant à vos critères.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Vehicle Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Ajouter un Véhicule</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Marque</label>
                  <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="ex: Tesla" value={newVehicle.make || ''} onChange={e => setNewVehicle({...newVehicle, make: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Modèle</label>
                  <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="ex: Model 3" value={newVehicle.model || ''} onChange={e => setNewVehicle({...newVehicle, model: e.target.value})} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Année</label>
                  <input type="number" className="w-full px-3 py-2 border rounded-lg text-sm" value={newVehicle.year || ''} onChange={e => setNewVehicle({...newVehicle, year: parseInt(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Immatriculation</label>
                  <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="ABC-1234" value={newVehicle.licensePlate || ''} onChange={e => setNewVehicle({...newVehicle, licensePlate: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                   <label className="text-xs font-medium text-slate-700">Statut</label>
                   <select className="w-full px-3 py-2 border rounded-lg text-sm" value={newVehicle.status} onChange={e => setNewVehicle({...newVehicle, status: e.target.value as VehicleStatus})}>
                     {Object.values(VehicleStatus).map(s => <option key={s} value={s}>{s}</option>)}
                   </select>
                </div>
                <div className="space-y-1">
                   <label className="text-xs font-medium text-slate-700">Carburant</label>
                   <select className="w-full px-3 py-2 border rounded-lg text-sm" value={newVehicle.fuelType} onChange={e => setNewVehicle({...newVehicle, fuelType: e.target.value as FuelType})}>
                     {Object.values(FuelType).map(f => <option key={f} value={f}>{f}</option>)}
                   </select>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 mt-2">
                <h4 className="text-sm font-semibold text-indigo-600 mb-3 flex items-center gap-2"><WrenchIcon size={16}/> Paramètres Maintenance</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">Kilométrage Actuel</label>
                    <input type="number" className="w-full px-3 py-2 border rounded-lg text-sm" value={newVehicle.mileage || ''} onChange={e => setNewVehicle({...newVehicle, mileage: parseInt(e.target.value)})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">Intervalle Service (km)</label>
                    <input type="number" className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="10000" value={newVehicle.maintenanceIntervalKm || ''} onChange={e => setNewVehicle({...newVehicle, maintenanceIntervalKm: parseInt(e.target.value)})} />
                  </div>
                </div>
                <div className="space-y-1 mt-3">
                    <label className="text-xs font-medium text-slate-700">Prochain Service Prévu</label>
                    <input type="date" className="w-full px-3 py-2 border rounded-lg text-sm" value={newVehicle.nextServiceDate || ''} onChange={e => setNewVehicle({...newVehicle, nextServiceDate: e.target.value})} />
                </div>
              </div>

              <button 
                onClick={handleAddVehicle}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors mt-2 shadow-lg shadow-indigo-200"
              >
                Ajouter Véhicule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper icon component
const WrenchIcon = ({size}: {size: number}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
);