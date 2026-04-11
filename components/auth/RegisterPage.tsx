import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Lock, Mail, User, ArrowRight, Loader2, ChevronLeft, UserCheck, ShieldCheck, ArrowLeft, Warehouse, UserRound, Phone, Building2, MapPin, MailCheck, Check, LocateFixed } from 'lucide-react';
import { UserRole } from '../../types';
import { BrandLogo } from '../BrandLogo';
import { ResolvedCurrentLocation, resolveCurrentLocation } from '../../services/location';

const REGISTER_ILLUSTRATION_SRC = new URL('../../register-bc.jpg', import.meta.url).href;

export const RegisterPage: React.FC = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Senegal');
  const [companyName, setCompanyName] = useState('');
  const [department, setDepartment] = useState('');
  const [parkingName, setParkingName] = useState('');
  const [parkingCapacity, setParkingCapacity] = useState('10');
  const [parkingAddress, setParkingAddress] = useState('');
  const [parkingCoordinates, setParkingCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [parkingLocationDraft, setParkingLocationDraft] = useState<ResolvedCurrentLocation | null>(null);
  const [parkingLocationConfirmed, setParkingLocationConfirmed] = useState(false);
  const [parkingLocationError, setParkingLocationError] = useState('');
  const [isLocatingParking, setIsLocatingParking] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.USER);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsSubmitting(true);
    try {
      const registration = await register({
        firstName,
        lastName,
        email,
        password,
        role: selectedRole,
        profileData: {
          phone,
          city,
          country,
          companyName,
          department,
          parkingName,
          parkingCapacity: parkingCapacity ? Number(parkingCapacity) : null,
          parkingAddress,
          parkingLatitude: parkingCoordinates?.latitude ?? null,
          parkingLongitude: parkingCoordinates?.longitude ?? null,
          parkingLocationConfirmed,
        },
      });
      setRegisteredEmail(registration.email);
      setSuccessMessage(registration.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Inscription impossible pour le moment. Vérifiez les informations saisies.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const roles = [
    {
      value: UserRole.USER,
      label: 'Client / Autre',
      desc: 'Je consulte, reserve ou achete un vehicule',
      icon: UserCheck,
      accent: 'bg-slate-100 text-slate-700',
    },
    {
      value: UserRole.PARTICULIER,
      label: 'Particulier',
      desc: 'Je propose mes vehicules en location',
      icon: User,
      accent: 'bg-emerald-100 text-emerald-700',
    },
    {
      value: UserRole.PARC_AUTO,
      label: 'Parking / Parc auto',
      desc: 'Je gere des emplacements et une flotte',
      icon: Warehouse,
      accent: 'bg-indigo-100 text-indigo-700',
    },
    {
      value: UserRole.ADMIN,
      label: 'Administration',
      desc: 'Je supervise les operations et les comptes',
      icon: ShieldCheck,
      accent: 'bg-amber-100 text-amber-700',
    },
  ];

  const selectedRoleConfig = roles.find((role) => role.value === selectedRole) ?? roles[0];
  const roleStepIsValid = Boolean(selectedRole);
  const profileFieldsAreValid = selectedRole === UserRole.PARC_AUTO
    ? Boolean(companyName && city && country && parkingName)
    : selectedRole === UserRole.ADMIN
      ? Boolean(department && city)
      : selectedRole === UserRole.PARTICULIER
        ? Boolean(city && country)
        : Boolean(city);
  const identityFieldsAreValid = Boolean(firstName && lastName && city && country);
  const accessFieldsAreValid = Boolean(email && password);
  const isFormValid = identityFieldsAreValid && accessFieldsAreValid && profileFieldsAreValid;

  const canGoToStep = (targetStep: 1 | 2 | 3) => {
    if (targetStep === 1) return true;
    if (targetStep === 2) return roleStepIsValid;
    return roleStepIsValid && identityFieldsAreValid && profileFieldsAreValid;
  };

  const changeStep = (targetStep: 1 | 2 | 3) => {
    if (canGoToStep(targetStep)) {
      setStep(targetStep);
    }
  };

  const handleUseCurrentParkingLocation = async () => {
    try {
      setIsLocatingParking(true);
      setParkingLocationError('');
      const resolvedLocation = await resolveCurrentLocation();
      setParkingLocationDraft(resolvedLocation);
    } catch (locationError) {
      setParkingLocationError(locationError instanceof Error ? locationError.message : 'Impossible de recuperer votre position actuelle.');
    } finally {
      setIsLocatingParking(false);
    }
  };

  const confirmParkingLocation = () => {
    if (!parkingLocationDraft) {
      return;
    }

    setParkingAddress(parkingLocationDraft.address);
    setParkingCoordinates({ latitude: parkingLocationDraft.latitude, longitude: parkingLocationDraft.longitude });
    setParkingLocationConfirmed(true);
    setCity((currentCity) => currentCity || parkingLocationDraft.city);
    setParkingLocationDraft(null);
  };

  return (
    <div className="min-h-screen bg-[#f7f5f0] font-sans lg:flex lg:h-screen lg:overflow-hidden">
      <div className="relative z-10 flex flex-1 flex-col overflow-hidden bg-[radial-gradient(circle_at_top,#ffffff_0%,#f8f5ef_52%,#f2eee7_100%)] px-4 py-4 sm:px-6 lg:w-[44%] lg:flex-none lg:px-12 xl:px-16">
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'linear-gradient(rgba(15,23,42,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.04) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <Link to="/" className="relative z-20 inline-flex w-fit items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600">
            <ChevronLeft size={16} />
            Retour
        </Link>

        <div className="relative z-10 mx-auto flex h-full w-full max-w-[450px] flex-col justify-start lg:justify-center py-6 overflow-y-auto">
          <div className="mb-8">
            <BrandLogo size="sm" />
            <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Créer un compte</h1>
            <p className="mt-2 text-sm text-slate-500">3 étapes courtes. On ne passe pas à la suite tant que l’étape n’est pas complète.</p>
          </div>

          <div className="mb-6 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => changeStep(1)}
                className={`rounded-2xl px-3 py-3 text-sm font-semibold transition-colors ${step === 1 ? 'bg-slate-950 text-white' : 'bg-white/70 text-slate-500'}`}
              >
                1. Compte
              </button>
              <button
                type="button"
                onClick={() => changeStep(2)}
                disabled={!canGoToStep(2)}
                className={`rounded-2xl px-3 py-3 text-sm font-semibold transition-colors ${step === 2 ? 'bg-slate-950 text-white' : 'bg-white/70 text-slate-500'} disabled:cursor-not-allowed disabled:opacity-45`}
              >
                2. Profil
              </button>
              <button
                type="button"
                onClick={() => changeStep(3)}
                disabled={!canGoToStep(3)}
                className={`rounded-2xl px-3 py-3 text-sm font-semibold transition-colors ${step === 3 ? 'bg-slate-950 text-white' : 'bg-white/70 text-slate-500'} disabled:cursor-not-allowed disabled:opacity-45`}
              >
                3. Accès
              </button>
          </div>

            {successMessage ? (
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <MailCheck size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Confirmez votre adresse email</h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">{successMessage}</p>
                </div>
                <div className="rounded-2xl bg-[#fbfaf7] px-4 py-4 text-left ring-1 ring-slate-200/80">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">Email de confirmation</p>
                  <p className="mt-2 text-sm font-bold text-slate-900">{registeredEmail}</p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">Ouvrez l'email recu puis cliquez sur le lien d'activation avant de revenir a la connexion.</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSuccessMessage('');
                      setRegisteredEmail('');
                    }}
                    className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200 hover:text-slate-900"
                  >
                    Creer un autre compte
                  </button>
                  <Link
                    to="/login"
                    className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-600"
                  >
                    Aller a la connexion
                  </Link>
                </div>
              </div>
            ) : step === 1 ? (
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Type de compte</h2>
                  <p className="mt-1 text-sm text-slate-500">Sélectionnez une seule option.</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {roles.map(({ value, label, desc, icon: Icon, accent }) => (
                    <button
                      type="button"
                      key={value}
                      onClick={() => setSelectedRole(value)}
                      className={`rounded-2xl px-4 py-3 text-left transition-all ring-1 ${selectedRole === value ? 'bg-indigo-50 ring-indigo-400' : 'bg-white ring-slate-200 hover:ring-slate-300'}`}
                    >
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent}`}>
                          <Icon size={18} />
                        </div>
                        {selectedRole === value && (
                          <span className="rounded-full bg-indigo-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
                            Actif
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-bold text-slate-900">{label}</p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-500 line-clamp-2">{desc}</p>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => changeStep(2)}
                  className="group flex w-full items-center justify-center rounded-2xl bg-slate-950 px-4 py-3.5 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-indigo-600"
                >
                  Continuer
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            ) : step === 2 ? (
              <div className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-extrabold tracking-tight text-slate-900">Identite et profil</h2>
                    <p className="mt-1 text-sm text-slate-500">Renseignez l’essentiel.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => changeStep(1)}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition-colors hover:text-slate-900"
                  >
                    <ArrowLeft size={14} /> Retour
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label htmlFor="firstName" className="block text-sm font-semibold text-slate-700">Prenom</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-indigo-500 text-slate-400">
                        <UserRound className="h-5 w-5" />
                      </div>
                      <input
                        id="firstName"
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="block w-full rounded-2xl bg-white px-3 py-3 pl-10 text-slate-900 outline-none ring-1 ring-slate-200 transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/30 sm:text-sm"
                        placeholder="Jean"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="lastName" className="block text-sm font-semibold text-slate-700">Nom</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-indigo-500 text-slate-400">
                        <User className="h-5 w-5" />
                      </div>
                      <input
                        id="lastName"
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="block w-full rounded-2xl bg-white px-3 py-3 pl-10 text-slate-900 outline-none ring-1 ring-slate-200 transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/30 sm:text-sm"
                        placeholder="Dupont"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="phone" className="block text-sm font-semibold text-slate-700">Telephone</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-indigo-500 text-slate-400">
                        <Phone className="h-5 w-5" />
                      </div>
                      <input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="block w-full rounded-2xl bg-white px-3 py-3 pl-10 text-slate-900 outline-none ring-1 ring-slate-200 transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/30 sm:text-sm"
                        placeholder="+221 77 123 45 67"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="city" className="block text-sm font-semibold text-slate-700">Ville</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-indigo-500 text-slate-400">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <input
                        id="city"
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="block w-full rounded-2xl bg-white px-3 py-3 pl-10 text-slate-900 outline-none ring-1 ring-slate-200 transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/30 sm:text-sm"
                        placeholder="Dakar"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label htmlFor="country" className="block text-sm font-semibold text-slate-700">Pays</label>
                    <input
                      id="country"
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="block w-full rounded-2xl bg-white px-4 py-3 text-slate-900 outline-none ring-1 ring-slate-200 transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/30 sm:text-sm"
                      placeholder="Senegal"
                    />
                  </div>

                  {selectedRole === UserRole.ADMIN ? (
                    <div className="space-y-1">
                      <label htmlFor="department" className="block text-sm font-semibold text-slate-700">Service</label>
                      <input
                        id="department"
                        type="text"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="block w-full rounded-2xl bg-white px-4 py-3 text-slate-900 outline-none ring-1 ring-slate-200 transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/30 sm:text-sm"
                        placeholder="Operations plateforme"
                      />
                    </div>
                  ) : selectedRole === UserRole.PARC_AUTO ? (
                    <div className="space-y-1">
                      <label htmlFor="parkingName" className="block text-sm font-semibold text-slate-700">Premier parking</label>
                      <input
                        id="parkingName"
                        type="text"
                        value={parkingName}
                        onChange={(e) => setParkingName(e.target.value)}
                        className="block w-full rounded-2xl bg-white px-4 py-3 text-slate-900 outline-none ring-1 ring-slate-200 transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/30 sm:text-sm"
                        placeholder="Parking Principal"
                      />
                    </div>
                  ) : (
                    <div className="px-1 py-3 text-xs leading-relaxed text-slate-600">
                      {selectedRole === UserRole.PARTICULIER
                        ? 'Votre profil proprietaire sera cree avec votre ville, pays et contact.'
                        : 'Pour un compte client, vous pourrez completer les details plus tard.'}
                    </div>
                  )}
                </div>

                {selectedRole === UserRole.PARC_AUTO && (
                  <div className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-[1.3fr_0.7fr]">
                      <div className="space-y-1">
                        <label htmlFor="companyName" className="block text-sm font-semibold text-slate-700">Structure</label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-indigo-500 text-slate-400">
                            <Building2 className="h-5 w-5" />
                          </div>
                          <input
                            id="companyName"
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            className="block w-full rounded-2xl bg-white px-3 py-3 pl-10 text-slate-900 outline-none ring-1 ring-slate-200 transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/30 sm:text-sm"
                            placeholder="Parking Plateau Signature"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="parkingCapacity" className="block text-sm font-semibold text-slate-700">Capacite</label>
                        <input
                          id="parkingCapacity"
                          type="number"
                          min="1"
                          value={parkingCapacity}
                          onChange={(e) => setParkingCapacity(e.target.value)}
                          className="block w-full rounded-2xl bg-white px-4 py-3 text-slate-900 outline-none ring-1 ring-slate-200 transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/30 sm:text-sm"
                          placeholder="10"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="parkingAddress" className="block text-sm font-semibold text-slate-700">Adresse du parc</label>
                      <input
                        id="parkingAddress"
                        type="text"
                        value={parkingAddress}
                        onChange={(e) => {
                          setParkingAddress(e.target.value);
                          setParkingLocationConfirmed(false);
                        }}
                        className="block w-full rounded-2xl bg-white px-4 py-3 text-slate-900 outline-none ring-1 ring-slate-200 transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/30 sm:text-sm"
                        placeholder="Adresse precise du parking"
                      />
                    </div>

                    <div className="rounded-2xl bg-[#fbfaf7] px-4 py-4 ring-1 ring-slate-200/80">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-bold text-slate-900">Utiliser votre position actuelle</p>
                          <p className="mt-1 text-xs leading-relaxed text-slate-500">L application recupere votre position, vous montre l adresse detectee, puis vous demande de confirmer qu il s agit bien du parc auto.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => void handleUseCurrentParkingLocation()}
                          disabled={isLocatingParking}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400"
                        >
                          {isLocatingParking ? <Loader2 size={16} className="animate-spin" /> : <LocateFixed size={16} />}
                          {isLocatingParking ? 'Localisation...' : 'Utiliser ma position'}
                        </button>
                      </div>

                      {parkingLocationError && (
                        <div className="mt-3 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{parkingLocationError}</div>
                      )}

                      {parkingLocationDraft && (
                        <div className="mt-3 rounded-2xl border border-indigo-100 bg-white px-4 py-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">Confirmation</p>
                          <p className="mt-2 text-sm font-bold text-slate-900">Est-ce bien l adresse et la position du parc auto ?</p>
                          <p className="mt-2 text-sm text-slate-600">{parkingLocationDraft.label}</p>
                          <p className="mt-2 text-xs text-slate-500">Coordonnees: {parkingLocationDraft.latitude}, {parkingLocationDraft.longitude}</p>
                          <div className="mt-4 flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={confirmParkingLocation}
                              className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-600"
                            >
                              Oui, enregistrer cette adresse
                            </button>
                            <button
                              type="button"
                              onClick={() => setParkingLocationDraft(null)}
                              className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200"
                            >
                              Non, annuler
                            </button>
                          </div>
                        </div>
                      )}

                      {parkingLocationConfirmed && parkingCoordinates && (
                        <div className="mt-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                          Adresse confirmee pour le parc auto. Elle pourra ensuite etre modifiee depuis l espace prive selon la regle des 7 jours.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  disabled={!identityFieldsAreValid || !profileFieldsAreValid}
                  onClick={() => changeStep(3)}
                  className="group flex w-full items-center justify-center rounded-2xl bg-slate-950 px-4 py-3.5 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-indigo-600 disabled:bg-slate-400"
                >
                  Continuer
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-extrabold tracking-tight text-slate-900">Acces au compte</h2>
                    <p className="mt-1 text-sm text-slate-500">Dernière étape.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => changeStep(2)}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition-colors hover:text-slate-900"
                  >
                    <ArrowLeft size={14} /> Retour
                  </button>
                </div>

                <div className="space-y-1">
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                    Adresse Email
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-indigo-500 text-slate-400">
                        <Mail className="h-5 w-5" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full rounded-2xl bg-white px-3 py-3 pl-10 text-slate-900 outline-none ring-1 ring-slate-200 transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/30 sm:text-sm"
                      placeholder="vous@entreprise.com"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                    Mot de passe
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-indigo-500 text-slate-400">
                        <Lock className="h-5 w-5" />
                    </div>
                    <input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full rounded-2xl bg-white px-3 py-3 pl-10 text-slate-900 outline-none ring-1 ring-slate-200 transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/30 sm:text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
                    <span>Min. 6 caracteres</span>
                    <span className="inline-flex items-center gap-1"><Check size={12} /> {selectedRoleConfig.label}</span>
                  </div>
                </div>

                <div className="px-1 py-2 text-xs leading-relaxed text-slate-600">
                  <span className="font-semibold text-slate-900">Recap:</span> {firstName || 'Prenom'} {lastName || 'Nom'} · {selectedRoleConfig.label} · {city || 'Ville'}
                </div>

                {error && (
                  <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
                    {error}
                  </div>
                )}

                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting || !isFormValid}
                    className="group relative flex w-full justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-slate-400"
                  >
                    {isSubmitting ? (
                        <Loader2 className="animate-spin h-5 w-5" />
                    ) : (
                        <>
                        Creer mon compte
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                  </button>
                </div>

                 <p className="text-xs text-center text-slate-500 leading-relaxed">
                   En vous inscrivant, vous acceptez nos <Link to="/terms" className="underline decoration-slate-300 hover:text-indigo-600 hover:decoration-indigo-600 transition-colors">Conditions</Link> et notre <Link to="/privacy" className="underline decoration-slate-300 hover:text-indigo-600 hover:decoration-indigo-600 transition-colors">Politique de confidentialite</Link>.
                 </p>
              </form>
            )}
          
           <p className="mt-5 text-center text-sm text-slate-600">
              Déjà membre ?{' '}
              <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
                Connectez-vous
              </Link>
            </p>
        </div>
        
        <div className="relative z-10 mt-6 text-center lg:text-left lg:pl-0 text-slate-400 text-xs">
            © 2024 Djambo
        </div>
      </div>

         <div className="relative hidden flex-1 items-center justify-center overflow-hidden bg-slate-950 lg:flex">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.24),transparent_34%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.08),transparent_38%)]"></div>
         <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '44px 44px' }}></div>
         <img className="h-full w-full object-cover object-center" src={REGISTER_ILLUSTRATION_SRC} alt="Illustration inscription Djambo" />
         <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.24)_0%,rgba(2,6,23,0.14)_28%,rgba(2,6,23,0.38)_100%)]"></div>
      </div>
    </div>
  );
};