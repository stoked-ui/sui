/**
 * Database Initialization Script
 *
 * Connects to MongoDB and ensures all required collections and indexes are
 * created for the Stoked UI Media API (including the BlogPost collection).
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

const ADMIN_EMAIL = process.env.AUTH_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.AUTH_ADMIN_PASSWORD;
const ADMIN_NAME = process.env.AUTH_ADMIN_NAME ?? 'Admin';

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
// BlogPost collection + indexes
// ---------------------------------------------------------------------------

async function ensureBlogPostCollection(db: Connection['db']) {
  if (!db) throw new Error('MongoDB db reference is undefined');

  const collectionName = 'blogposts';

  // Create collection if it does not exist (createCollection is idempotent
  // when the collection already exists in modern MongoDB drivers).
  const collections = await db.listCollections({ name: collectionName }).toArray();
  if (collections.length === 0) {
    await db.createCollection(collectionName);
    log(`Created collection: ${collectionName}`);
  } else {
    log(`Collection already exists: ${collectionName}`);
  }

  const col = db.collection(collectionName);

  // Ensure every index defined in BlogPostSchema is present.
  // createIndex is idempotent – if the index already exists with the same
  // options, MongoDB returns its name without recreating it.

  // 1. Unique index on slug (critical – prevents duplicates)
  await col.createIndex(
    { slug: 1 },
    { unique: true, name: 'blogpost_slug_unique', background: true },
  );
  log('  index: blogpost_slug_unique');

  // 2. Status field index
  await col.createIndex(
    { status: 1 },
    { name: 'blogpost_status', background: true },
  );
  log('  index: blogpost_status');

  // 3. Compound: status + date (listing by status chronologically)
  await col.createIndex(
    { status: 1, date: -1 },
    { name: 'blogpost_status_date', background: true },
  );
  log('  index: blogpost_status_date');

  // 4. Compound: targetSites + status + date (site-specific listing)
  await col.createIndex(
    { targetSites: 1, status: 1, date: -1 },
    { name: 'blogpost_targetsites_status_date', background: true },
  );
  log('  index: blogpost_targetsites_status_date');

  // 5. Sparse index on nostrEventId (only on documents that have the field)
  await col.createIndex(
    { nostrEventId: 1 },
    { sparse: true, name: 'blogpost_nostr_event_id', background: true },
  );
  log('  index: blogpost_nostr_event_id');

  // 6. Full-text search index on title, description, tags
  //    NOTE: MongoDB allows only one text index per collection.
  //    createIndex is a no-op if the identical index already exists.
  try {
    await col.createIndex(
      { title: 'text', description: 'text', tags: 'text' },
      {
        weights: { title: 10, tags: 5, description: 1 },
        name: 'blogpost_text_search',
        background: true,
      },
    );
    log('  index: blogpost_text_search');
  } catch (err: unknown) {
    // If a conflicting text index already exists, warn but don't abort.
    const msg = err instanceof Error ? err.message : String(err);
    warn(`Could not create text index (may already exist with different definition): ${msg}`);
  }

  log(`BlogPost collection and indexes ready.`);
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

  await ensureBlogPostCollection(db);
  await ensureAdminUser(db);

  log('Database initialization complete.');
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('[init-db] Fatal error:', err);
  process.exit(1);
});
