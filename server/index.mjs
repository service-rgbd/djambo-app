import crypto from 'node:crypto';
import path from 'node:path';
import express from 'express';
import cors from 'cors';
import postgres from 'postgres';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { loadEnvConfig } from '../utils/loadEnv.mjs';

const workspaceRoot = process.cwd();
const env = loadEnvConfig(workspaceRoot);
const databaseUrl = process.env.DATABASE_URL || env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to start the Djambo API');
}
const port = Number(process.env.PORT || 8787);
const app = express();
const sql = postgres(databaseUrl, { max: 10, prepare: false });

const hashPassword = (password) => crypto.scryptSync(password, 'fleetcommand-salt', 64).toString('hex');
const hashVerificationToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
const resendApiKey = env.RESEND_API_KEY;
const resendFromEmail = env.RESEND_FROM_EMAIL || 'Djambo <onboarding@resend.dev>';
const openRouterApiKey = env.OPEN_AI_CHAT_BOT || env.OPENROUTER_API_KEY || '';
const openRouterModel = env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-001';
const aiCacheTtlMs = Math.max(60_000, Number(env.AI_CACHE_TTL_MS || 21_600_000) || 21_600_000);
const aiResponseCache = new Map();
const isProduction = process.env.NODE_ENV === 'production';
const normalizedAppUrl = (() => {
  const rawUrl = env.APP_URL || 'http://localhost:3000';
  return /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
})();
const normalizedApiUrl = (() => {
  const rawUrl = env.API_URL || `http://localhost:${port}`;
  return /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
})();
const allowedOrigins = (env.ALLOWED_ORIGINS || `${normalizedAppUrl},http://localhost:3000,http://127.0.0.1:3000`)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const localOriginPattern = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;
const mediaDirectory = workspaceRoot;
const defaultVehicleReleaseTime = '10:00';
const uploadStorageProvider = env.UPLOAD_STORAGE_PROVIDER || 'local';
const maxUploadSizeMb = Math.max(1, Number(env.MAX_UPLOAD_SIZE_MB || 10) || 10);
const maxUploadSizeBytes = maxUploadSizeMb * 1024 * 1024;
const r2PublicBaseUrl = env.R2_PUBLIC_BASE_URL || '';
const r2Client = uploadStorageProvider === 'r2' && env.R2_ACCOUNT_ID && env.R2_BUCKET_NAME && env.R2_ACCESS_KEY_ID && env.R2_SECRET_ACCESS_KEY
  ? new S3Client({
      region: 'auto',
      endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      },
    })
  : null;

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const getRequestUserId = (req) => {
  const userId = req.headers['x-user-id'];
  if (!userId || Array.isArray(userId)) {
    return null;
  }

  if (!uuidPattern.test(userId)) {
    return null;
  }

  return userId;
};

const normalizeVehicleRequestType = (value) => {
  return value === 'buy' ? 'BUY' : value === 'rent' ? 'RENT' : null;
};

const normalizeReservationMode = (value) => {
  return value === 'on_site' ? 'ON_SITE' : value === 'direct_app' ? 'DIRECT_APP' : null;
};

const sanitizeText = (value) => typeof value === 'string' ? value.trim() : '';

const normalizeAiPrompt = (value) => sanitizeText(value)
  .toLowerCase()
  .replace(/\s+/g, ' ')
  .slice(0, 500);

const pruneAiResponseCache = () => {
  const now = Date.now();
  for (const [key, entry] of aiResponseCache.entries()) {
    if (!entry || entry.expiresAt <= now) {
      aiResponseCache.delete(key);
    }
  }
};

const buildAiCacheKey = (userId, messages) => {
  const serialized = JSON.stringify(messages.map((message) => [message.role, normalizeAiPrompt(message.text)]));
  return `${userId}:${crypto.createHash('sha1').update(serialized).digest('hex')}`;
};

const extractOpenRouterText = (payload) => {
  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content === 'string') {
    return sanitizeText(content);
  }

  if (Array.isArray(content)) {
    return sanitizeText(content.map((part) => {
      if (typeof part === 'string') {
        return part;
      }

      if (part && typeof part.text === 'string') {
        return part.text;
      }

      return '';
    }).join('\n'));
  }

  return '';
};

const buildStaticAiReply = (message) => {
  if (/^(bonjour|salut|bonsoir|hello)\b/.test(message)) {
    return 'Bonjour. Je peux vous aider sur les clients, les contrats, les vehicules et les actions prioritaires de votre espace Djambo.';
  }

  if (/(qui es tu|que peux tu faire|aide|help)/.test(message)) {
    return 'Je peux resumer votre activite, expliquer un module, proposer une action concrete sur les clients, les contrats ou la flotte, et signaler les points a surveiller.';
  }

  if (/(comment|ou).*(ajouter|creer).*(client)/.test(message)) {
    return 'Depuis Clients, utilisez Ajouter un client puis choisissez soit un compte deja inscrit, soit une creation manuelle. Pour une location, le client peut ensuite etre envoye directement vers le module Contrats.';
  }

  if (/(comment|ou).*(contrat)/.test(message)) {
    return 'Le flux optimal est simple: choisissez le client, selectionnez un vehicule disponible, renseignez la periode, verifiez le total, puis generez le PDF. Chaque dossier emis reste consultable dans la liste des contrats.';
  }

  if (/(cout|co[uû]t|credits?|tokens?|openrouter).*(ia|chat|assistant)|comment.*(economiser|reduire|limiter).*(credits?|cout|tokens?)/.test(message)) {
    return 'Pour limiter les couts IA, Djambo repond localement aux questions courtes, reutilise un cache sur les demandes repetees et n appelle OpenRouter que pour les cas qui demandent une vraie analyse. Les reponses sont aussi volontairement courtes pour reduire les tokens.';
  }

  return '';
};

const buildAiSnapshot = async (userId) => {
  const ownerProfile = await getOwnerProfileByUserId(userId);
  if (!ownerProfile) {
    return {
      currentDate: new Date().toISOString().slice(0, 10),
      scope: 'user',
      note: 'Utilisateur connecte sans profil proprietaire.'
    };
  }

  const [vehicleCounts] = await sql`
    select
      count(*)::int as total,
      count(*) filter (where is_available = true)::int as available,
      coalesce(avg(price_per_day), 0)::int as average_daily_rate
    from vehicles
    where owner_id = ${ownerProfile.id};
  `;

  const [contractCounts] = await sql`
    select
      count(*)::int as total,
      count(*) filter (where status = 'ACTIVE')::int as active,
      count(*) filter (where status = 'PENDING_PAYMENT')::int as pending_payment,
      coalesce(sum(total_amount), 0)::int as booked_amount
    from contracts
    where owner_id = ${ownerProfile.id};
  `;

  const customerSummaries = await getCustomerSummariesByUserId(userId);
  const recentContracts = await sql`
    select c.contract_number, c.total_amount, c.start_date, c.end_date, u.full_name, concat(v.brand, ' ', v.model) as vehicle_label
    from contracts c
    join app_users u on u.id = c.customer_id
    join vehicles v on v.id = c.vehicle_id
    where c.owner_id = ${ownerProfile.id}
    order by c.generated_at desc nulls last, c.created_at desc
    limit 3;
  `;

  return {
    currentDate: new Date().toISOString().slice(0, 10),
    scope: 'owner',
    ownerDisplayName: ownerProfile.display_name,
    city: ownerProfile.city || '',
    vehicles: {
      total: vehicleCounts?.total || 0,
      available: vehicleCounts?.available || 0,
      averageDailyRate: vehicleCounts?.average_daily_rate || 0,
    },
    customers: {
      total: customerSummaries.length,
      active: customerSummaries.filter((customer) => customer.status === 'Actif').length,
    },
    contracts: {
      total: contractCounts?.total || 0,
      active: contractCounts?.active || 0,
      pendingPayment: contractCounts?.pending_payment || 0,
      bookedAmount: contractCounts?.booked_amount || 0,
    },
    recentContracts: recentContracts.map((contract) => ({
      contractNumber: contract.contract_number,
      customerName: contract.full_name,
      vehicleLabel: contract.vehicle_label,
      totalAmount: contract.total_amount,
      startDate: contract.start_date,
      endDate: contract.end_date,
    })),
  };
};

const buildAiSystemPrompt = (snapshot) => {
  return [
    'Tu es FleetMind, assistant operationnel de Djambo pour un gestionnaire de flotte.',
    'Reponds uniquement en francais, avec un ton direct, utile et concis.',
    'Si la question est simple, reponds sans utiliser un long developpement: 3 a 6 phrases courtes ou 4 puces maximum.',
    'Ne donne pas de chiffres inventes: utilise seulement le contexte fourni quand il est pertinent.',
    'Pour les demandes hors perimetre, recadre poliment vers la gestion clients, contrats, vehicules, revenus ou operations.',
    'Quand c est utile, termine par une action concrete a faire dans l application.',
    `Contexte metier compact: ${JSON.stringify(snapshot)}`,
  ].join(' ');
};

const slugifyFilePart = (value) => sanitizeText(value)
  .normalize('NFD')
  .replace(/[^a-zA-Z0-9._-]+/g, '-')
  .replace(/-+/g, '-')
  .replace(/^-|-$/g, '')
  .toLowerCase();

const allowedUploadContentTypes = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
  ['image/avif', 'avif'],
]);

const allowedMediaUploadScopes = new Map([
  ['brand-logo', 'branding'],
  ['storefront-cover', 'storefronts'],
  ['contract-banner', 'contracts'],
]);

const buildPublicMediaUrl = (objectKey) => {
  return `${normalizedApiUrl.replace(/\/$/, '')}/api/media/${objectKey.replace(/^\/+/, '')}`;
};

