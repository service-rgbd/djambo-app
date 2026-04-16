import { BookingStatus, FleetStats, FuelType, RevenueData, UserRole, VehicleCategory } from '../types';
import {
  findMarketplaceOwnerById,
  findMarketplaceVehicleById,
  marketplaceVehicles as legacyMarketplaceVehicles,
  reviews as legacyMarketplaceReviews,
} from './mockData';

const defaultApiBaseUrl = 'https://api.djambo-app.com';
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)
  || defaultApiBaseUrl;

const normalizeEmail = (email: string) => email.trim().toLowerCase();

type StoredUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  authToken?: string;
  sessionExpiresAt?: string;
};

const storedUserKey = 'fleet_user';
const authExpiredEventName = 'djambo:auth-expired';

export type CustomerSummary = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  status: 'Actif' | 'A relancer';
  totalBookings: number;
  totalRequests: number;
  totalSpent: number;
  lastActivityAt: string | null;
  preferredVehicle: string | null;
  interestType: 'RENT' | 'BUY' | null;
};

export type CreateCustomerPayload = {
  fullName: string;
  email: string;
  phone: string;
  interestType: 'RENT' | 'BUY';
};

export type RegisteredCustomerCandidate = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  linkedToCurrentOwner: boolean;
};

export type OwnerVehicleSummary = {
  id: string;
  title: string;
  city: string;
  pricePerDay: number;
  rating: number;
  reviewCount: number;
  viewCount: number;
  isAvailable: boolean;
  occupiedUntil: string | null;
  nextAvailabilityTime: string | null;
  parkingId: string | null;
  parkingName: string | null;
  imageUrl: string | null;
};

export type OwnerParkingSummary = {
  id: string;
  name: string;
  city: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  location_source?: string;
  location_confirmed_at?: string | null;
  location_updated_at?: string | null;
  location_editable_after?: string | null;
  access_type?: string;
  opening_hours?: string;
  security_features?: string[];
  capacity_total: number;
  vehicle_count: number;
  available_spots: number;
  vehicles: OwnerVehicleSummary[];
};

export type OwnerRequestSummary = {
  id: string;
  request_type: 'RENT' | 'BUY';
  status: string;
  booking_channel: 'DIRECT_APP' | 'ON_SITE';
  start_date: string | null;
  end_date: string | null;
  estimated_total: number | null;
  offered_price: number | null;
  pickup_mode: string | null;
  contact_preference: string | null;
  message: string | null;
  created_at: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  identity_number: string | null;
  license_number: string | null;
  vehicle_title: string;
  response_message?: string | null;
  responded_at?: string | null;
  responded_by_user_id?: string | null;
};

export type OwnerReviewSummary = {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_name: string;
  vehicle_title: string;
};

export type OwnerNotificationSummary = {
  id: string;
  type: 'REQUEST_CREATED' | 'REQUEST_UPDATED' | 'CONTRACT_CREATED' | 'CONTRACT_UPDATED' | 'PROFILE_VIEWED';
  title: string;
  detail: string;
  relatedKind: string;
  relatedId: string | null;
  metadata: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
  readAt?: string | null;
};

export type OwnerDashboardResponse = {
  ownerProfile: {
    id: string;
    userId: string;
    displayName: string;
    city: string;
    country: string;
    responseTime: string;
    rating: number;
    reviewCount: number;
    vehicleCount: number;
    verified: boolean;
    type: UserRole;
  } | null;
  stats: {
    listedVehicles: number;
    activeBookings: number;
    totalRevenue: number;
    averageRating: number;
  } | null;
  vehicles: OwnerVehicleSummary[];
  recentBookings: Array<{
    id: string;
    vehicle_id: string;
    user_id: string;
    start_date: string;
    end_date: string;
    total_price: number;
    status: BookingStatus | string;
    message?: string;
    created_at: string;
    vehicle_title: string;
    renter_name: string;
  }>;
  parkings: OwnerParkingSummary[];
  requestInbox: OwnerRequestSummary[];
  reviewFeed: OwnerReviewSummary[];
  notifications: OwnerNotificationSummary[];
};

