import {
  Vehicle, VehicleStatus, FuelType, MaintenanceRecord, RevenueData, FleetStats, Customer, Contract,
  OwnerProfile, MarketplaceVehicle, VehicleCategory, Review, MarketplaceBooking, BookingStatus
} from '../types';
import {
  LEGACY_OWNER_ID_ALIASES,
  LEGACY_USER_ID_ALIASES,
  LEGACY_VEHICLE_ID_ALIASES,
} from '../shared/marketplaceIds.js';

const ownerIdAliases = LEGACY_OWNER_ID_ALIASES as Record<string, string>;
const userIdAliases = LEGACY_USER_ID_ALIASES as Record<string, string>;
const vehicleIdAliases = LEGACY_VEHICLE_ID_ALIASES as Record<string, string>;

const TOYOTA_LAND_CRUISER_GX_2022_SRC = new URL('../Toyota Land Cruiser GX 2022.jpeg', import.meta.url).href;
const TOYOTA_LAND_CRUISER_GX_2022_ALT_SRC = new URL('../Toyota Land Cruiser GX 2022 2.webp', import.meta.url).href;
const MERCEDES_BENZ_C_300_AMG_LINE_SRC = new URL('../Mercedes-Benz C 300 AMG Line .jpeg', import.meta.url).href;
const MERCEDES_BENZ_C_300_AMG_LINE_ALT_SRC = new URL('../Mercedes-Benz C 300 AMG Line  22.jpeg', import.meta.url).href;
const RANGE_ROVER_SPORT_SE_2023_SRC = new URL('../Range Rover Sport SE 2023 .jpeg', import.meta.url).href;
const RANGE_ROVER_SPORT_SE_2023_ALT_SRC = new URL('../WhatsApp Image 2023-08-16 at 13.49.13 (2).jpeg', import.meta.url).href;
const RENAULT_DUSTER_PRESTIGE_4X4_SRC = new URL('../Renauld duster Prestige.webp', import.meta.url).href;
const RENAULT_DUSTER_PRESTIGE_4X4_ALT_SRC = new URL('../Renauld duster Prestige2.webp', import.meta.url).href;
const RENAULT_DUSTER_PRESTIGE_4X4_ALT_JPEG_SRC = new URL('../Renauld duster Prestige 2.jpeg', import.meta.url).href;
const RENAULT_DUSTER_PRESTIGE_4X4_ALT_JPEG_2_SRC = new URL('../Renauld duster Prestige2.jpeg', import.meta.url).href;
const VOLKSWAGEN_POLO_CONFORTLINE_SRC = new URL('../Volkswagen Polo Confortline.jpeg', import.meta.url).href;
const VOLKSWAGEN_POLO_CONFORTLINE_ALT_SRC = new URL('../wolvageng.png', import.meta.url).href;
const TOYOTA_PRADO_TXL_2021_ALT_SRC = new URL('../Toyota Prado TXL 2021.webp', import.meta.url).href;
const TOYOTA_PRADO_TXL_2021_SRC = new URL('../Toyota Prado TXL 2021 22.jpeg', import.meta.url).href;
const TOYOTA_HILUX_DOUBLE_CAB_4X4_SRC = new URL('../Toyotohiluxdoublecab.jpeg', import.meta.url).href;
const TOYOTA_HILUX_DOUBLE_CAB_4X4_ALT_SRC = new URL('../Toyotahilydouble2.jpeg', import.meta.url).href;
const MERCEDES_BENZ_VITO_TOURER_9_PLACES_SRC = new URL('../Mercedes-Benz Vito Tourer 9 places.jpeg', import.meta.url).href;
const MERCEDES_BENZ_VITO_TOURER_9_PLACES_ALT_SRC = new URL('../Mercedes-Benz Vito Tourer 9 places 2.avif', import.meta.url).href;
const PORSCHE_CAYENNE_2022_SRC = new URL('../Porsche Cayenne 2022 .jpeg', import.meta.url).href;
const PORSCHE_CAYENNE_2022_ALT_SRC = new URL('../Porsche Cayenne 2022 22.jpeg', import.meta.url).href;

// ============================================================
// MARKETPLACE DATA
// ============================================================

