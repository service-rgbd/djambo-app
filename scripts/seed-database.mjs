import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import postgres from 'postgres';
import { loadEnvConfig } from '../utils/loadEnv.mjs';

const workspaceRoot = process.cwd();

const passwordHash = crypto.scryptSync('password123', 'fleetcommand-salt', 64).toString('hex');
const env = loadEnvConfig(workspaceRoot);
const databaseUrl = process.env.DATABASE_URL || env.DATABASE_URL;
const sql = postgres(databaseUrl, { max: 1, prepare: false });

const users = [
  { id: '11111111-1111-1111-1111-111111111111', full_name: 'AutoLoc Dakar', email: 'autoloc@fleetcommand.africa', role: 'PARC_AUTO' },
  { id: '22222222-2222-2222-2222-222222222222', full_name: 'Yacouba Traore', email: 'yacouba@fleetcommand.africa', role: 'PARTICULIER' },
  { id: '33333333-3333-3333-3333-333333333333', full_name: 'Premium Cars CI', email: 'premium@fleetcommand.africa', role: 'PARC_AUTO' },
  { id: '44444444-4444-4444-4444-444444444444', full_name: 'Client Demo', email: 'client@fleetcommand.africa', role: 'USER' },
];

const ownerProfiles = [
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', user_id: users[0].id, display_name: 'AutoLoc Dakar', description: 'Agence premium a Dakar.',
    address: 'Avenue Bourguiba, Plateau', city: 'Dakar', country: 'Senegal', whatsapp: '+221771234567', verified: true,
    response_time: 'Repond en moins d\'1h', member_since: '2021-03-10', rating: 4.8, review_count: 127, vehicle_count: 3,
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', user_id: users[1].id, display_name: 'Yacouba Traore', description: 'Particulier soigneux a Abidjan.',
    address: 'Cocody Riviera 3', city: 'Abidjan', country: 'Cote d\'Ivoire', whatsapp: '+2250789123456', verified: true,
    response_time: 'Repond en moins de 3h', member_since: '2022-07-15', rating: 4.5, review_count: 23, vehicle_count: 1,
  },
  {
    id: 'cccccccc-cccc-cccc-cccc-cccccccccccc', user_id: users[2].id, display_name: 'Premium Cars CI', description: 'Leader du haut de gamme a Abidjan.',
    address: 'Marcory', city: 'Abidjan', country: 'Cote d\'Ivoire', whatsapp: '+2250798765432', verified: true,
    response_time: 'Repond en moins de 30 min', member_since: '2020-01-05', rating: 4.9, review_count: 314, vehicle_count: 2,
  },
];