const extractMediaObjectKey = (value) => {
  if (typeof value !== 'string' || !value.trim()) {
    return '';
  }

  const rawValue = value.trim();
  const normalizedApiPrefix = `${normalizedApiUrl.replace(/\/$/, '')}/api/media/`;

  if (rawValue.startsWith(normalizedApiPrefix)) {
    return rawValue.slice(normalizedApiPrefix.length).replace(/^\/+/, '');
  }

  if (rawValue.startsWith('/api/media/')) {
    return rawValue.replace(/^\/api\/media\//, '').replace(/^\/+/, '');
  }

  if (rawValue.startsWith('/media/')) {
    return rawValue.replace(/^\/media\//, '').replace(/^\/+/, '');
  }

  try {
    const parsedUrl = new URL(rawValue);
    const host = parsedUrl.hostname.toLowerCase();

    if (parsedUrl.pathname.startsWith('/api/media/')) {
      return parsedUrl.pathname.replace(/^\/api\/media\//, '').replace(/^\/+/, '');
    }

    if (
      host === 'cdn.djambo-app.com'
      || host === 'media.djambo-app.com'
      || host.endsWith('.r2.dev')
      || (r2PublicBaseUrl && host === new URL(r2PublicBaseUrl).hostname.toLowerCase())
    ) {
      return parsedUrl.pathname.replace(/^\/+/, '');
    }
  } catch {
    return '';
  }

  return '';
};

const normalizeStoredMediaUrl = (value) => {
  if (typeof value !== 'string' || !value.trim()) {
    return value || null;
  }

  const objectKey = extractMediaObjectKey(value);
  return objectKey ? buildPublicMediaUrl(objectKey) : value;
};

const uploadBufferToR2 = async ({ folder, actorId, defaultName, buffer, contentType, fileName }) => {
  if (!r2Client || !env.R2_BUCKET_NAME) {
    throw new Error('Le stockage R2 n est pas configure sur le backend.');
  }

  const extension = allowedUploadContentTypes.get(contentType) || 'bin';
  const safeName = slugifyFilePart(path.basename(fileName || `upload.${extension}`, path.extname(fileName || '')) || defaultName || 'media');
  const objectKey = `${folder}/${actorId}/${Date.now()}-${crypto.randomBytes(6).toString('hex')}-${safeName || defaultName || 'image'}.${extension}`;

  await r2Client.send(new PutObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: objectKey,
    Body: buffer,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000, immutable',
  }));

  return {
    key: objectKey,
    url: buildPublicMediaUrl(objectKey),
  };
};

const getParkingLocationEditableAfter = (timestamp) => {
  if (!timestamp) {
    return null;
  }

  return new Date(new Date(timestamp).getTime() + (7 * 24 * 60 * 60 * 1000)).toISOString();
};

const sanitizeCustomerDetails = (details, user) => {
  const source = details && typeof details === 'object' ? details : {};

  return {
    fullName: sanitizeText(source.fullName) || user.full_name || '',
    email: sanitizeText(source.email) || user.email || '',
    phone: sanitizeText(source.phone) || user.phone || '',
    identityNumber: sanitizeText(source.identityNumber),
    licenseNumber: sanitizeText(source.licenseNumber),
  };
};

const buildUserInitials = (fullName) => {
  const parts = sanitizeText(fullName).split(/\s+/).filter(Boolean);
  return (parts.slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join('') || 'DJ').slice(0, 2);
};

const isMissingColumnError = (error, columnName) => (
  error?.code === '42703' && String(error?.message || '').includes(columnName)
);

const isMissingRelationError = (error, relationName) => (
  error?.code === '42P01' && String(error?.message || '').includes(relationName)
);

const isMissingPublicProfileColumnError = (error) => (
  isMissingColumnError(error, 'store_slug')
  || isMissingColumnError(error, '.type')
  || isMissingRelationError(error, 'app_settings')
);

const mapPublicOwnerProfile = (row) => ({
  id: row.owner_id || row.id,
  userId: row.user_id,
  type: row.owner_type || row.type,
  displayName: row.display_name,
  description: row.description || '',
  address: row.address || '',
  city: row.owner_city || row.city || '',
  country: row.country || '',
  rating: Number(row.owner_rating ?? row.rating ?? 0),
  reviewCount: Number(row.owner_review_count ?? row.review_count ?? 0),
  vehicleCount: Number(row.owner_vehicle_count ?? row.vehicle_count ?? 0),
  verified: Boolean(row.verified),
  whatsapp: row.whatsapp || '',
  responseTime: row.response_time || 'Reponse en moins de 30 min',
  memberSince: row.member_since,
  storeSlug: row.store_slug || toSlug(row.display_name),
});

const mapPublicVehicle = (row) => {
  const images = Array.isArray(row.images) ? row.images : [];

  return {
    id: row.id,
    ownerId: row.owner_id,
    ownerProfile: mapPublicOwnerProfile(row),
    title: row.title,
    brand: row.brand,
    model: row.model,
    year: row.year,
    category: categoryFromDb[row.category] || row.category,
    fuelType: fuelTypeFromDb[row.fuel_type] || row.fuel_type,
    transmission: row.transmission,
    seats: row.seats,
    pricePerDay: row.price_per_day,
    priceSale: row.price_sale || undefined,
    isForRent: Boolean(row.is_for_rent),
    isForSale: Boolean(row.is_for_sale),
    description: row.description || '',
    features: Array.isArray(row.features) ? row.features : [],
    location: row.location,
    city: row.city,
    images: images.map((image, index) => ({
      id: image.id || `${row.id}-img-${index + 1}`,
      url: normalizeStoredMediaUrl(image.url),
      alt: image.alt || row.title,
    })),
    rating: Number(row.rating || 0),
    reviewCount: Number(row.review_count || 0),
    viewCount: Number(row.view_count || 0),
    isFeatured: Boolean(row.is_featured),
    isAvailable: Boolean(row.is_available),
    createdAt: row.created_at,
    mileage: row.mileage || 0,
    color: row.color || '',
    conditions: row.conditions || '',
  };
};

const mapPublicReview = (row) => ({
  id: row.id,
  userId: row.user_id,
  userName: row.user_name,
  userInitials: buildUserInitials(row.user_name),
  vehicleId: row.vehicle_id,
  ownerId: row.owner_id,
  rating: Number(row.rating),
  comment: row.comment,
  createdAt: row.created_at,
});

const publicVehicleSelect = ({ includeStoreSlug = true, includeOwnerType = true } = {}) => sql`
  select
    v.id,
    v.owner_id,
    op.user_id,
    ${includeOwnerType ? sql`op.type as owner_type` : sql`null::text as owner_type`},
    op.display_name,
    op.description,
    op.address,
    op.city as owner_city,
    op.country,
    op.rating as owner_rating,
    op.review_count as owner_review_count,
    op.vehicle_count as owner_vehicle_count,
    op.verified,
    op.whatsapp,
    op.response_time,
    op.member_since,
    ${includeStoreSlug ? sql`aps.store_slug` : sql`null::text as store_slug`},
    v.title,
    v.brand,
    v.model,
    v.year,
    v.category,
    v.fuel_type,
    v.transmission,
    v.seats,
    v.price_per_day,
    v.price_sale,
    v.is_for_rent,
    v.is_for_sale,
    v.description,
    v.features,
    v.location,
    v.city,
    v.rating,
    v.review_count,
    v.view_count,
    v.is_featured,
    v.is_available,
    v.created_at,
    v.mileage,
    v.color,
    v.conditions,
    coalesce((
      select json_agg(json_build_object('id', vi.id, 'url', vi.image_url, 'alt', coalesce(vi.alt_text, v.title)) order by vi.sort_order)
      from vehicle_images vi
      where vi.vehicle_id = v.id
    ), '[]'::json) as images
`;

const getPublicVehicles = async () => {
  let rows;
  try {
    rows = await sql`
      ${publicVehicleSelect()}
      from vehicles v
      join owner_profiles op on op.id = v.owner_id
      left join app_settings aps on aps.user_id = op.user_id
      where v.is_for_rent = true or v.is_for_sale = true
      order by v.is_featured desc, v.created_at desc;
    `;
  } catch (error) {
    if (!isMissingPublicProfileColumnError(error)) {
      throw error;
    }

    rows = await sql`
      ${publicVehicleSelect({ includeStoreSlug: false, includeOwnerType: false })}
      from vehicles v
      join owner_profiles op on op.id = v.owner_id
      where v.is_for_rent = true or v.is_for_sale = true
      order by v.is_featured desc, v.created_at desc;
    `;
  }

  return rows.map(mapPublicVehicle);
};

const getPublicVehicleById = async (vehicleId) => {
  let rows;
  try {
    rows = await sql`
      ${publicVehicleSelect()}
      from vehicles v
      join owner_profiles op on op.id = v.owner_id
      left join app_settings aps on aps.user_id = op.user_id
      where v.id = ${vehicleId}
      limit 1;
    `;
  } catch (error) {
    if (!isMissingPublicProfileColumnError(error)) {
      throw error;
    }

    rows = await sql`
      ${publicVehicleSelect({ includeStoreSlug: false, includeOwnerType: false })}
      from vehicles v
      join owner_profiles op on op.id = v.owner_id
      where v.id = ${vehicleId}
      limit 1;
    `;
  }

  return rows[0] ? mapPublicVehicle(rows[0]) : null;
};

const getPublicReviewsByVehicleId = async (vehicleId) => {
  const rows = await sql`
    select r.id, r.vehicle_id, r.owner_id, r.user_id, r.rating, r.comment, r.created_at, u.full_name as user_name
    from reviews r
    join app_users u on u.id = r.user_id
    where r.vehicle_id = ${vehicleId}
    order by r.created_at desc;
  `;

  return rows.map(mapPublicReview);
};

const getPublicReviewsByOwnerId = async (ownerId) => {
  const rows = await sql`
    select r.id, r.vehicle_id, r.owner_id, r.user_id, r.rating, r.comment, r.created_at, u.full_name as user_name
    from reviews r
    join app_users u on u.id = r.user_id
    where r.owner_id = ${ownerId}
    order by r.created_at desc;
  `;

  return rows.map(mapPublicReview);
};

const refreshVehicleAndOwnerRatings = async (vehicleId, ownerId) => {
  await sql`
    update vehicles
    set rating = coalesce((select round(avg(r.rating)::numeric, 1) from reviews r where r.vehicle_id = ${vehicleId}), 0),
        review_count = (select count(*)::int from reviews r where r.vehicle_id = ${vehicleId})
    where id = ${vehicleId};
  `;

  await sql`
    update owner_profiles
    set rating = coalesce((select round(avg(r.rating)::numeric, 1) from reviews r where r.owner_id = ${ownerId}), 0),
        review_count = (select count(*)::int from reviews r where r.owner_id = ${ownerId})
    where id = ${ownerId};
  `;
};

const buildOwnerNotificationFeed = ({ bookings, requestInbox, reviewFeed }) => {
  const bookingNotifications = bookings.map((booking) => ({
    id: `booking-${booking.id}`,
    type: 'booking',
    title: booking.status === 'PENDING' ? 'Nouvelle reservation en attente' : 'Reservation mise a jour',
    detail: `${booking.renter_name} pour ${booking.vehicle_title}`,
    status: booking.status,
    createdAt: booking.created_at,
  }));

  const requestNotifications = requestInbox.map((request) => ({
    id: `request-${request.id}`,
    type: request.offered_price ? 'offer' : 'request',
    title: request.booking_channel === 'ON_SITE' ? 'Passage sur place demande' : 'Reservation directe recue',
    detail: `${request.customer_name} pour ${request.vehicle_title}`,
    status: request.status,
    createdAt: request.created_at,
  }));

  const reviewNotifications = reviewFeed.map((review) => ({
    id: `review-${review.id}`,
    type: 'review',
    title: `Nouvel avis ${review.rating}/5`,
    detail: `${review.user_name} a evalue ${review.vehicle_title}`,
    status: 'NEW',
    createdAt: review.created_at,
  }));

  return [...bookingNotifications, ...requestNotifications, ...reviewNotifications]
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .slice(0, 12);
};

const fuelTypeToDb = {
  Essence: 'Petrol',
  Petrol: 'Petrol',
  Diesel: 'Diesel',
  Hybride: 'Hybrid',
  Hybrid: 'Hybrid',
  'Électrique': 'Electric',
  Electrique: 'Electric',
  Electric: 'Electric',
};

const fuelTypeFromDb = {
  Petrol: 'Essence',
  Diesel: 'Diesel',
  Hybrid: 'Hybride',
  Electric: 'Électrique',
};

const categoryToDb = {
  SUV: 'SUV',
  Berline: 'BERLINE',
  BERLINE: 'BERLINE',
  Luxe: 'LUXE',
  LUXE: 'LUXE',
  'Économique': 'ECONOMIQUE',
  Economique: 'ECONOMIQUE',
  ECONOMIQUE: 'ECONOMIQUE',
  Utilitaire: 'UTILITAIRE',
  UTILITAIRE: 'UTILITAIRE',
  'Pick-up': 'PICKUP',
  PICKUP: 'PICKUP',
  Cabriolet: 'CABRIOLET',
  CABRIOLET: 'CABRIOLET',
  Monospace: 'MONOSPACE',
  MONOSPACE: 'MONOSPACE',
};

const categoryFromDb = {
  SUV: 'SUV',
  BERLINE: 'Berline',
  LUXE: 'Luxe',
  ECONOMIQUE: 'Économique',
  UTILITAIRE: 'Utilitaire',
  PICKUP: 'Pick-up',
  CABRIOLET: 'Cabriolet',
  MONOSPACE: 'Monospace',
};

const contractStatusFromDb = {
  DRAFT: 'Paiement En Attente',
  PENDING_PAYMENT: 'Paiement En Attente',
  ACTIVE: 'Actif',
  COMPLETED: 'Terminé',
  CANCELLED: 'Annulé',
};

const toSlug = (value) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '') || 'djambo';

const buildDefaultSettings = ({ user, ownerProfile, settingsRow }) => {
  const businessName = settingsRow?.business_name || ownerProfile?.display_name || user.full_name || 'Djambo Mobility';
  const city = settingsRow?.city || ownerProfile?.city || user.profile_data?.city || 'Dakar';
  const responseTime = settingsRow?.response_time || ownerProfile?.response_time || 'Reponse en moins de 30 min';
  const storeSlug = settingsRow?.store_slug || toSlug(businessName);

  return {
    businessName,
    publicEmail: settingsRow?.public_email || user.email || 'contact@djambo-app.com',
    supportPhone: settingsRow?.support_phone || user.phone || ownerProfile?.whatsapp || '',
    city,
    responseTime,
    storeSlug,
    publicStoreUrl: settingsRow?.public_store_url || `${normalizedAppUrl}/#/store/${storeSlug}`,
    publicProfileUrl: settingsRow?.public_profile_url || `${normalizedAppUrl}/#/profile/${storeSlug}`,
    chauffeurOnDemand: settingsRow?.chauffeur_on_demand ?? true,
    chauffeurDailyRate: String(settingsRow?.chauffeur_daily_rate ?? 30000),
    deliveryEnabled: settingsRow?.delivery_enabled ?? true,
    whatsappEnabled: settingsRow?.whatsapp_enabled ?? true,
    contractSignatureEnabled: settingsRow?.contract_signature_enabled ?? true,
    notificationsEmail: settingsRow?.notifications_email ?? true,
    notificationsSms: settingsRow?.notifications_sms ?? false,
    brandLogo: normalizeStoredMediaUrl(settingsRow?.brand_logo) || undefined,
    storefrontCover: normalizeStoredMediaUrl(settingsRow?.storefront_cover) || undefined,
    contractBanner: normalizeStoredMediaUrl(settingsRow?.contract_banner) || undefined,
  };
};

