import { BookingStatus, FleetStats, RevenueData, UserRole } from '../types';

const localHostnames = new Set(['localhost', '127.0.0.1']);
const defaultApiBaseUrl = localHostnames.has(window.location.hostname)
  ? 'http://localhost:8787'
  : `${window.location.protocol}//${window.location.hostname}:8787`;
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)
  || defaultApiBaseUrl;

type StoredUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type RegisterPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  profileData: {
    phone?: string;
    city?: string;
    country?: string;
    companyName?: string;
    department?: string;
    parkingName?: string;
    parkingCapacity?: number | null;
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

const getStoredUser = (): StoredUser | null => {
  const raw = localStorage.getItem('fleet_user');
  return raw ? JSON.parse(raw) : null;
};

const apiRequest = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const storedUser = getStoredUser();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(storedUser ? { 'x-user-id': storedUser.id, 'x-user-role': storedUser.role } : {}),
      ...(init?.headers || {}),
    },
    ...init,
  });

  if (!response.ok) {
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
  login: (email: string, password: string) => apiRequest<StoredUser>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
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
  getDashboardOverview: () => apiRequest<{
    stats: FleetStats & { availableVehicles: number; totalParkings: number };
    revenueData: RevenueData[];
  }>('/api/dashboard/overview'),
  getOwnerDashboard: () => apiRequest<{
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
    vehicles: Array<{
      id: string;
      title: string;
      city: string;
      pricePerDay: number;
      rating: number;
      reviewCount: number;
      viewCount: number;
      isAvailable: boolean;
      occupiedUntil: string | null;
      parkingName: string | null;
      imageUrl: string | null;
    }>;
    recentBookings: Array<{
      id: string;
      vehicle_id: string;
      user_id: string;
      start_date: string;
      end_date: string;
      total_price: number;
      status: BookingStatus | string;
      message?: string;
      vehicle_title: string;
      renter_name: string;
    }>;
    parkings: Array<{
      id: string;
      name: string;
      city: string;
      address: string;
      access_type?: string;
      opening_hours?: string;
      security_features?: string[];
      capacity_total: number;
      vehicle_count: number;
      available_spots: number;
    }>;
  }>('/api/dashboard/owner'),
};