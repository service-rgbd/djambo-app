import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import {
  Calendar,
  Car,
  CheckCircle,
  Copy,
  CreditCard,
  FileText,
  Link as LinkIcon,
  Loader2,
  Search,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  api,
  CustomerSummary,
  ManagedContractRecord,
  OwnerInventoryVehicle,
  PrivateAppSettings,
  RegisteredCustomerCandidate,
} from '../services/api';

const CONTRACT_ILLUSTRATION_SRC = new URL('../ullustrqtionsectioncontrat.jpg', import.meta.url).href;

const paymentLabel: Record<NonNullable<ManagedContractRecord['paymentMethod']>, string> = {
  'Carte Bancaire': 'Carte bancaire',
  Virement: 'Virement',
  'Espèces': 'Especes',
};

const statusTone: Record<string, string> = {
  Actif: 'bg-emerald-100 text-emerald-700',
  'Paiement En Attente': 'bg-amber-100 text-amber-700',
  'Terminé': 'bg-slate-100 text-slate-700',
  'Annulé': 'bg-rose-100 text-rose-700',
};

const buildContractUrl = (contractId: string) => `${window.location.origin}/#/app/contracts?contract=${contractId}`;

const defaultSettings: PrivateAppSettings = {
  businessName: 'Djambo Mobility',
  publicEmail: 'contact@djambo-app.com',
  supportPhone: '',
  city: 'Dakar',
  responseTime: 'Reponse en moins de 30 min',
  storeSlug: 'djambo-mobility',
  publicStoreUrl: `${window.location.origin}/#/store/djambo-mobility`,
  publicProfileUrl: `${window.location.origin}/#/profile/djambo-mobility`,
  chauffeurOnDemand: true,
  chauffeurDailyRate: '30000',
  deliveryEnabled: true,
  whatsappEnabled: true,
  contractSignatureEnabled: true,
  notificationsEmail: true,
  notificationsSms: false,
};