const mapParkingSummary = (parking, vehiclesByParking = {}) => ({
  ...parking,
  location_editable_after: getParkingLocationEditableAfter(parking.location_updated_at),
  vehicles: vehiclesByParking[parking.id] || [],
});

const getOwnerProfileByUserId = async (userId) => {
  const ownerRows = await sql`
    select *
    from owner_profiles
    where user_id = ${userId}
    limit 1;
  `;

  return ownerRows[0] || null;
};

const getCustomerSummariesByUserId = async (userId) => {
  const ownerRows = await sql`
    select id
    from owner_profiles
    where user_id = ${userId}
    limit 1;
  `;

  if (ownerRows.length === 0) {
    return [];
  }

  const ownerId = ownerRows[0].id;
  const customerRows = await sql`
    with customer_activity as (
      select
        u.id,
        u.full_name,
        u.email,
        coalesce(u.phone, '') as phone,
        b.total_price::int as amount,
        b.created_at as activity_at,
        v.title as vehicle_title,
        'BOOKING'::text as source,
        null::text as manual_intent
      from bookings b
      join app_users u on u.id = b.renter_id
      join vehicles v on v.id = b.vehicle_id
      where b.owner_id = ${ownerId}

      union all

      select
        u.id,
        u.full_name,
        u.email,
        coalesce(u.phone, '') as phone,
        coalesce(vr.estimated_total, vr.offered_price, 0)::int as amount,
        vr.created_at as activity_at,
        coalesce(v.title, vr.vehicle_title) as vehicle_title,
        'REQUEST'::text as source,
        null::text as manual_intent
      from vehicle_requests vr
      join app_users u on u.id = vr.user_id
      left join vehicles v on v.id = vr.vehicle_id
      where vr.owner_id = ${ownerId}

      union all

      select
        u.id,
        u.full_name,
        u.email,
        coalesce(u.phone, '') as phone,
        0::int as amount,
        coalesce(nullif(u.profile_data ->> 'manualCreatedAt', '')::timestamptz, now()) as activity_at,
        null::text as vehicle_title,
        'MANUAL'::text as source,
        upper(nullif(u.profile_data ->> 'clientIntent', ''))::text as manual_intent
      from app_users u
      where u.role = 'USER'
        and coalesce(u.profile_data ->> 'createdByOwnerId', '') = ${ownerId}::text
    )
    select
      id,
      full_name,
      email,
      phone,
      count(*) filter (where source = 'BOOKING')::int as total_bookings,
      count(*) filter (where source = 'REQUEST')::int as total_requests,
      coalesce(sum(amount) filter (where source = 'BOOKING'), 0)::int as total_spent,
      max(activity_at) as last_activity_at,
      (array_remove(array_agg(vehicle_title order by activity_at desc), null))[1] as preferred_vehicle,
      (array_remove(array_agg(manual_intent order by activity_at desc), null))[1] as interest_type
    from customer_activity
    group by id, full_name, email, phone
    order by last_activity_at desc nulls last;
  `;

  return customerRows.map((customer) => {
    const nameParts = String(customer.full_name || '').trim().split(/\s+/).filter(Boolean);
    const firstName = nameParts[0] || 'Client';
    const lastName = nameParts.slice(1).join(' ') || 'Djambo';
    const lastActivityAt = customer.last_activity_at ? new Date(customer.last_activity_at) : null;
    const daysSinceActivity = lastActivityAt
      ? Math.floor((Date.now() - lastActivityAt.getTime()) / 86400000)
      : Number.POSITIVE_INFINITY;

    return {
      id: customer.id,
      firstName,
      lastName,
      fullName: customer.full_name,
      email: customer.email,
      phone: customer.phone,
      status: daysSinceActivity <= 45 ? 'Actif' : 'A relancer',
      totalBookings: customer.total_bookings,
      totalRequests: customer.total_requests,
      totalSpent: customer.total_spent,
      lastActivityAt: customer.last_activity_at,
      preferredVehicle: customer.preferred_vehicle,
      interestType: customer.interest_type === 'BUY' ? 'BUY' : customer.interest_type === 'RENT' ? 'RENT' : null,
    };
  });
};

const buildCustomerSummaryPayload = ({
  id,
  fullName,
  email,
  phone,
  totalBookings = 0,
  totalRequests = 0,
  totalSpent = 0,
  lastActivityAt = null,
  preferredVehicle = null,
  interestType = null,
}) => {
  const nameParts = String(fullName || '').trim().split(/\s+/).filter(Boolean);
  const firstName = nameParts[0] || 'Client';
  const lastName = nameParts.slice(1).join(' ') || 'Djambo';
  const resolvedLastActivityAt = lastActivityAt ? new Date(lastActivityAt) : null;
  const daysSinceActivity = resolvedLastActivityAt
    ? Math.floor((Date.now() - resolvedLastActivityAt.getTime()) / 86400000)
    : Number.POSITIVE_INFINITY;

  return {
    id,
    firstName,
    lastName,
    fullName,
    email,
    phone,
    status: daysSinceActivity <= 45 ? 'Actif' : 'A relancer',
    totalBookings,
    totalRequests,
    totalSpent,
    lastActivityAt,
    preferredVehicle,
    interestType: interestType === 'BUY' ? 'BUY' : interestType === 'RENT' ? 'RENT' : null,
  };
};

const resolveContractCustomerForOwner = async ({ ownerProfile, customerId }) => {
  const [customer] = await sql`
    select
      u.id,
      u.full_name,
      u.email,
      coalesce(u.phone, '') as phone,
      u.role,
      u.profile_data,
      exists (
        select 1
        from bookings b
        where b.owner_id = ${ownerProfile.id}
          and b.renter_id = u.id
      ) as has_booking_relation,
      exists (
        select 1
        from vehicle_requests vr
        where vr.owner_id = ${ownerProfile.id}
          and vr.user_id = u.id
      ) as has_request_relation
    from app_users u
    where u.id = ${customerId}::uuid
    limit 1;
  `;

  if (!customer || customer.role !== 'USER') {
    return null;
  }

  const profileData = customer.profile_data && typeof customer.profile_data === 'object'
    ? customer.profile_data
    : {};
  const linkedOwnerId = sanitizeText(profileData.createdByOwnerId);
  const alreadyOwned = linkedOwnerId === ownerProfile.id;
  const relatedToOwner = alreadyOwned || customer.has_booking_relation || customer.has_request_relation;

  if (relatedToOwner) {
    return {
      id: customer.id,
      full_name: customer.full_name,
      email: customer.email,
      phone: customer.phone,
    };
  }

  if (linkedOwnerId && linkedOwnerId !== ownerProfile.id) {
    return 'linked-elsewhere';
  }

  const manualCreatedAt = sanitizeText(profileData.manualCreatedAt) || new Date().toISOString();
  const [linkedCustomer] = await sql`
    update app_users
    set profile_data = ${JSON.stringify({
      ...profileData,
      createdByOwnerId: ownerProfile.id,
      manualCreatedAt,
      source: profileData.source || 'contract-auto-link',
      clientIntent: profileData.clientIntent || 'RENT',
    })}::jsonb
    where id = ${customer.id}::uuid
    returning id, full_name, email, coalesce(phone, '') as phone;
  `;

  return linkedCustomer || null;
};

const sendResendEmail = async ({ to, subject, html, text }) => {
  if (!resendApiKey) {
    if (isProduction) {
      throw new Error('RESEND_API_KEY is missing from environment');
    }

    console.warn(`[email:dev-fallback] ${subject} -> ${to}`);
    console.warn(text);
    return { simulated: true };
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: resendFromEmail,
      to: [to],
      subject,
      html,
      text,
    }),
  });

  if (!response.ok) {
    const payload = await response.text();
    if (response.status === 403 && payload.includes('only send testing emails')) {
      throw new Error('Resend accepte bien votre domaine expéditeur, mais le compte est encore limité aux emails de test. Il faut activer l’envoi production dans Resend pour envoyer à d’autres destinataires.');
    }
    throw new Error(`Resend error: ${payload}`);
  }

  return { simulated: false };
};

const sendVerificationEmail = async ({ to, name, verificationUrl, role }) => {
  const html = `
    <div style="font-family:Arial,sans-serif;background:#f7f5f0;padding:32px;color:#0f172a;">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:24px;padding:32px;border:1px solid #e2e8f0;box-shadow:0 24px 60px rgba(15,23,42,0.08);">
        <p style="font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#4f46e5;margin:0 0 16px;">Djambo</p>
        <h1 style="font-size:28px;line-height:1.2;margin:0 0 12px;">Confirmez votre adresse email</h1>
        <p style="font-size:15px;line-height:1.6;color:#475569;margin:0 0 16px;">Bonjour ${name}, votre compte ${role.toLowerCase()} a bien ete cree. Cliquez sur le bouton ci-dessous pour activer l'acces.</p>
        <div style="margin:28px 0;">
          <a href="${verificationUrl}" style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;padding:14px 22px;border-radius:16px;font-weight:700;">Confirmer mon email</a>
        </div>
        <p style="font-size:13px;line-height:1.6;color:#64748b;margin:0 0 10px;">Ce lien expire dans 24 heures.</p>
        <p style="font-size:13px;line-height:1.6;color:#64748b;margin:0;">Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :</p>
        <p style="font-size:12px;line-height:1.6;color:#334155;word-break:break-all;margin-top:8px;">${verificationUrl}</p>
      </div>
    </div>
  `;

  return sendResendEmail({
    to,
    subject: 'Confirmez votre email Djambo',
    html,
    text: `Bonjour ${name}, confirmez votre adresse email Djambo ici : ${verificationUrl}`,
  });
};

const sendPasswordResetEmail = async ({ to, name, resetUrl }) => {
  const html = `
    <div style="font-family:Arial,sans-serif;background:#f7f5f0;padding:32px;color:#0f172a;">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:24px;padding:32px;border:1px solid #e2e8f0;box-shadow:0 24px 60px rgba(15,23,42,0.08);">
        <p style="font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#4f46e5;margin:0 0 16px;">Djambo</p>
        <h1 style="font-size:28px;line-height:1.2;margin:0 0 12px;">Reinitialisez votre mot de passe</h1>
        <p style="font-size:15px;line-height:1.6;color:#475569;margin:0 0 16px;">Bonjour ${name}, nous avons recu une demande de reinitialisation de mot de passe pour votre compte Djambo.</p>
        <div style="margin:28px 0;">
          <a href="${resetUrl}" style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;padding:14px 22px;border-radius:16px;font-weight:700;">Choisir un nouveau mot de passe</a>
        </div>
        <p style="font-size:13px;line-height:1.6;color:#64748b;margin:0 0 10px;">Ce lien expire dans 30 minutes.</p>
        <p style="font-size:13px;line-height:1.6;color:#64748b;margin:0;">Si vous n'etes pas a l'origine de cette demande, ignorez simplement cet email.</p>
        <p style="font-size:12px;line-height:1.6;color:#334155;word-break:break-all;margin-top:8px;">${resetUrl}</p>
      </div>
    </div>
  `;

  return sendResendEmail({
    to,
    subject: 'Reinitialisation de mot de passe Djambo',
    html,
    text: `Bonjour ${name}, reinitialisez votre mot de passe Djambo ici : ${resetUrl}`,
  });
};

const renderVerificationPage = ({ title, description, success }) => `
  <!DOCTYPE html>
  <html lang="fr">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; background: #f7f5f0; color: #0f172a; display:flex; align-items:center; justify-content:center; min-height:100vh; margin:0; padding:24px; }
        .card { width:min(560px,100%); background:#fff; border:1px solid #e2e8f0; border-radius:24px; padding:32px; box-shadow:0 24px 60px rgba(15,23,42,.08); }
        .badge { display:inline-block; padding:8px 12px; border-radius:999px; font-size:12px; font-weight:700; letter-spacing:.18em; text-transform:uppercase; background:${success ? '#dcfce7' : '#fef3c7'}; color:${success ? '#166534' : '#92400e'}; }
        h1 { font-size:28px; margin:16px 0 12px; }
        p { font-size:15px; line-height:1.6; color:#475569; }
        a { display:inline-block; margin-top:18px; text-decoration:none; background:#0f172a; color:#fff; padding:14px 20px; border-radius:14px; font-weight:700; }
      </style>
    </head>
    <body>
      <div class="card">
        <span class="badge">${success ? 'Compte active' : 'Lien invalide'}</span>
        <h1>${title}</h1>
        <p>${description}</p>
        <a href="${normalizedAppUrl}/#/login">Aller a la connexion</a>
      </div>
    </body>
  </html>
`;

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || localOriginPattern.test(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origin not allowed by CORS: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '12mb' }));
const rawImageUpload = express.raw({
  type: (req) => String(req.headers['content-type'] || '').startsWith('image/'),
  limit: `${maxUploadSizeMb}mb`,
});
app.use('/media', express.static(mediaDirectory, {
  fallthrough: false,
  maxAge: '7d',
  setHeaders: (res, filePath) => {
    if (path.extname(filePath).toLowerCase() === '.mp4') {
      res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
    }
  },
}));

