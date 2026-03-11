/**
 * Database Initialization Script
 *
 * Connects to MongoDB and ensures all required collections and indexes are
 * created for the Stoked UI Media API.
 *
 * Also creates a default admin user when AUTH_ADMIN_EMAIL / AUTH_ADMIN_PASSWORD
 * environment variables are provided.
 *
 * Usage:
 *   ts-node scripts/init-db.ts
 *
 * Environment variables:
 *   MONGODB_URI         - MongoDB connection string (required)
 *   AUTH_ADMIN_EMAIL    - Email for the default admin user (optional)
 *   AUTH_ADMIN_PASSWORD - Password for the default admin user (optional)
 *   AUTH_ADMIN_NAME     - Display name for the default admin user (default: "Admin")
 */

import * as dotenv from 'dotenv';
import mongoose, { Connection } from 'mongoose';

dotenv.config();

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const MONGODB_URI =
  process.env.MONGODB_URI ?? 'mongodb://localhost:27017/stoked-media';

const ADMIN_EMAIL = process.env.AUTH_ADMIN_EMAIL ?? 'b@stokedconsulting.com';
const ADMIN_PASSWORD = process.env.AUTH_ADMIN_PASSWORD;
const ADMIN_NAME = process.env.AUTH_ADMIN_NAME ?? 'Brian';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function log(msg: string) {
  console.log(`[init-db] ${msg}`);
}

function warn(msg: string) {
  console.warn(`[init-db] WARN: ${msg}`);
}

// ---------------------------------------------------------------------------
// Default admin user (optional)
// ---------------------------------------------------------------------------

async function ensureAdminUser(db: Connection['db']) {
  if (!db) throw new Error('MongoDB db reference is undefined');
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    log('Skipping admin user creation (AUTH_ADMIN_EMAIL / AUTH_ADMIN_PASSWORD not set).');
    return;
  }

  // Import bcryptjs dynamically so the script fails gracefully if the package
  // is not installed in the current environment.
  let bcrypt: typeof import('bcryptjs');
  try {
    bcrypt = await import('bcryptjs');
  } catch {
    warn('bcryptjs is not available – skipping admin user creation.');
    return;
  }

  // NOTE: AuthService currently uses an in-memory user store; there is no
  // persisted "users" collection yet.  When a persistent User model is added
  // this function should insert into that collection.  For now we write to a
  // provisional "users" collection so the seed data is available when the
  // model lands.
  const col = db.collection('users');

  const existing = await col.findOne({ email: ADMIN_EMAIL.toLowerCase() });
  if (existing) {
    log(`Admin user already exists: ${ADMIN_EMAIL}`);
    return;
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  await col.insertOne({
    email: ADMIN_EMAIL.toLowerCase(),
    passwordHash,
    name: ADMIN_NAME,
    role: 'admin',
    createdAt: new Date(),
  });

  log(`Created admin user: ${ADMIN_EMAIL} (role: admin)`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  log(`Connecting to MongoDB…`);
  log(`URI: ${MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);

  await mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 10_000,
  });

  const db = mongoose.connection.db;
  if (!db) throw new Error('mongoose.connection.db is undefined after connect()');

  log('Connected.');

  await ensureDefaultClients(db);
  await ensureAdminUser(db);

  log('Database initialization complete.');
  await mongoose.disconnect();
}

async function ensureDefaultClients(db: Connection['db']) {
  if (!db) throw new Error('MongoDB db reference is undefined');

  const collectionName = 'clients';
  const collections = await db.listCollections({ name: collectionName }).toArray();
  if (collections.length === 0) {
    await db.createCollection(collectionName);
    log(`Created collection: ${collectionName}`);
  }

  const col = db.collection(collectionName);

  // Ensure unique index on slug
  await col.createIndex({ slug: 1 }, { unique: true, name: 'client_slug_unique', background: true }).catch(() => {});

  const defaultClient = {
    name: 'Stoked',
    slug: 'stoked',
    contactEmail: 'b@stokedconsulting.com',
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const existing = await col.findOne({ slug: 'stoked' });
  if (!existing) {
    await col.insertOne(defaultClient);
    log(`Created default client: ${defaultClient.name}`);
  } else {
    log(`Default client already exists: ${defaultClient.name}`);
  }
}

main().catch((err) => {
  console.error('[init-db] Fatal error:', err);
  process.exit(1);
});
