import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { getDb } from 'docs/src/modules/db/mongodb';

export type UserRole = 'admin' | 'client' | 'agent' | 'totally stoked' | 'subscriber' | 'stokd member';

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
  emailVerifiedAt?: Date;
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
    clientSlug?: string;
    avatarUrl: string;
    impersonatedId?: string;
  };
}

export interface AuthTokenPayload {
  sub: string;
  email: string;
  role: UserRole;
  name: string;
  clientId?: string;
  clientSlug?: string;
  avatarUrl?: string;
  impersonatedId?: string;
}

const AUTO_DOMAINS = (process.env.AUTH_AUTO_DOMAINS || 'stokedconsulting.com,stoked-ui.com,brianstoker.com')
  .split(',')
  .map((d) => d.trim().toLowerCase());

const JWT_SECRET = process.env.JWT_SECRET || (() => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable is required in production');
  }
  return 'dev-secret-change-me';
})();
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Calculates the appropriate user role based on their email and subscription status.
 */
export async function calculateUserRole(email: string): Promise<UserRole> {
  const normalizedEmail = email.toLowerCase();
  
  // 1. Admin Check (Domain based)
  const domain = normalizedEmail.split('@')[1]?.toLowerCase();
  if (domain && AUTO_DOMAINS.includes(domain)) {
    return 'admin';
  }

  const db = await getDb();
  const now = new Date();

  // 2. Stokd Member Check ($10/mo membership)
  const stokdMembership = await db.collection('licenses').findOne({
    email: normalizedEmail,
    productId: 'stokd-membership', // Assuming this ID for membership
    status: { $in: ['active', 'pending'] },
    $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gt: now } }]
  });
  if (stokdMembership) return 'stokd member';

  // 3. Subscriber Check (Any valid subscription)
  const anySubscription = await db.collection('licenses').findOne({
    email: normalizedEmail,
    status: { $in: ['active', 'pending'] },
    $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gt: now } }]
  });
  if (anySubscription) return 'subscriber';

  // 4. Default for Google OAuth users who haven't bought anything
  return 'totally stoked';
}

function gravatarUrl(email: string): string {
  const hash = crypto.createHash('md5').update(email.trim().toLowerCase()).digest('hex');
  return `https://www.gravatar.com/avatar/${hash}?d=mp&s=64`;
}

async function resolveClientSlug(clientId?: ObjectId): Promise<string | undefined> {
  if (!clientId) return undefined;
  const db = await getDb();
  const client = await db.collection('clients').findOne({ _id: clientId }, { projection: { slug: 1 } });
  return client?.slug as string | undefined;
}

async function generateAuthResult(user: User, pictureUrl?: string, impersonatedId?: string): Promise<AuthResult> {
  const clientSlug = await resolveClientSlug(user.clientId);
  const avatarUrl = pictureUrl || user.avatarUrl || gravatarUrl(user.email);
  const payload = {
    sub: user._id.toString(),
    email: user.email,
    role: user.role,
    name: user.name,
    clientId: user.clientId?.toString(),
    clientSlug,
    avatarUrl,
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
      clientSlug,
      avatarUrl,
      impersonatedId,
    },
  };
}

export async function createAuthResultForUser(user: User, pictureUrl?: string, impersonatedId?: string): Promise<AuthResult> {
  return generateAuthResult(user, pictureUrl, impersonatedId);
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const db = await getDb();
  return db.collection<User>('users').findOne({ email: email.toLowerCase() });
}