app.get('/api/auth/verify-email', async (req, res) => {
  try {
    const token = typeof req.query.token === 'string' ? req.query.token : '';
    if (!token) {
      return res.status(400).send(renderVerificationPage({
        title: 'Lien de confirmation manquant',
        description: 'Le lien de verification est incomplet. Relancez votre inscription pour recevoir un nouvel email.',
        success: false,
      }));
    }

    const tokenHash = hashVerificationToken(token);
    const verifiedUser = await sql.begin(async (transaction) => {
      const tokenRows = await transaction`
        select evt.id, evt.user_id, au.full_name
        from email_verification_tokens evt
        join app_users au on au.id = evt.user_id
        where evt.token_hash = ${tokenHash}
          and evt.consumed_at is null
          and evt.expires_at > now()
        limit 1
        for update;
      `;

      if (tokenRows.length === 0) {
        return null;
      }

      const verification = tokenRows[0];

      await transaction`
        update app_users
        set email_verified = true
        where id = ${verification.user_id};
      `;

      await transaction`
        update email_verification_tokens
        set consumed_at = now()
        where id = ${verification.id};
      `;

      return verification;
    });

    if (!verifiedUser) {
      return res.status(400).send(renderVerificationPage({
        title: 'Lien de confirmation invalide',
        description: 'Ce lien a deja ete utilise ou a expire. Reinscrivez-vous ou demandez un nouvel email.',
        success: false,
      }));
    }

    return res.send(renderVerificationPage({
      title: 'Adresse email confirmee',
      description: `${verifiedUser.full_name}, votre compte est maintenant active. Vous pouvez vous connecter a Djambo.`,
      success: true,
    }));
  } catch (error) {
    console.error(error);
    return res.status(500).send(renderVerificationPage({
      title: 'Verification indisponible',
      description: 'Une erreur est survenue pendant la verification. Reessayez dans quelques instants.',
      success: false,
    }));
  }
});

app.get('/api/health', async (_req, res) => {
  const now = await sql`select now() as now`;
  res.json({ ok: true, service: 'djambo-api', now: now[0].now });
});

app.get('/api/marketplace/vehicles', async (_req, res) => {
  try {
    return res.json(await getPublicVehicles());
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Marketplace vehicles fetch failed' });
  }
});

app.get('/api/marketplace/vehicles/:vehicleId', async (req, res) => {
  try {
    const vehicle = await getPublicVehicleById(req.params.vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    await sql`
      update vehicles
      set view_count = view_count + 1
      where id = ${req.params.vehicleId};
    `;

    const [refreshedVehicle, reviews, relatedVehicles] = await Promise.all([
      getPublicVehicleById(req.params.vehicleId),
      getPublicReviewsByVehicleId(req.params.vehicleId),
      (async () => {
        let rows;
        try {
          rows = await sql`
            ${publicVehicleSelect()}
            from vehicles v
            join owner_profiles op on op.id = v.owner_id
            left join app_settings aps on aps.user_id = op.user_id
            where v.id <> ${req.params.vehicleId}
              and v.city = ${vehicle.city}
              and (v.is_for_rent = true or v.is_for_sale = true)
            order by v.is_featured desc, v.created_at desc
            limit 3;
          `;
        } catch (error) {
          if (!isMissingPublicProfileColumnError(error)) {
            throw error;
          }

          rows = await sql`
            ${publicVehicleSelect({ includeStoreSlug: false, includeOwnerType: false })}
            from vehicles v
            join owner_profiles op on op.id = v.owner_id
            where v.id <> ${req.params.vehicleId}
              and v.city = ${vehicle.city}
              and (v.is_for_rent = true or v.is_for_sale = true)
            order by v.is_featured desc, v.created_at desc
            limit 3;
          `;
        }
        return rows.map(mapPublicVehicle);
      })(),
    ]);

    return res.json({ vehicle: refreshedVehicle, reviews, relatedVehicles });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Vehicle detail fetch failed' });
  }
});

app.post('/api/marketplace/vehicles/:vehicleId/reviews', async (req, res) => {
  try {
    const userId = getRequestUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'Connectez-vous pour laisser un avis.' });
    }

    const vehicle = await sql`
      select v.id, v.owner_id, op.user_id as owner_user_id
      from vehicles v
      join owner_profiles op on op.id = v.owner_id
      where v.id = ${req.params.vehicleId}
      limit 1;
    `;

    if (vehicle.length === 0) {
      return res.status(404).json({ message: 'Vehicule introuvable.' });
    }

    const targetVehicle = vehicle[0];
    if (targetVehicle.owner_user_id === userId) {
      return res.status(403).json({ message: 'Vous ne pouvez pas commenter votre propre vehicule.' });
    }

    const rating = Math.max(1, Math.min(5, Number(req.body?.rating) || 0));
    const comment = sanitizeText(req.body?.comment);
    if (!rating || !comment) {
      return res.status(400).json({ message: 'La note et le commentaire sont requis.' });
    }

    await sql`
      insert into reviews (vehicle_id, owner_id, user_id, rating, comment)
      values (${targetVehicle.id}, ${targetVehicle.owner_id}, ${userId}, ${rating}, ${comment})
      on conflict (vehicle_id, user_id)
      do update set rating = excluded.rating, comment = excluded.comment, created_at = now();
    `;

    await refreshVehicleAndOwnerRatings(targetVehicle.id, targetVehicle.owner_id);

    const [updatedVehicle, updatedReviews] = await Promise.all([
      getPublicVehicleById(targetVehicle.id),
      getPublicReviewsByVehicleId(targetVehicle.id),
    ]);

    return res.status(201).json({
      vehicle: updatedVehicle,
      reviews: updatedReviews,
      review: updatedReviews[0] || null,
      message: 'Votre avis a bien ete enregistre.',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Impossible d enregistrer votre avis.' });
  }
});

app.get('/api/marketplace/owners/:ownerId', async (req, res) => {
  try {
    let rows;
    try {
      rows = await sql`
        select op.id, op.user_id, op.type, op.display_name, op.description, op.address, op.city, op.country,
               op.rating, op.review_count, op.vehicle_count, op.verified, op.whatsapp, op.response_time, op.member_since,
               aps.store_slug
        from owner_profiles op
        left join app_settings aps on aps.user_id = op.user_id
        where op.id = ${req.params.ownerId}
        limit 1;
      `;
    } catch (error) {
      if (!isMissingPublicProfileColumnError(error)) {
        throw error;
      }

      rows = await sql`
        select op.id, op.user_id, null::text as type, op.display_name, op.description, op.address, op.city, op.country,
               op.rating, op.review_count, op.vehicle_count, op.verified, op.whatsapp, op.response_time, op.member_since,
               null::text as store_slug
        from owner_profiles op
        where op.id = ${req.params.ownerId}
        limit 1;
      `;
    }

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Owner not found' });
    }

    const ownerProfile = mapPublicOwnerProfile(rows[0]);
    const [vehicles, reviews] = await Promise.all([
      (async () => {
        let vehicleRows;
        try {
          vehicleRows = await sql`
            ${publicVehicleSelect()}
            from vehicles v
            join owner_profiles op on op.id = v.owner_id
            left join app_settings aps on aps.user_id = op.user_id
            where v.owner_id = ${req.params.ownerId}
              and (v.is_for_rent = true or v.is_for_sale = true)
            order by v.is_featured desc, v.created_at desc;
          `;
        } catch (error) {
          if (!isMissingPublicProfileColumnError(error)) {
            throw error;
          }

          vehicleRows = await sql`
            ${publicVehicleSelect({ includeStoreSlug: false, includeOwnerType: false })}
            from vehicles v
            join owner_profiles op on op.id = v.owner_id
            where v.owner_id = ${req.params.ownerId}
              and (v.is_for_rent = true or v.is_for_sale = true)
            order by v.is_featured desc, v.created_at desc;
          `;
        }
        return vehicleRows.map(mapPublicVehicle);
      })(),
      getPublicReviewsByOwnerId(req.params.ownerId),
    ]);

    return res.json({ ownerProfile, vehicles, reviews });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Owner profile fetch failed' });
  }
});

app.get('/api/storefront/:slug', async (req, res) => {
  try {
    let ownerRows;
    try {
      ownerRows = await sql`
         select op.id, op.user_id, op.type, op.display_name, op.description, op.address, op.city, op.country,
               op.rating, op.review_count, op.vehicle_count, op.verified, op.whatsapp, op.response_time, op.member_since,
               aps.store_slug
        from owner_profiles op
        left join app_settings aps on aps.user_id = op.user_id
        order by op.display_name;
      `;
    } catch (error) {
      if (!isMissingPublicProfileColumnError(error)) {
        throw error;
      }

      ownerRows = await sql`
        select op.id, op.user_id, null::text as type, op.display_name, op.description, op.address, op.city, op.country,
               op.rating, op.review_count, op.vehicle_count, op.verified, op.whatsapp, op.response_time, op.member_since,
               null::text as store_slug
        from owner_profiles op
        order by op.display_name;
      `;
    }

    const matchedOwner = ownerRows.find((row) => (row.store_slug || toSlug(row.display_name)) === req.params.slug);
    if (!matchedOwner) {
      return res.status(404).json({ message: 'Storefront not found' });
    }

    const ownerProfile = mapPublicOwnerProfile(matchedOwner);
    let vehicleRows;
    try {
      vehicleRows = await sql`
        ${publicVehicleSelect()}
        from vehicles v
        join owner_profiles op on op.id = v.owner_id
        left join app_settings aps on aps.user_id = op.user_id
        where v.owner_id = ${matchedOwner.id}
          and (v.is_for_rent = true or v.is_for_sale = true)
        order by v.is_featured desc, v.created_at desc;
      `;
    } catch (error) {
      if (!isMissingPublicProfileColumnError(error)) {
        throw error;
      }

      vehicleRows = await sql`
        ${publicVehicleSelect({ includeStoreSlug: false, includeOwnerType: false })}
        from vehicles v
        join owner_profiles op on op.id = v.owner_id
        where v.owner_id = ${matchedOwner.id}
          and (v.is_for_rent = true or v.is_for_sale = true)
        order by v.is_featured desc, v.created_at desc;
      `;
    }

    return res.json({ ownerProfile, vehicles: vehicleRows.map(mapPublicVehicle) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Storefront fetch failed' });
  }
});

app.get('/api/customers', async (req, res) => {
  try {
    const userId = getRequestUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'Missing user id' });
    }

    const customers = await getCustomerSummariesByUserId(userId);
    return res.json(customers);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Customers fetch failed' });
  }
});

app.get('/api/customers/registered-users', async (req, res) => {
  try {
    const userId = getRequestUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'Missing user id' });
    }

    const ownerProfile = await getOwnerProfileByUserId(userId);
    if (!ownerProfile) {
      return res.status(403).json({ message: 'Owner profile required' });
    }

    const searchTerm = sanitizeText(req.query?.query || '');
    const searchPattern = `%${searchTerm.toLowerCase()}%`;
    const rows = await sql`
      select
        u.id,
        u.full_name,
        u.email,
        coalesce(u.phone, '') as phone,
        coalesce(u.profile_data ->> 'createdByOwnerId', '') as linked_owner_id
      from app_users u
      where u.role = 'USER'
        and (
          coalesce(u.profile_data ->> 'createdByOwnerId', '') = ''
          or coalesce(u.profile_data ->> 'createdByOwnerId', '') = ${ownerProfile.id}::text
        )
        and (
          ${searchTerm ? sql`
            lower(u.full_name) like ${searchPattern}
            or lower(u.email) like ${searchPattern}
            or lower(coalesce(u.phone, '')) like ${searchPattern}
          ` : sql`true`}
        )
      order by
        case when coalesce(u.profile_data ->> 'createdByOwnerId', '') = ${ownerProfile.id}::text then 0 else 1 end,
        u.full_name asc
      limit 12;
    `;

    return res.json(rows.map((row) => ({
      id: row.id,
      fullName: row.full_name,
      email: row.email,
      phone: row.phone,
      linkedToCurrentOwner: row.linked_owner_id === ownerProfile.id,
    })));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Registered users fetch failed' });
  }
});