const ownerProfilesSource: OwnerProfile[] = [
  {
    id: 'op1', userId: 'u10', type: 'PARC_AUTO',
    displayName: 'AutoLoc Dakar',
    description: 'Agence de location premium à Dakar depuis 2015. Flotte de 18 véhicules entretenus et assurés. Service 7j/7.',
    address: 'Avenue Bourguiba, Plateau', city: 'Dakar', country: 'Sénégal',
    rating: 4.8, reviewCount: 127, vehicleCount: 8, verified: true,
    whatsapp: '+221771234567', responseTime: 'Répond en moins d\'1h', memberSince: '2021-03-10',
  },
  {
    id: 'op2', userId: 'u11', type: 'PARTICULIER',
    displayName: 'Yacouba Traoré',
    description: 'Particulier sérieux basé à Abidjan. Je mets mon véhicule en location quand je voyage. Entretien régulier garanti.',
    address: 'Cocody Riviera 3', city: 'Abidjan', country: 'Côte d\'Ivoire',
    rating: 4.5, reviewCount: 23, vehicleCount: 2, verified: true,
    whatsapp: '+2250789123456', responseTime: 'Répond en moins de 3h', memberSince: '2022-07-15',
  },
  {
    id: 'op3', userId: 'u12', type: 'PARC_AUTO',
    displayName: 'Premium Cars CI',
    description: 'Leader de la location de véhicules haut de gamme en Côte d\'Ivoire. Chauffeur disponible sur demande. Flotte de 25 véhicules.',
    address: 'Zone industrielle de Marcory', city: 'Abidjan', country: 'Côte d\'Ivoire',
    rating: 4.9, reviewCount: 314, vehicleCount: 12, verified: true,
    whatsapp: '+2250798765432', responseTime: 'Répond en moins de 30 min', memberSince: '2020-01-05',
  },
  {
    id: 'op4', userId: 'u13', type: 'PARTICULIER',
    displayName: 'Moussa Koné',
    description: 'Propriétaire d\'un Hilux en parfait état. Idéal pour les déplacements inter-villes et zones difficiles d\'accès.',
    address: 'Quartier du Fleuve', city: 'Bamako', country: 'Mali',
    rating: 4.3, reviewCount: 11, vehicleCount: 1, verified: false,
    whatsapp: '+22366112233', responseTime: 'Répond en moins de 6h', memberSince: '2023-04-20',
  },
  {
    id: 'op5', userId: 'u14', type: 'PARC_AUTO',
    displayName: 'Kinscar Fleet',
    description: 'Spécialiste des véhicules de luxe et des transferts VIP à Dakar. Chauffeur bilingue disponible. Partenaire hôtels 5 étoiles.',
    address: 'Les Almadies', city: 'Dakar', country: 'Sénégal',
    rating: 4.7, reviewCount: 89, vehicleCount: 6, verified: true,
    whatsapp: '+221764567890', responseTime: 'Répond en moins d\'1h', memberSince: '2021-09-01',
  },
];

export const ownerProfiles: OwnerProfile[] = ownerProfilesSource.map((profile) => ({
  ...profile,
  id: ownerIdAliases[profile.id] || profile.id,
  userId: userIdAliases[profile.userId] || profile.userId,
}));

const ownerProfilesByLegacyId = ownerProfilesSource.reduce<Record<string, OwnerProfile>>((accumulator, profile, index) => {
  accumulator[profile.id] = ownerProfiles[index];
  return accumulator;
}, {});

// Real Unsplash car photos indexed by vehicle seed
const UNSPLASH_CAR_IDS: Record<string, [string, string, string]> = {
  'land-cruiser':    ['photo-1533591380348-14193f1de18f', 'photo-1519641471654-76ce0107ad1b', 'photo-1476357471311-43c0db9fb2b4'],
  'mercedes-c300':  ['photo-1618843479313-40f8afb4b4d8', 'photo-1605559424843-9073c6e332a0', 'photo-1494976388531-d1058494cdd8'],
  'range-rover-sport': ['photo-1549399542-7e3f8b79c341', 'photo-1533591380348-14193f1de18f', 'photo-1519641471654-76ce0107ad1b'],
  'vw-polo':         ['photo-1471289549423-04a21b3a0c5f', 'photo-1580273916550-e323be2ae537', 'photo-1559416523-140ddc3d238c'],
  'hilux-4x4':       ['photo-1558618666-fcd25c85cd64', 'photo-1605893477799-b99e3b8b93fe', 'photo-1533073526757-2c8ca1df9f1c'],
  'bmw-7series':     ['photo-1555215695-3004980ad54e', 'photo-1494976388531-d1058494cdd8', 'photo-1605559424843-9073c6e332a0'],
  'corolla-hybrid':  ['photo-1559416523-140ddc3d238c', 'photo-1580273916550-e323be2ae537', 'photo-1471289549423-04a21b3a0c5f'],
  'renault-duster':  ['photo-1531297484001-80022131f5a1', 'photo-1519641471654-76ce0107ad1b', 'photo-1476357471311-43c0db9fb2b4'],
  'vito-tourer':     ['photo-1474515439-f4b7e28f6c21', 'photo-1537996194471-e657df975ab4', 'photo-1548616282-0c5cf4e1d2f9'],
  'prado-txl':       ['photo-1533591380348-14193f1de18f', 'photo-1549399542-7e3f8b79c341', 'photo-1519641471654-76ce0107ad1b'],
  'honda-accord':    ['photo-1568844293986-8d0400bd4745', 'photo-1559416523-140ddc3d238c', 'photo-1580273916550-e323be2ae537'],
  'porsche-cayenne': ['photo-1544636331-e26879cd4d9b', 'photo-1503376780353-7e6692767b70', 'photo-1552519507-da3b142c6e3d'],
};

