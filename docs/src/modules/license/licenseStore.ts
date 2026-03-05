import * as crypto from 'crypto';
import { ObjectId } from 'mongodb';
import { getDb } from 'docs/src/modules/db/mongodb';

const LICENSES_COLLECTION = 'licenses';
const LICENSE_PRODUCT_COLLECTIONS = ['license_products', 'products'];

const KEY_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export type LicenseStatus = 'pending' | 'active' | 'expired' | 'revoked';

export interface LicenseProduct {
  _id?: string;
  productId: string;
  name: string;
  keyPrefix: string;
  stripeProductId?: string;
  stripePriceId?: string;
  price: number;
  currency: string;
  licenseDurationDays: number;
  gracePeriodDays: number;
  trialDurationDays: number;
  purchaseUrl?: string;
}

type LicenseDoc = {
  _id?: ObjectId;
  key: string;
  email: string;
  productId: string;
  hardwareId: string | null;
  machineName: string | null;
  status: LicenseStatus;
  activatedAt?: Date;
  expiresAt?: Date;
  gracePeriodDays: number;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  deactivationCount: number;
  activationHistory: string[];
  createdAt?: Date;
  updatedAt?: Date;
};

export interface LicenseResponse {
  key: string;
  email: string;
  productId: string;
  status: LicenseStatus;
  activatedAt?: Date;
  expiresAt?: Date;
  gracePeriodDays: number;
  machineName?: string | null;
}

export class LicenseStoreError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function toLicenseResponse(doc: LicenseDoc): LicenseResponse {
  return {
    key: doc.key,
    email: doc.email,
    productId: doc.productId,
    status: doc.status,
    activatedAt: doc.activatedAt,
    expiresAt: doc.expiresAt,
    gracePeriodDays: doc.gracePeriodDays,
    machineName: doc.machineName,
  };
}

function normalizeLicenseProduct(doc: Record<string, unknown>): LicenseProduct {
  return {
    _id: typeof doc._id === 'object' && doc._id !== null && 'toString' in doc._id
      ? (doc._id as { toString: () => string }).toString()
      : (doc._id as string | undefined),
    productId: String(doc.productId || ''),
    name: String(doc.name || ''),
    keyPrefix: String(doc.keyPrefix || ''),
    stripeProductId: typeof doc.stripeProductId === 'string' ? doc.stripeProductId : undefined,
    stripePriceId: typeof doc.stripePriceId === 'string' ? doc.stripePriceId : undefined,
    price: Number(doc.price || 0),
    currency: String(doc.currency || 'usd'),
    licenseDurationDays: Number(doc.licenseDurationDays || 365),
    gracePeriodDays: Number(doc.gracePeriodDays || 14),
    trialDurationDays: Number(doc.trialDurationDays || 30),
    purchaseUrl: typeof doc.purchaseUrl === 'string' ? doc.purchaseUrl : undefined,
  };
}

async function findLicenseProduct(productId: string): Promise<LicenseProduct | null> {
  const db = await getDb();

  for (const collectionName of LICENSE_PRODUCT_COLLECTIONS) {
    const doc = await db.collection(collectionName).findOne({
      productId,
      stripePriceId: { $exists: true, $ne: '' },
    });

    if (doc) {
      return normalizeLicenseProduct(doc as Record<string, unknown>);
    }
  }

  return null;
}