export const ContractManager: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<NonNullable<ManagedContractRecord['paymentMethod']>>('Carte Bancaire');
  const [chauffeurRequested, setChauffeurRequested] = useState(false);
  const [chauffeurRate, setChauffeurRate] = useState(30000);
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [contractList, setContractList] = useState<ManagedContractRecord[]>([]);
  const [copiedContractId, setCopiedContractId] = useState('');
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [registeredCandidates, setRegisteredCandidates] = useState<RegisteredCustomerCandidate[]>([]);
  const [vehicles, setVehicles] = useState<OwnerInventoryVehicle[]>([]);
  const [settings, setSettings] = useState<PrivateAppSettings>(defaultSettings);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');
  const [prefillNotice, setPrefillNotice] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadPage = async () => {
      try {
        setPageLoading(true);
        const [customerResponse, registeredResponse, vehicleResponse, contractResponse, settingsResponse] = await Promise.all([
          api.getCustomers(),
          api.searchRegisteredCustomers(''),
          api.getOwnerVehicles(),
          api.getContracts(),
          api.getPrivateSettings(),
        ]);

        if (!isMounted) {
          return;
        }

        setCustomers(customerResponse);
          setRegisteredCandidates(registeredResponse);
        setVehicles(vehicleResponse);
        setContractList(contractResponse);
        setSettings(settingsResponse);
        setChauffeurRate(Number(settingsResponse.chauffeurDailyRate || 30000) || 30000);
        setError('');
      } catch {
        if (isMounted) {
          setError('Impossible de charger les clients, les voitures ou les contrats reels.');
        }
      } finally {
        if (isMounted) {
          setPageLoading(false);
        }
      }
    };

    void loadPage();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!customers.length) {
      return;
    }

    const searchParams = new URLSearchParams(location.search);
    const customerIdFromQuery = searchParams.get('customerId') || '';
    const intentFromQuery = searchParams.get('intent') || '';
    if (!customerIdFromQuery) {
      return;
    }

    const matchedCustomer = customers.find((customer) => customer.id === customerIdFromQuery);
    if (!matchedCustomer) {
      return;
    }

    setSelectedCustomer(matchedCustomer.id);
    setPrefillNotice(intentFromQuery === 'rent'
      ? `Client location preselectionne: ${matchedCustomer.fullName}. Choisissez maintenant le vehicule et les dates pour etablir le contrat.`
      : `Client preselectionne: ${matchedCustomer.fullName}.`);

    const cleanedSearch = new URLSearchParams(location.search);
    cleanedSearch.delete('customerId');
    cleanedSearch.delete('intent');
    navigate({ pathname: location.pathname, search: cleanedSearch.toString() }, { replace: true });
  }, [customers, location.pathname, location.search, navigate]);

  const availableVehicles = useMemo(() => vehicles.filter((vehicle) => vehicle.isAvailable), [vehicles]);
  const pickerCustomers = useMemo(() => {
    const knownCustomerIds = new Set(customers.map((customer) => customer.id));
    const knownCustomerEmails = new Set(customers.map((customer) => customer.email.toLowerCase()));
    const syntheticCandidates = registeredCandidates
      .filter((candidate) => !knownCustomerIds.has(candidate.id) && !knownCustomerEmails.has(candidate.email.toLowerCase()))
      .map((candidate) => ({
        id: candidate.id,
        firstName: candidate.fullName.split(/\s+/)[0] || 'Client',
        lastName: candidate.fullName.split(/\s+/).slice(1).join(' ') || 'Djambo',
        fullName: candidate.fullName,
        email: candidate.email,
        phone: candidate.phone,
        status: 'Actif' as const,
        totalBookings: 0,
        totalRequests: 0,
        totalSpent: 0,
        lastActivityAt: null,
        preferredVehicle: null,
        interestType: 'RENT' as const,
      }));

    return [...customers, ...syntheticCandidates];
  }, [customers, registeredCandidates]);
  const filteredCustomers = useMemo(() => {
    const term = customerSearchTerm.trim().toLowerCase();
    if (!term) {
      return pickerCustomers;
    }

    return pickerCustomers.filter((customer) =>
      [customer.fullName, customer.email, customer.phone, customer.preferredVehicle || '']
        .some((value) => value.toLowerCase().includes(term))
    );
  }, [customerSearchTerm, pickerCustomers]);
  const selectedCustomerObject = customers.find((customer) => customer.id === selectedCustomer);
  const selectedPickerCustomer = pickerCustomers.find((customer) => customer.id === selectedCustomer) || selectedCustomerObject;
  const selectedVehicleObject = vehicles.find((vehicle) => vehicle.id === selectedVehicle);

  const days = useMemo(() => {
    if (!startDate || !endDate) {
      return 0;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000));
  }, [endDate, startDate]);

  const dailyRate = selectedVehicleObject?.pricePerDay || 0;
  const chauffeurTotal = chauffeurRequested ? chauffeurRate * Math.max(days, 1) : 0;
  const totalAmount = Math.max(days, 1) * dailyRate + chauffeurTotal;

  const downloadContractPdf = (contract: ManagedContractRecord, customer?: CustomerSummary, vehicle?: OwnerInventoryVehicle) => {
    const resolvedCustomer = customer || customers.find((item) => item.id === contract.customerId);
    const resolvedVehicle = vehicle || vehicles.find((item) => item.id === contract.vehicleId);
    if (!resolvedCustomer || !resolvedVehicle) {
      return;
    }

    const document = new jsPDF({ unit: 'mm', format: 'a4' });
    const margin = 16;
    const pageWidth = document.internal.pageSize.getWidth();
    const usableWidth = pageWidth - margin * 2;
    let y = 18;

    const ensureSpace = (requiredHeight = 14) => {
      if (y + requiredHeight <= 280) {
        return;
      }
      document.addPage();
      y = 18;
    };

    const addParagraph = (text: string, fontSize = 10, color = '#475569') => {
      document.setFont('helvetica', 'normal');
      document.setFontSize(fontSize);
      document.setTextColor(color);
      const lines = document.splitTextToSize(text, usableWidth);
      ensureSpace(lines.length * 5 + 4);
      document.text(lines, margin, y);
      y += lines.length * 5 + 2;
    };

    const addSectionTitle = (title: string) => {
      ensureSpace(12);
      document.setDrawColor('#e2e8f0');
      document.line(margin, y, pageWidth - margin, y);
      y += 6;
      document.setFont('helvetica', 'bold');
      document.setFontSize(12);
      document.setTextColor('#0f172a');
      document.text(title, margin, y);
      y += 6;
    };

    const addKeyValue = (label: string, value: string) => {
      ensureSpace(6);
      document.setFont('helvetica', 'bold');
      document.setFontSize(10);
      document.setTextColor('#0f172a');
      document.text(`${label}:`, margin, y);
      document.setFont('helvetica', 'normal');
      document.setTextColor('#475569');
      document.text(value, margin + 40, y);
      y += 6;
    };

    document.setFillColor('#0f172a');
    document.rect(margin, y, usableWidth, 26, 'F');
    document.setFont('helvetica', 'bold');
    document.setTextColor('#ffffff');
    document.setFontSize(18);
    document.text('Contrat de location Djambo', margin + 6, y + 10);
    document.setFontSize(10);
    document.setTextColor('#cbd5e1');
    document.text(`Reference ${contract.contractNumber || contract.id}`, margin + 6, y + 17);
    document.text(`Edite le ${new Date(contract.generatedAt || new Date().toISOString()).toLocaleDateString('fr-FR')}`, margin + 6, y + 22);
    y += 34;

    addSectionTitle('Parties contractantes');
    addKeyValue('Loueur', settings.businessName || user?.name || 'Djambo Mobility');
    addKeyValue('Email loueur', settings.publicEmail || user?.email || 'support@djambo.app');
    addKeyValue('Telephone loueur', settings.supportPhone || 'Non renseigne');
    addKeyValue('Client', resolvedCustomer.fullName || contract.customerName || 'Client');
    addKeyValue('Email client', resolvedCustomer.email || contract.customerEmail || 'Non renseigne');
    addKeyValue('Telephone client', resolvedCustomer.phone || contract.customerPhone || 'Non renseigne');

    addSectionTitle('Vehicule et periode');
    addKeyValue('Vehicule', contract.vehicleLabel || `${resolvedVehicle.brand} ${resolvedVehicle.model}`);
    addKeyValue('Categorie', resolvedVehicle.category);
    addKeyValue('Ville', resolvedVehicle.city);
    addKeyValue('Point de retrait', resolvedVehicle.location);
    addKeyValue('Date de debut', new Date(contract.startDate).toLocaleDateString('fr-FR'));
    addKeyValue('Date de fin', new Date(contract.endDate).toLocaleDateString('fr-FR'));
    addKeyValue('Disponibilite contractuelle', 'Mise a disposition a 10:00, restitution avant 18:00.');

    addSectionTitle('Conditions financieres');
    addKeyValue('Tarif journalier', `${(contract.dailyRate || dailyRate).toLocaleString()} FCFA`);
    addKeyValue('Mode de paiement', paymentLabel[contract.paymentMethod || 'Carte Bancaire']);
    addKeyValue('Option chauffeur', contract.chauffeurRequested ? `Oui, ${(contract.chauffeurRate || 0).toLocaleString()} FCFA / jour` : 'Non');
    addKeyValue('Montant total', `${contract.totalAmount.toLocaleString()} FCFA`);

    addSectionTitle('Clauses principales');
    addParagraph('1. Le vehicule est remis dans un etat conforme au descriptif et doit etre restitue avec un niveau de carburant equivalent.');
    addParagraph('2. Toute prolongation doit etre confirmee avant l echeance contractuelle afin de garantir la disponibilite et la couverture du dossier.');
    addParagraph('3. Le client reste responsable des contraventions, degradations non liees a l usure normale et frais engages pendant la periode de possession.');
    addParagraph('4. Les reservations anticipees sont maintenues sous reserve du reglement et des verifications d usage prevues par le loueur.');
    addParagraph('5. En cas d indisponibilite exceptionnelle, une solution equivalente ou un report valide d un commun accord sera propose.');

    addSectionTitle('Observations');
    addParagraph(`Statut initial du dossier: ${contract.status}.`);
    addParagraph(`Reference de consultation client: ${resolvedCustomer.preferredVehicle || 'Aucune preference enregistree'}.`);
    addParagraph('Application ouverte a tous les utilisateurs, sans preference geographique imposee.');

    ensureSpace(24);
    document.setDrawColor('#cbd5e1');
    document.line(margin, y + 12, margin + 70, y + 12);
    document.line(pageWidth - margin - 70, y + 12, pageWidth - margin, y + 12);
    document.setFont('helvetica', 'normal');
    document.setFontSize(10);
    document.setTextColor('#64748b');
    document.text('Signature loueur', margin, y + 18);
    document.text('Signature client', pageWidth - margin - 70, y + 18);

    document.save(`contrat-${contract.contractNumber || contract.id}.pdf`);
  };

  const resetForm = () => {
    setSelectedCustomer('');
    setSelectedVehicle('');
    setStartDate('');
    setEndDate('');
    setPaymentMethod('Carte Bancaire');
    setChauffeurRequested(false);
    setChauffeurRate(Number(settings.chauffeurDailyRate || 30000) || 30000);
  };

  const handleGenerateContract = async () => {
    if (!selectedCustomer || !selectedVehicle || !startDate || !endDate) {
      return;
    }

    try {
      setProcessing(true);
      let resolvedCustomerId = selectedCustomer;
      let resolvedCustomer = customers.find((customer) => customer.id === selectedCustomer) || null;

      if (!resolvedCustomer) {
        const candidate = registeredCandidates.find((entry) => entry.id === selectedCustomer);
        if (!candidate) {
          setError('Le client choisi n est pas disponible pour le contrat.');
          return;
        }

        const attachedCustomer = await api.createCustomer({
          fullName: candidate.fullName,
          email: candidate.email,
          phone: candidate.phone,
          interestType: 'RENT',
        });

        resolvedCustomerId = attachedCustomer.id;
        resolvedCustomer = attachedCustomer;
        setSelectedCustomer(attachedCustomer.id);
        setCustomers((current) => [attachedCustomer, ...current.filter((customer) => customer.id !== attachedCustomer.id)]);
        setRegisteredCandidates((current) => current.filter((entry) => entry.id !== candidate.id));
      }

      const newContract = await api.createContract({
        customerId: resolvedCustomerId,
        vehicleId: selectedVehicle,
        startDate,
        endDate,
        totalAmount,
        dailyRate,
        paymentMethod,
        chauffeurRequested,
        chauffeurRate: chauffeurRequested ? chauffeurRate : 0,
      });

      setContractList((current) => [
        { ...newContract, contractUrl: newContract.contractUrl || buildContractUrl(newContract.id) },
        ...current,
      ]);
      setPaymentSuccess(true);
      downloadContractPdf(newContract, resolvedCustomer || undefined, selectedVehicleObject);
      resetForm();
      setTimeout(() => setPaymentSuccess(false), 2500);
      setError('');
    } catch {
      setError('Creation du contrat impossible pour le moment.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {pageLoading && (
        <div className="flex items-center gap-3 border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
          <Loader2 size={16} className="animate-spin text-slate-950" />
          Synchronisation des contrats, clients et voitures...
        </div>
      )}

      {paymentSuccess && (
        <div className="border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Le contrat a ete cree, persiste et exporte en PDF.
        </div>
      )}

      {error && (
        <div className="border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {error}
        </div>
      )}

      {prefillNotice && (
        <div className="border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
          {prefillNotice}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Nouveau dossier</p>
              <h2 className="mt-2 text-xl font-extrabold text-slate-950">Construire un contrat proprement</h2>
            </div>
            <div className="flex h-11 w-11 items-center justify-center bg-slate-100 text-slate-700">
              <FileText size={18} />
            </div>
          </div>

          <div className="space-y-5">
            <label className="space-y-2">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700"><User size={14} /> Client</span>
              <details className="rounded-[24px] border border-slate-200 bg-slate-50/70 open:bg-white">
                <summary className="cursor-pointer list-none px-4 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-slate-950">{selectedPickerCustomer ? selectedPickerCustomer.fullName : 'Choisir un client enregistre'}</p>
                      <p className="mt-1 text-xs text-slate-500">{selectedPickerCustomer ? selectedPickerCustomer.email : `${pickerCustomers.length} client(s) disponible(s) dans la liste`}</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-600 ring-1 ring-slate-200">
                      Liste depliante
                    </span>
                  </div>
                </summary>

                <div className="border-t border-slate-200 px-4 pb-4 pt-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      value={customerSearchTerm}
                      onChange={(event) => setCustomerSearchTerm(event.target.value)}
                      placeholder="Filtrer la liste des clients enregistres"
                      className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-slate-950"
                    />
                  </div>

                  <div className="mt-4 max-h-[240px] overflow-y-auto rounded-2xl border border-slate-200 bg-white">
                    {filteredCustomers.length > 0 ? filteredCustomers.map((customer, index) => {
                      const isSelected = customer.id === selectedCustomer;

                      return (
                        <button
                          key={customer.id}
                          type="button"
                          onClick={() => setSelectedCustomer(customer.id)}
                          className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors ${index !== filteredCustomers.length - 1 ? 'border-b border-slate-100' : ''} ${isSelected ? 'bg-slate-950 text-white' : 'hover:bg-slate-50'}`}
                        >
                          <div className="min-w-0">
                            <p className={`truncate text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-950'}`}>{customer.fullName}</p>
                            <p className={`truncate text-xs ${isSelected ? 'text-white/70' : 'text-slate-500'}`}>{customer.email}</p>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            {!customers.some((entry) => entry.id === customer.id) && (
                              <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${isSelected ? 'bg-white/10 text-white' : 'bg-emerald-50 text-emerald-700'}`}>
                                Compte parc
                              </span>
                            )}
                            <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${isSelected ? 'bg-white/10 text-white' : customer.status === 'Actif' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                              {customer.status}
                            </span>
                          </div>
                        </button>
                      );
                    }) : (
                      <div className="px-4 py-8 text-center text-sm text-slate-500">
                        Aucun client enregistre ne correspond a cette recherche.
                      </div>
                    )}
                  </div>
                </div>
              </details>
            </label>

            <label className="space-y-2">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700"><Car size={14} /> Vehicule</span>
              <select className="w-full border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-950" value={selectedVehicle} onChange={(e) => setSelectedVehicle(e.target.value)}>
                <option value="">Choisir un vehicule disponible...</option>
                {availableVehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>{vehicle.brand} {vehicle.model} - {vehicle.city}</option>
                ))}
              </select>
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700"><Calendar size={14} /> Debut</span>
                <input type="date" className="w-full border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-950" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </label>
              <label className="space-y-2">
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700"><Calendar size={14} /> Fin</span>
                <input type="date" className="w-full border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-950" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700"><CreditCard size={14} /> Paiement</span>
                <select className="w-full border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-950" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as NonNullable<ManagedContractRecord['paymentMethod']>)}>
                  <option value="Carte Bancaire">Carte bancaire</option>
                  <option value="Virement">Virement</option>
                  <option value="Espèces">Especes</option>
                </select>
              </label>
              <div className="border border-slate-200 bg-slate-50 px-4 py-4">
                <label className="flex items-center justify-between gap-3">
                  <span>
                    <span className="block text-sm font-bold text-slate-900">Chauffeur a la demande</span>
                    <span className="mt-1 block text-sm text-slate-500">Ajoute une prestation chauffeur au contrat.</span>
                  </span>
                  <input type="checkbox" checked={chauffeurRequested} onChange={(e) => setChauffeurRequested(e.target.checked)} className="h-5 w-5 border-slate-300 text-slate-950" />
                </label>
              </div>
            </div>

            {chauffeurRequested && (
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Tarif chauffeur / jour</span>
                <input type="number" className="w-full border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-950" value={chauffeurRate} onChange={(e) => setChauffeurRate(Number(e.target.value) || 0)} />
              </label>
            )}
          </div>
        </section>

        <section className="border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Synthese</p>
              <h2 className="mt-2 text-xl font-extrabold text-slate-950">Resume du contrat</h2>
            </div>
            <div className="flex h-11 w-11 items-center justify-center bg-slate-100 text-slate-700">
              <ShieldCheck size={18} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Client</p>
              <p className="mt-2 text-sm font-bold text-slate-900">{selectedPickerCustomer ? selectedPickerCustomer.fullName : 'Aucun client selectionne'}</p>
              <p className="mt-1 text-sm text-slate-500">{selectedPickerCustomer?.email || 'Selectionnez un client pour continuer.'}</p>
            </div>

            <div className="border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Vehicule</p>
              <p className="mt-2 text-sm font-bold text-slate-900">{selectedVehicleObject ? `${selectedVehicleObject.brand} ${selectedVehicleObject.model}` : 'Aucun vehicule selectionne'}</p>
              <p className="mt-1 text-sm text-slate-500">{selectedVehicleObject ? `${selectedVehicleObject.city} • ${selectedVehicleObject.location}` : 'Selectionnez un vehicule pour voir le devis.'}</p>
            </div>

            <div className="border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3 text-sm text-slate-600">
                <span>Base location</span>
                <span className="font-bold text-slate-900">{days > 0 ? `${(dailyRate * days).toLocaleString()} FCFA` : '—'}</span>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 text-sm text-slate-600">
                <span>Chauffeur</span>
                <span className="font-bold text-slate-900">{chauffeurRequested ? `${chauffeurTotal.toLocaleString()} FCFA` : 'Non ajoute'}</span>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-200 pt-3">
                <span className="text-sm font-semibold text-slate-700">Total estime</span>
                <span className="text-xl font-extrabold text-slate-950">{days > 0 ? `${totalAmount.toLocaleString()} FCFA` : '—'}</span>
              </div>
            </div>

            <div className="border border-slate-200 bg-slate-950 p-4 text-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Mode de paiement</p>
              <p className="mt-2 text-sm font-bold">{paymentLabel[paymentMethod]}</p>
              <p className="mt-1 text-sm text-slate-300">Le contrat est prepare avec cette methode comme reference de reglement.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void handleGenerateContract()}
            disabled={!selectedCustomer || !selectedVehicle || !startDate || !endDate || processing || pageLoading}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 bg-slate-950 px-5 py-3.5 text-sm font-bold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {processing ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
            {processing ? 'Generation en cours...' : 'Generer le contrat PDF'}
          </button>
        </section>
      </div>

      <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Dossiers emis</p>
            <h2 className="mt-2 text-xl font-extrabold text-slate-950">Liste des contrats</h2>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600">
            {contractList.length} contrat{contractList.length > 1 ? 's' : ''}
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {contractList.map((contract) => {
            const customer = customers.find((item) => item.id === contract.customerId);
            const vehicle = vehicles.find((item) => item.id === contract.vehicleId);
            return (
              <article key={contract.id} className="overflow-hidden rounded-[26px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] shadow-sm transition-shadow hover:shadow-md">
                <div className="border-b border-slate-200 bg-slate-950 px-5 py-4 text-white">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">Reference contrat</p>
                      <p className="mt-2 text-lg font-extrabold">{contract.contractNumber || contract.id}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${statusTone[contract.status] || 'bg-slate-100 text-slate-700'}`}>{contract.status}</span>
                      {contract.chauffeurRequested && <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-white">Chauffeur inclus</span>}
                    </div>
                  </div>
                </div>

                <div className="space-y-5 p-5">
                  <div>
                    <p className="text-lg font-extrabold text-slate-950">{customer?.fullName || contract.customerName || 'Client inconnu'}</p>
                    <p className="mt-1 text-sm text-slate-500">{customer?.email || contract.customerEmail || 'Email non renseigne'}</p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 px-4 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Vehicule</p>
                      <p className="mt-2 text-sm font-bold text-slate-900">{vehicle ? `${vehicle.brand} ${vehicle.model}` : contract.vehicleLabel || 'Vehicule inconnu'}</p>
                      <p className="mt-1 text-sm text-slate-500">{vehicle ? `${vehicle.city} • ${vehicle.location}` : 'Vehicule archive ou non trouve'}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-4 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Periode</p>
                      <p className="mt-2 text-sm font-bold text-slate-900">{new Date(contract.startDate).toLocaleDateString('fr-FR')} - {new Date(contract.endDate).toLocaleDateString('fr-FR')}</p>
                      <p className="mt-1 text-sm text-slate-500">Paiement {paymentLabel[contract.paymentMethod || 'Carte Bancaire']}</p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Montant</p>
                      <p className="mt-2 text-base font-extrabold text-slate-950">{contract.totalAmount.toLocaleString()} FCFA</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Journalier</p>
                      <p className="mt-2 text-base font-extrabold text-slate-950">{(contract.dailyRate || 0).toLocaleString()} FCFA</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Emission</p>
                      <p className="mt-2 text-base font-extrabold text-slate-950">{new Date(contract.generatedAt || contract.startDate).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 pt-4">
                    <button
                      type="button"
                      onClick={() => downloadContractPdf(contract, customer, vehicle)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      <FileText size={15} />
                      PDF
                    </button>
                    <a href={contract.contractUrl || buildContractUrl(contract.id)} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                      <LinkIcon size={15} />
                      Ouvrir le lien
                    </a>
                    <button
                      type="button"
                      onClick={async () => {
                        await navigator.clipboard.writeText(contract.contractUrl || buildContractUrl(contract.id));
                        setCopiedContractId(contract.id);
                        setTimeout(() => setCopiedContractId(''), 1500);
                      }}
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      {copiedContractId === contract.id ? <CheckCircle size={15} /> : <Copy size={15} />}
                      {copiedContractId === contract.id ? 'Copie' : 'Copier'}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}

          {!pageLoading && contractList.length === 0 && (
            <div className="xl:col-span-2 border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
              Aucun contrat reel n a encore ete genere.
            </div>
          )}
        </div>
      </section>

      <section className="overflow-hidden border border-slate-200 bg-white shadow-sm">
        <div className="p-6 sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Contrats et signature</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">Contrats relies aux vrais clients, aux vraies voitures et au PDF detaille.</h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Cette vue rassemble la preparation du contrat, le choix du mode de paiement, la mise a disposition d un chauffeur et la liste des dossiers emis depuis votre espace reel.
          </p>

          <figure className="mt-6 overflow-hidden border border-slate-200 bg-slate-100">
            <img src={CONTRACT_ILLUSTRATION_SRC} alt="Contrat Djambo" className="h-full max-h-[300px] w-full object-cover" />
            <figcaption className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
              Legende visuelle du module contrat et signature.
            </figcaption>
          </figure>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/app/clients" className="border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100">Voir les clients</Link>
            <Link to="/app/settings" className="border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100">Regler les options de service</Link>
          </div>
        </div>
      </section>
    </div>
  );
};
