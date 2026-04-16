import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarClock, Car, Loader2, Mail, Phone, Plus, Search, Users, Wallet, X } from 'lucide-react';
import { api, CustomerSummary, RegisteredCustomerCandidate } from '../services/api';

type InterestType = 'RENT' | 'BUY';

export const ClientList: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [availableRegisteredUsers, setAvailableRegisteredUsers] = useState<RegisteredCustomerCandidate[]>([]);
  const [availableRegisteredSearch, setAvailableRegisteredSearch] = useState('');
  const [availableRegisteredLoading, setAvailableRegisteredLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [modalTab, setModalTab] = useState<'registered' | 'manual'>('registered');
  const [newCustomer, setNewCustomer] = useState({ fullName: '', email: '', phone: '', interestType: 'RENT' as InterestType });
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [registeredSearch, setRegisteredSearch] = useState('');
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredCustomerCandidate[]>([]);
  const [registeredUsersLoading, setRegisteredUsersLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadCustomers = async () => {
      try {
        setIsLoading(true);
        const response = await api.getCustomers();
        if (!isMounted) {
          return;
        }

        setCustomers(response);
        setError('');
      } catch {
        if (!isMounted) {
          return;
        }

        setError('Impossible de charger les clients reels pour le moment.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadCustomers();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const timeoutId = window.setTimeout(async () => {
      try {
        setAvailableRegisteredLoading(true);
        const response = await api.searchRegisteredCustomers(availableRegisteredSearch);
        if (!isMounted) {
          return;
        }

        setAvailableRegisteredUsers(response);
        setCreateError('');
      } catch {
        if (isMounted) {
          setCreateError('Impossible de charger les utilisateurs deja inscrits pour le moment.');
        }
      } finally {
        if (isMounted) {
          setAvailableRegisteredLoading(false);
        }
      }
    }, 180);

    return () => {
      isMounted = false;
      window.clearTimeout(timeoutId);
    };
  }, [availableRegisteredSearch]);

  useEffect(() => {
    if (!showCreateModal || modalTab !== 'registered') {
      return;
    }

    let isMounted = true;
    const timeoutId = window.setTimeout(async () => {
      try {
        setRegisteredUsersLoading(true);
        const response = await api.searchRegisteredCustomers(registeredSearch);
        if (!isMounted) {
          return;
        }

        setRegisteredUsers(response);
        setCreateError('');
      } catch {
        if (isMounted) {
          setCreateError('Impossible de rechercher les utilisateurs deja inscrits pour le moment.');
        }
      } finally {
        if (isMounted) {
          setRegisteredUsersLoading(false);
        }
      }
    }, 180);

    return () => {
      isMounted = false;
      window.clearTimeout(timeoutId);
    };
  }, [modalTab, registeredSearch, showCreateModal]);

  const filteredCustomers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return customers;
    }

    return customers.filter((customer) =>
      [customer.fullName, customer.email, customer.phone, customer.preferredVehicle || '']
        .some((value) => value.toLowerCase().includes(term))
    );
  }, [customers, searchTerm]);

  const activeCustomerList = useMemo(
    () => filteredCustomers.filter((customer) => customer.status === 'Actif'),
    [filteredCustomers]
  );

  const followUpCustomerList = useMemo(
    () => filteredCustomers.filter((customer) => customer.status !== 'Actif'),
    [filteredCustomers]
  );

  const totalRevenue = customers.reduce((sum, customer) => sum + customer.totalSpent, 0);
  const activeCustomers = customers.filter((customer) => customer.status === 'Actif').length;
  const linkedRegisteredCount = availableRegisteredUsers.filter((candidate) => candidate.linkedToCurrentOwner).length;
  const attachableRegisteredCount = availableRegisteredUsers.filter((candidate) => !candidate.linkedToCurrentOwner).length;

  const getInitials = (fullName: string) => {
    const parts = fullName.split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
      return 'CL';
    }

    return ((parts[0][0] || 'C') + (parts[1]?.[0] || parts[0][1] || 'L')).toUpperCase();
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setCreateError('');
    setRegisteredSearch('');
    setRegisteredUsers([]);
    setModalTab('registered');
    setNewCustomer({ fullName: '', email: '', phone: '', interestType: 'RENT' });
  };

  const handleCustomerCreated = (createdCustomer: CustomerSummary) => {
    setCustomers((current) => [createdCustomer, ...current.filter((customer) => customer.id !== createdCustomer.id)]);
    setAvailableRegisteredUsers((current) => current.filter((candidate) => candidate.email !== createdCustomer.email));
    setRegisteredUsers((current) => current.filter((candidate) => candidate.email !== createdCustomer.email));
    setNewCustomer({ fullName: '', email: '', phone: '', interestType: 'RENT' });
    closeCreateModal();

    if (createdCustomer.interestType === 'RENT') {
      navigate(`/app/contracts?customerId=${createdCustomer.id}&intent=rent`);
    }
  };

  const handleCreateCustomer = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsCreating(true);
      setCreateError('');
      const createdCustomer = await api.createCustomer({
        fullName: newCustomer.fullName.trim(),
        email: newCustomer.email.trim(),
        phone: newCustomer.phone.trim(),
        interestType: newCustomer.interestType,
      });
      handleCustomerCreated(createdCustomer);
    } catch (creationError) {
      setCreateError(creationError instanceof Error ? creationError.message : 'Impossible d ajouter ce client.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleAttachRegisteredUser = async (candidate: RegisteredCustomerCandidate) => {
    try {
      setIsCreating(true);
      setCreateError('');
      const createdCustomer = await api.createCustomer({
        fullName: candidate.fullName,
        email: candidate.email,
        phone: candidate.phone,
        interestType: newCustomer.interestType,
      });
      handleCustomerCreated(createdCustomer);
    } catch (creationError) {
      setCreateError(creationError instanceof Error ? creationError.message : 'Impossible de rattacher cet utilisateur.');
    } finally {
      setIsCreating(false);
    }
  };

  const renderCustomerCard = (customer: CustomerSummary) => (
    <article key={customer.id} className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-sm font-bold text-indigo-700">
            {customer.firstName[0]}{customer.lastName[0]}
          </div>
          <div>
            <p className="text-lg font-extrabold text-slate-950">{customer.fullName}</p>
            <p className="mt-1 text-sm text-slate-500">{customer.status === 'Actif' ? 'Client engage récemment' : 'Dernière activité plus ancienne'}</p>
          </div>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${customer.status === 'Actif' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
          {customer.status}
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Contact</p>
          <p className="mt-2 flex items-center gap-2"><Mail size={14} className="text-slate-400" /> {customer.email}</p>
          <p className="mt-1 flex items-center gap-2"><Phone size={14} className="text-slate-400" /> {customer.phone || 'Non renseigne'}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Activite</p>
          <p className="mt-2">{customer.totalBookings} reservation(s) confirmee(s)</p>
          <p className="mt-1">{customer.totalRequests} demande(s) deposee(s)</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-600">
        <span className="rounded-full bg-slate-100 px-3 py-1">Valeur {customer.totalSpent.toLocaleString()} FCFA</span>
        {customer.interestType && (
          <span className={`rounded-full px-3 py-1 ${customer.interestType === 'RENT' ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700'}`}>
            {customer.interestType === 'RENT' ? 'Client location' : 'Client achat'}
          </span>
        )}
        {customer.preferredVehicle && (
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-indigo-700">
            <Car size={12} /> {customer.preferredVehicle}
          </span>
        )}
        {customer.lastActivityAt && (
          <span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">
            Derniere activite {new Date(customer.lastActivityAt).toLocaleDateString('fr-FR')}
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
        {customer.interestType === 'RENT' && (
          <button
            type="button"
            onClick={() => navigate(`/app/contracts?customerId=${customer.id}&intent=rent`)}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-slate-800"
          >
            Creer un contrat
          </button>
        )}
        {customer.interestType === 'BUY' && (
          <span className="inline-flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-amber-700">
            Suivi achat a traiter
          </span>
        )}
      </div>
    </article>
  );

  const renderRegisteredUserCard = (candidate: RegisteredCustomerCandidate, mode: 'surface' | 'modal' = 'surface') => {
    const isLinked = candidate.linkedToCurrentOwner;
    const wrapperClassName = mode === 'surface'
      ? 'rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md'
      : 'rounded-[24px] border border-slate-200 bg-slate-50/70 p-5';

    return (
      <article key={candidate.id} className={wrapperClassName}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-bold ${isLinked ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}`}>
              {getInitials(candidate.fullName)}
            </div>
            <div>
              <p className="text-lg font-extrabold text-slate-950">{candidate.fullName}</p>
              <p className="mt-1 text-sm text-slate-500">{candidate.email}</p>
              <p className="mt-1 text-sm text-slate-500">{candidate.phone || 'Telephone non renseigne'}</p>
            </div>
          </div>
          <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${isLinked ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-50 text-indigo-700'}`}>
            {isLinked ? 'Deja rattache' : 'Disponible'}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-600">
          <span className="rounded-full bg-slate-100 px-3 py-1">Compte plateforme</span>
          <span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">Ajout rapide au portefeuille client</span>
          <span className={`rounded-full px-3 py-1 ${newCustomer.interestType === 'RENT' ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700'}`}>
            {newCustomer.interestType === 'RENT' ? 'Parcours location' : 'Parcours achat'}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
          <p className="text-sm text-slate-500">
            {isLinked
              ? 'Ce compte peut etre reutilise directement pour un contrat ou un suivi commercial.'
              : 'Rattachez ce compte pour le retrouver ensuite dans votre base client.'}
          </p>
          <button
            type="button"
            onClick={() => void handleAttachRegisteredUser(candidate)}
            disabled={isCreating}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-slate-800 disabled:bg-slate-400"
          >
            {isCreating ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
            {isLinked ? 'Utiliser ce compte' : 'Rattacher ce compte'}
          </button>
        </div>
      </article>
    );
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-6">
          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr] xl:items-end">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-600">Clients reels</p>
              <h1 className="mt-2 text-2xl font-extrabold text-slate-950">Une base client plus lisible, et un ajout plus direct.</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">La page se concentre maintenant sur deux gestes simples: retrouver un client existant ou rattacher rapidement un compte deja inscrit avant de creer un contrat.</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Nom, email, telephone, vehicule..."
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-indigo-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800"
              >
                <Plus size={16} /> Ajouter un client
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 border-b border-slate-200 bg-slate-50/80 p-6 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700"><Users size={18} /></div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Base client</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-950">{customers.length}</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><CalendarClock size={18} /></div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Clients actifs</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-950">{activeCustomers}</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-700"><Wallet size={18} /></div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Valeur cumulee</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-950">{totalRevenue.toLocaleString()} FCFA</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-slate-200 bg-white p-6">
          <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr] xl:items-start">
            <div>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Rattachement rapide</p>
                  <h2 className="mt-2 text-xl font-extrabold text-slate-950">Les comptes deja inscrits restent visibles sans noyer la page.</h2>
                  <p className="mt-2 text-sm text-slate-500">Cherchez un compte, rattachez-le, puis retrouvez-le aussitot dans votre base client et dans le module contrat.</p>
                </div>

                <div className="relative w-full lg:max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    placeholder="Rechercher un compte deja inscrit"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:bg-white"
                    value={availableRegisteredSearch}
                    onChange={(e) => setAvailableRegisteredSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-5 grid gap-4 xl:grid-cols-2">
                {availableRegisteredLoading ? (
                  <div className="xl:col-span-2 flex items-center justify-center gap-3 rounded-[24px] border border-slate-200 bg-slate-50 px-6 py-10 text-sm text-slate-500">
                    <Loader2 size={18} className="animate-spin text-slate-900" />
                    Chargement des comptes deja inscrits...
                  </div>
                ) : availableRegisteredUsers.length > 0 ? availableRegisteredUsers.map((candidate) => renderRegisteredUserCard(candidate, 'surface')) : (
                  <div className="xl:col-span-2 rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
                    Aucun utilisateur inscrit disponible pour cette recherche.
                  </div>
                )}
              </div>
            </div>

            <aside className="rounded-[26px] border border-slate-200 bg-[linear-gradient(180deg,#0f172a_0%,#111827_100%)] p-5 text-white shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">Lecture rapide</p>
              <h3 className="mt-2 text-xl font-extrabold">Le bon point d entree avant contrat.</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">Cette zone sert uniquement a verifier si le client existe deja sur la plateforme, puis a le rattacher sans repasser par une saisie manuelle.</p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">Disponibles</p>
                  <p className="mt-2 text-2xl font-extrabold">{attachableRegisteredCount}</p>
                  <p className="mt-1 text-sm text-slate-300">Compte(s) prets a rattacher</p>
                </div>
                <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">Deja relies</p>
                  <p className="mt-2 text-2xl font-extrabold">{linkedRegisteredCount}</p>
                  <p className="mt-1 text-sm text-slate-300">Compte(s) reutilisables</p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                <p className="text-sm font-bold text-white">Quand ouvrir la fenetre d ajout ?</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">Quand le client n est pas encore present sur la plateforme ou quand vous voulez saisir son contact manuellement en quelques champs.</p>
              </div>

              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="mt-5 inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-950 transition-colors hover:bg-slate-100"
              >
                <Plus size={16} /> Ouvrir l ajout simplifie
              </button>
            </aside>
          </div>
        </div>

        {error && (
          <div className="px-6 pt-6">
            <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
          </div>
        )}

        {isLoading ? (
          <div className="flex min-h-[280px] items-center justify-center text-slate-500">
            <Loader2 size={18} className="mr-3 animate-spin text-indigo-600" />
            Chargement des clients...
          </div>
        ) : filteredCustomers.length > 0 ? (
          <div className="space-y-6 p-6">
            <section className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-600">Clients actifs</p>
                  <h2 className="mt-1 text-lg font-extrabold text-slate-950">Les clients les plus engages en premier.</h2>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">{activeCustomerList.length}</span>
              </div>
              {activeCustomerList.length > 0 ? (
                <div className="grid gap-4 xl:grid-cols-2">
                  {activeCustomerList.map(renderCustomerCard)}
                </div>
              ) : (
                <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-center text-sm text-slate-500">
                  Aucun client actif pour cette recherche.
                </div>
              )}
            </section>

            <section className="space-y-4 border-t border-slate-200 pt-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-600">A relancer</p>
                  <h2 className="mt-1 text-lg font-extrabold text-slate-950">Les clients avec une activite plus ancienne.</h2>
                </div>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">{followUpCustomerList.length}</span>
              </div>
              {followUpCustomerList.length > 0 ? (
                <div className="grid gap-4 xl:grid-cols-2">
                  {followUpCustomerList.map(renderCustomerCard)}
                </div>
              ) : (
                <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-center text-sm text-slate-500">
                  Aucun client a relancer pour cette recherche.
                </div>
              )}
            </section>
          </div>
        ) : (
          <div className="flex min-h-[260px] flex-col items-center justify-center px-6 text-center text-slate-500">
            <Users size={36} className="mb-3 text-slate-300" />
            <p className="text-base font-semibold text-slate-700">Aucun client reel a afficher pour l instant.</p>
            <p className="mt-2 max-w-md text-sm">Les clients apparaîtront ici dès qu ils auront effectué une réservation, une demande, ou que vous les aurez rattachés manuellement via leur email.</p>
          </div>
        )}
      </section>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-auto rounded-[28px] bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-6">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-600">Ajouter un client</p>
                <h2 className="mt-2 text-2xl font-extrabold text-slate-950">Choisir un compte existant ou saisir un client en quelques champs.</h2>
                <p className="mt-2 max-w-2xl text-sm text-slate-500">Le parcours reste volontairement court: definir l intention commerciale, retrouver un compte deja inscrit si possible, sinon saisir le contact manuellement.</p>
              </div>
              <button type="button" onClick={closeCreateModal} className="rounded-2xl border border-slate-200 p-3 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900">
                <X size={18} />
              </button>
            </div>

            <div className="border-b border-slate-200 px-6 py-4">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div className="flex flex-wrap items-center gap-3">
                  <button type="button" onClick={() => setModalTab('registered')} className={`rounded-2xl px-4 py-2.5 text-sm font-bold transition-colors ${modalTab === 'registered' ? 'bg-slate-950 text-white' : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}>
                    Utilisateurs deja inscrits
                  </button>
                  <button type="button" onClick={() => setModalTab('manual')} className={`rounded-2xl px-4 py-2.5 text-sm font-bold transition-colors ${modalTab === 'manual' ? 'bg-slate-950 text-white' : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}>
                    Nouveau client
                  </button>
                </div>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Intention commerciale</p>
                  <div className="mt-2 inline-flex rounded-2xl border border-slate-200 bg-slate-50 p-1">
                    <button
                      type="button"
                      onClick={() => setNewCustomer((current) => ({ ...current, interestType: 'RENT' }))}
                      className={`rounded-2xl px-4 py-2 text-sm font-bold transition-colors ${newCustomer.interestType === 'RENT' ? 'bg-slate-950 text-white' : 'text-slate-600 hover:text-slate-950'}`}
                    >
                      Location
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewCustomer((current) => ({ ...current, interestType: 'BUY' }))}
                      className={`rounded-2xl px-4 py-2 text-sm font-bold transition-colors ${newCustomer.interestType === 'BUY' ? 'bg-slate-950 text-white' : 'text-slate-600 hover:text-slate-950'}`}
                    >
                      Achat
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              {modalTab === 'registered' ? (
                <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
                  <div className="space-y-5">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="text"
                        placeholder="Rechercher un utilisateur par nom, email ou telephone"
                        value={registeredSearch}
                        onChange={(event) => setRegisteredSearch(event.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-slate-950 focus:bg-white"
                      />
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                      {registeredUsersLoading ? (
                        <div className="col-span-full flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-6 py-12 text-sm text-slate-500">
                          <Loader2 size={18} className="animate-spin text-slate-900" />
                          Recherche des comptes deja inscrits...
                        </div>
                      ) : registeredUsers.length > 0 ? registeredUsers.map((candidate) => renderRegisteredUserCard(candidate, 'modal')) : (
                        <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
                          Aucun utilisateur deja inscrit ne correspond a cette recherche.
                        </div>
                      )}
                    </div>
                  </div>

                  <aside className="rounded-[26px] border border-slate-200 bg-slate-50/70 p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Ce qui va se passer</p>
                    <h3 className="mt-2 text-lg font-extrabold text-slate-950">Un rattachement, puis la suite dans le bon module.</h3>
                    <div className="mt-4 space-y-3 text-sm text-slate-600">
                      <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                        <p className="font-bold text-slate-900">1. Vous choisissez un compte existant</p>
                        <p className="mt-1">Aucune ressaisie manuelle tant que le compte est deja present sur la plateforme.</p>
                      </div>
                      <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                        <p className="font-bold text-slate-900">2. Il rejoint votre base client</p>
                        <p className="mt-1">Le compte devient visible dans la liste client et reutilisable pour les contrats.</p>
                      </div>
                      <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                        <p className="font-bold text-slate-900">3. Parcours actif</p>
                        <p className="mt-1">{newCustomer.interestType === 'RENT' ? 'Le client sera oriente vers le parcours location.' : 'Le client sera suivi dans le parcours achat.'}</p>
                      </div>
                    </div>
                  </aside>
                </div>
              ) : (
                <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
                  <aside className="rounded-[26px] border border-slate-200 bg-slate-50/70 p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Saisie manuelle</p>
                    <h3 className="mt-2 text-lg font-extrabold text-slate-950">Trois informations suffisent.</h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">Utilisez cette voie seulement si le client n apparait pas deja dans la plateforme. Une fois cree, il sera ajoute directement a votre base client.</p>

                    <div className="mt-4 space-y-3 text-sm text-slate-600">
                      <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                        <p className="font-bold text-slate-900">Nom complet</p>
                        <p className="mt-1">Le nom visible dans la base client et dans le contrat.</p>
                      </div>
                      <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                        <p className="font-bold text-slate-900">Email</p>
                        <p className="mt-1">Le point de contact principal pour retrouver le client rapidement.</p>
                      </div>
                      <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                        <p className="font-bold text-slate-900">Telephone</p>
                        <p className="mt-1">Le contact utile pour la reservation, la remise ou le suivi.</p>
                      </div>
                    </div>
                  </aside>

                  <form onSubmit={handleCreateCustomer} className="rounded-[26px] border border-slate-200 bg-white p-5">
                    <div className="grid gap-4">
                      <label className="block">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Nom complet</span>
                        <input
                          required
                          value={newCustomer.fullName}
                          onChange={(event) => setNewCustomer((current) => ({ ...current, fullName: event.target.value }))}
                          className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-950 focus:bg-white"
                          placeholder="Ex: Awa Diop"
                        />
                      </label>
                      <label className="block">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Email</span>
                        <input
                          required
                          type="email"
                          value={newCustomer.email}
                          onChange={(event) => setNewCustomer((current) => ({ ...current, email: event.target.value }))}
                          className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-950 focus:bg-white"
                          placeholder="client@exemple.com"
                        />
                      </label>
                      <label className="block">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Telephone</span>
                        <input
                          required
                          value={newCustomer.phone}
                          onChange={(event) => setNewCustomer((current) => ({ ...current, phone: event.target.value }))}
                          className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-950 focus:bg-white"
                          placeholder="+221 77 000 00 00"
                        />
                      </label>
                    </div>

                    <div className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm text-slate-500">
                        {newCustomer.interestType === 'RENT'
                          ? 'Le client sera ajoute a la base puis pourra etre utilise pour un contrat de location.'
                          : 'Le client sera ajoute a la base pour suivi commercial achat.'}
                      </p>
                      <button
                        type="submit"
                        disabled={isCreating}
                        className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-500 disabled:bg-slate-400"
                      >
                        {isCreating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                        {isCreating ? 'Creation...' : 'Enregistrer le client'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {createError && <div className="mt-5 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{createError}</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};