app.post('/api/customers', async (req, res) => {
  try {
    const userId = getRequestUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'Missing user id' });
    }

    const ownerProfile = await getOwnerProfileByUserId(userId);
    if (!ownerProfile) {
      return res.status(403).json({ message: 'Owner profile required' });
    }

    const fullName = sanitizeText(req.body?.fullName);
    const email = sanitizeText(req.body?.email).toLowerCase();
    const phone = sanitizeText(req.body?.phone);
    const interestType = req.body?.interestType === 'BUY' ? 'BUY' : 'RENT';

    if (!fullName || !email || !phone) {
      return res.status(400).json({ message: 'Nom, email et telephone sont requis.' });
    }

    const existingUsers = await sql`
      select id, full_name, email, coalesce(phone, '') as phone, role, profile_data
      from app_users
      where email = ${email}
      limit 1;
    `;

    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0];
      const existingProfileData = existingUser.profile_data && typeof existingUser.profile_data === 'object'
        ? existingUser.profile_data
        : {};
      const linkedOwnerId = sanitizeText(existingProfileData.createdByOwnerId);

      if (existingUser.role !== 'USER') {
        return res.status(409).json({ message: 'Cet email est deja utilise par un autre type de compte.' });
      }

      if (linkedOwnerId && linkedOwnerId !== ownerProfile.id) {
        return res.status(409).json({ message: 'Ce client est deja rattache a un autre espace proprietaire.' });
      }

      const linkedAt = sanitizeText(existingProfileData.manualCreatedAt) || new Date().toISOString();
      const updatedUsers = await sql`
        update app_users
        set phone = ${phone || existingUser.phone || null},
            profile_data = ${JSON.stringify({
              ...existingProfileData,
              createdByOwnerId: ownerProfile.id,
              manualCreatedAt: linkedAt,
              clientIntent: interestType,
              source: existingProfileData.source || 'dashboard-manual-customer',
            })}::jsonb
        where id = ${existingUser.id}::uuid
        returning id, full_name, email, coalesce(phone, '') as phone;
      `;

      return res.status(200).json(buildCustomerSummaryPayload({
        id: updatedUsers[0].id,
        fullName: updatedUsers[0].full_name,
        email: updatedUsers[0].email,
        phone: updatedUsers[0].phone,
        lastActivityAt: linkedAt,
        interestType,
      }));
    }

    const createdAt = new Date().toISOString();
    const generatedPassword = crypto.randomBytes(18).toString('hex');

    const insertedUsers = await sql`
      insert into app_users (full_name, email, password_hash, role, email_verified, phone, profile_data)
      values (
        ${fullName},
        ${email},
        ${hashPassword(generatedPassword)},
        ${'USER'}::user_role,
        true,
        ${phone},
        ${JSON.stringify({
          createdByOwnerId: ownerProfile.id,
          manualCreatedAt: createdAt,
          clientIntent: interestType,
          source: 'dashboard-manual-customer',
        })}::jsonb
      )
      returning id, full_name, email, coalesce(phone, '') as phone;
    `;

    const createdUser = insertedUsers[0];

    return res.status(201).json(buildCustomerSummaryPayload({
      id: createdUser.id,
      fullName: createdUser.full_name,
      email: createdUser.email,
      phone: createdUser.phone,
      lastActivityAt: createdAt,
      interestType,
    }));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Customer creation failed' });
  }
});

app.post('/api/uploads/vehicle-image', rawImageUpload, async (req, res) => {
  try {
    const userId = getRequestUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'Missing user id' });
    }

    const ownerProfile = await getOwnerProfileByUserId(userId);
    if (!ownerProfile) {
      return res.status(403).json({ message: 'Owner profile required' });
    }

    const contentType = String(req.headers['content-type'] || '').toLowerCase();
    if (!allowedUploadContentTypes.has(contentType)) {
      return res.status(400).json({ message: 'Format image non supporte. Utilisez JPG, PNG, WebP ou AVIF.' });
    }

    const body = req.body;
    if (!Buffer.isBuffer(body) || body.length === 0) {
      return res.status(400).json({ message: 'Aucun fichier image recu.' });
    }

    if (body.length > maxUploadSizeBytes) {
      return res.status(413).json({ message: `Image trop lourde. Maximum autorise: ${maxUploadSizeMb} Mo.` });
    }

    const fileNameHeader = sanitizeText(String(req.headers['x-file-name'] || 'vehicle-image'));
    const uploadResult = await uploadBufferToR2({
      folder: 'vehicles',
      actorId: ownerProfile.id,
      defaultName: 'vehicle',
      buffer: body,
      contentType,
      fileName: decodeURIComponent(fileNameHeader || 'vehicle-image'),
    });

    return res.status(201).json(uploadResult);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error instanceof Error ? error.message : 'Upload image impossible.' });
  }
});

app.post('/api/uploads/media', rawImageUpload, async (req, res) => {
  try {
    const userId = getRequestUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'Missing user id' });
    }

    const contentType = String(req.headers['content-type'] || '').toLowerCase();
    if (!allowedUploadContentTypes.has(contentType)) {
      return res.status(400).json({ message: 'Format image non supporte. Utilisez JPG, PNG, WebP ou AVIF.' });
    }

    const scopeHeader = sanitizeText(String(req.headers['x-upload-scope'] || '')).toLowerCase();
    const folder = allowedMediaUploadScopes.get(scopeHeader);
    if (!folder) {
      return res.status(400).json({ message: 'Type d upload non supporte.' });
    }

    const body = req.body;
    if (!Buffer.isBuffer(body) || body.length === 0) {
      return res.status(400).json({ message: 'Aucun fichier image recu.' });
    }

    if (body.length > maxUploadSizeBytes) {
      return res.status(413).json({ message: `Image trop lourde. Maximum autorise: ${maxUploadSizeMb} Mo.` });
    }

    const fileNameHeader = sanitizeText(String(req.headers['x-file-name'] || scopeHeader || 'media-image'));
    const uploadResult = await uploadBufferToR2({
      folder,
      actorId: userId,
      defaultName: scopeHeader || 'media',
      buffer: body,
      contentType,
      fileName: decodeURIComponent(fileNameHeader || 'media-image'),
    });

    return res.status(201).json(uploadResult);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error instanceof Error ? error.message : 'Upload image impossible.' });
  }
});