export type ParkingLocationPayload = {
  address: string;
  city: string;
  latitude: number;
  longitude: number;
};

export type PrivateAppSettings = {
  businessName: string;
  publicEmail: string;
  supportPhone: string;
  city: string;
  responseTime: string;
  storeSlug: string;
  publicStoreUrl: string;
  publicProfileUrl: string;
  chauffeurOnDemand: boolean;
  chauffeurDailyRate: string;
  deliveryEnabled: boolean;
  whatsappEnabled: boolean;
  contractSignatureEnabled: boolean;
  notificationsEmail: boolean;
  notificationsSms: boolean;
  brandLogo?: string;
  storefrontCover?: string;
  contractBanner?: string;
};

export type OwnerInventoryVehicle = {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  category: string;
  fuelType: string;
  transmission: 'Manuelle' | 'Automatique';
  seats: number;
  pricePerDay: number;
  city: string;
  location: string;
  description: string;
  mileage: number;
  color?: string | null;
  isAvailable: boolean;
  parkingId?: string | null;
  parkingName?: string | null;
  imageUrl?: string | null;
};

export type CreateOwnerVehiclePayload = {
  title: string;
  brand: string;
  model: string;
  year: number;
  category: string;
  fuelType: string;
  transmission: 'Manuelle' | 'Automatique';
  seats: number;
  pricePerDay: number;
  city: string;
  location: string;
  description: string;
  mileage: number;
  color?: string;
  isAvailable: boolean;
  parkingId?: string | null;
  imageUrl?: string;
};

export type ManagedContractRecord = {
  id: string;
  contractNumber: string;
  customerId: string;
  vehicleId: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  dailyRate: number;
  status: 'Paiement En Attente' | 'Actif' | 'Terminé' | 'Annulé';
  paymentMethod?: 'Carte Bancaire' | 'Virement' | 'Espèces';
  chauffeurRequested?: boolean;
  chauffeurRate?: number;
  generatedAt?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  vehicleLabel?: string;
  responseMessage?: string | null;
  respondedAt?: string | null;
  respondedByUserId?: string | null;
  contractUrl: string;
};

export type UpdateVehicleRequestPayload = {
  status: 'PENDING' | 'CONTACTED' | 'APPROVED' | 'REJECTED' | 'CANCELED';
  responseMessage?: string;
};

export type UpdateContractPayload = {
  status: 'PENDING_PAYMENT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  responseMessage?: string;
};

export type CreateContractPayload = {
  customerId: string;
  vehicleId: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  dailyRate: number;
  paymentMethod?: 'Carte Bancaire' | 'Virement' | 'Espèces';
  chauffeurRequested?: boolean;
  chauffeurRate?: number;
};

export type RegisterPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  turnstileToken?: string;
  profileData: {
    phone?: string;
    city?: string;
    country?: string;
    companyName?: string;
    department?: string;
    parkingName?: string;
    parkingCapacity?: number | null;
    parkingAddress?: string;
    parkingLatitude?: number | null;
    parkingLongitude?: number | null;
    parkingLocationConfirmed?: boolean;
  };
};

export type RegisterResponse = {
  email: string;
  requiresEmailVerification: boolean;
  message: string;
};

export type ForgotPasswordResponse = {
  message: string;
};

export type ResetPasswordResponse = {
  message: string;
};

export type VehicleRequestPayload = {
  vehicleId: string;
  vehicleTitle: string;
  ownerName: string;
  requestType: 'rent' | 'buy';
  reservationMode: 'direct_app' | 'on_site';
  startDate?: string;
  endDate?: string;
  estimatedTotal?: number;
  offeredPrice?: number;
  pickupMode?: 'agency' | 'delivery';
  contactPreference?: 'platform' | 'whatsapp';
  message?: string;
  customerDetails?: {
    fullName: string;
    email: string;
    phone: string;
    identityNumber: string;
    licenseNumber?: string;
  };
};

export type VehicleRequestResponse = {
  id: string;
  requestType: 'RENT' | 'BUY';
  status: string;
  message: string;
};

export type UploadVehicleImageResponse = {
  key: string;
  url: string;
};

