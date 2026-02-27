import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { getDb } from 'docs/src/modules/db/mongodb';

export type UserRole = 'admin' | 'client';

export interface User {
  _id: ObjectId;
  email: string;
  passwordHash?: string;
  name: string;
  role: UserRole;
  clientId?: ObjectId;
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
  };
}

const AUTO_DOMAINS = (process.env.AUTH_AUTO_DOMAINS || 'stokedconsulting.com,stoked-ui.com,brianstoker.com')
  .split(',')
  .map((d) => d.trim().toLowerCase());

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
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

function generateAuthResult(user: User, pictureUrl?: string): AuthResult {
  const payload = {
    sub: user._id.toString(),
    email: user.email,
    role: user.role,
    name: user.name,
    clientId: user.clientId?.toString(),
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
    },
  };
}

async function findUserByEmail(email: string): Promise<User | null> {
  const db = await getDb();
  return db.collection<User>('users').findOne({ email });
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
  const newUser: Omit<User, '_id'> = {
    email: normalizedEmail,
    passwordHash,
    name,
    role: determineRole(normalizedEmail),
    active: true,
    createdAt: now,
    updatedAt: now,
  };
  const result = await db.collection('users').insertOne(newUser);
  return generateAuthResult({ ...newUser, _id: result.insertedId } as User);
}

export async function login(email: string, password: string): Promise<AuthResult> {
  const normalizedEmail = email.toLowerCase();
  let user = await findUserByEmail(normalizedEmail);

  // If no direct match, check if this email is an alias on another user
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
  return generateAuthResult(user);
}

export async function loginWithGooglePayload(email: string, name: string, picture?: string): Promise<AuthResult> {
  const normalizedEmail = email.toLowerCase();
  const db = await getDb();
  const users = db.collection<User>('users');

  // Try direct email match, then alias match
  let user = await findUserByEmail(normalizedEmail);
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

  const now = new Date();
  const newUser: User = {
    _id: new ObjectId(),
    email: normalizedEmail,
    name,
    role: determineRole(normalizedEmail),
    avatarUrl: picture,
    active: true,
    createdAt: now,
    updatedAt: now,
  };
  await users.insertOne(newUser);
  return generateAuthResult(newUser, picture);
}

export function verifyToken(token: string): { sub: string; email: string; role: UserRole; name: string; clientId?: string } {
  return jwt.verify(token, JWT_SECRET) as { sub: string; email: string; role: UserRole; name: string; clientId?: string };
}