const LOCAL_MARKETPLACE_VEHICLE_IMAGES: Record<string, string[]> = {
  'Toyota Land Cruiser GX 2022': [TOYOTA_LAND_CRUISER_GX_2022_SRC, TOYOTA_LAND_CRUISER_GX_2022_ALT_SRC],
  'Mercedes-Benz C 300 AMG Line': [MERCEDES_BENZ_C_300_AMG_LINE_SRC, MERCEDES_BENZ_C_300_AMG_LINE_ALT_SRC],
  'Range Rover Sport SE 2023': [RANGE_ROVER_SPORT_SE_2023_SRC, RANGE_ROVER_SPORT_SE_2023_ALT_SRC],
  'Volkswagen Polo Confortline': [VOLKSWAGEN_POLO_CONFORTLINE_SRC, VOLKSWAGEN_POLO_CONFORTLINE_ALT_SRC],
  'Renault Duster Prestige 4x4': [
    RENAULT_DUSTER_PRESTIGE_4X4_SRC,
    RENAULT_DUSTER_PRESTIGE_4X4_ALT_SRC,
    RENAULT_DUSTER_PRESTIGE_4X4_ALT_JPEG_SRC,
    RENAULT_DUSTER_PRESTIGE_4X4_ALT_JPEG_2_SRC,
  ],
  'Toyota Hilux Double Cab 4x4': [TOYOTA_HILUX_DOUBLE_CAB_4X4_SRC, TOYOTA_HILUX_DOUBLE_CAB_4X4_ALT_SRC],
  'Mercedes-Benz Vito Tourer 9 places': [MERCEDES_BENZ_VITO_TOURER_9_PLACES_SRC, MERCEDES_BENZ_VITO_TOURER_9_PLACES_ALT_SRC],
  'Toyota Prado TXL 2021': [TOYOTA_PRADO_TXL_2021_SRC, TOYOTA_PRADO_TXL_2021_ALT_SRC],
  'Porsche Cayenne 2022': [PORSCHE_CAYENNE_2022_SRC, PORSCHE_CAYENNE_2022_ALT_SRC],
};

const makeImages = (seed: string, title = '', count = 3) => {
  const ids = UNSPLASH_CAR_IDS[seed] || [];
  const localUrls = LOCAL_MARKETPLACE_VEHICLE_IMAGES[title] || [];
  const resolvedUrls = localUrls.length > 0
    ? localUrls.slice(0, count)
    : ids.map((id) => `https://images.unsplash.com/${id}?w=900&q=80&auto=format&fit=crop`).slice(0, count);

  return resolvedUrls.map((url, i) => ({
    id: `${seed}-img${i + 1}`,
    url,
    alt: title ? `${title} - Photo ${i + 1}` : `Photo ${i + 1}`,
  }));
};