export async function register(email: string, password: string, name: string): Promise<AuthResult> {
  const normalizedEmail = email.toLowerCase();
  const existing = await findUserByEmail(normalizedEmail);
  if (existing) {
    throw new Error('Email already registered');
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const now = new Date();
  const db = await getDb();
  
  const role = await calculateUserRole(normalizedEmail);
  
  const newUser: Omit<User, '_id'> = {
    email: normalizedEmail,
    passwordHash,
    name,
    role,
    active: true,
    createdAt: now,
    updatedAt: now,
  };
  const result = await db.collection('users').insertOne(newUser);
  return await generateAuthResult({ ...newUser, _id: result.insertedId } as User);
}

export async function login(email: string, password: string): Promise<AuthResult> {
  const normalizedEmail = email.toLowerCase();
  let user = await findUserByEmail(normalizedEmail);

  if (!user) {
    const db = await getDb();
    user = await db.collection<User>('users').findOne({ aliases: normalizedEmail });
  }

  if (!user || !user.passwordHash) {
    throw new Error('Invalid credentials');
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new Error('Invalid credentials');
  }

  // Refresh role on login
  const newRole = await calculateUserRole(normalizedEmail);
  if (newRole !== user.role && user.role !== 'admin' && user.role !== 'client') {
     const db = await getDb();
     await db.collection('users').updateOne({ _id: user._id }, { $set: { role: newRole, updatedAt: new Date() } });
     user.role = newRole;
  }

  return await generateAuthResult(user);
}

async function addToMailingList(email: string) {
  // We don't have direct access to the Lambda handler here, 
  // but we can insert directly into the 'subscribers' collection.
  try {
    const db = await getDb();
    const collection = db.collection("subscribers");
    const existing = await collection.findOne({ email: email.toLowerCase() });
    if (!existing) {
      await collection.insertOne({ 
        email: email.toLowerCase(), 
        subscribedAt: new Date(),
        source: 'google-oauth-login'
      });
      console.log(`Added ${email} to subscribers list`);
    }
  } catch (err) {
    console.error('Failed to add user to mailing list:', err);
  }
}

export async function loginWithGooglePayload(email: string, name: string, picture?: string): Promise<AuthResult> {
  const normalizedEmail = email.toLowerCase();
  const db = await getDb();
  const users = db.collection<User>('users');

  let user = await findUserByEmail(normalizedEmail);
  if (!user) {
    user = await users.findOne({ aliases: normalizedEmail });
  }

  const newRole = await calculateUserRole(normalizedEmail);

  if (user) {
    // Update existing user
    const update: any = { updatedAt: new Date() };
    if (picture && picture !== user.avatarUrl) {
      update.avatarUrl = picture;
      user.avatarUrl = picture;
    }
    // Update role if it changed (don't downgrade admins or clients automatically for now)
    if (newRole !== user.role && user.role !== 'admin' && user.role !== 'client') {
      update.role = newRole;
      user.role = newRole;
    }
    
    await users.updateOne({ _id: user._id }, { $set: update });
    return await generateAuthResult(user, picture);
  }

  // Create new user (Totally Stoked role by default if no subscriptions found)
  const now = new Date();
  const newUser: User = {
    _id: new ObjectId(),
    email: normalizedEmail,
    name,
    role: newRole,
    avatarUrl: picture,
    emailVerifiedAt: now,
    active: true,
    createdAt: now,
    updatedAt: now,
  };
  await users.insertOne(newUser);
  
  // New user from Google OAuth? Add to mailing list.
  await addToMailingList(normalizedEmail);
  
  return await generateAuthResult(newUser, picture);
}

export async function impersonateUser(actorId: string, targetId: string): Promise<AuthResult> {
  const db = await getDb();
  const actor = await db.collection<User>('users').findOne({ _id: new ObjectId(actorId) });
  if (!actor || (actor.role !== 'admin' && actor.role !== 'agent')) {
    throw new Error('Not authorized to impersonate');
  }

  const target = await db.collection<User>('users').findOne({ _id: new ObjectId(targetId) });
  if (!target) {
    throw new Error('Target user not found');
  }

  if (actor.role === 'agent') {
    const isAgent = await db.collection('users').findOne({
      _id: new ObjectId(targetId),
      agentIds: new ObjectId(actorId)
    });
    if (!isAgent) {
      throw new Error('Not authorized as an agent for this user');
    }
  }

  return await generateAuthResult(target, target.avatarUrl, actorId);
}

export function verifyToken(token: string): AuthTokenPayload {
  return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
}