export type AIChatMessage = {
  role: 'user' | 'assistant';
  text: string;
};

export type AIChatResponse = {
  reply: string;
  source: 'fallback' | 'cache' | 'openrouter';
  cached: boolean;
  model?: string;
};

export type PushPublicKeyResponse = {
  enabled: boolean;
  publicKey: string | null;
};

export type PushSubscriptionPayload = {
  endpoint: string;
  expirationTime?: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
  contentEncoding?: string;
};

export type PrivateSettingMediaScope = 'brand-logo' | 'storefront-cover' | 'contract-banner';

export type MarketplacePublicOwnerProfile = {
  id: string;
  userId: string;
  type: 'PARTICULIER' | 'PARC_AUTO';
  displayName: string;
  description: string;
  address: string;
  city: string;
  country: string;
  rating: number;
  reviewCount: number;
  vehicleCount: number;
  verified: boolean;
  whatsapp?: string;
  responseTime: string;
  memberSince: string;
  storeSlug: string;
};

export type MarketplacePublicVehicleImage = {
  id: string;
  url: string;
  alt: string;
};

export type MarketplacePublicVehicle = {
  id: string;
  ownerId: string;
  ownerProfile: MarketplacePublicOwnerProfile;
  title: string;
  brand: string;
  model: string;
  year: number;
  category: VehicleCategory | string;
  fuelType: FuelType | string;
  transmission: 'Manuelle' | 'Automatique';
  seats: number;
  pricePerDay: number;
  priceSale?: number;
  isForRent: boolean;
  isForSale: boolean;
  description: string;
  features: string[];
  location: string;
  city: string;
  images: MarketplacePublicVehicleImage[];
  rating: number;
  reviewCount: number;
  viewCount: number;
  isFeatured: boolean;
  isAvailable: boolean;
  createdAt: string;
  mileage: number;
  color: string;
  conditions?: string;
};