const marketplaceVehiclesSource: MarketplaceVehicle[] = [
  {
    id: 'mv1', ownerId: 'op1', ownerProfile: ownerProfiles[0],
    title: 'Toyota Land Cruiser GX 2022',
    brand: 'Toyota', model: 'Land Cruiser GX', year: 2022,
    category: VehicleCategory.SUV, fuelType: FuelType.Diesel,
    transmission: 'Automatique', seats: 7,
    pricePerDay: 45000, isForRent: true, isForSale: false,
    description: 'Le Land Cruiser GX est le 4x4 de référence pour les routes africaines. Climatisation puissante, système audio premium, intérieur cuir. Idéal pour groupes ou familles.',
    features: ['Climatisation', 'Cuir', 'GPS', 'Caméra de recul', '4x4 intégral', 'Android Auto', 'Bluetooth'],
    location: 'Plateau, Dakar', city: 'Dakar',
    images: makeImages('land-cruiser', 'Toyota Land Cruiser GX 2022'),
    rating: 4.9, reviewCount: 38, viewCount: 412, isFeatured: true, isAvailable: true,
    createdAt: '2024-01-15', mileage: 28000, color: 'Blanc Perle',
    conditions: 'Caution 200 000 FCFA. Carburant non inclus. Kilométrage illimité.',
  },
  {
    id: 'mv2', ownerId: 'op3', ownerProfile: ownerProfiles[2],
    title: 'Mercedes-Benz C 300 AMG Line',
    brand: 'Mercedes-Benz', model: 'C 300 AMG Line', year: 2021,
    category: VehicleCategory.BERLINE, fuelType: FuelType.Petrol,
    transmission: 'Automatique', seats: 5,
    pricePerDay: 55000, isForRent: true, isForSale: false,
    description: 'Berline élégante avec finition AMG Line. Siège chauffant, écran 12", son Burmester. Parfaite pour les déplacements professionnels et événements.',
    features: ['Siège chauffant', 'Son Burmester', 'Toit ouvrant', 'Aide au stationnement', 'Cruise control', 'USB-C'],
    location: 'Marcory, Abidjan', city: 'Abidjan',
    images: makeImages('mercedes-c300', 'Mercedes-Benz C 300 AMG Line'),
    rating: 4.8, reviewCount: 51, viewCount: 389, isFeatured: true, isAvailable: true,
    createdAt: '2024-02-01', mileage: 19500, color: 'Gris Selenite',
    conditions: 'Caution 300 000 FCFA. Assurance incluse. Chauffeur disponible +25 000/j.',
  },
  {
    id: 'mv3', ownerId: 'op5', ownerProfile: ownerProfiles[4],
    title: 'Range Rover Sport SE 2023',
    brand: 'Land Rover', model: 'Range Rover Sport SE', year: 2023,
    category: VehicleCategory.LUXE, fuelType: FuelType.Diesel,
    transmission: 'Automatique', seats: 5,
    pricePerDay: 95000, priceSale: 52000000, isForRent: true, isForSale: true,
    description: 'Le summum du luxe tout-terrain. Intérieur Windsor cuir, écran Pivi Pro 11.4", système audio Meridian 23 haut-parleurs. Expérience de conduite inégalée.',
    features: ['Cuir Windsor', 'Meridian 23hp', 'Pivi Pro 11.4"', 'Sièges massants', 'Head-up display', 'Air suspension', 'Night vision'],
    location: 'Les Almadies, Dakar', city: 'Dakar',
    images: makeImages('range-rover-sport', 'Range Rover Sport SE 2023'),
    rating: 5.0, reviewCount: 14, viewCount: 521, isFeatured: true, isAvailable: true,
    createdAt: '2024-03-01', mileage: 8000, color: 'Noir Santorini',
    conditions: 'Caution 500 000 FCFA. Assurance tous risques incluse.',
  },
  {
    id: 'mv4', ownerId: 'op2', ownerProfile: ownerProfiles[1],
    title: 'Volkswagen Polo Confortline',
    brand: 'Volkswagen', model: 'Polo Confortline', year: 2020,
    category: VehicleCategory.ECONOMIQUE, fuelType: FuelType.Petrol,
    transmission: 'Manuelle', seats: 5,
    pricePerDay: 15000, isForRent: true, isForSale: false,
    description: 'Citadine économique et fiable. Parfaite pour se déplacer en ville. Entretien à jour, CT valide. Faible consommation.',
    features: ['Clim auto', 'Bluetooth', 'Régulateur de vitesse', 'Rétroviseurs électriques'],
    location: 'Cocody Riviera 3, Abidjan', city: 'Abidjan',
    images: makeImages('vw-polo', 'Volkswagen Polo Confortline'),
    rating: 4.4, reviewCount: 19, viewCount: 203, isFeatured: false, isAvailable: true,
    createdAt: '2024-01-20', mileage: 54000, color: 'Blanc',
    conditions: 'Caution 50 000 FCFA. 150 km/j inclus, 75 FCFA le km supplémentaire.',
  },
  {
    id: 'mv5', ownerId: 'op4', ownerProfile: ownerProfiles[3],
    title: 'Toyota Hilux Double Cab 4x4',
    brand: 'Toyota', model: 'Hilux Double Cab', year: 2022,
    category: VehicleCategory.PICKUP, fuelType: FuelType.Diesel,
    transmission: 'Manuelle', seats: 5,
    pricePerDay: 35000, isForRent: true, isForSale: false,
    description: 'Pickup robuste idéal pour les grands espaces et pistes non revêtues. Capacité de charge 1 tonne. Parfait pour missions et explorations.',
    features: ['4x4 permanent', 'Diff lock', 'Cruise control', 'Air bag', 'Bluetooth'],
    location: 'Quartier du Fleuve, Bamako', city: 'Bamako',
    images: makeImages('hilux-4x4', 'Toyota Hilux Double Cab 4x4'),
    rating: 4.2, reviewCount: 9, viewCount: 178, isFeatured: false, isAvailable: true,
    createdAt: '2024-02-10', mileage: 41000, color: 'Argent',
    conditions: 'Caution 150 000 FCFA. Kilométrage illimité. ONG et missions acceptées.',
  },
  {
    id: 'mv6', ownerId: 'op5', ownerProfile: ownerProfiles[4],
    title: 'BMW Série 7 730 Li Executive',
    brand: 'BMW', model: 'Série 7 730 Li', year: 2022,
    category: VehicleCategory.LUXE, fuelType: FuelType.Hybrid,
    transmission: 'Automatique', seats: 5,
    pricePerDay: 110000, isForRent: true, isForSale: false,
    description: 'Limousine d\'exception pour vos déplacements VIP. Empattement long, sièges arrière avec tablettes, système sky-lounge, diffuseur d\'arômes.',
    features: ['Sky Lounge panoramique', 'Siège relaxation arrière', 'Tablettes', 'Bowers & Wilkins Diamond', 'Massage 4 zones', 'Wi-Fi 4G'],
    location: 'Les Almadies, Dakar', city: 'Dakar',
    images: makeImages('bmw-7series', 'BMW Série 7 730 Li Executive'),
    rating: 4.7, reviewCount: 22, viewCount: 634, isFeatured: true, isAvailable: true,
    createdAt: '2024-01-05', mileage: 12000, color: 'Noir Saphir',
    conditions: 'Chauffeur inclus obligatoire. Caution 500 000 FCFA. Réservation 24h min.',
  },
  {
    id: 'mv7', ownerId: 'op1', ownerProfile: ownerProfiles[0],
    title: 'Toyota Corolla Hybrid 2021',
    brand: 'Toyota', model: 'Corolla Hybrid', year: 2021,
    category: VehicleCategory.BERLINE, fuelType: FuelType.Hybrid,
    transmission: 'Automatique', seats: 5,
    pricePerDay: 20000, isForRent: true, isForSale: false,
    description: 'Berline hybride économique et confortable. Idéale pour les déplacements quotidiens. Faible consommation, grande fiabilité Toyota.',
    features: ['Hybride', 'Clim auto', 'Caméra recul', 'Android Auto', 'Apple CarPlay', 'Lane assist'],
    location: 'Plateau, Dakar', city: 'Dakar',
    images: makeImages('corolla-hybrid', 'Toyota Corolla Hybrid 2021'),
    rating: 4.6, reviewCount: 33, viewCount: 245, isFeatured: false, isAvailable: false,
    createdAt: '2024-02-20', mileage: 32000, color: 'Bleu Métallisé',
    conditions: 'Caution 75 000 FCFA. Kilométrage illimité. Non disponible 15-22 Juin.',
  },
  {
    id: 'mv8', ownerId: 'op3', ownerProfile: ownerProfiles[2],
    title: 'Renault Duster Prestige 4x4',
    brand: 'Renault', model: 'Duster Prestige', year: 2021,
    category: VehicleCategory.SUV, fuelType: FuelType.Diesel,
    transmission: 'Manuelle', seats: 5,
    pricePerDay: 25000, isForRent: true, isForSale: false,
    description: 'SUV polyvalent au meilleur rapport qualité-prix. Passe partout en ville comme en brousse. Idéal couples et petites familles.',
    features: ['4x4', 'Clim auto', 'Bluetooth', 'Barres de toit', 'Jantes alliage'],
    location: 'Marcory, Abidjan', city: 'Abidjan',
    images: makeImages('renault-duster', 'Renault Duster Prestige 4x4'),
    rating: 4.3, reviewCount: 27, viewCount: 192, isFeatured: false, isAvailable: true,
    createdAt: '2024-03-01', mileage: 48000, color: 'Gris Castor',
    conditions: 'Caution 100 000 FCFA. 200 km/j inclus.',
  },
  {
    id: 'mv9', ownerId: 'op3', ownerProfile: ownerProfiles[2],
    title: 'Mercedes-Benz Vito Tourer 9 places',
    brand: 'Mercedes-Benz', model: 'Vito Tourer', year: 2020,
    category: VehicleCategory.UTILITAIRE, fuelType: FuelType.Diesel,
    transmission: 'Automatique', seats: 9,
    pricePerDay: 45000, isForRent: true, isForSale: false,
    description: 'Véhicule de groupe 9 places idéal pour transferts aéroport, séminaires, mariages. Confort premium, climatisation indépendante arrière.',
    features: ['9 places', 'Clim indépendante', 'Bluetooth', 'Vitres teintées', 'Espaces bagages'],
    location: 'Marcory, Abidjan', city: 'Abidjan',
    images: makeImages('vito-tourer', 'Mercedes-Benz Vito Tourer 9 places'),
    rating: 4.5, reviewCount: 41, viewCount: 267, isFeatured: false, isAvailable: true,
    createdAt: '2024-01-10', mileage: 67000, color: 'Noir',
    conditions: 'Caution 200 000 FCFA. Chauffeur disponible +30 000/j. Devis groupes.',
  },
  {
    id: 'mv10', ownerId: 'op1', ownerProfile: ownerProfiles[0],
    title: 'Toyota Prado TXL 2021',
    brand: 'Toyota', model: 'Prado TXL', year: 2021,
    category: VehicleCategory.SUV, fuelType: FuelType.Diesel,
    transmission: 'Automatique', seats: 7,
    pricePerDay: 50000, priceSale: 28500000, isForRent: true, isForSale: true,
    description: 'SUV très recherché, robuste et élégant. 7 places, suspension renforcée. Parfait pour familles et excursions. Aussi disponible à la vente.',
    features: ['7 places', '4x4 intégral', 'Toit ouvrant', 'GPS', 'Cuir', 'Caméra 360°', 'Cruise control'],
    location: 'Plateau, Dakar', city: 'Dakar',
    images: makeImages('prado-txl', 'Toyota Prado TXL 2021'),
    rating: 4.8, reviewCount: 56, viewCount: 498, isFeatured: true, isAvailable: true,
    createdAt: '2023-12-01', mileage: 35000, color: 'Blanc Nacré',
    conditions: 'Caution 250 000 FCFA. Vente possible avec historique complet.',
  },
  {
    id: 'mv11', ownerId: 'op2', ownerProfile: ownerProfiles[1],
    title: 'Honda Accord Sport 2020',
    brand: 'Honda', model: 'Accord Sport', year: 2020,
    category: VehicleCategory.BERLINE, fuelType: FuelType.Petrol,
    transmission: 'Automatique', seats: 5,
    pricePerDay: 22000, isForRent: true, isForSale: true,
    priceSale: 10500000,
    description: 'Berline sportive et confortable. Entretien Honda constructeur garanti. Très faible consommation. Idéale pour trajets villes et routes nationales.',
    features: ['Lane watch', 'Freinage d\'urgence', 'Bluetooth', 'Android Auto', 'Clim auto bi-zone'],
    location: 'Cocody Riviera 3, Abidjan', city: 'Abidjan',
    images: makeImages('honda-accord', 'Honda Accord Sport 2020'),
    rating: 4.5, reviewCount: 16, viewCount: 156, isFeatured: false, isAvailable: true,
    createdAt: '2024-03-05', mileage: 44000, color: 'Rouge Rallye',
    conditions: 'Caution 80 000 FCFA. Vente possible, CT valide jusqu\'à 2025.',
  },
  {
    id: 'mv12', ownerId: 'op5', ownerProfile: ownerProfiles[4],
    title: 'Porsche Cayenne 2022',
    brand: 'Porsche', model: 'Cayenne S', year: 2022,
    category: VehicleCategory.LUXE, fuelType: FuelType.Petrol,
    transmission: 'Automatique', seats: 5,
    pricePerDay: 130000, isForRent: true, isForSale: false,
    description: 'L\'icône de Porsche en SUV. Puissance 440ch, 0-100 en 5.0s. Intérieur alcantara, son Bose 14 haut-parleurs. Pour une expérience de conduite unique.',
    features: ['440 ch', 'PDCC Sport', 'Panoramique', 'Bose 14hp', 'Sièges sport', 'PSCB', 'Alcantara'],
    location: 'Les Almadies, Dakar', city: 'Dakar',
    images: makeImages('porsche-cayenne', 'Porsche Cayenne 2022'),
    rating: 4.9, reviewCount: 7, viewCount: 743, isFeatured: true, isAvailable: true,
    createdAt: '2024-02-15', mileage: 5000, color: 'Blanc Craie',
    conditions: 'Caution 1 000 000 FCFA. Permis B minimum 3 ans exigé.',
  },
];

