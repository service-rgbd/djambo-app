import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarClock, Car, Loader2, Mail, Phone, Plus, Search, Users, Wallet, X } from 'lucide-react';
import { api, CustomerSummary, RegisteredCustomerCandidate } from '../services/api';

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
  const [newCustomer, setNewCustomer] = useState({ fullName: '', email: '', phone: '', interestType: 'RENT' as 'RENT' | 'BUY' });
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

  const totalRevenue = customers.reduce((sum, customer) => sum + customer.totalSpent, 0);
  const activeCustomers = customers.filter((customer) => customer.status === 'Actif').length;

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

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setCreateError('');
    setRegisteredSearch('');
    setModalTab('registered');
  };

  const handleCustomerCreated = (createdCustomer: CustomerSummary) => {
    setCustomers((current) => [createdCustomer, ...current.filter((customer) => customer.id !== createdCustomer.id)]);
    setAvailableRegisteredUsers((current) => current.filter((candidate) => candidate.email !== createdCustomer.email));
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

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-600">Clients reels</p>
              <h1 className="mt-2 text-2xl font-extrabold text-slate-950">Reservations, demandes et rattachement manuel reunis au meme endroit.</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-500">Cette vue remonte les personnes qui ont reserve, demande un vehicule ou que vous rattachez directement a votre espace a partir d un compte deja inscrit.</p>
            </div>

            <div className="flex min-w-full flex-col gap-3 lg:min-w-[420px] lg:items-end">
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800"
              >
                <Plus size={16} /> Ajouter un client
              </button>
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Nom, email, téléphone, véhicule..."
                  className="w-full rounded-2xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-indigo-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
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
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Comptes deja inscrits</p>
              <h2 className="mt-2 text-xl font-extrabold text-slate-950">Les utilisateurs deja presents sur la plateforme apparaissent ici pour rattachement rapide.</h2>
              <p className="mt-2 text-sm text-slate-500">Vous pouvez les afficher, les rechercher puis les rattacher a votre espace sans repasser par la fenetre d ajout.</p>
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
            ) : availableRegisteredUsers.length > 0 ? availableRegisteredUsers.map((candidate) => (
              <article key={candidate.id} className="rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-extrabold text-slate-950">{candidate.fullName}</p>
                    <p className="mt-1 text-sm text-slate-500">{candidate.email}</p>
                    <p className="mt-1 text-sm text-slate-500">{candidate.phone || 'Telephone non renseigne'}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${candidate.linkedToCurrentOwner ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-50 text-indigo-700'}`}>
                    {candidate.linkedToCurrentOwner ? 'Deja dans votre espace' : 'Disponible a rattacher'}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-600">
                  <span className="rounded-full bg-slate-100 px-3 py-1">Compte plateforme verifie</span>
                  <span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">Visible ici avant contrat</span>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
                  <p className="text-sm text-slate-500">Rattachez ce compte pour le retrouver ensuite dans la liste client et dans les contrats.</p>
                  <button
                    type="button"
                    onClick={() => void handleAttachRegisteredUser(candidate)}
                    disabled={isCreating}
                    className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-slate-800 disabled:bg-slate-400"
                  >
                    {isCreating ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                    {candidate.linkedToCurrentOwner ? 'Utiliser ce compte' : 'Rattacher ce compte'}
                  </button>
                </div>
              </article>
            )) : (
              <div className="xl:col-span-2 rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
                Aucun utilisateur inscrit disponible pour cette recherche.
              </div>
            )}
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
          <div className="grid gap-4 p-6 xl:grid-cols-2">
            {filteredCustomers.map((customer) => (
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
            ))}
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
                <h2 className="mt-2 text-2xl font-extrabold text-slate-950">Rattacher un compte existant ou creer un nouveau client.</h2>
                <p className="mt-2 max-w-2xl text-sm text-slate-500">La fenetre permet de rechercher les utilisateurs deja inscrits sur la plateforme, puis de les rattacher proprement a votre espace avant contrat.</p>
              </div>
              <button type="button" onClick={closeCreateModal} className="rounded-2xl border border-slate-200 p-3 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900">
                <X size={18} />
              </button>
            </div>

            <div className="border-b border-slate-200 px-6 py-4">
              <div className="flex flex-wrap items-center gap-3">
                <button type="button" onClick={() => setModalTab('registered')} className={`rounded-2xl px-4 py-2.5 text-sm font-bold transition-colors ${modalTab === 'registered' ? 'bg-slate-950 text-white' : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}>
                  Utilisateurs deja inscrits
                </button>
                <button type="button" onClick={() => setModalTab('manual')} className={`rounded-2xl px-4 py-2.5 text-sm font-bold transition-colors ${modalTab === 'manual' ? 'bg-slate-950 text-white' : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}>
                  Nouveau client
                </button>
                <div className="ml-auto min-w-[220px]">
                  <label className="space-y-2">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Intention commerciale</span>
                    <select
                      value={newCustomer.interestType}
                      onChange={(event) => setNewCustomer((current) => ({ ...current, interestType: event.target.value as 'RENT' | 'BUY' }))}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-950 focus:bg-white"
                    >
                      <option value="RENT">Location</option>
                      <option value="BUY">Achat</option>
                    </select>
                  </label>
                </div>
              </div>
            </div>

            <div className="p-6">
              {modalTab === 'registered' ? (
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
                    ) : registeredUsers.length > 0 ? registeredUsers.map((candidate) => (
                      <article key={candidate.id} className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-lg font-extrabold text-slate-950">{candidate.fullName}</p>
                            <p className="mt-1 text-sm text-slate-500">{candidate.email}</p>
                            <p className="mt-1 text-sm text-slate-500">{candidate.phone || 'Telephone non renseigne'}</p>
                          </div>
                          <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${candidate.linkedToCurrentOwner ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'}`}>
                            {candidate.linkedToCurrentOwner ? 'Deja rattache' : 'Compte disponible'}
                          </span>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
                          <div className="text-sm text-slate-500">
                            {newCustomer.interestType === 'RENT' ? 'Sera disponible dans le module contrat.' : 'Sera suivi comme opportunite achat.'}
                          </div>
                          <button
                            type="button"
                            onClick={() => void handleAttachRegisteredUser(candidate)}
                            disabled={isCreating}
                            className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-slate-800 disabled:bg-slate-400"
                          >
                            {isCreating ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                            {candidate.linkedToCurrentOwner ? 'Mettre a jour et utiliser' : 'Rattacher ce client'}
                          </button>
                        </div>
                      </article>
                    )) : (
                      <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
                        Aucun utilisateur deja inscrit ne correspond a cette recherche.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCreateCustomer} className="grid gap-4 lg:grid-cols-2">
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
                  <label className="block lg:col-span-2">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Telephone</span>
                    <input
                      required
                      value={newCustomer.phone}
                      onChange={(event) => setNewCustomer((current) => ({ ...current, phone: event.target.value }))}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-950 focus:bg-white"
                      placeholder="+221 77 000 00 00"
                    />
                  </label>
                  <div className="lg:col-span-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={isCreating}
                      className="inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-500 disabled:bg-slate-400"
                    >
                      {isCreating ? <Loader2 size={16} className="animate-spin" /> : 'Enregistrer le client'}
                    </button>
                  </div>
                </form>
              )}

              {createError && <div className="mt-5 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{createError}</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};