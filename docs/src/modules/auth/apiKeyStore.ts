import * as crypto from 'crypto';
import { ObjectId } from 'mongodb';
import { getDb } from 'docs/src/modules/db/mongodb';
import type { UserRole } from './authStore';

export interface ApiKey {
  _id: ObjectId;
  key: string;
  prefix: string;
  userId: ObjectId;
  name: string;
  createdAt: Date;
  lastUsedAt: Date | null;
  revokedAt: Date | null;
}

export interface ApiKeyInfo {
  id: string;
  prefix: string;
  name: string;
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
}

export interface ApiKeyUser {
  sub: string;
  email: string;
  role: UserRole;
  name: string;
  clientId?: string;
}

export async function createApiKey(
  userId: string,
  name: string,
): Promise<{ key: string; info: ApiKeyInfo }> {
  const db = await getDb();
  const raw = crypto.randomBytes(32).toString('hex');
  const key = `sk_${raw}`;
  const prefix = key.slice(0, 11); // "sk_" + 8 hex chars

  const doc: Omit<ApiKey, '_id'> = {
    key,
    prefix,
    userId: new ObjectId(userId),
    name,
    createdAt: new Date(),
    lastUsedAt: null,
    revokedAt: null,
  };

  const result = await db.collection('api_keys').insertOne(doc);

  return {
    key,
    info: {
      id: result.insertedId.toString(),
      prefix,
      name,
      createdAt: doc.createdAt.toISOString(),
      lastUsedAt: null,
      revokedAt: null,
    },
  };
}

export async function validateApiKey(key: string): Promise<ApiKeyUser | null> {
  const db = await getDb();
  const apiKey = await db.collection<ApiKey>('api_keys').findOne({
    key,
    revokedAt: null,
  });

  if (!apiKey) {
    return null;
  }

  // Update lastUsedAt (fire-and-forget)
  db.collection('api_keys').updateOne(
    { _id: apiKey._id },
    { $set: { lastUsedAt: new Date() } },
  );

  // Look up the associated user
  const user = await db.collection('users').findOne({
    _id: apiKey.userId,
    active: true,
  });

  if (!user) {
    return null;
  }

  return {
    sub: user._id.toString(),
    email: user.email as string,
    role: user.role as UserRole,
    name: user.name as string,
    clientId: user.clientId?.toString(),
  };
}

export async function revokeApiKey(keyId: string, userId: string): Promise<boolean> {
  const db = await getDb();
  const result = await db.collection('api_keys').updateOne(
    {
      _id: new ObjectId(keyId),
      userId: new ObjectId(userId),
      revokedAt: null,
    },
    { $set: { revokedAt: new Date() } },
  );
  return result.modifiedCount === 1;
}

export async function listApiKeys(userId: string): Promise<ApiKeyInfo[]> {
  const db = await getDb();
  const keys = await db
    .collection<ApiKey>('api_keys')
    .find({ userId: new ObjectId(userId) })
    .sort({ createdAt: -1 })
    .toArray();

  return keys.map((k) => ({
    id: k._id.toString(),
    prefix: k.prefix,
    name: k.name,
    createdAt: k.createdAt.toISOString(),
    lastUsedAt: k.lastUsedAt?.toISOString() ?? null,
    revokedAt: k.revokedAt?.toISOString() ?? null,
  }));
}