export const marketplaceVehicles: MarketplaceVehicle[] = marketplaceVehiclesSource.map((vehicle) => ({
  ...vehicle,
  id: vehicleIdAliases[vehicle.id] || vehicle.id,
  ownerId: ownerIdAliases[vehicle.ownerId] || vehicle.ownerId,
  ownerProfile: ownerProfilesByLegacyId[vehicle.ownerId] || vehicle.ownerProfile,
}));

export const reviews: Review[] = [
  { id: 'r1', userId: 'u20', userName: 'Fatou Diaw', userInitials: 'FD', vehicleId: 'mv1', ownerId: 'op1', rating: 5, comment: 'Véhicule impeccable, propre et bien entretenu. AutoLoc Dakar est très professionnel, je recommande vivement !', createdAt: '2024-03-10' },
  { id: 'r2', userId: 'u21', userName: 'Ibrahim Sow', userInitials: 'IS', vehicleId: 'mv1', ownerId: 'op1', rating: 5, comment: 'Land Cruiser en parfait état. Livraison ponctuelle à l\'hôtel. Service 5 étoiles.', createdAt: '2024-02-25' },
  { id: 'r3', userId: 'u22', userName: 'Aïcha Kouyaté', userInitials: 'AK', vehicleId: 'mv2', ownerId: 'op3', rating: 5, comment: 'Mercedes splendide pour notre événement d\'entreprise. Premium Cars CI est à la hauteur de sa réputation.', createdAt: '2024-03-01' },
  { id: 'r4', userId: 'u23', userName: 'Koffi Assi', userInitials: 'KA', vehicleId: 'mv2', ownerId: 'op3', rating: 4, comment: 'Très belle voiture, chauffeur courtois. Je retire une étoile car la livraison avait 20 min de retard.', createdAt: '2024-02-14' },
  { id: 'r5', userId: 'u24', userName: 'Mariama Ba', userInitials: 'MB', vehicleId: 'mv3', ownerId: 'op5', rating: 5, comment: 'Range Rover absolument magnifique. Kinscar est le meilleur pour le luxe à Dakar. À recommander sans hésiter.', createdAt: '2024-03-05' },
  { id: 'r6', userId: 'u25', userName: 'Seydou Doumbia', userInitials: 'SD', vehicleId: 'mv4', ownerId: 'op2', rating: 4, comment: 'Yacouba est très sympathique et réactif. Polo propre et en bon état. Rapport qualité-prix excellent.', createdAt: '2024-02-20' },
  { id: 'r7', userId: 'u26', userName: 'Rokia Coulibaly', userInitials: 'RC', vehicleId: 'mv5', ownerId: 'op4', rating: 4, comment: 'Hilux idéal pour notre mission en brousse. Moussa a été coopératif malgré quelques soucis de communication.', createdAt: '2024-01-28' },
  { id: 'r8', userId: 'u27', userName: 'Modou Fall', userInitials: 'MF', vehicleId: 'mv6', ownerId: 'op5', rating: 5, comment: 'BMW 7 pour une réunion importante. Chauffeur professionnel et discret. Impression parfaite sur mes clients.', createdAt: '2024-03-12' },
  { id: 'r9', userId: 'u28', userName: 'Aminata Diallo', userInitials: 'AD', vehicleId: 'mv7', ownerId: 'op1', rating: 5, comment: 'Corolla hybride silencieuse et économique. J\'ai fait Dakar-Ziguinchor sans souci aucun.', createdAt: '2024-02-05' },
  { id: 'r10', userId: 'u29', userName: 'Cheikh Mbaye', userInitials: 'CM', vehicleId: 'mv10', ownerId: 'op1', rating: 5, comment: 'Prado TXL pour notre safari. Impeccable sur tous les terrains. AutoLoc reste ma référence à Dakar.', createdAt: '2024-03-08' },
  { id: 'r11', userId: 'u30', userName: 'Bintou Koné', userInitials: 'BK', vehicleId: 'mv8', ownerId: 'op3', rating: 4, comment: 'Duster pratique et fiable. Process de location simple et rapide avec Premium Cars CI.', createdAt: '2024-02-18' },
  { id: 'r12', userId: 'u31', userName: 'Oumar Ndiaye', userInitials: 'ON', vehicleId: 'mv9', ownerId: 'op3', rating: 5, comment: 'Vito parfait pour le transfert mariage de 8 personnes. Très propre, chauffeur en costume. Bravo !', createdAt: '2024-03-02' },
].map((review) => ({
  ...review,
  vehicleId: vehicleIdAliases[review.vehicleId] || review.vehicleId,
  ownerId: ownerIdAliases[review.ownerId] || review.ownerId,
}));