app.get(/^\/api\/media\/(.+)$/, async (req, res) => {
  try {
    if (!r2Client || !env.R2_BUCKET_NAME) {
      return res.status(503).json({ message: 'Le stockage media n est pas configure sur le backend.' });
    }

    const objectKey = decodeURIComponent(String(req.params[0] || '')).replace(/^\/+/, '');
    if (!objectKey) {
      return res.status(400).json({ message: 'Chemin media invalide.' });
    }

    const mediaResult = await r2Client.send(new GetObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: objectKey,
    }));

    if (!mediaResult.Body) {
      return res.status(404).json({ message: 'Media introuvable.' });
    }

    const mediaBuffer = Buffer.from(await mediaResult.Body.transformToByteArray());
    res.setHeader('Content-Type', mediaResult.ContentType || 'application/octet-stream');
    res.setHeader('Cache-Control', mediaResult.CacheControl || 'public, max-age=31536000, immutable');
    return res.status(200).send(mediaBuffer);
  } catch (error) {
    console.error(error);
    return res.status(404).json({ message: 'Media introuvable.' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, firstName, lastName, email, password, role, profileData } = req.body;
    const normalizedRole = role ?? 'USER';
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const fullName = typeof name === 'string' && name.trim()
      ? name.trim()
      : [firstName, lastName].filter(Boolean).join(' ').trim();
    const safeProfileData = {
      phone: profileData?.phone?.trim() || null,
      city: profileData?.city?.trim() || 'Dakar',
      country: profileData?.country?.trim() || 'Senegal',
      companyName: profileData?.companyName?.trim() || null,
      department: profileData?.department?.trim() || null,
      parkingName: profileData?.parkingName?.trim() || null,
      parkingCapacity: Number(profileData?.parkingCapacity || 0) || null,
      parkingAddress: profileData?.parkingAddress?.trim() || null,
      parkingLatitude: Number.isFinite(Number(profileData?.parkingLatitude)) ? Number(profileData.parkingLatitude) : null,
      parkingLongitude: Number.isFinite(Number(profileData?.parkingLongitude)) ? Number(profileData.parkingLongitude) : null,
      parkingLocationConfirmed: Boolean(profileData?.parkingLocationConfirmed),
    };

    if (!fullName || !normalizedEmail || !password) {
      return res.status(400).json({ message: 'Missing registration fields' });
    }

    if (normalizedRole === 'PARC_AUTO' && (!safeProfileData.companyName || !safeProfileData.parkingName || !safeProfileData.city || !safeProfileData.country)) {
      return res.status(400).json({ message: 'Les informations du parc auto sont incompletes.' });
    }

    if (normalizedRole === 'ADMIN' && !safeProfileData.department) {
      return res.status(400).json({ message: 'Le service d administration est requis.' });
    }

    if (normalizedRole === 'PARTICULIER' && !safeProfileData.city) {
      return res.status(400).json({ message: 'La ville est requise pour un proprietaire particulier.' });
    }

    const existing = await sql`select id from app_users where email = ${normalizedEmail}`;
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashVerificationToken(verificationToken);

    const user = await sql.begin(async (transaction) => {
      const insertedUsers = await transaction`
        insert into app_users (full_name, email, password_hash, role, email_verified, phone, profile_data)
        values (
          ${fullName},
          ${normalizedEmail},
          ${hashPassword(password)},
          ${normalizedRole}::user_role,
          false,
          ${safeProfileData.phone},
          ${JSON.stringify(safeProfileData)}::jsonb
        )
        returning id, full_name, email, role;
      `;
      const createdUser = insertedUsers[0];

      if (createdUser.role === 'PARTICULIER' || createdUser.role === 'PARC_AUTO') {
        const displayName = createdUser.role === 'PARC_AUTO'
          ? safeProfileData.companyName || fullName
          : fullName;

        await transaction`
          insert into owner_profiles (user_id, display_name, description, address, city, country, whatsapp, verified, response_time, member_since)
          values (
            ${createdUser.id},
            ${displayName},
            ${createdUser.role === 'PARC_AUTO' ? 'Nouvelle structure Djambo' : 'Nouveau profil Djambo'},
            ${''},
            ${safeProfileData.city},
            ${safeProfileData.country},
            ${safeProfileData.phone},
            false,
            ${'Repond en moins de 24h'},
            current_date
          )
          on conflict (user_id) do nothing;
        `;
      }

      if (createdUser.role === 'PARC_AUTO') {
        await transaction`
          insert into parkings (
            owner_id,
            name,
            city,
            address,
            access_type,
            opening_hours,
            security_features,
            capacity_total,
            latitude,
            longitude,
            location_source,
            location_confirmed_at,
            location_updated_at
          )
          select
            id,
            ${safeProfileData.parkingName},
            ${safeProfileData.city},
            ${safeProfileData.parkingAddress || safeProfileData.city || 'Adresse a completer'},
            ${'standard'},
            ${'24/7'},
            ${['Camera']},
            ${safeProfileData.parkingCapacity || 10},
            ${safeProfileData.parkingLatitude},
            ${safeProfileData.parkingLongitude},
            ${safeProfileData.parkingLocationConfirmed ? 'gps_confirmed' : 'manual'},
            ${safeProfileData.parkingLocationConfirmed ? new Date().toISOString() : null},
            ${safeProfileData.parkingLocationConfirmed ? new Date().toISOString() : null}
          from owner_profiles
          where user_id = ${createdUser.id}
          and not exists (select 1 from parkings where owner_id = owner_profiles.id);
        `;
      }

      await transaction`
        delete from email_verification_tokens
        where user_id = ${createdUser.id};
      `;

      await transaction`
        insert into email_verification_tokens (user_id, token_hash, expires_at)
        values (${createdUser.id}, ${tokenHash}, now() + interval '24 hours');
      `;

      return createdUser;
    });

    try {
      const verificationUrl = `${normalizedApiUrl}/api/auth/verify-email?token=${verificationToken}`;
      const deliveryResult = await sendVerificationEmail({
        to: user.email,
        name: user.full_name,
        verificationUrl,
        role: user.role,
      });

      if (deliveryResult?.simulated) {
        await sql.begin(async (transaction) => {
          await transaction`
            update app_users
            set email_verified = true
            where id = ${user.id};
          `;

          await transaction`
            update email_verification_tokens
            set consumed_at = now()
            where user_id = ${user.id}
              and consumed_at is null;
          `;
        });

        return res.status(201).json({
          email: user.email,
          requiresEmailVerification: false,
          message: 'Compte cree en local sans fournisseur email. Le compte a ete active automatiquement pour le developpement.',
        });
      }
    } catch (sendError) {
      await sql`delete from app_users where id = ${user.id}`;
      throw sendError;
    }

    res.status(201).json({
      email: user.email,
      requiresEmailVerification: true,
      message: 'Un email de confirmation a ete envoye. Activez votre compte avant de vous connecter.',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error instanceof Error ? error.message : 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await sql`select id, full_name, email, role, phone, password_hash, email_verified from app_users where email = ${email}`;
    if (result.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const user = result[0];
    if (user.password_hash !== hashPassword(password)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    if (!user.email_verified) {
      return res.status(403).json({ message: 'Veuillez confirmer votre adresse email avant de vous connecter.' });
    }

    res.json({ id: user.id, name: user.full_name, email: user.email, role: user.role, phone: user.phone || undefined });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Login failed' });
  }
});

app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    if (!email) {
      return res.status(400).json({ message: 'Adresse email requise.' });
    }

    const users = await sql`
      select id, full_name, email, email_verified
      from app_users
      where email = ${email}
      limit 1;
    `;

    if (users.length === 0 || !users[0].email_verified) {
      return res.json({ message: 'Si un compte existe avec cet email, un message de reinitialisation a ete envoye.' });
    }

    const user = users[0];
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashVerificationToken(resetToken);

    await sql.begin(async (transaction) => {
      await transaction`
        delete from password_reset_tokens
        where user_id = ${user.id};
      `;

      await transaction`
        insert into password_reset_tokens (user_id, token_hash, expires_at)
        values (${user.id}, ${tokenHash}, now() + interval '30 minutes');
      `;
    });

    const resetUrl = `${normalizedAppUrl}/#/reset-password?token=${resetToken}`;
    await sendPasswordResetEmail({
      to: user.email,
      name: user.full_name,
      resetUrl,
    });

    return res.json({ message: 'Si un compte existe avec cet email, un message de reinitialisation a ete envoye.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error instanceof Error ? error.message : 'Impossible d envoyer l email de reinitialisation.' });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const token = typeof req.body.token === 'string' ? req.body.token : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    if (!token || password.length < 6) {
      return res.status(400).json({ message: 'Token invalide ou mot de passe trop court.' });
    }

    const tokenHash = hashVerificationToken(token);
    const updatedUser = await sql.begin(async (transaction) => {
      const tokenRows = await transaction`
        select prt.id, prt.user_id
        from password_reset_tokens prt
        where prt.token_hash = ${tokenHash}
          and prt.consumed_at is null
          and prt.expires_at > now()
        limit 1
        for update;
      `;

      if (tokenRows.length === 0) {
        return null;
      }

      const resetRecord = tokenRows[0];

      await transaction`
        update app_users
        set password_hash = ${hashPassword(password)}
        where id = ${resetRecord.user_id};
      `;

      await transaction`
        update password_reset_tokens
        set consumed_at = now()
        where id = ${resetRecord.id};
      `;

      return resetRecord;
    });

    if (!updatedUser) {
      return res.status(400).json({ message: 'Le lien de reinitialisation est invalide ou a expire.' });
    }

    return res.json({ message: 'Votre mot de passe a ete reinitialise avec succes.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Impossible de reinitialiser le mot de passe.' });
  }
});

app.post('/api/vehicle-requests', async (req, res) => {
  try {
    const userId = getRequestUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'Connexion requise pour envoyer une demande.' });
    }

    const requestType = normalizeVehicleRequestType(req.body.requestType);
    const bookingChannel = normalizeReservationMode(req.body.reservationMode);
    const vehicleReference = typeof req.body.vehicleId === 'string' ? req.body.vehicleId.trim() : '';
    const vehicleTitle = typeof req.body.vehicleTitle === 'string' ? req.body.vehicleTitle.trim() : '';
    const ownerName = typeof req.body.ownerName === 'string' ? req.body.ownerName.trim() : '';
    const startDate = typeof req.body.startDate === 'string' && req.body.startDate ? req.body.startDate : null;
    const endDate = typeof req.body.endDate === 'string' && req.body.endDate ? req.body.endDate : null;
    const pickupMode = typeof req.body.pickupMode === 'string' ? req.body.pickupMode.trim() : null;
    const contactPreference = typeof req.body.contactPreference === 'string' ? req.body.contactPreference.trim() : null;
    const message = typeof req.body.message === 'string' ? req.body.message.trim() : '';
    const estimatedTotal = Number.isFinite(Number(req.body.estimatedTotal)) ? Number(req.body.estimatedTotal) : null;
    const offeredPrice = Number.isFinite(Number(req.body.offeredPrice)) ? Number(req.body.offeredPrice) : null;

    const [requestUser] = await sql`
      select id, full_name, email, phone
      from app_users
      where id = ${userId}::uuid
      limit 1;
    `;

    if (!requestUser) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }

    const customerDetails = sanitizeCustomerDetails(req.body.customerDetails, requestUser);

    if (!requestType || !bookingChannel || !vehicleReference || !vehicleTitle) {
      return res.status(400).json({ message: 'Informations de demande incomplètes.' });
    }

    if (requestType === 'RENT' && (!startDate || !endDate)) {
      return res.status(400).json({ message: 'Les dates de location sont requises.' });
    }

    if (bookingChannel === 'DIRECT_APP') {
      if (!customerDetails.fullName || !customerDetails.email || !customerDetails.phone || !customerDetails.identityNumber) {
        return res.status(400).json({ message: 'Les informations d enregistrement sont requises pour une reservation directe.' });
      }

      if (requestType === 'RENT' && !customerDetails.licenseNumber) {
        return res.status(400).json({ message: 'Le numero de permis est requis pour une reservation directe.' });
      }
    }

    const matchedVehicleRows = uuidPattern.test(vehicleReference)
      ? await sql`
          select v.id, v.title, v.owner_id, v.is_for_rent, v.is_for_sale, v.is_available, v.price_per_day, op.display_name
          from vehicles v
          left join owner_profiles op on op.id = v.owner_id
          where v.id = ${vehicleReference}::uuid
          limit 1;
        `
      : await sql`
          select v.id, v.title, v.owner_id, v.is_for_rent, v.is_for_sale, v.is_available, v.price_per_day, op.display_name
          from vehicles v
          left join owner_profiles op on op.id = v.owner_id
          where lower(v.title) = lower(${vehicleTitle})
          limit 1;
        `;

    const matchedVehicle = matchedVehicleRows[0] || null;

    if (matchedVehicle && requestType === 'RENT') {
      if (!matchedVehicle.is_for_rent) {
        return res.status(400).json({ message: 'Ce vehicule n est pas disponible a la location.' });
      }
      if (!matchedVehicle.is_available) {
        return res.status(400).json({ message: 'Ce vehicule n est pas disponible pour la periode demandee.' });
      }

      const conflictingBookings = await sql`
        select id
        from bookings
        where vehicle_id = ${matchedVehicle.id}
          and status in ('PENDING', 'CONFIRMED')
          and daterange(start_date, end_date, '[]') && daterange(${startDate}, ${endDate}, '[]')
        limit 1;
      `;

      if (conflictingBookings.length > 0) {
        return res.status(409).json({ message: 'La periode choisie n est plus disponible. Merci de selectionner d autres dates.' });
      }
    }

    if (matchedVehicle && requestType === 'BUY' && !matchedVehicle.is_for_sale) {
      return res.status(400).json({ message: 'Ce vehicule n est pas propose a la vente.' });
    }

    const snapshot = {
      vehicleReference,
      vehicleTitle,
      ownerName: ownerName || matchedVehicle?.display_name || null,
      requestType,
      bookingChannel,
      startDate,
      endDate,
      pickupMode,
      contactPreference,
      estimatedTotal,
      offeredPrice,
      message,
      customerDetails,
    };

    const insertedRows = await sql`
      insert into vehicle_requests (
        user_id,
        vehicle_id,
        owner_id,
        vehicle_reference,
        vehicle_title,
        owner_name,
        request_type,
        booking_channel,
        start_date,
        end_date,
        estimated_total,
        offered_price,
        pickup_mode,
        contact_preference,
        message,
        customer_details,
        request_snapshot
      ) values (
        ${userId}::uuid,
        ${matchedVehicle?.id || null},
        ${matchedVehicle?.owner_id || null},
        ${vehicleReference},
        ${vehicleTitle},
        ${ownerName || matchedVehicle?.display_name || null},
        ${requestType},
        ${bookingChannel},
        ${startDate},
        ${endDate},
        ${estimatedTotal},
        ${offeredPrice},
        ${pickupMode},
        ${contactPreference},
        ${message || null},
        ${JSON.stringify(customerDetails)}::jsonb,
        ${JSON.stringify(snapshot)}::jsonb
      )
      returning id, request_type, status;
    `;

    return res.status(201).json({
      id: insertedRows[0].id,
      requestType: insertedRows[0].request_type,
      status: insertedRows[0].status,
      message: bookingChannel === 'ON_SITE'
        ? 'Votre demande de passage sur place a ete transmise au proprietaire.'
        : requestType === 'BUY'
        ? 'Votre intention d achat a ete enregistree et transmise au vendeur.'
        : 'Votre demande de location a ete enregistree et transmise au proprietaire.',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Impossible d enregistrer votre demande pour le moment.' });
  }
});

app.put('/api/owner/parkings/:parkingId/location', async (req, res) => {
  try {
    const userId = getRequestUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'Missing user id' });
    }

    const { parkingId } = req.params;
    if (!uuidPattern.test(parkingId)) {
      return res.status(400).json({ message: 'Parking invalide.' });
    }

    const address = sanitizeText(req.body.address);
    const city = sanitizeText(req.body.city);
    const latitude = Number(req.body.latitude);
    const longitude = Number(req.body.longitude);

    if (!address || !city || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return res.status(400).json({ message: 'Adresse ou coordonnees invalides.' });
    }

    const ownerProfile = await getOwnerProfileByUserId(userId);
    if (!ownerProfile) {
      return res.status(404).json({ message: 'Profil proprietaire introuvable.' });
    }

    const parkingRows = await sql`
      select id, name, city, address, latitude, longitude, location_confirmed_at, location_updated_at
      from parkings
      where id = ${parkingId}::uuid
        and owner_id = ${ownerProfile.id}
      limit 1;
    `;

    if (parkingRows.length === 0) {
      return res.status(404).json({ message: 'Parking introuvable.' });
    }

    const parking = parkingRows[0];
    const editableAfter = getParkingLocationEditableAfter(parking.location_updated_at);
    if (editableAfter && new Date(editableAfter).getTime() > Date.now()) {
      return res.status(423).json({
        message: `Cette localisation ne peut etre modifiee qu a partir du ${new Date(editableAfter).toLocaleDateString('fr-FR')}.`,
      });
    }

    const updatedRows = await sql`
      update parkings
      set address = ${address},
          city = ${city},
          latitude = ${latitude},
          longitude = ${longitude},
          location_source = ${'gps_confirmed'},
          location_confirmed_at = now(),
          location_updated_at = now()
      where id = ${parkingId}::uuid
      returning id, name, city, address, latitude, longitude, location_source, location_confirmed_at, location_updated_at;
    `;

    return res.json({
      ...updatedRows[0],
      location_editable_after: getParkingLocationEditableAfter(updatedRows[0].location_updated_at),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Impossible de mettre a jour la localisation du parking.' });
  }
});

app.get('/api/settings', async (req, res) => {
  try {
    const userId = getRequestUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'Missing user id' });
    }

    const [user] = await sql`
      select id, full_name, email, phone, profile_data
      from app_users
      where id = ${userId}
      limit 1;
    `;

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const ownerProfile = await getOwnerProfileByUserId(userId);
    const [settingsRow] = await sql`
      select *
      from app_settings
      where user_id = ${userId}
      limit 1;
    `;

    return res.json(buildDefaultSettings({ user, ownerProfile, settingsRow }));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Settings fetch failed' });
  }
});