export type MarketplacePublicReview = {
  id: string;
  userId: string;
  userName: string;
  userInitials: string;
  vehicleId: string;
  ownerId: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export type MarketplaceVehicleDetailResponse = {
  vehicle: MarketplacePublicVehicle;
  reviews: MarketplacePublicReview[];
  relatedVehicles: MarketplacePublicVehicle[];
};

export type MarketplaceOwnerDetailResponse = {
  ownerProfile: MarketplacePublicOwnerProfile;
  vehicles: MarketplacePublicVehicle[];
  reviews: MarketplacePublicReview[];
};

export type MarketplaceStorefrontResponse = {
  ownerProfile: MarketplacePublicOwnerProfile;
  vehicles: MarketplacePublicVehicle[];
};

export type SubmitVehicleReviewPayload = {
  vehicleId: string;
  rating: number;
  comment: string;
};

export type SubmitVehicleReviewResponse = {
  vehicle: MarketplacePublicVehicle;
  reviews: MarketplacePublicReview[];
  review: MarketplacePublicReview | null;
  message: string;
};

const toStoreSlug = (value: string) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

const normalizeLegacyOwnerProfile = (ownerProfile: typeof legacyMarketplaceVehicles[number]['ownerProfile']): MarketplacePublicOwnerProfile => ({
  id: ownerProfile.id,
  userId: ownerProfile.userId,
  type: ownerProfile.type === 'PARC_AUTO' ? 'PARC_AUTO' : 'PARTICULIER',
  displayName: ownerProfile.displayName,
  description: ownerProfile.description,
  address: ownerProfile.address,
  city: ownerProfile.city,
  country: ownerProfile.country,
  rating: ownerProfile.rating,
  reviewCount: ownerProfile.reviewCount,
  vehicleCount: ownerProfile.vehicleCount,
  verified: ownerProfile.verified,
  whatsapp: ownerProfile.whatsapp,
  responseTime: ownerProfile.responseTime,
  memberSince: ownerProfile.memberSince,
  storeSlug: toStoreSlug(ownerProfile.displayName),
});

const normalizeLegacyVehicle = (vehicle: typeof legacyMarketplaceVehicles[number]): MarketplacePublicVehicle => ({
  id: vehicle.id,
  ownerId: vehicle.ownerId,
  ownerProfile: normalizeLegacyOwnerProfile(vehicle.ownerProfile),
  title: vehicle.title,
  brand: vehicle.brand,
  model: vehicle.model,
  year: vehicle.year,
  category: vehicle.category,
  fuelType: vehicle.fuelType,
  transmission: vehicle.transmission,
  seats: vehicle.seats,
  pricePerDay: vehicle.pricePerDay,
  priceSale: vehicle.priceSale,
  isForRent: vehicle.isForRent,
  isForSale: vehicle.isForSale,
  description: vehicle.description,
  features: vehicle.features,
  location: vehicle.location,
  city: vehicle.city,
  images: vehicle.images,
  rating: vehicle.rating,
  reviewCount: vehicle.reviewCount,
  viewCount: vehicle.viewCount,
  isFeatured: vehicle.isFeatured,
  isAvailable: vehicle.isAvailable,
  createdAt: vehicle.createdAt,
  mileage: vehicle.mileage,
  color: vehicle.color,
  conditions: vehicle.conditions,
});

const mergeVehicleWithLegacyImages = (
  apiVehicle: MarketplacePublicVehicle,
  legacyVehicle: MarketplacePublicVehicle,
): MarketplacePublicVehicle => ({
  ...apiVehicle,
  ownerProfile: {
    ...apiVehicle.ownerProfile,
    type: apiVehicle.ownerProfile.type || legacyVehicle.ownerProfile.type,
    storeSlug: apiVehicle.ownerProfile.storeSlug || legacyVehicle.ownerProfile.storeSlug,
  },
  images: legacyVehicle.images.length > 0 ? legacyVehicle.images : apiVehicle.images,
});

const legacyMarketplaceVehicleIds = new Set(legacyMarketplaceVehicles.map((vehicle) => vehicle.id));

export const isLegacyMarketplaceVehicleId = (vehicleId: string) => legacyMarketplaceVehicleIds.has(vehicleId);

export const isRealUserMarketplaceVehicle = (vehicle: Pick<MarketplacePublicVehicle, 'id'>) => !isLegacyMarketplaceVehicleId(vehicle.id);

const normalizeLegacyReview = (review: typeof legacyMarketplaceReviews[number]): MarketplacePublicReview => ({
  id: review.id,
  userId: review.userId,
  userName: review.userName,
  userInitials: review.userInitials,
  vehicleId: review.vehicleId,
  ownerId: review.ownerId,
  rating: review.rating,
  comment: review.comment,
  createdAt: review.createdAt,
});

const mergeMarketplaceVehicles = (apiVehicles: MarketplacePublicVehicle[]): MarketplacePublicVehicle[] => {
  const legacyVehicles = legacyMarketplaceVehicles.map(normalizeLegacyVehicle);
  const vehiclesById = new Map<string, MarketplacePublicVehicle>();

  apiVehicles.forEach((vehicle) => {
    vehiclesById.set(vehicle.id, vehicle);
  });

  const merged: MarketplacePublicVehicle[] = legacyVehicles.map((vehicle) => {
    const apiVehicle = vehiclesById.get(vehicle.id);
    return apiVehicle ? mergeVehicleWithLegacyImages(apiVehicle, vehicle) : vehicle;
  });
  const mergedIds = new Set(merged.map((vehicle) => vehicle.id));

  apiVehicles.forEach((vehicle) => {
    if (!mergedIds.has(vehicle.id)) {
      merged.push(vehicle);
    }
  });

  return merged;
};

const mergeMarketplaceReviews = (apiReviews: MarketplacePublicReview[], ownerId?: string, vehicleId?: string): MarketplacePublicReview[] => {
  const legacyReviews = legacyMarketplaceReviews
    .map(normalizeLegacyReview)
    .filter((review) => (!ownerId || review.ownerId === ownerId) && (!vehicleId || review.vehicleId === vehicleId));

  const reviewsById = new Map<string, MarketplacePublicReview>();
  apiReviews.forEach((review) => reviewsById.set(review.id, review));

  const merged = legacyReviews.map((review) => reviewsById.get(review.id) || review);
  const mergedIds = new Set(merged.map((review) => review.id));
  apiReviews.forEach((review) => {
    if (!mergedIds.has(review.id)) {
      merged.push(review);
    }
  });

  return merged;
};

const buildLegacyVehicleDetailResponse = (vehicleId: string): MarketplaceVehicleDetailResponse => {
  const legacyVehicle = findMarketplaceVehicleById(vehicleId);
  if (!legacyVehicle) {
    throw new Error('Vehicle not found');
  }

  const normalizedVehicle = normalizeLegacyVehicle(legacyVehicle);
  const relatedVehicles = legacyMarketplaceVehicles
    .filter((vehicle) => vehicle.id !== normalizedVehicle.id && vehicle.city === normalizedVehicle.city)
    .slice(0, 3)
    .map(normalizeLegacyVehicle);

  return {
    vehicle: normalizedVehicle,
    reviews: mergeMarketplaceReviews([], undefined, normalizedVehicle.id),
    relatedVehicles,
  };
};

const buildLegacyOwnerDetailResponse = (ownerId: string): MarketplaceOwnerDetailResponse => {
  const legacyOwner = findMarketplaceOwnerById(ownerId);
  if (!legacyOwner) {
    throw new Error('Owner not found');
  }

  return {
    ownerProfile: normalizeLegacyOwnerProfile(legacyOwner),
    vehicles: legacyMarketplaceVehicles
      .filter((vehicle) => vehicle.ownerId === legacyOwner.id)
      .map(normalizeLegacyVehicle),
    reviews: mergeMarketplaceReviews([], legacyOwner.id),
  };
};

const buildLegacyStorefrontResponse = (slug: string): MarketplaceStorefrontResponse => {
  const legacyOwner = legacyMarketplaceVehicles
    .map((vehicle) => vehicle.ownerProfile)
    .find((ownerProfile, index, all) => index === all.findIndex((candidate) => candidate.id === ownerProfile.id) && toStoreSlug(ownerProfile.displayName) === slug);

  if (!legacyOwner) {
    throw new Error('Storefront not found');
  }

  return {
    ownerProfile: normalizeLegacyOwnerProfile(legacyOwner),
    vehicles: legacyMarketplaceVehicles
      .filter((vehicle) => vehicle.ownerId === legacyOwner.id)
      .map(normalizeLegacyVehicle),
  };
};

const getStoredUser = (): StoredUser | null => {
  const raw = localStorage.getItem(storedUserKey);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    localStorage.removeItem(storedUserKey);
    return null;
  }
};