export const marketplaceBookings: MarketplaceBooking[] = [
  { id: 'b1', vehicleId: 'mv1', userId: 'u20', startDate: '2024-04-01', endDate: '2024-04-05', totalPrice: 225000, status: BookingStatus.CONFIRMED, message: 'Voyage en famille', createdAt: '2024-03-20' },
  { id: 'b2', vehicleId: 'mv2', userId: 'u22', startDate: '2024-04-10', endDate: '2024-04-11', totalPrice: 55000, status: BookingStatus.PENDING, message: 'Événement d\'entreprise', createdAt: '2024-03-25' },
  { id: 'b3', vehicleId: 'mv6', userId: 'u27', startDate: '2024-04-15', endDate: '2024-04-15', totalPrice: 110000, status: BookingStatus.CONFIRMED, message: 'Réunion board', createdAt: '2024-03-28' },
].map((booking) => ({
  ...booking,
  vehicleId: vehicleIdAliases[booking.vehicleId] || booking.vehicleId,
}));

export const resolveMarketplaceVehicleId = (vehicleId?: string) => {
  if (!vehicleId) {
    return vehicleId;
  }

  return vehicleIdAliases[vehicleId] || vehicleId;
};

export const resolveMarketplaceOwnerId = (ownerId?: string) => {
  if (!ownerId) {
    return ownerId;
  }

  return ownerIdAliases[ownerId] || ownerId;
};

