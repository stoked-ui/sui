import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import clientPromise from './mongodb';

export type UserRole = 'admin' | 'client' | 'agent';

export interface User {
  _id: ObjectId;
  email: string;
  passwordHash?: string;
  name: string;
  role: UserRole;
  clientId?: ObjectId;
  agentIds?: ObjectId[];
  aliases?: string[];
  avatarUrl?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResult {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    clientId?: string;
    avatarUrl: string;
    impersonatedId?: string;
  };
}

const AUTO_DOMAINS = (process.env.AUTH_AUTO_DOMAINS || 'stokedconsulting.com,stoked-ui.com,brianstoker.com')
  .split(',')
  .map((d) => d.trim().toLowerCase());

const getJwtSecret = () => {
  let secret: string | undefined;
  try {
    // SST v4 uses globalThis.Resource
    secret = (globalThis as any).Resource?.JWT_SECRET?.value;
    if (!secret) {
      // SST v3 / other
      secret = (globalThis as any).$SST_LINKS?.JWT_SECRET?.value;
    }
  } catch { /* ignore */ }

  if (!secret) {
    secret = process.env.JWT_SECRET || 'dev-secret-change-me';
  }
  return secret;
};

const JWT_SECRET = getJwtSecret();
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function determineRole(email: string): UserRole {
  const domain = email.split('@')[1]?.toLowerCase();
  if (domain && AUTO_DOMAINS.includes(domain)) {
    return 'admin';
  }
  return 'client';
}

function gravatarUrl(email: string): string {
  const hash = crypto.createHash('md5').update(email.trim().toLowerCase()).digest('hex');
  return `https://www.gravatar.com/avatar/${hash}?d=mp&s=64`;
}

function generateAuthResult(user: User, pictureUrl?: string, impersonatedId?: string): AuthResult {
  const payload = {
    sub: user._id.toString(),
    email: user.email,
    role: user.role,
    name: user.name,
    clientId: user.clientId?.toString(),
    impersonatedId,
  };
  const access_token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });
  return {
    access_token,
    user: {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      clientId: user.clientId?.toString(),
      avatarUrl: pictureUrl || user.avatarUrl || gravatarUrl(user.email),
      impersonatedId,
    },
  };
}

let indexEnsured = false;

async function ensureUserIndexes(users: import('mongodb').Collection<User>) {
  if (indexEnsured) return;
  indexEnsured = true;
  await users.createIndex({ email: 1 }, { unique: true, background: true }).catch(() => {});
}

export async function loginWithGooglePayload(email: string, name: string, picture?: string): Promise<AuthResult> {
  const normalizedEmail = email.toLowerCase();
  const db = (await clientPromise).db();
  const users = db.collection<User>('users');

  await ensureUserIndexes(users);

  // Try direct email match, then alias match
  let user = await users.findOne({ email: normalizedEmail });
  if (!user) {
    user = await users.findOne({ aliases: normalizedEmail });
  }

  if (user) {
    // Persist the Google avatar if we got one and it changed
    if (picture && picture !== user.avatarUrl) {
      await users.updateOne({ _id: user._id }, { $set: { avatarUrl: picture, updatedAt: new Date() } });
      user.avatarUrl = picture;
    }
    return generateAuthResult(user, picture);
  }

  // Atomic upsert to prevent duplicate user creation from concurrent logins
  const now = new Date();
  const result = await users.findOneAndUpdate(
    { email: normalizedEmail },
    {
      $setOnInsert: {
        email: normalizedEmail,
        name,
        role: determineRole(normalizedEmail),
        active: true,
        createdAt: now,
      },
      $set: {
        avatarUrl: picture,
        updatedAt: now,
      },
    },
    { upsert: true, returnDocument: 'after' },
  );

  const upsertedUser = result!;
  return generateAuthResult(upsertedUser, picture);
}