const parkings = [
  { id: 'dddddddd-dddd-dddd-dddd-dddddddddddd', owner_id: ownerProfiles[0].id, name: 'Parking Plateau Signature', city: 'Dakar', address: 'Plateau, Dakar', access_type: 'vip', opening_hours: '24/7', security_features: ['Camera', 'Gardien', 'Acces badge'], capacity_total: 20 },
  { id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', owner_id: ownerProfiles[1].id, name: 'Parking Riviera Select', city: 'Abidjan', address: 'Riviera 3, Abidjan', access_type: 'prive', opening_hours: '06:00 - 23:00', security_features: ['Camera', 'Portail automatique'], capacity_total: 8 },
  { id: 'ffffffff-ffff-ffff-ffff-ffffffffffff', owner_id: ownerProfiles[2].id, name: 'Parking Marcory Executive', city: 'Abidjan', address: 'Zone industrielle, Marcory', access_type: 'business', opening_hours: '24/7', security_features: ['Camera', 'Gardien', 'Lavage premium'], capacity_total: 18 },
];

const vehicles = [
  {
    id: '10000000-0000-0000-0000-000000000001', owner_id: ownerProfiles[0].id, parking_id: parkings[0].id, title: 'Toyota Land Cruiser GX 2022', brand: 'Toyota', model: 'Land Cruiser GX', year: 2022,
    category: 'SUV', fuel_type: 'Diesel', transmission: 'Automatique', seats: 7, price_per_day: 45000, is_for_rent: true, is_for_sale: false,
    description: '4x4 premium pour route et confort.', features: ['Climatisation', 'GPS', 'Cuir'], location: 'Plateau, Dakar', city: 'Dakar', rating: 4.9,
    review_count: 38, view_count: 412, is_featured: true, is_available: false, mileage: 28000, color: 'Blanc Perle', conditions: 'Caution 200 000 FCFA.'
  },
  {
    id: '10000000-0000-0000-0000-000000000002', owner_id: ownerProfiles[0].id, parking_id: parkings[0].id, title: 'Toyota Prado TXL 2021', brand: 'Toyota', model: 'Prado TXL', year: 2021,
    category: 'SUV', fuel_type: 'Diesel', transmission: 'Automatique', seats: 7, price_per_day: 50000, is_for_rent: true, is_for_sale: true,
    description: 'SUV robuste et elegant.', features: ['7 places', '4x4', 'GPS'], location: 'Plateau, Dakar', city: 'Dakar', rating: 4.8,
    review_count: 56, view_count: 498, is_featured: true, is_available: true, mileage: 35000, color: 'Blanc Nacre', conditions: 'Historique complet.'
  },
  {
    id: '10000000-0000-0000-0000-000000000003', owner_id: ownerProfiles[1].id, parking_id: parkings[1].id, title: 'Honda Accord Sport 2020', brand: 'Honda', model: 'Accord Sport', year: 2020,
    category: 'BERLINE', fuel_type: 'Petrol', transmission: 'Automatique', seats: 5, price_per_day: 22000, is_for_rent: true, is_for_sale: true,
    description: 'Berline sportive et confortable.', features: ['Bluetooth', 'Android Auto'], location: 'Cocody Riviera 3, Abidjan', city: 'Abidjan', rating: 4.5,
    review_count: 16, view_count: 156, is_featured: false, is_available: true, mileage: 44000, color: 'Rouge Rallye', conditions: 'CT valide.'
  },
  {
    id: '10000000-0000-0000-0000-000000000004', owner_id: ownerProfiles[2].id, parking_id: parkings[2].id, title: 'Mercedes-Benz C 300 AMG Line', brand: 'Mercedes-Benz', model: 'C 300 AMG Line', year: 2021,
    category: 'BERLINE', fuel_type: 'Petrol', transmission: 'Automatique', seats: 5, price_per_day: 55000, is_for_rent: true, is_for_sale: false,
    description: 'Berline executive premium.', features: ['Toit ouvrant', 'USB-C', 'Son premium'], location: 'Marcory, Abidjan', city: 'Abidjan', rating: 4.8,
    review_count: 51, view_count: 389, is_featured: true, is_available: false, mileage: 19500, color: 'Gris Selenite', conditions: 'Assurance incluse.'
  },
  {
    id: '10000000-0000-0000-0000-000000000005', owner_id: ownerProfiles[2].id, parking_id: parkings[2].id, title: 'Mercedes-Benz Vito Tourer 9 places', brand: 'Mercedes-Benz', model: 'Vito Tourer', year: 2020,
    category: 'UTILITAIRE', fuel_type: 'Diesel', transmission: 'Automatique', seats: 9, price_per_day: 45000, is_for_rent: true, is_for_sale: false,
    description: 'Transport premium de groupe.', features: ['9 places', 'Clim arriere'], location: 'Marcory, Abidjan', city: 'Abidjan', rating: 4.5,
    review_count: 41, view_count: 267, is_featured: false, is_available: true, mileage: 67000, color: 'Noir', conditions: 'Chauffeur disponible.'
  }
];

const vehicleImages = [
  { id: '30000000-0000-0000-0000-000000000001', vehicle_id: vehicles[0].id, image_url: 'https://images.unsplash.com/photo-1533591380348-14193f1de18f?w=900&q=80&auto=format&fit=crop', alt_text: 'Toyota Land Cruiser', sort_order: 0 },
  { id: '30000000-0000-0000-0000-000000000002', vehicle_id: vehicles[1].id, image_url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=900&q=80&auto=format&fit=crop', alt_text: 'Toyota Prado', sort_order: 0 },
  { id: '30000000-0000-0000-0000-000000000003', vehicle_id: vehicles[2].id, image_url: 'https://images.unsplash.com/photo-1568844293986-8d0400bd4745?w=900&q=80&auto=format&fit=crop', alt_text: 'Honda Accord', sort_order: 0 },
  { id: '30000000-0000-0000-0000-000000000004', vehicle_id: vehicles[3].id, image_url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=900&q=80&auto=format&fit=crop', alt_text: 'Mercedes C300', sort_order: 0 },
  { id: '30000000-0000-0000-0000-000000000005', vehicle_id: vehicles[4].id, image_url: 'https://images.unsplash.com/photo-1474515439-f4b7e28f6c21?w=900&q=80&auto=format&fit=crop', alt_text: 'Mercedes Vito', sort_order: 0 },
];

const bookings = [
  { id: '20000000-0000-0000-0000-000000000001', vehicle_id: vehicles[0].id, renter_id: users[3].id, owner_id: ownerProfiles[0].id, start_date: '2026-04-08', end_date: '2026-04-14', total_price: 270000, status: 'CONFIRMED', message: 'Voyage famille Dakar' },
  { id: '20000000-0000-0000-0000-000000000002', vehicle_id: vehicles[3].id, renter_id: users[3].id, owner_id: ownerProfiles[2].id, start_date: '2026-04-10', end_date: '2026-04-13', total_price: 165000, status: 'PENDING', message: 'Deplacement executive' },
  { id: '20000000-0000-0000-0000-000000000003', vehicle_id: vehicles[2].id, renter_id: users[3].id, owner_id: ownerProfiles[1].id, start_date: '2026-03-20', end_date: '2026-03-24', total_price: 88000, status: 'COMPLETED', message: 'Location terminee sans incident' },
];

const contracts = [
  { id: '40000000-0000-0000-0000-000000000001', booking_id: bookings[0].id, customer_id: users[3].id, vehicle_id: vehicles[0].id, owner_id: ownerProfiles[0].id, contract_number: 'FC-2026-0001', status: 'ACTIVE', start_date: '2026-04-08', end_date: '2026-04-14', daily_rate: 45000, total_amount: 270000, notes: 'Contrat premium Dakar' },
  { id: '40000000-0000-0000-0000-000000000002', booking_id: bookings[2].id, customer_id: users[3].id, vehicle_id: vehicles[2].id, owner_id: ownerProfiles[1].id, contract_number: 'FC-2026-0002', status: 'COMPLETED', start_date: '2026-03-20', end_date: '2026-03-24', daily_rate: 22000, total_amount: 88000, notes: 'Contrat particulier Abidjan' },
];

try {
  for (const user of users) {
    await sql`
      INSERT INTO app_users (id, full_name, email, password_hash, role, email_verified)
      VALUES (${user.id}::uuid, ${user.full_name}, ${user.email}, ${passwordHash}, ${user.role}::user_role, true)
      ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name, role = EXCLUDED.role;
    `;
  }

  for (const owner of ownerProfiles) {
    await sql`
      INSERT INTO owner_profiles (id, user_id, display_name, description, address, city, country, whatsapp, verified, response_time, member_since, rating, review_count, vehicle_count)
      VALUES (${owner.id}::uuid, ${owner.user_id}::uuid, ${owner.display_name}, ${owner.description}, ${owner.address}, ${owner.city}, ${owner.country}, ${owner.whatsapp}, ${owner.verified}, ${owner.response_time}, ${owner.member_since}, ${owner.rating}, ${owner.review_count}, ${owner.vehicle_count})
      ON CONFLICT (user_id) DO UPDATE SET display_name = EXCLUDED.display_name, city = EXCLUDED.city, vehicle_count = EXCLUDED.vehicle_count;
    `;
  }

  for (const parking of parkings) {
    await sql`
      INSERT INTO parkings (id, owner_id, name, city, address, access_type, opening_hours, security_features, capacity_total)
      VALUES (${parking.id}::uuid, ${parking.owner_id}::uuid, ${parking.name}, ${parking.city}, ${parking.address}, ${parking.access_type}, ${parking.opening_hours}, ${parking.security_features}, ${parking.capacity_total})
      ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, city = EXCLUDED.city, capacity_total = EXCLUDED.capacity_total;
    `;
  }

  for (const vehicle of vehicles) {
    await sql`
      INSERT INTO vehicles (
        id, owner_id, parking_id, title, brand, model, year, category, fuel_type, transmission, seats,
        price_per_day, is_for_rent, is_for_sale, description, features, location, city, rating,
        review_count, view_count, is_featured, is_available, mileage, color, conditions, price_sale
      ) VALUES (
        ${vehicle.id}::uuid, ${vehicle.owner_id}::uuid, ${vehicle.parking_id}::uuid, ${vehicle.title}, ${vehicle.brand}, ${vehicle.model}, ${vehicle.year},
        ${vehicle.category}::vehicle_category, ${vehicle.fuel_type}::fuel_type_enum, ${vehicle.transmission}::transmission_type, ${vehicle.seats},
        ${vehicle.price_per_day}, ${vehicle.is_for_rent}, ${vehicle.is_for_sale}, ${vehicle.description}, ${vehicle.features}, ${vehicle.location}, ${vehicle.city}, ${vehicle.rating},
        ${vehicle.review_count}, ${vehicle.view_count}, ${vehicle.is_featured}, ${vehicle.is_available}, ${vehicle.mileage}, ${vehicle.color}, ${vehicle.conditions}, ${vehicle.price_sale ?? null}
      ) ON CONFLICT (id) DO UPDATE SET
        parking_id = EXCLUDED.parking_id,
        title = EXCLUDED.title,
        price_per_day = EXCLUDED.price_per_day,
        is_available = EXCLUDED.is_available,
        review_count = EXCLUDED.review_count,
        view_count = EXCLUDED.view_count;
    `;
  }

  for (const image of vehicleImages) {
    await sql`
      INSERT INTO vehicle_images (id, vehicle_id, image_url, alt_text, sort_order)
      VALUES (${image.id}::uuid, ${image.vehicle_id}::uuid, ${image.image_url}, ${image.alt_text}, ${image.sort_order})
      ON CONFLICT (id) DO UPDATE SET image_url = EXCLUDED.image_url, alt_text = EXCLUDED.alt_text;
    `;
  }

  for (const booking of bookings) {
    await sql`
      INSERT INTO bookings (id, vehicle_id, renter_id, owner_id, start_date, end_date, total_price, status, message)
      VALUES (${booking.id}::uuid, ${booking.vehicle_id}::uuid, ${booking.renter_id}::uuid, ${booking.owner_id}::uuid, ${booking.start_date}, ${booking.end_date}, ${booking.total_price}, ${booking.status}::booking_status, ${booking.message})
      ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, start_date = EXCLUDED.start_date, end_date = EXCLUDED.end_date, total_price = EXCLUDED.total_price;
    `;
  }

  for (const contract of contracts) {
    await sql`
      INSERT INTO contracts (id, booking_id, customer_id, vehicle_id, owner_id, contract_number, status, start_date, end_date, daily_rate, total_amount, notes)
      VALUES (${contract.id}::uuid, ${contract.booking_id}::uuid, ${contract.customer_id}::uuid, ${contract.vehicle_id}::uuid, ${contract.owner_id}::uuid, ${contract.contract_number}, ${contract.status}::contract_status, ${contract.start_date}, ${contract.end_date}, ${contract.daily_rate}, ${contract.total_amount}, ${contract.notes})
      ON CONFLICT (contract_number) DO UPDATE SET status = EXCLUDED.status, total_amount = EXCLUDED.total_amount, notes = EXCLUDED.notes;
    `;
  }

  console.log('Database seeded successfully');
} finally {
  await sql.end();
}