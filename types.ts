// ============================================================
// LEGACY FLEET MANAGEMENT TYPES (backward compatible)
// ============================================================

export enum VehicleStatus {
  Active = 'Actif',
  Maintenance = 'En Maintenance',
  Rented = 'Loué',
  OutOfService = 'Hors Service'
}

export enum FuelType {
  Petrol = 'Essence',
  Diesel = 'Diesel',
  Electric = 'Électrique',
  Hybrid = 'Hybride'
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  status: VehicleStatus;
  fuelType: FuelType;
  mileage: number;
  lastMaintenanceDate: string;
  maintenanceIntervalKm: number;
  nextServiceDate: string;
  imageUrl: string;
}

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  description: string;
  date: string;
  cost: number;
  status: 'En Attente' | 'En Cours' | 'Terminé';
}

export interface RevenueData {
  month: string;
  revenue: number;
  expenses: number;
}

export interface FleetStats {
  totalVehicles: number;
  activeRentals: number;
  inMaintenance: number;
  totalRevenue: number;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  status: 'Actif' | 'Bloqué';
}

export interface Contract {
  id: string;
  customerId: string;
  vehicleId: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  status: 'Paiement En Attente' | 'Actif' | 'Terminé' | 'Annulé';
  paymentMethod?: 'Carte Bancaire' | 'Virement' | 'Espèces';
}

// ============================================================
// MARKETPLACE PLATFORM TYPES
// ============================================================

export enum UserRole {
  USER = 'USER',
  PARTICULIER = 'PARTICULIER',
  PARC_AUTO = 'PARC_AUTO',
  ADMIN = 'ADMIN'
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELED = 'canceled',
  COMPLETED = 'completed'
}

export enum VehicleCategory {
  SUV = 'SUV',
  BERLINE = 'Berline',
  LUXE = 'Luxe',
  ECONOMIQUE = 'Économique',
  UTILITAIRE = 'Utilitaire',
  PICKUP = 'Pick-up',
  CABRIOLET = 'Cabriolet',
  MONOSPACE = 'Monospace'
}

export interface OwnerProfile {
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
  logo?: string;
  whatsapp?: string;
  responseTime: string;
  memberSince: string;
}

export interface VehicleImage {
  id: string;
  url: string;
  alt: string;
}

export interface MarketplaceVehicle {
  id: string;
  ownerId: string;
  ownerProfile: OwnerProfile;
  title: string;
  brand: string;
  model: string;
  year: number;
  category: VehicleCategory;
  fuelType: FuelType;
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
  images: VehicleImage[];
  rating: number;
  reviewCount: number;
  viewCount: number;
  isFeatured: boolean;
  isAvailable: boolean;
  createdAt: string;
  mileage: number;
  color: string;
  conditions?: string;
}

export interface MarketplaceBooking {
  id: string;
  vehicleId: string;
  userId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: BookingStatus;
  message?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userInitials: string;
  vehicleId: string;
  ownerId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface SearchFilters {
  city: string;
  category: VehicleCategory | '';
  minPrice: number;
  maxPrice: number;
  fuelType: FuelType | '';
  isForRent: boolean;
  isForSale: boolean;
  transmission: 'Manuelle' | 'Automatique' | '';
}

export interface Parking {
  id: string;
  name: string;
  city: string;
  address: string;
  accessType?: string;
  openingHours?: string;
  securityFeatures?: string[];
  capacityTotal: number;
  vehicleCount: number;
  availableSpots: number;
}