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
  maxActivations: number;
  purchaseUrl?: string;
}

export type ActivationRecord = {
  hardwareId: string;
  machineName: string | null;
  activatedAt: Date;
};

type LicenseDoc = {
  _id?: ObjectId;
  key: string;
  email: string;
  productId: string;
  hardwareId: string | null; // Legacy single hardware ID
  machineName: string | null; // Legacy machine name
  activations?: ActivationRecord[]; // New multiple activations
  status: LicenseStatus;
  activatedAt?: Date;
  expiresAt?: Date;
  gracePeriodDays: number;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  deactivationCount: number;
  activationHistory: string[];
  createdAt?: Date;
  updatedAt?: Date;
  maxActivations?: number;
};

export interface LicenseResponse {
  key: string;
  email: string;
  productId: string;
  product: string; // Alias for productId
  status: LicenseStatus;
  activatedAt?: Date;
  expiresAt?: Date;
  gracePeriodDays: number;
  machineName?: string | null;
  // New fields for CLI/App integration
  valid: boolean;
  activations: number;
  maxActivations: number;
}

export class LicenseStoreError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function getActivationsCount(doc: LicenseDoc): number {
  if (doc.activations && doc.activations.length > 0) {
    return doc.activations.length;
  }
  return doc.hardwareId ? 1 : 0;
}

function isValid(doc: LicenseDoc): boolean {
  if (doc.status !== 'active' && doc.status !== 'pending') {
    return false;
  }
  if (doc.expiresAt) {
    const graceMs = (doc.gracePeriodDays || 0) * 24 * 60 * 60 * 1000;
    const expiryWithGrace = new Date(doc.expiresAt.getTime() + graceMs);
    if (new Date() > expiryWithGrace) {
      return false;
    }
  }
  return true;
}

function toLicenseResponse(doc: LicenseDoc): LicenseResponse {
  return {
    key: doc.key,
    email: doc.email,
    productId: doc.productId,
    product: doc.productId,
    status: doc.status,
    activatedAt: doc.activatedAt,
    expiresAt: doc.expiresAt,
    gracePeriodDays: doc.gracePeriodDays,
    machineName: doc.machineName,
    valid: isValid(doc),
    activations: getActivationsCount(doc),
    maxActivations: doc.maxActivations || 1,
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
    maxActivations: Number(doc.maxActivations || 3),
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

  // If not found in primary collections, try finding by productId without stripePriceId check (for internal use)
  for (const collectionName of LICENSE_PRODUCT_COLLECTIONS) {
    const doc = await db.collection(collectionName).findOne({ productId });
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
            maxActivations: 1,
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

  const activations = license.activations || [];
  const existingActivation = activations.find(a => a.hardwareId === input.hardwareId) || 
    (license.hardwareId === input.hardwareId ? { hardwareId: license.hardwareId, machineName: license.machineName, activatedAt: license.activatedAt || new Date() } : null);

  if (existingActivation) {
    return toLicenseResponse(license);
  }

  const currentCount = getActivationsCount(license);
  const max = license.maxActivations || 1;

  if (currentCount >= max) {
    throw new LicenseStoreError(409, `Maximum activations reached (${max}). Deactivate another device first.`);
  }

  const newActivation: ActivationRecord = {
    hardwareId: input.hardwareId,
    machineName: input.machineName || null,
    activatedAt: new Date(),
  };

  await collection.updateOne(
    { key: input.key },
    {
      $set: {
        status: 'active',
        // Update legacy fields for compatibility
        hardwareId: input.hardwareId,
        machineName: input.machineName || null,
        activatedAt: new Date(),
        updatedAt: new Date(),
      },
      $push: {
        activations: newActivation,
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

  // Check if this hardware is one of the active ones
  const activations = license.activations || [];
  const isHardwareActive = activations.some(a => a.hardwareId === input.hardwareId) || 
    (license.hardwareId === input.hardwareId);

  if (license.status === 'active' && !isHardwareActive) {
    throw new LicenseStoreError(403, 'This device is not activated for this license');
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

  const activations = license.activations || [];
  const isHardwareActive = activations.some(a => a.hardwareId === input.hardwareId) || 
    (license.hardwareId === input.hardwareId);

  if (!isHardwareActive) {
    throw new LicenseStoreError(404, 'Activation not found for this device');
  }

  if ((license.deactivationCount || 0) >= 10) { // Increased limit for multi-device
    throw new LicenseStoreError(403, 'Deactivation limit reached (10 per year)');
  }

  const newActivations = activations.filter(a => a.hardwareId !== input.hardwareId);
  const isLast = newActivations.length === 0;

  const update: any = {
    $set: {
      activations: newActivations,
      updatedAt: new Date(),
    },
    $inc: {
      deactivationCount: 1,
    },
  };

  if (license.hardwareId === input.hardwareId) {
    update.$set.hardwareId = newActivations.length > 0 ? newActivations[0].hardwareId : null;
    update.$set.machineName = newActivations.length > 0 ? newActivations[0].machineName : null;
  }

  if (isLast) {
    update.$set.status = 'pending';
  }

  await collection.updateOne({ key: input.key }, update);

  return { message: 'License deactivated successfully' };
}

export async function createLicense(params: {
  email: string;
  productId: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  maxActivations?: number;
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
      activations: [],
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
      maxActivations: params.maxActivations || product.maxActivations || 3,
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
      ? (getActivationsCount(license) > 0 ? 'active' : 'pending')
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