app.put('/api/settings', async (req, res) => {
  try {
    const userId = getRequestUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'Missing user id' });
    }

    const payload = req.body || {};
    const supportPhone = typeof payload.supportPhone === 'string' ? payload.supportPhone.trim() : '';
    const businessName = typeof payload.businessName === 'string' ? payload.businessName.trim() : 'Djambo Mobility';
    const city = typeof payload.city === 'string' ? payload.city.trim() : 'Dakar';
    const responseTime = typeof payload.responseTime === 'string' ? payload.responseTime.trim() : 'Reponse en moins de 30 min';
    const storeSlug = toSlug(payload.storeSlug || businessName);

    const [user] = await sql`
      select id, full_name, email, phone, profile_data
      from app_users
      where id = ${userId}
      limit 1;
    `;

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const ownerProfile = await getOwnerProfileByUserId(userId);

    await sql.begin(async (transaction) => {
      await transaction`
        update app_users
        set phone = ${supportPhone || null},
            profile_data = jsonb_set(coalesce(profile_data, '{}'::jsonb), '{city}', to_jsonb(${city}), true)
        where id = ${userId};
      `;

      if (ownerProfile) {
        await transaction`
          update owner_profiles
          set display_name = ${businessName},
              city = ${city},
              response_time = ${responseTime},
              whatsapp = ${supportPhone || null}
          where user_id = ${userId};
        `;
      }

      await transaction`
        insert into app_settings (
          user_id, business_name, public_email, support_phone, city, response_time, store_slug,
          public_store_url, public_profile_url, chauffeur_on_demand, chauffeur_daily_rate,
          delivery_enabled, whatsapp_enabled, contract_signature_enabled,
          notifications_email, notifications_sms, brand_logo, storefront_cover, contract_banner
        ) values (
          ${userId},
          ${businessName},
          ${typeof payload.publicEmail === 'string' ? payload.publicEmail.trim() : user.email},
          ${supportPhone || null},
          ${city},
          ${responseTime},
          ${storeSlug},
          ${typeof payload.publicStoreUrl === 'string' ? payload.publicStoreUrl.trim() : `${normalizedAppUrl}/#/store/${storeSlug}`},
          ${typeof payload.publicProfileUrl === 'string' ? payload.publicProfileUrl.trim() : `${normalizedAppUrl}/#/profile/${storeSlug}`},
          ${Boolean(payload.chauffeurOnDemand)},
          ${Number(payload.chauffeurDailyRate || 0) || 0},
          ${Boolean(payload.deliveryEnabled)},
          ${Boolean(payload.whatsappEnabled)},
          ${Boolean(payload.contractSignatureEnabled)},
          ${Boolean(payload.notificationsEmail)},
          ${Boolean(payload.notificationsSms)},
          ${typeof payload.brandLogo === 'string' ? payload.brandLogo : null},
          ${typeof payload.storefrontCover === 'string' ? payload.storefrontCover : null},
          ${typeof payload.contractBanner === 'string' ? payload.contractBanner : null}
        )
        on conflict (user_id) do update set
          business_name = excluded.business_name,
          public_email = excluded.public_email,
          support_phone = excluded.support_phone,
          city = excluded.city,
          response_time = excluded.response_time,
          store_slug = excluded.store_slug,
          public_store_url = excluded.public_store_url,
          public_profile_url = excluded.public_profile_url,
          chauffeur_on_demand = excluded.chauffeur_on_demand,
          chauffeur_daily_rate = excluded.chauffeur_daily_rate,
          delivery_enabled = excluded.delivery_enabled,
          whatsapp_enabled = excluded.whatsapp_enabled,
          contract_signature_enabled = excluded.contract_signature_enabled,
          notifications_email = excluded.notifications_email,
          notifications_sms = excluded.notifications_sms,
          brand_logo = excluded.brand_logo,
          storefront_cover = excluded.storefront_cover,
          contract_banner = excluded.contract_banner,
          updated_at = now();
      `;
    });

    const refreshedOwner = await getOwnerProfileByUserId(userId);
    const [settingsRow] = await sql`
      select *
      from app_settings
      where user_id = ${userId}
      limit 1;
    `;

    return res.json(buildDefaultSettings({ user: { ...user, phone: supportPhone }, ownerProfile: refreshedOwner, settingsRow }));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Settings update failed' });
  }
});

app.post('/api/ai/chat', async (req, res) => {
  try {
    const userId = getRequestUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'Missing user id' });
    }

    const rawMessages = Array.isArray(req.body?.messages) ? req.body.messages : [];
    const messages = rawMessages
      .map((message) => ({
        role: message?.role === 'assistant' ? 'assistant' : 'user',
        text: sanitizeText(message?.text).slice(0, 1_500),
      }))
      .filter((message) => message.text)
      .slice(-8);

    const latestUserMessage = [...messages].reverse().find((message) => message.role === 'user');
    if (!latestUserMessage) {
      return res.status(400).json({ message: 'Aucun message utilisateur valide.' });
    }

    const normalizedPrompt = normalizeAiPrompt(latestUserMessage.text);
    const staticReply = buildStaticAiReply(normalizedPrompt);
    if (staticReply) {
      return res.json({ reply: staticReply, source: 'fallback', cached: false, model: 'local-rules' });
    }

    pruneAiResponseCache();
    const cacheKey = buildAiCacheKey(userId, messages);
    const cachedEntry = aiResponseCache.get(cacheKey);
    if (cachedEntry && cachedEntry.expiresAt > Date.now()) {
      return res.json({ reply: cachedEntry.reply, source: 'cache', cached: true, model: cachedEntry.model });
    }

    if (!openRouterApiKey) {
      return res.status(503).json({ message: 'OPEN_AI_CHAT_BOT ou OPENROUTER_API_KEY manquante sur le backend Render.' });
    }

    const snapshot = await buildAiSnapshot(userId);
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': normalizedAppUrl,
        'X-Title': 'Djambo FleetMind',
      },
      body: JSON.stringify({
        model: openRouterModel,
        temperature: 0.2,
        max_tokens: 260,
        messages: [
          { role: 'system', content: buildAiSystemPrompt(snapshot) },
          ...messages.map((message) => ({ role: message.role, content: message.text })),
        ],
      }),
    });

    if (!response.ok) {
      const payload = await response.text();
      console.error('OpenRouter request failed:', payload);
      return res.status(502).json({ message: 'OpenRouter n a pas pu traiter la demande.' });
    }

    const payload = await response.json();
    const reply = extractOpenRouterText(payload);
    if (!reply) {
      return res.status(502).json({ message: 'Reponse vide retournee par OpenRouter.' });
    }

    aiResponseCache.set(cacheKey, {
      reply,
      model: openRouterModel,
      expiresAt: Date.now() + aiCacheTtlMs,
    });

    return res.json({ reply, source: 'openrouter', cached: false, model: openRouterModel });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'AI chat failed' });
  }
});

app.get('/api/owner/vehicles', async (req, res) => {
  try {
    const userId = getRequestUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'Missing user id' });
    }

    const ownerProfile = await getOwnerProfileByUserId(userId);
    if (!ownerProfile) {
      return res.json([]);
    }

    const vehicles = await sql`
      select
        v.id,
        v.title,
        v.brand,
        v.model,
        v.year,
        v.category,
        v.fuel_type,
        v.transmission,
        v.seats,
        v.price_per_day,
        v.city,
        v.location,
        v.description,
        v.mileage,
        v.color,
        v.is_available,
        v.parking_id,
        p.name as parking_name,
        (select image_url from vehicle_images where vehicle_id = v.id order by sort_order asc limit 1) as image_url
      from vehicles v
      left join parkings p on p.id = v.parking_id
      where v.owner_id = ${ownerProfile.id}
      order by v.created_at desc;
    `;

    return res.json(vehicles.map((vehicle) => ({
      id: vehicle.id,
      title: vehicle.title,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      category: categoryFromDb[vehicle.category] || vehicle.category,
      fuelType: fuelTypeFromDb[vehicle.fuel_type] || vehicle.fuel_type,
      transmission: vehicle.transmission,
      seats: vehicle.seats,
      pricePerDay: vehicle.price_per_day,
      city: vehicle.city,
      location: vehicle.location,
      description: vehicle.description,
      mileage: vehicle.mileage,
      color: vehicle.color,
      isAvailable: vehicle.is_available,
      parkingId: vehicle.parking_id,
      parkingName: vehicle.parking_name,
      imageUrl: normalizeStoredMediaUrl(vehicle.image_url),
    })));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Owner vehicles fetch failed' });
  }
});

app.post('/api/owner/vehicles', async (req, res) => {
  try {
    const userId = getRequestUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'Missing user id' });
    }

    const ownerProfile = await getOwnerProfileByUserId(userId);
    if (!ownerProfile) {
      return res.status(403).json({ message: 'Owner profile required' });
    }

    const payload = req.body || {};
    const fuelType = fuelTypeToDb[payload.fuelType];
    const category = categoryToDb[payload.category];

    if (!payload.title || !payload.brand || !payload.model || !fuelType || !category || !payload.city || !payload.location || !payload.description) {
      return res.status(400).json({ message: 'Vehicle payload is incomplete' });
    }

    const insertedVehicle = await sql.begin(async (transaction) => {
      const rows = await transaction`
        insert into vehicles (
          owner_id, title, brand, model, year, category, fuel_type, transmission, seats,
          price_per_day, is_for_rent, is_for_sale, description, features, location, city,
          mileage, color, is_available, parking_id
        ) values (
          ${ownerProfile.id},
          ${String(payload.title).trim()},
          ${String(payload.brand).trim()},
          ${String(payload.model).trim()},
          ${Number(payload.year) || new Date().getFullYear()},
          ${category}::vehicle_category,
          ${fuelType}::fuel_type_enum,
          ${payload.transmission === 'Manuelle' ? 'Manuelle' : 'Automatique'}::transmission_type,
          ${Math.max(1, Number(payload.seats) || 5)},
          ${Math.max(0, Number(payload.pricePerDay) || 0)},
          true,
          false,
          ${String(payload.description).trim()},
          ${[]},
          ${String(payload.location).trim()},
          ${String(payload.city).trim()},
          ${Math.max(0, Number(payload.mileage) || 0)},
          ${payload.color ? String(payload.color).trim() : null},
          ${Boolean(payload.isAvailable)},
          ${payload.parkingId || null}
        ) returning *;
      `;

      const vehicle = rows[0];

      if (typeof payload.imageUrl === 'string' && payload.imageUrl.trim()) {
        await transaction`
          insert into vehicle_images (vehicle_id, image_url, alt_text, sort_order)
          values (${vehicle.id}, ${payload.imageUrl.trim()}, ${vehicle.title}, 0);
        `;
      }

      await transaction`
        update owner_profiles
        set vehicle_count = (
          select count(*)::int from vehicles where owner_id = ${ownerProfile.id}
        )
        where id = ${ownerProfile.id};
      `;

      return vehicle;
    });

    const [vehicleImage] = await sql`
      select image_url
      from vehicle_images
      where vehicle_id = ${insertedVehicle.id}
      order by sort_order asc
      limit 1;
    `;
    const [parking] = insertedVehicle.parking_id ? await sql`
      select name from parkings where id = ${insertedVehicle.parking_id} limit 1;
    ` : [null];

    return res.status(201).json({
      id: insertedVehicle.id,
      title: insertedVehicle.title,
      brand: insertedVehicle.brand,
      model: insertedVehicle.model,
      year: insertedVehicle.year,
      category: categoryFromDb[insertedVehicle.category] || insertedVehicle.category,
      fuelType: fuelTypeFromDb[insertedVehicle.fuel_type] || insertedVehicle.fuel_type,
      transmission: insertedVehicle.transmission,
      seats: insertedVehicle.seats,
      pricePerDay: insertedVehicle.price_per_day,
      city: insertedVehicle.city,
      location: insertedVehicle.location,
      description: insertedVehicle.description,
      mileage: insertedVehicle.mileage,
      color: insertedVehicle.color,
      isAvailable: insertedVehicle.is_available,
      parkingId: insertedVehicle.parking_id,
      parkingName: parking?.name || null,
      imageUrl: normalizeStoredMediaUrl(vehicleImage?.image_url) || null,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Vehicle creation failed' });
  }
});

app.delete('/api/owner/vehicles/:vehicleId', async (req, res) => {
  try {
    const userId = getRequestUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'Missing user id' });
    }

    const ownerProfile = await getOwnerProfileByUserId(userId);
    if (!ownerProfile) {
      return res.status(403).json({ message: 'Owner profile required' });
    }

    const vehicleId = req.params.vehicleId;
    const deletedRows = await sql`
      delete from vehicles
      where id = ${vehicleId}::uuid and owner_id = ${ownerProfile.id}
      returning id;
    `;

    if (deletedRows.length === 0) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    await sql`
      update owner_profiles
      set vehicle_count = (
        select count(*)::int from vehicles where owner_id = ${ownerProfile.id}
      )
      where id = ${ownerProfile.id};
    `;

    return res.json({ ok: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Vehicle deletion failed' });
  }
});

app.get('/api/contracts', async (req, res) => {
  try {
    const userId = getRequestUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'Missing user id' });
    }

    const ownerProfile = await getOwnerProfileByUserId(userId);
    const rows = ownerProfile
      ? await sql`
          select
            c.id,
            c.contract_number,
            c.customer_id,
            c.vehicle_id,
            c.start_date,
            c.end_date,
            c.total_amount,
            c.daily_rate,
            c.status,
            c.payment_method,
            c.chauffeur_requested,
            c.chauffeur_rate,
            c.generated_at,
            u.full_name as customer_name,
            u.email as customer_email,
            coalesce(u.phone, '') as customer_phone,
            concat(v.brand, ' ', v.model) as vehicle_label
          from contracts c
          join app_users u on u.id = c.customer_id
          join vehicles v on v.id = c.vehicle_id
          where c.owner_id = ${ownerProfile.id}
          order by c.generated_at desc, c.created_at desc;
        `
      : await sql`
          select
            c.id,
            c.contract_number,
            c.customer_id,
            c.vehicle_id,
            c.start_date,
            c.end_date,
            c.total_amount,
            c.daily_rate,
            c.status,
            c.payment_method,
            c.chauffeur_requested,
            c.chauffeur_rate,
            c.generated_at,
            u.full_name as customer_name,
            u.email as customer_email,
            coalesce(u.phone, '') as customer_phone,
            concat(v.brand, ' ', v.model) as vehicle_label
          from contracts c
          join app_users u on u.id = c.customer_id
          join vehicles v on v.id = c.vehicle_id
          where c.customer_id = ${userId}
          order by c.generated_at desc, c.created_at desc;
        `;

    return res.json(rows.map((contract) => ({
      id: contract.id,
      contractNumber: contract.contract_number,
      customerId: contract.customer_id,
      vehicleId: contract.vehicle_id,
      startDate: contract.start_date,
      endDate: contract.end_date,
      totalAmount: contract.total_amount,
      dailyRate: contract.daily_rate,
      status: contractStatusFromDb[contract.status] || 'Actif',
      paymentMethod: contract.payment_method || 'Carte Bancaire',
      chauffeurRequested: contract.chauffeur_requested,
      chauffeurRate: contract.chauffeur_rate,
      generatedAt: contract.generated_at,
      customerName: contract.customer_name,
      customerEmail: contract.customer_email,
      customerPhone: contract.customer_phone,
      vehicleLabel: contract.vehicle_label,
      contractUrl: `${normalizedAppUrl}/#/app/contracts?contract=${contract.id}`,
    })));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Contracts fetch failed' });
  }
});