export const persistStoredUser = (user: StoredUser | null) => {
  if (user) {
    localStorage.setItem(storedUserKey, JSON.stringify(user));
    return;
  }

  localStorage.removeItem(storedUserKey);
};

const notifyAuthExpired = () => {
  persistStoredUser(null);
  window.dispatchEvent(new CustomEvent(authExpiredEventName));
};

export const onAuthExpired = (callback: () => void) => {
  const listener = () => callback();
  window.addEventListener(authExpiredEventName, listener);
  return () => window.removeEventListener(authExpiredEventName, listener);
};

const buildAuthHeaders = () => {
  const storedUser = getStoredUser();
  return storedUser?.authToken ? { Authorization: `Bearer ${storedUser.authToken}` } : {};
};

const apiRequest = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...buildAuthHeaders(),
      ...(init?.headers || {}),
    },
    ...init,
  });

  if (!response.ok) {
    if (response.status === 401) {
      notifyAuthExpired();
    }

    const message = await response.text();
    try {
      const parsed = JSON.parse(message) as { message?: string };
      throw new Error(parsed.message || 'API request failed');
    } catch {
      throw new Error(message || 'API request failed');
    }
  }

  return response.json() as Promise<T>;
};

export const api = {
  login: (email: string, password: string, turnstileToken?: string) => apiRequest<StoredUser>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: normalizeEmail(email), password, turnstileToken }),
  }),
  logout: () => apiRequest<{ ok: true }>('/api/auth/logout', {
    method: 'POST',
  }),
  register: (payload: RegisterPayload) => apiRequest<RegisterResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  forgotPassword: (email: string) => apiRequest<ForgotPasswordResponse>('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }),
  resetPassword: (token: string, password: string) => apiRequest<ResetPasswordResponse>('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  }),
  submitVehicleRequest: (payload: VehicleRequestPayload) => apiRequest<VehicleRequestResponse>('/api/vehicle-requests', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  updateVehicleRequest: (requestId: string, payload: UpdateVehicleRequestPayload) => apiRequest<{
    id: string;
    status: string;
    responseMessage?: string | null;
    respondedAt?: string | null;
    respondedByUserId?: string | null;
  }>(`/api/vehicle-requests/${requestId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  }),
  getCustomers: () => apiRequest<CustomerSummary[]>('/api/customers'),
  searchRegisteredCustomers: (query = '') => apiRequest<RegisteredCustomerCandidate[]>(`/api/customers/registered-users?query=${encodeURIComponent(query)}`),
  createCustomer: (payload: CreateCustomerPayload) => apiRequest<CustomerSummary>('/api/customers', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  getPrivateSettings: () => apiRequest<PrivateAppSettings>('/api/settings'),
  updatePrivateSettings: (payload: PrivateAppSettings) => apiRequest<PrivateAppSettings>('/api/settings', {
    method: 'PUT',
    body: JSON.stringify(payload),
  }),
  getOwnerVehicles: () => apiRequest<OwnerInventoryVehicle[]>('/api/owner/vehicles'),
  createOwnerVehicle: (payload: CreateOwnerVehiclePayload) => apiRequest<OwnerInventoryVehicle>('/api/owner/vehicles', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  uploadVehicleImage: async (file: File) => {
    const response = await fetch(`${API_BASE_URL}/api/uploads/vehicle-image`, {
      method: 'POST',
      headers: {
        ...buildAuthHeaders(),
        'Content-Type': file.type || 'application/octet-stream',
        'x-file-name': encodeURIComponent(file.name),
      },
      body: file,
    });

    if (!response.ok) {
      if (response.status === 401) {
        notifyAuthExpired();
      }

      const message = await response.text();
      try {
        const parsed = JSON.parse(message) as { message?: string };
        throw new Error(parsed.message || 'Upload image failed');
      } catch {
        throw new Error(message || 'Upload image failed');
      }
    }

    return response.json() as Promise<UploadVehicleImageResponse>;
  },
  uploadPrivateSettingImage: async (file: File, scope: PrivateSettingMediaScope) => {
    const response = await fetch(`${API_BASE_URL}/api/uploads/media`, {
      method: 'POST',
      headers: {
        ...buildAuthHeaders(),
        'Content-Type': file.type || 'application/octet-stream',
        'x-file-name': encodeURIComponent(file.name),
        'x-upload-scope': scope,
      },
      body: file,
    });

    if (!response.ok) {
      if (response.status === 401) {
        notifyAuthExpired();
      }

      const message = await response.text();
      try {
        const parsed = JSON.parse(message) as { message?: string };
        throw new Error(parsed.message || 'Upload image failed');
      } catch {
        throw new Error(message || 'Upload image failed');
      }
    }

    return response.json() as Promise<UploadVehicleImageResponse>;
  },
  deleteOwnerVehicle: (vehicleId: string) => apiRequest<{ ok: true }>(`/api/owner/vehicles/${vehicleId}`, {
    method: 'DELETE',
  }),
  getContracts: () => apiRequest<ManagedContractRecord[]>('/api/contracts'),
  createContract: (payload: CreateContractPayload) => apiRequest<ManagedContractRecord>('/api/contracts', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  updateContract: (contractId: string, payload: UpdateContractPayload) => apiRequest<{
    id: string;
    status: ManagedContractRecord['status'];
    responseMessage?: string | null;
    respondedAt?: string | null;
    respondedByUserId?: string | null;
  }>(`/api/contracts/${contractId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  }),
  getNotifications: () => apiRequest<OwnerNotificationSummary[]>('/api/notifications'),
  markNotificationRead: (notificationId: string) => apiRequest<{ id: string; isRead: boolean; readAt?: string | null }>(`/api/notifications/${notificationId}/read`, {
    method: 'PATCH',
  }),
  getPushPublicKey: () => apiRequest<PushPublicKeyResponse>('/api/push/public-key'),
  savePushSubscription: (payload: PushSubscriptionPayload) => apiRequest<{ ok: true; id: string | null; endpoint: string }>('/api/push/subscriptions', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  deletePushSubscription: (endpoint: string) => apiRequest<{ ok: true; removed: boolean }>('/api/push/subscriptions', {
    method: 'DELETE',
    body: JSON.stringify({ endpoint }),
  }),
  getDashboardOverview: () => apiRequest<{
    stats: FleetStats & { availableVehicles: number; totalParkings: number };
    revenueData: RevenueData[];
  }>('/api/dashboard/overview'),
  getMarketplaceVehicles: async () => {
    try {
      const vehicles = await apiRequest<MarketplacePublicVehicle[]>('/api/marketplace/vehicles');
      return mergeMarketplaceVehicles(vehicles);
    } catch {
      return legacyMarketplaceVehicles.map(normalizeLegacyVehicle);
    }
  },
  getMarketplaceVehicleById: async (vehicleId: string) => {
    try {
      const payload = await apiRequest<MarketplaceVehicleDetailResponse>(`/api/marketplace/vehicles/${vehicleId}`);
      const legacyVehicle = findMarketplaceVehicleById(payload.vehicle.id);
      const normalizedLegacyVehicle = legacyVehicle ? normalizeLegacyVehicle(legacyVehicle) : null;

      return {
        vehicle: normalizedLegacyVehicle ? mergeVehicleWithLegacyImages(payload.vehicle, normalizedLegacyVehicle) : payload.vehicle,
        reviews: mergeMarketplaceReviews(payload.reviews, undefined, payload.vehicle.id),
        relatedVehicles: mergeMarketplaceVehicles(payload.relatedVehicles),
      };
    } catch {
      return buildLegacyVehicleDetailResponse(vehicleId);
    }
  },
  submitVehicleReview: (payload: SubmitVehicleReviewPayload) => apiRequest<SubmitVehicleReviewResponse>(`/api/marketplace/vehicles/${payload.vehicleId}/reviews`, {
    method: 'POST',
    body: JSON.stringify({ rating: payload.rating, comment: payload.comment }),
  }),
  getMarketplaceOwnerById: async (ownerId: string) => {
    try {
      const payload = await apiRequest<MarketplaceOwnerDetailResponse>(`/api/marketplace/owners/${ownerId}`);
      const legacyOwner = findMarketplaceOwnerById(ownerId);
      return {
        ownerProfile: payload.ownerProfile,
        vehicles: mergeMarketplaceVehicles(payload.vehicles).filter((vehicle) => vehicle.ownerId === payload.ownerProfile.id),
        reviews: mergeMarketplaceReviews(payload.reviews, payload.ownerProfile.id || legacyOwner?.id),
      };
    } catch {
      return buildLegacyOwnerDetailResponse(ownerId);
    }
  },
  getStorefrontBySlug: async (slug: string) => {
    try {
      const payload = await apiRequest<MarketplaceStorefrontResponse>(`/api/storefront/${slug}`);
      return {
        ownerProfile: payload.ownerProfile,
        vehicles: mergeMarketplaceVehicles(payload.vehicles).filter((vehicle) => vehicle.ownerId === payload.ownerProfile.id),
      };
    } catch {
      return buildLegacyStorefrontResponse(slug);
    }
  },
  getOwnerDashboard: () => apiRequest<OwnerDashboardResponse>('/api/dashboard/owner'),
  updateParkingLocation: (parkingId: string, payload: ParkingLocationPayload) => apiRequest<OwnerParkingSummary>(`/api/owner/parkings/${parkingId}/location`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }),
  chatWithAssistant: (messages: AIChatMessage[]) => apiRequest<AIChatResponse>('/api/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ messages }),
  }),
};