export const findMarketplaceVehicleById = (vehicleId?: string) => {
  const resolvedVehicleId = resolveMarketplaceVehicleId(vehicleId);
  return marketplaceVehicles.find((vehicle) => vehicle.id === resolvedVehicleId);
};

export const findMarketplaceOwnerById = (ownerId?: string) => {
  const resolvedOwnerId = resolveMarketplaceOwnerId(ownerId);
  return ownerProfiles.find((profile) => profile.id === resolvedOwnerId);
};

export const vehicles: Vehicle[] = [
  {
    id: 'v1',
    make: 'Tesla',
    model: 'Model 3',
    year: 2023,
    licensePlate: 'ABC-1234',
    status: VehicleStatus.Active,
    fuelType: FuelType.Electric,
    mileage: 12500,
    lastMaintenanceDate: '2023-12-15',
    maintenanceIntervalKm: 15000,
    nextServiceDate: '2024-06-15',
    imageUrl: 'https://picsum.photos/400/300?random=1'
  },
  {
    id: 'v2',
    make: 'Ford',
    model: 'Transit',
    year: 2022,
    licensePlate: 'TRN-5678',
    status: VehicleStatus.Rented,
    fuelType: FuelType.Diesel,
    mileage: 45000,
    lastMaintenanceDate: '2024-01-10',
    maintenanceIntervalKm: 10000,
    nextServiceDate: '2024-04-10',
    imageUrl: 'https://picsum.photos/400/300?random=2'
  },
  {
    id: 'v3',
    make: 'Toyota',
    model: 'RAV4 Hybrid',
    year: 2024,
    licensePlate: 'HYB-9988',
    status: VehicleStatus.Active,
    fuelType: FuelType.Hybrid,
    mileage: 5000,
    lastMaintenanceDate: '2024-02-01',
    maintenanceIntervalKm: 10000,
    nextServiceDate: '2024-08-01',
    imageUrl: 'https://picsum.photos/400/300?random=3'
  },
  {
    id: 'v4',
    make: 'Mercedes-Benz',
    model: 'Sprinter',
    year: 2021,
    licensePlate: 'SPR-7722',
    status: VehicleStatus.Maintenance,
    fuelType: FuelType.Diesel,
    mileage: 68000,
    lastMaintenanceDate: '2023-11-20',
    maintenanceIntervalKm: 15000,
    nextServiceDate: '2024-03-20',
    imageUrl: 'https://picsum.photos/400/300?random=4'
  },
  {
    id: 'v5',
    make: 'Chevrolet',
    model: 'Bolt EV',
    year: 2023,
    licensePlate: 'EV-4455',
    status: VehicleStatus.Rented,
    fuelType: FuelType.Electric,
    mileage: 18000,
    lastMaintenanceDate: '2024-01-25',
    maintenanceIntervalKm: 20000,
    nextServiceDate: '2024-07-25',
    imageUrl: 'https://picsum.photos/400/300?random=5'
  },
  {
    id: 'v6',
    make: 'Ford',
    model: 'F-150 Lightning',
    year: 2023,
    licensePlate: 'TRK-9000',
    status: VehicleStatus.Maintenance,
    fuelType: FuelType.Electric,
    mileage: 15000,
    lastMaintenanceDate: '2024-03-01',
    maintenanceIntervalKm: 15000,
    nextServiceDate: '2024-09-01',
    imageUrl: 'https://picsum.photos/400/300?random=6'
  }
];

