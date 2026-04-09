import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Lock, Mail, User, ArrowRight, Loader2, ChevronLeft, UserCheck, BadgeCheck, Sparkles, ShieldCheck, ArrowLeft, Warehouse, UserRound, Phone, Building2, MapPin, MailCheck } from 'lucide-react';
import { UserRole } from '../../types';
import { BrandLogo } from '../BrandLogo';

const REGISTER_ILLUSTRATION_SRC = new URL('../../register-bc.jpg', import.meta.url).href;

export const RegisterPage: React.FC = () => {
  const [step, setStep] = useState<1 | 2>(1);
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
  const roleFieldsAreValid = selectedRole === UserRole.PARC_AUTO
    ? Boolean(companyName && city && country && parkingName)
    : selectedRole === UserRole.ADMIN
      ? Boolean(department && city)
      : selectedRole === UserRole.PARTICULIER
        ? Boolean(city && country)
        : true;
  const baseFieldsAreValid = Boolean(firstName && lastName && email && password);
  const isFormValid = baseFieldsAreValid && roleFieldsAreValid;

  return (
    <div className="min-h-screen flex bg-[#f7f5f0] font-sans">
      <div className="flex-1 flex flex-col justify-center py-8 px-4 sm:px-6 lg:flex-none lg:w-[43%] lg:px-14 xl:px-20 bg-[radial-gradient(circle_at_top,#ffffff_0%,#f8f5ef_52%,#f2eee7_100%)] z-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'linear-gradient(rgba(15,23,42,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.04) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <Link to="/" className="absolute top-6 left-6 flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors text-sm font-medium z-10">
            <ChevronLeft size={16} />
            Retour
        </Link>

        <div className="mx-auto w-full max-w-sm lg:w-full lg:max-w-[440px] relative z-10">
          <div className="mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-600 mb-2">FleetCommand Plus</p>
            <h1 className="text-3xl lg:text-[2rem] font-extrabold text-slate-900 tracking-tight">Inscription en 2 etapes, plus claire et plus courte.</h1>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">On distingue d'abord le type de compte, puis les informations d'acces. C'est plus net pour le parking, l'administration et les autres profils.</p>
          </div>

          <div className="mt-5 bg-white/92 backdrop-blur-xl py-6 px-4 shadow-[0_30px_100px_rgba(15,23,42,0.12)] rounded-[28px] sm:px-7 border border-white/80">
            <div className="text-center mb-5">
                <div className="flex items-center justify-center mb-4">
                  <BrandLogo size="sm" subtitle="L'app FleetCommand" />
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  <span className={`h-2 w-2 rounded-full ${step === 1 ? 'bg-indigo-500' : 'bg-emerald-500'}`}></span>
                  Etape {step} sur 2
                </div>
            </div>

            <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5">
              <button
                type="button"
                onClick={() => setStep(1)}
                className={`rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${step === 1 ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
              >
                Type de compte
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className={`rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${step === 2 ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
              >
                Identite
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
                <div className="rounded-2xl border border-slate-200 bg-[#fbfaf7] px-4 py-4 text-left">
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
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-900"
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
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Choisissez le cadre de votre compte</h2>
                  <p className="mt-1 text-sm text-slate-500">Chaque type de compte declenche ensuite le bon parcours de dashboard.</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {roles.map(({ value, label, desc, icon: Icon, accent }) => (
                    <button
                      type="button"
                      key={value}
                      onClick={() => setSelectedRole(value)}
                      className={`rounded-2xl border p-4 text-left transition-all ${selectedRole === value ? 'border-indigo-500 bg-indigo-50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                    >
                      <div className="mb-3 flex items-center justify-between gap-3">
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
                      <p className="mt-1 text-xs leading-relaxed text-slate-500">{desc}</p>
                    </button>
                  ))}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-[#fbfaf7] p-4">
                  <div className="flex items-start gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${selectedRoleConfig.accent}`}>
                      <selectedRoleConfig.icon size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{selectedRoleConfig.label}</p>
                      <p className="mt-1 text-xs text-slate-500">{selectedRole === UserRole.PARC_AUTO ? 'Le dashboard mettra l accent sur les parkings, les disponibilites et l occupation.' : selectedRole === UserRole.ADMIN ? 'Le compte sera oriente supervision, controle et administration de la plateforme.' : selectedRole === UserRole.PARTICULIER ? 'Le parcours sera adapte a la gestion d un ou plusieurs vehicules personnels.' : 'Le compte sera oriente recherche, reservation et consultation des vehicules.'}</p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="group flex w-full items-center justify-center rounded-2xl bg-slate-950 px-4 py-3.5 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-indigo-600"
                >
                  Continuer
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Entrez vos informations</h2>
                    <p className="mt-1 text-sm text-slate-500">Compte choisi: <span className="font-semibold text-slate-700">{selectedRoleConfig.label}</span></p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900"
                  >
                    <ArrowLeft size={14} /> Retour
                  </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label htmlFor="firstName" className="block text-sm font-semibold text-slate-700">
                      Prenom
                    </label>
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
                        className="appearance-none block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-2xl bg-[#fcfbf8] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm text-slate-900"
                        placeholder="Jean"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="lastName" className="block text-sm font-semibold text-slate-700">
                      Nom
                    </label>
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
                        className="appearance-none block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-2xl bg-[#fcfbf8] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm text-slate-900"
                        placeholder="Dupont"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label htmlFor="phone" className="block text-sm font-semibold text-slate-700">
                      Telephone
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-indigo-500 text-slate-400">
                          <Phone className="h-5 w-5" />
                      </div>
                      <input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="appearance-none block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-2xl bg-[#fcfbf8] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm text-slate-900"
                        placeholder="+221 77 123 45 67"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="city" className="block text-sm font-semibold text-slate-700">
                      Ville
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-indigo-500 text-slate-400">
                          <MapPin className="h-5 w-5" />
                      </div>
                      <input
                        id="city"
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="appearance-none block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-2xl bg-[#fcfbf8] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm text-slate-900"
                        placeholder="Dakar"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="country" className="block text-sm font-semibold text-slate-700">
                    Pays
                  </label>
                  <input
                    id="country"
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-2xl bg-[#fcfbf8] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm text-slate-900"
                    placeholder="Senegal"
                  />
                </div>

                {selectedRole === UserRole.PARC_AUTO && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1 sm:col-span-2">
                      <label htmlFor="companyName" className="block text-sm font-semibold text-slate-700">
                        Nom du parking ou de la structure
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-indigo-500 text-slate-400">
                            <Building2 className="h-5 w-5" />
                        </div>
                        <input
                          id="companyName"
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="appearance-none block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-2xl bg-[#fcfbf8] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm text-slate-900"
                          placeholder="Parking Plateau Signature"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="parkingName" className="block text-sm font-semibold text-slate-700">
                        Premier parking
                      </label>
                      <input
                        id="parkingName"
                        type="text"
                        value={parkingName}
                        onChange={(e) => setParkingName(e.target.value)}
                        className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-2xl bg-[#fcfbf8] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm text-slate-900"
                        placeholder="Parking Principal"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="parkingCapacity" className="block text-sm font-semibold text-slate-700">
                        Capacite initiale
                      </label>
                      <input
                        id="parkingCapacity"
                        type="number"
                        min="1"
                        value={parkingCapacity}
                        onChange={(e) => setParkingCapacity(e.target.value)}
                        className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-2xl bg-[#fcfbf8] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm text-slate-900"
                        placeholder="10"
                      />
                    </div>
                  </div>
                )}

                {selectedRole === UserRole.ADMIN && (
                  <div className="space-y-1">
                    <label htmlFor="department" className="block text-sm font-semibold text-slate-700">
                      Service / departement
                    </label>
                    <input
                      id="department"
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-2xl bg-[#fcfbf8] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm text-slate-900"
                      placeholder="Operations plateforme"
                    />
                  </div>
                )}

                {selectedRole === UserRole.PARTICULIER && (
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-xs leading-relaxed text-emerald-700">
                    Votre profil proprietaire sera cree avec votre ville, pays et contact pour faciliter la publication de vos vehicules.
                  </div>
                )}

                {selectedRole === UserRole.USER && (
                  <div className="rounded-2xl border border-slate-200 bg-[#fbfaf7] px-4 py-3 text-xs leading-relaxed text-slate-600">
                    Pour un compte client, les champs de contact restent simples. Vous pourrez completer le reste plus tard.
                  </div>
                )}

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
                      className="appearance-none block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-2xl bg-[#fcfbf8] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm text-slate-900"
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
                      className="appearance-none block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-2xl bg-[#fcfbf8] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm text-slate-900"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
                    <span>Min. 6 caracteres</span>
                    <span>{selectedRoleConfig.label}</span>
                  </div>
                </div>

                {error && (
                  <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                    {error}
                  </div>
                )}

                <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                  <button
                    type="button"
                    className="inline-flex justify-center items-center py-3 px-4 border border-slate-200 rounded-2xl shadow-sm bg-[#fbfaf7] text-sm font-semibold text-slate-700 hover:bg-white hover:border-slate-300 transition-all duration-200"
                  >
                    <svg className="h-5 w-5 mr-3" aria-hidden="true" viewBox="0 0 24 24">
                      <path d="M12.0003 20.45c-4.6667 0-8.45-3.7833-8.45-8.45 0-4.6667 3.7833-8.45 8.45-8.45 4.6667 0 8.45 3.7833 8.45 8.45 0 4.6667-3.7833 8.45-8.45 8.45Z" fill="#fff" />
                      <path d="M20.108 13.5682c.1591-1.0228.25-2.0682.25-3.1364 0-.5227-.0454-1.0227-.1136-1.5227h-8.2443v3.0681h4.7954c-.25 1.1591-.909 2.1591-1.8409 2.841v2.3182h2.9091c1.7046-1.5682 2.6819-3.8864 2.2443-3.5682Z" fill="#4285F4" />
                      <path d="M11.9998 20.4501c2.2045 0 4.0682-.7273 5.4318-1.9773l-2.9091-2.3182c-.75.5228-1.7273.8182-2.5227.8182-2.2273 0-4.1136-1.5-4.7955-3.5227H4.25v2.3863c1.3864 2.75 4.2273 4.6137 7.7498 4.6137Z" fill="#34A853" />
                      <path d="M7.2044 13.4501c-.1818-.5455-.2727-1.1137-.2727-1.7046s.0909-1.1591.2727-1.7045V7.6546H4.25c-.6136 1.2273-.9545 2.6136-.9545 4.0909s.3409 2.8636.9545 4.0909l2.9544-2.3863Z" fill="#FBBC05" />
                      <path d="M11.9998 6.9046c1.2045 0 2.2727.4318 3.1136 1.2273l2.3182-2.3182C15.9543 4.4955 14.1134 3.5409 11.9998 3.5409c-3.5225 0-6.3634 1.8636-7.7498 4.6136l2.9545 2.3864c.6818-2.0227 2.5682-3.5227 4.7953-3.6363Z" fill="#EA4335" />
                    </svg>
                    Google
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting || !isFormValid}
                    className="group relative flex justify-center py-3 px-5 border border-transparent text-sm font-bold rounded-2xl text-white bg-slate-950 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-slate-400 transition-all duration-300 shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5"
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
                   En vous inscrivant, vous acceptez nos <a href="#" className="underline decoration-slate-300 hover:text-indigo-600 hover:decoration-indigo-600 transition-colors">Conditions</a> et notre <a href="#" className="underline decoration-slate-300 hover:text-indigo-600 hover:decoration-indigo-600 transition-colors">Politique de confidentialite</a>.
                </p>
              </form>
            )}
          </div>
          
           <p className="mt-5 text-center text-sm text-slate-600">
              Déjà membre ?{' '}
              <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
                Connectez-vous
              </Link>
            </p>
        </div>
        
        <div className="absolute bottom-6 left-0 w-full text-center lg:text-left lg:pl-24 text-slate-400 text-xs">
            © 2024 FleetCommand
        </div>
      </div>

         <div className="hidden lg:block relative w-0 flex-1 bg-slate-900 overflow-hidden">
        <img className="absolute inset-0 h-full w-full object-cover" src={REGISTER_ILLUSTRATION_SRC} alt="Illustration inscription FleetCommand" />
         <div className="absolute inset-0 bg-gradient-to-br from-slate-950/55 via-slate-950/45 to-indigo-950/70"></div>
         <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '44px 44px' }}></div>
         
         <div className="relative h-full flex flex-col justify-center items-center p-10 text-center z-10">
          <div className="w-full max-w-lg bg-white/10 backdrop-blur-xl border border-white/15 rounded-[28px] shadow-2xl p-6 mb-6 text-left">
             <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-4">
               <div>
                 <div className="text-xs text-indigo-300 uppercase font-semibold mb-1 tracking-[0.18em]">Onboarding premium</div>
                 <div className="text-2xl font-bold text-white">Comptes mieux cadres</div>
               </div>
               <div className="h-9 w-9 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                <Sparkles size={16} className="text-amber-300" />
               </div>
             </div>
             <div className="space-y-3 mb-5">
              {[
                'Etape 1 pour distinguer parking, administration et autre',
                'Etape 2 pour ne demander que les informations utiles',
                'Page plus compacte et plus lisible sur laptop comme mobile',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <BadgeCheck size={15} className="text-emerald-300 shrink-0" />
                <span className="text-sm text-white/90">{item}</span>
                </div>
              ))}
             </div>
             <div className="grid grid-cols-3 gap-3">
              {['Type', 'Identite', 'Acces'].map((stepLabel, index) => (
                <div key={stepLabel} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-500 text-white flex items-center justify-center text-sm font-bold mb-2">{index + 1}</div>
                <div className="text-xs text-slate-200">{stepLabel}</div>
                </div>
              ))}
             </div>
          </div>
            
            <h3 className="text-3xl font-bold text-white mb-3 tracking-tight">
            Inscription plus courte, roles mieux organises
            </h3>
            <p className="text-indigo-200 text-base max-w-md leading-relaxed">
            Le compte est structure avant meme de demander nom, prenom et acces. Le parcours est plus net et moins long.
            </p>
         </div>
      </div>
    </div>
  );
};