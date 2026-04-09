import crypto from 'node:crypto';
import path from 'node:path';
import express from 'express';
import cors from 'cors';
import postgres from 'postgres';
import { loadEnvConfig } from '../utils/loadEnv.mjs';

const workspaceRoot = process.cwd();
const env = loadEnvConfig(workspaceRoot);
const databaseUrl = process.env.DATABASE_URL || env.DATABASE_URL;
const port = Number(process.env.PORT || 8787);
const app = express();
const sql = postgres(databaseUrl, { max: 10, prepare: false });

const hashPassword = (password) => crypto.scryptSync(password, 'fleetcommand-salt', 64).toString('hex');
const hashVerificationToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
const resendApiKey = env.RESEND_API_KEY;
const resendFromEmail = env.RESEND_FROM_EMAIL || 'FleetCommand <onboarding@resend.dev>';
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

const sendResendEmail = async ({ to, subject, html, text }) => {
  if (!resendApiKey) {
    throw new Error('RESEND_API_KEY is missing from environment');
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
};

const sendVerificationEmail = async ({ to, name, verificationUrl, role }) => {
  const html = `
    <div style="font-family:Arial,sans-serif;background:#f7f5f0;padding:32px;color:#0f172a;">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:24px;padding:32px;border:1px solid #e2e8f0;box-shadow:0 24px 60px rgba(15,23,42,0.08);">
        <p style="font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#4f46e5;margin:0 0 16px;">FleetCommand</p>
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

  await sendResendEmail({
    to,
    subject: 'Confirmez votre email FleetCommand',
    html,
    text: `Bonjour ${name}, confirmez votre adresse email FleetCommand ici : ${verificationUrl}`,
  });
};

const sendPasswordResetEmail = async ({ to, name, resetUrl }) => {
  const html = `
    <div style="font-family:Arial,sans-serif;background:#f7f5f0;padding:32px;color:#0f172a;">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:24px;padding:32px;border:1px solid #e2e8f0;box-shadow:0 24px 60px rgba(15,23,42,0.08);">
        <p style="font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#4f46e5;margin:0 0 16px;">FleetCommand</p>
        <h1 style="font-size:28px;line-height:1.2;margin:0 0 12px;">Reinitialisez votre mot de passe</h1>
        <p style="font-size:15px;line-height:1.6;color:#475569;margin:0 0 16px;">Bonjour ${name}, nous avons recu une demande de reinitialisation de mot de passe pour votre compte FleetCommand.</p>
        <div style="margin:28px 0;">
          <a href="${resetUrl}" style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;padding:14px 22px;border-radius:16px;font-weight:700;">Choisir un nouveau mot de passe</a>
        </div>
        <p style="font-size:13px;line-height:1.6;color:#64748b;margin:0 0 10px;">Ce lien expire dans 30 minutes.</p>
        <p style="font-size:13px;line-height:1.6;color:#64748b;margin:0;">Si vous n'etes pas a l'origine de cette demande, ignorez simplement cet email.</p>
        <p style="font-size:12px;line-height:1.6;color:#334155;word-break:break-all;margin-top:8px;">${resetUrl}</p>
      </div>
    </div>
  `;

  await sendResendEmail({
    to,
    subject: 'Reinitialisation de mot de passe FleetCommand',
    html,
    text: `Bonjour ${name}, reinitialisez votre mot de passe FleetCommand ici : ${resetUrl}`,
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
app.use(express.json());
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
      description: `${verifiedUser.full_name}, votre compte est maintenant active. Vous pouvez vous connecter a FleetCommand.`,
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
  res.json({ ok: true, now: now[0].now });
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
            ${createdUser.role === 'PARC_AUTO' ? 'Nouvelle structure FleetCommand' : 'Nouveau profil FleetCommand'},
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
          insert into parkings (owner_id, name, city, address, access_type, opening_hours, security_features, capacity_total)
          select id, ${safeProfileData.parkingName}, ${safeProfileData.city}, ${'Adresse a completer'}, ${'standard'}, ${'24/7'}, ${['Camera']}, ${safeProfileData.parkingCapacity || 10}
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
      await sendVerificationEmail({
        to: user.email,
        name: user.full_name,
        verificationUrl,
        role: user.role,
      });
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
    const result = await sql`select id, full_name, email, role, password_hash, email_verified from app_users where email = ${email}`;
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

    res.json({ id: user.id, name: user.full_name, email: user.email, role: user.role });
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
    const userId = req.headers['x-user-id'];
    if (!userId || Array.isArray(userId)) {
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
               count(v.id)::int as vehicle_count,
               greatest(p.capacity_total - count(v.id)::int, 0)::int as available_spots
        from parkings p
        left join vehicles v on v.parking_id = p.id
        group by p.id
        order by p.city, p.name;
      `;
      return res.json({ ownerProfile: null, stats: null, vehicles: [], recentBookings: [], parkings });
    }

    const owner = ownerRows[0];

    const vehicles = await sql`
      select v.id, v.title, v.city, v.price_per_day, v.rating, v.review_count, v.view_count, v.is_available,
             v.created_at, p.name as parking_name,
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
      select b.id, b.vehicle_id, b.renter_id as user_id, b.start_date, b.end_date, b.total_price, b.status, b.message,
             v.title as vehicle_title, u.full_name as renter_name
      from bookings b
      join vehicles v on v.id = b.vehicle_id
      join app_users u on u.id = b.renter_id
      where b.owner_id = ${owner.id}
      order by b.created_at desc
      limit 6;
    `;

    const parkings = await sql`
      select p.id, p.name, p.city, p.address, p.access_type, p.opening_hours, p.security_features, p.capacity_total,
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
      vehicles: vehicles.map((vehicle) => ({
        id: vehicle.id,
        title: vehicle.title,
        city: vehicle.city,
        pricePerDay: vehicle.price_per_day,
        rating: Number(vehicle.rating),
        reviewCount: vehicle.review_count,
        viewCount: vehicle.view_count,
        isAvailable: vehicle.is_available,
        occupiedUntil: vehicle.occupied_until,
        parkingName: vehicle.parking_name,
        imageUrl: vehicle.image_url,
      })),
      recentBookings: bookings,
      parkings,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Owner dashboard fetch failed' });
  }
});

app.listen(port, () => {
  console.log(`FleetCommand API listening on http://localhost:${port}`);
});