export const customers: Customer[] = [
  { id: 'c1', firstName: 'Jean', lastName: 'Dupont', email: 'jean.dupont@example.com', phone: '+221 77 123 45 67', licenseNumber: 'PC-12345', status: 'Actif' },
  { id: 'c2', firstName: 'Marie', lastName: 'Kouassi', email: 'marie.kouassi@example.com', phone: '+225 07 89 12 34', licenseNumber: 'PC-67890', status: 'Actif' },
  { id: 'c3', firstName: 'Amadou', lastName: 'Diallo', email: 'amadou.d@company.com', phone: '+223 66 11 22 33', licenseNumber: 'PC-11223', status: 'Bloqué' },
];

export const contracts: Contract[] = [
  { id: 'cnt1', customerId: 'c1', vehicleId: 'v2', startDate: '2024-03-01', endDate: '2024-03-05', totalAmount: 450, status: 'Actif', paymentMethod: 'Carte Bancaire' },
  { id: 'cnt2', customerId: 'c2', vehicleId: 'v5', startDate: '2024-03-10', endDate: '2024-03-12', totalAmount: 200, status: 'Paiement En Attente' }
];

export const maintenanceRecords: MaintenanceRecord[] = [
  { id: 'm1', vehicleId: 'v4', description: 'Remplacement plaquettes de frein', date: '2024-03-15', cost: 450, status: 'En Cours' },
  { id: 'm2', vehicleId: 'v2', description: 'Vidange et filtres', date: '2024-01-10', cost: 120, status: 'Terminé' },
  { id: 'm3', vehicleId: 'v6', description: 'Diagnostic batterie', date: '2024-03-18', cost: 200, status: 'En Attente' },
];

export const revenueData: RevenueData[] = [
  { month: 'Oct', revenue: 45000, expenses: 12000 },
  { month: 'Nov', revenue: 52000, expenses: 15000 },
  { month: 'Déc', revenue: 49000, expenses: 11000 },
  { month: 'Jan', revenue: 58000, expenses: 18000 },
  { month: 'Fév', revenue: 55000, expenses: 14000 },
  { month: 'Mar', revenue: 62000, expenses: 16000 },
];

export const getStats = (): FleetStats => {
  return {
    totalVehicles: vehicles.length,
    activeRentals: vehicles.filter(v => v.status === VehicleStatus.Rented).length,
    inMaintenance: vehicles.filter(v => v.status === VehicleStatus.Maintenance).length,
    totalRevenue: revenueData.reduce((acc, curr) => acc + curr.revenue, 0)
  };
};