export async function listLicenseProducts(): Promise<LicenseProduct[]> {
  const db = await getDb();
  const seen = new Set<string>();
  const rows: LicenseProduct[] = [];

  for (const collectionName of LICENSE_PRODUCT_COLLECTIONS) {
    const docs = await db.collection(collectionName)
      .find(
        { stripePriceId: { $exists: true, $ne: '' } },
        {
          projection: {
            productId: 1,
            name: 1,
            keyPrefix: 1,
            stripePriceId: 1,
            licenseDurationDays: 1,
            gracePeriodDays: 1,
            trialDurationDays: 1,
            purchaseUrl: 1,
          },
        },
      )
      .toArray();

    docs.forEach((doc) => {
      const normalized = normalizeLicenseProduct(doc as Record<string, unknown>);
      if (!normalized.productId || seen.has(normalized.productId)) {
        return;
      }

      seen.add(normalized.productId);
      rows.push(normalized);
    });
  }

  return rows.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getLicenseProductOrThrow(productId: string): Promise<LicenseProduct> {
  const product = await findLicenseProduct(productId);
  if (!product) {
    throw new LicenseStoreError(404, `Product not found: ${productId}`);
  }
  return product;
}

function generateKey(prefix: string): string {
  const bytes = crypto.randomBytes(8);
  let result = `${prefix}-`;

  for (let group = 0; group < 3; group += 1) {
    for (let i = 0; i < 4; i += 1) {
      const idx = group * 4 + i;
      const byteIndex = Math.floor((idx * 5) / 8);
      const bitOffset = (idx * 5) % 8;
      let value: number;

      if (bitOffset <= 3) {
        value = (bytes[byteIndex] >> (3 - bitOffset)) & 0x1f;
      } else {
        value = ((bytes[byteIndex] << (bitOffset - 3)) | (bytes[byteIndex + 1] >> (11 - bitOffset))) & 0x1f;
      }

      result += KEY_ALPHABET[value];
    }

    if (group < 2) {
      result += '-';
    }
  }

  return result;
}

export async function activateLicense(input: {
  key: string;
  hardwareId: string;
  machineName?: string;
}): Promise<LicenseResponse> {
  const db = await getDb();
  const collection = db.collection<LicenseDoc>(LICENSES_COLLECTION);

  const license = await collection.findOne({ key: input.key });
  if (!license) {
    throw new LicenseStoreError(404, 'License not found');
  }

  if (license.status === 'expired' || license.status === 'revoked') {
    throw new LicenseStoreError(400, `License is ${license.status}`);
  }

  if (license.status === 'active' && license.hardwareId === input.hardwareId) {
    return toLicenseResponse(license);
  }

  if (license.status === 'active' && license.hardwareId !== input.hardwareId) {
    throw new LicenseStoreError(409, 'License is already activated on a different device. Deactivate first.');
  }

  await collection.updateOne(
    { key: input.key },
    {
      $set: {
        status: 'active',
        hardwareId: input.hardwareId,
        machineName: input.machineName || null,
        activatedAt: new Date(),
        updatedAt: new Date(),
      },
      $push: {
        activationHistory: input.hardwareId,
      },
    },
  );

  const updated = await collection.findOne({ key: input.key });
  if (!updated) {
    throw new LicenseStoreError(404, 'License not found');
  }

  return toLicenseResponse(updated);
}

export async function validateLicense(input: {
  key: string;
  hardwareId: string;
}): Promise<LicenseResponse> {
  const db = await getDb();
  const collection = db.collection<LicenseDoc>(LICENSES_COLLECTION);

  const license = await collection.findOne({ key: input.key });
  if (!license) {
    throw new LicenseStoreError(404, 'License not found');
  }

  if (license.hardwareId && license.hardwareId !== input.hardwareId) {
    throw new LicenseStoreError(403, 'Hardware ID mismatch');
  }

  let final = license;

  if (license.expiresAt) {
    const graceMs = (license.gracePeriodDays || 0) * 24 * 60 * 60 * 1000;
    const expiryWithGrace = new Date(license.expiresAt.getTime() + graceMs);

    if (new Date() > expiryWithGrace && license.status !== 'expired') {
      await collection.updateOne(
        { key: input.key },
        {
          $set: {
            status: 'expired',
            updatedAt: new Date(),
          },
        },
      );

      const refreshed = await collection.findOne({ key: input.key });
      if (refreshed) {
        final = refreshed;
      }
    }
  }

  return toLicenseResponse(final);
}

export async function deactivateLicense(input: {
  key: string;
  hardwareId: string;
}): Promise<{ message: string }> {
  const db = await getDb();
  const collection = db.collection<LicenseDoc>(LICENSES_COLLECTION);

  const license = await collection.findOne({ key: input.key });
  if (!license) {
    throw new LicenseStoreError(404, 'License not found');
  }

  if (license.status !== 'active') {
    throw new LicenseStoreError(400, 'License is not active');
  }

  if (license.hardwareId !== input.hardwareId) {
    throw new LicenseStoreError(403, 'Hardware ID mismatch');
  }

  if ((license.deactivationCount || 0) >= 3) {
    throw new LicenseStoreError(403, 'Deactivation limit reached (3 per year)');
  }

  await collection.updateOne(
    { key: input.key },
    {
      $set: {
        hardwareId: null,
        machineName: null,
        status: 'pending',
        updatedAt: new Date(),
      },
      $inc: {
        deactivationCount: 1,
      },
    },
  );

  return { message: 'License deactivated successfully' };
}

export async function createLicense(params: {
  email: string;
  productId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
}): Promise<LicenseDoc> {
  const db = await getDb();
  const collection = db.collection<LicenseDoc>(LICENSES_COLLECTION);
  const product = await getLicenseProductOrThrow(params.productId);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (product.licenseDurationDays || 365));

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const key = generateKey(product.keyPrefix);

    const doc: LicenseDoc = {
      key,
      email: params.email,
      productId: params.productId,
      hardwareId: null,
      machineName: null,
      status: 'pending',
      activatedAt: undefined,
      expiresAt,
      gracePeriodDays: product.gracePeriodDays || 14,
      stripeCustomerId: params.stripeCustomerId,
      stripeSubscriptionId: params.stripeSubscriptionId,
      deactivationCount: 0,
      activationHistory: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      const result = await collection.insertOne(doc);
      return { ...doc, _id: result.insertedId };
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code?: number }).code === 11000 &&
        attempt < 2
      ) {
        continue;
      }
      throw error;
    }
  }

  throw new LicenseStoreError(400, 'Failed to generate unique license key after 3 attempts');
}

export async function findLicenseBySubscriptionId(subscriptionId: string): Promise<LicenseDoc | null> {
  const db = await getDb();
  const collection = db.collection<LicenseDoc>(LICENSES_COLLECTION);
  return collection.findOne({ stripeSubscriptionId: subscriptionId });
}

export async function renewLicenseBySubscriptionId(subscriptionId: string): Promise<void> {
  const db = await getDb();
  const collection = db.collection<LicenseDoc>(LICENSES_COLLECTION);

  const license = await collection.findOne({ stripeSubscriptionId: subscriptionId });
  if (!license) {
    return;
  }

  const product = await findLicenseProduct(license.productId);
  const durationDays = product?.licenseDurationDays || 365;

  const nextExpiry = new Date();
  nextExpiry.setDate(nextExpiry.getDate() + durationDays);

  const nextStatus: LicenseStatus =
    license.status === 'expired'
      ? (license.hardwareId ? 'active' : 'pending')
      : license.status;

  await collection.updateOne(
    { stripeSubscriptionId: subscriptionId },
    {
      $set: {
        expiresAt: nextExpiry,
        status: nextStatus,
        updatedAt: new Date(),
      },
    },
  );
}

export function toPublicLicenseResponse(doc: LicenseDoc): LicenseResponse {
  return toLicenseResponse(doc);
}