app.post('/api/contracts', async (req, res) => {
  try {
    const userId = getRequestUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'Missing user id' });
    }

    const ownerProfile = await getOwnerProfileByUserId(userId);
    if (!ownerProfile) {
      return res.status(403).json({ message: 'Owner profile required' });
    }

    const payload = req.body || {};
    if (!payload.customerId || !payload.vehicleId || !payload.startDate || !payload.endDate) {
      return res.status(400).json({ message: 'Contract payload is incomplete' });
    }

    const [vehicle] = await sql`
      select id, brand, model
      from vehicles
      where id = ${payload.vehicleId}::uuid and owner_id = ${ownerProfile.id}
      limit 1;
    `;
    const customer = await resolveContractCustomerForOwner({
      ownerProfile,
      customerId: payload.customerId,
    });

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicule introuvable dans votre flotte.' });
    }

    if (customer === 'linked-elsewhere') {
      return res.status(409).json({ message: 'Ce client est deja rattache a un autre espace proprietaire.' });
    }

    if (!customer) {
      return res.status(404).json({ message: 'Client introuvable ou non autorise pour ce contrat.' });
    }

    const contractNumber = `DJ-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 100000)}`;
    const [insertedContract] = await sql`
      insert into contracts (
        customer_id, vehicle_id, owner_id, contract_number, status,
        start_date, end_date, daily_rate, total_amount, payment_method,
        chauffeur_requested, chauffeur_rate, generated_at
      ) values (
        ${customer.id},
        ${vehicle.id},
        ${ownerProfile.id},
        ${contractNumber},
        'ACTIVE'::contract_status,
        ${payload.startDate},
        ${payload.endDate},
        ${Math.max(0, Number(payload.dailyRate) || 0)},
        ${Math.max(0, Number(payload.totalAmount) || 0)},
        ${payload.paymentMethod || 'Carte Bancaire'},
        ${Boolean(payload.chauffeurRequested)},
        ${Math.max(0, Number(payload.chauffeurRate) || 0)},
        now()
      ) returning *;
    `;

    return res.status(201).json({
      id: insertedContract.id,
      contractNumber,
      customerId: customer.id,
      vehicleId: vehicle.id,
      startDate: insertedContract.start_date,
      endDate: insertedContract.end_date,
      totalAmount: insertedContract.total_amount,
      dailyRate: insertedContract.daily_rate,
      status: contractStatusFromDb[insertedContract.status] || 'Actif',
      paymentMethod: insertedContract.payment_method || 'Carte Bancaire',
      chauffeurRequested: insertedContract.chauffeur_requested,
      chauffeurRate: insertedContract.chauffeur_rate,
      generatedAt: insertedContract.generated_at,
      customerName: customer.full_name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      vehicleLabel: `${vehicle.brand} ${vehicle.model}`,
      contractUrl: `${normalizedAppUrl}/#/app/contracts?contract=${insertedContract.id}`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Contract creation failed' });
  }
});

app.get('/api/dashboard/overview', async (_req, res) => {
  try {
    const [counts] = await sql`
      select
        count(*)::int as total_vehicles,
        count(*) filter (where is_available = true)::int as available_vehicles,
        count(*) filter (where is_available = false)::int as occupied_vehicles,
        (select count(*)::int from parkings) as total_parkings,
        (
          select coalesce(sum(total_price), 0)::int
          from bookings
          where status in ('CONFIRMED', 'COMPLETED')
        ) as total_revenue
      from vehicles;
    `;

    const revenueRows = await sql`
      select to_char(month_bucket, 'Mon') as month, revenue::int as revenue, expenses::int as expenses
      from (
        select date_trunc('month', created_at) as month_bucket,
               coalesce(sum(total_price), 0) as revenue,
               coalesce(sum(total_price) * 0.18, 0) as expenses
        from bookings
        where status in ('CONFIRMED', 'COMPLETED')
        group by 1
        order by 1 desc
        limit 6
      ) t
      order by month_bucket asc;
    `;

    res.json({
      stats: {
        totalVehicles: counts.total_vehicles,
        activeRentals: counts.occupied_vehicles,
        inMaintenance: 0,
        totalRevenue: counts.total_revenue,
        availableVehicles: counts.available_vehicles,
        totalParkings: counts.total_parkings,
      },
      revenueData: revenueRows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Overview fetch failed' });
  }
});

app.get('/api/dashboard/owner', async (req, res) => {
  try {
    const userId = getRequestUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'Missing user id' });
    }

    const ownerRows = await sql`
      select op.*, u.full_name, u.email, u.role
      from owner_profiles op
      join app_users u on u.id = op.user_id
      where u.id = ${userId}
      limit 1;
    `;

    if (ownerRows.length === 0) {
      const parkings = await sql`
       select p.id, p.name, p.city, p.address, p.capacity_total,
         p.latitude, p.longitude, p.location_source, p.location_confirmed_at, p.location_updated_at,
               count(v.id)::int as vehicle_count,
               greatest(p.capacity_total - count(v.id)::int, 0)::int as available_spots
        from parkings p
        left join vehicles v on v.parking_id = p.id
        group by p.id
        order by p.city, p.name;
      `;
      return res.json({ ownerProfile: null, stats: null, vehicles: [], recentBookings: [], parkings: parkings.map((parking) => mapParkingSummary(parking)), requestInbox: [], reviewFeed: [], notifications: [] });
    }

    const owner = ownerRows[0];

    const vehicles = await sql`
      select v.id, v.title, v.city, v.price_per_day, v.rating, v.review_count, v.view_count, v.is_available,
             v.created_at, p.id as parking_id, p.name as parking_name,
             (select image_url from vehicle_images where vehicle_id = v.id order by sort_order asc limit 1) as image_url,
             (
               select max(b.end_date)
               from bookings b
               where b.vehicle_id = v.id
                 and b.status in ('PENDING', 'CONFIRMED')
                 and b.end_date >= current_date
             ) as occupied_until
      from vehicles v
      left join parkings p on p.id = v.parking_id
      where v.owner_id = ${owner.id}
      order by v.created_at desc;
    `;

    const bookings = await sql`
      select b.id, b.vehicle_id, b.renter_id as user_id, b.start_date, b.end_date, b.total_price, b.status, b.message, b.created_at,
             v.title as vehicle_title, u.full_name as renter_name
      from bookings b
      join vehicles v on v.id = b.vehicle_id
      join app_users u on u.id = b.renter_id
      where b.owner_id = ${owner.id}
      order by b.created_at desc
      limit 6;
    `;

    const requestInbox = await sql`
      select
        vr.id,
        vr.request_type,
        vr.status,
        vr.booking_channel,
        vr.start_date,
        vr.end_date,
        vr.estimated_total,
        vr.offered_price,
        vr.pickup_mode,
        vr.contact_preference,
        vr.message,
        vr.created_at,
        coalesce(vr.customer_details ->> 'fullName', u.full_name) as customer_name,
        coalesce(vr.customer_details ->> 'email', u.email) as customer_email,
        coalesce(vr.customer_details ->> 'phone', u.phone, '') as customer_phone,
        vr.customer_details ->> 'identityNumber' as identity_number,
        vr.customer_details ->> 'licenseNumber' as license_number,
        coalesce(v.title, vr.vehicle_title) as vehicle_title
      from vehicle_requests vr
      join app_users u on u.id = vr.user_id
      left join vehicles v on v.id = vr.vehicle_id
      where vr.owner_id = ${owner.id}
      order by vr.created_at desc
      limit 8;
    `;

    const reviewFeed = await sql`
      select r.id, r.rating, r.comment, r.created_at, u.full_name as user_name, v.title as vehicle_title
      from reviews r
      join app_users u on u.id = r.user_id
      join vehicles v on v.id = r.vehicle_id
      where r.owner_id = ${owner.id}
      order by r.created_at desc
      limit 6;
    `;

    const parkings = await sql`
      select p.id, p.name, p.city, p.address, p.access_type, p.opening_hours, p.security_features, p.capacity_total,
             p.latitude, p.longitude, p.location_source, p.location_confirmed_at, p.location_updated_at,
             count(v.id)::int as vehicle_count,
             greatest(p.capacity_total - count(v.id)::int, 0)::int as available_spots
      from parkings p
      left join vehicles v on v.parking_id = p.id
      where p.owner_id = ${owner.id}
      group by p.id
      order by p.name;
    `;

    const completedRevenue = bookings
      .filter((booking) => booking.status === 'COMPLETED' || booking.status === 'CONFIRMED')
      .reduce((sum, booking) => sum + booking.total_price, 0);

    const activeBookings = bookings.filter((booking) => booking.status === 'CONFIRMED' || booking.status === 'PENDING').length;

    const mappedVehicles = vehicles.map((vehicle) => ({
      id: vehicle.id,
      title: vehicle.title,
      city: vehicle.city,
      pricePerDay: vehicle.price_per_day,
      rating: Number(vehicle.rating),
      reviewCount: vehicle.review_count,
      viewCount: vehicle.view_count,
      isAvailable: vehicle.is_available,
      occupiedUntil: vehicle.occupied_until,
      nextAvailabilityTime: vehicle.occupied_until ? defaultVehicleReleaseTime : null,
      parkingId: vehicle.parking_id,
      parkingName: vehicle.parking_name,
      imageUrl: normalizeStoredMediaUrl(vehicle.image_url),
    }));

    const vehiclesByParking = mappedVehicles.reduce((accumulator, vehicle) => {
      if (!vehicle.parkingId) {
        return accumulator;
      }

      if (!accumulator[vehicle.parkingId]) {
        accumulator[vehicle.parkingId] = [];
      }

      accumulator[vehicle.parkingId].push(vehicle);
      return accumulator;
    }, {});

    const notifications = buildOwnerNotificationFeed({ bookings, requestInbox, reviewFeed });

    res.json({
      ownerProfile: {
        id: owner.id,
        userId: owner.user_id,
        displayName: owner.display_name,
        city: owner.city,
        country: owner.country,
        responseTime: owner.response_time,
        rating: Number(owner.rating),
        reviewCount: owner.review_count,
        vehicleCount: owner.vehicle_count,
        verified: owner.verified,
        type: owner.role,
      },
      stats: {
        listedVehicles: vehicles.length,
        activeBookings,
        totalRevenue: completedRevenue,
        averageRating: Number(owner.rating),
      },
      vehicles: mappedVehicles,
      recentBookings: bookings,
      parkings: parkings.map((parking) => mapParkingSummary(parking, vehiclesByParking)),
      requestInbox,
      reviewFeed,
      notifications,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Owner dashboard fetch failed' });
  }
});

app.listen(port, () => {
  console.log(`Djambo API listening on http://localhost:${port}`);
});