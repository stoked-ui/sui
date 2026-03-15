import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { ObjectId } from 'mongodb';
import type { AuthTokenPayload } from 'docs/src/modules/auth/authStore';
import {
  calculateUserRole,
  createAuthResultForUser,
  findUserByEmail,
  type AuthResult,
  type User,
} from 'docs/src/modules/auth/authStore';
import { getDb } from 'docs/src/modules/db/mongodb';
import { isValidEmail } from 'docs/src/modules/license/licenseApiUtils';

const PRODUCT_FEEDBACK_VERIFICATION_TTL_MS = 15 * 60 * 1000;
const PRODUCT_FEEDBACK_RESEND_COOLDOWN_MS = 60 * 1000;
const sesClient = new SESClient({ region: process.env.AWS_REGION || 'us-east-1' });
const sesFromEmail = process.env.SES_FROM_EMAIL || 'noreply@stoked-ui.com';

type ProductFeedbackVerificationDoc = {
  _id: ObjectId;
  email: string;
  name: string;
  passwordHash: string;
  codeHash: string;
  codeExpiresAt: Date;
  resendAvailableAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

type ProductFeedbackDoc = {
  _id: ObjectId;
  productId: string;
  rating: number;
  message: string;
  userId: ObjectId;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function generateVerificationCode() {
  return crypto.randomInt(100000, 1000000).toString();
}

async function findExistingAccount(email: string) {
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    return existingUser;
  }

  const db = await getDb();
  return db.collection<User>('users').findOne({ aliases: email });
}

async function sendVerificationEmail(email: string, code: string) {
  try {
    await sesClient.send(
      new SendEmailCommand({
        Source: sesFromEmail,
        Destination: {
          ToAddresses: [email],
        },
        Message: {
          Subject: {
            Data: 'Verify your Stoked Consulting feedback account',
          },
          Body: {
            Text: {
              Data: [
                'Use this code to verify your email address and continue to the product feedback form.',
                '',
                `Verification code: ${code}`,
                '',
                'This code expires in 15 minutes.',
                '',
                'If you did not request this, you can ignore this email.',
              ].join('\n'),
            },
          },
        },
      }),
    );
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[product-feedback] Falling back to console delivery for verification email:', error);
      console.info(`[product-feedback] verification code for ${email}: ${code}`);
      return;
    }

    throw error;
  }
}

function validateRegistrationInput(name: string, email: string, password: string) {
  if (name.trim().length < 2) {
    throw new Error('Name must be at least 2 characters');
  }

  if (!isValidEmail(email)) {
    throw new Error('Enter a valid email address');
  }

  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }
}

export async function startProductFeedbackRegistration(params: {
  name: string;
  email: string;
  password: string;
}) {
  const name = params.name.trim();
  const email = normalizeEmail(params.email);
  const password = params.password;
  validateRegistrationInput(name, email, password);

  const existingUser = await findExistingAccount(email);
  if (existingUser) {
    throw new Error('Email already registered');
  }

  const db = await getDb();
  const verificationCollection = db.collection<ProductFeedbackVerificationDoc>('productFeedbackVerifications');
  const now = new Date();
  const existingRequest = await verificationCollection.findOne({ email });
  if (existingRequest && existingRequest.resendAvailableAt > now) {
    const secondsRemaining = Math.max(
      1,
      Math.ceil((existingRequest.resendAvailableAt.getTime() - now.getTime()) / 1000),
    );
    throw new Error(`Please wait ${secondsRemaining}s before requesting another code`);
  }

  const code = generateVerificationCode();
  const [passwordHash, codeHash] = await Promise.all([
    bcrypt.hash(password, 10),
    bcrypt.hash(code, 10),
  ]);
  const codeExpiresAt = new Date(now.getTime() + PRODUCT_FEEDBACK_VERIFICATION_TTL_MS);
  const resendAvailableAt = new Date(now.getTime() + PRODUCT_FEEDBACK_RESEND_COOLDOWN_MS);

  await verificationCollection.updateOne(
    { email },
    {
      $set: {
        name,
        passwordHash,
        codeHash,
        codeExpiresAt,
        resendAvailableAt,
        updatedAt: now,
      },
      $setOnInsert: {
        createdAt: now,
      },
    },
    { upsert: true },
  );

  await sendVerificationEmail(email, code);

  return {
    email,
    expiresAt: codeExpiresAt.toISOString(),
  };
}

export async function verifyProductFeedbackRegistration(params: {
  email: string;
  code: string;
}): Promise<AuthResult> {
  const email = normalizeEmail(params.email);
  const code = params.code.trim();

  if (!isValidEmail(email)) {
    throw new Error('Enter a valid email address');
  }

  if (!/^\d{6}$/.test(code)) {
    throw new Error('Verification code must be 6 digits');
  }

  const db = await getDb();
  const verificationCollection = db.collection<ProductFeedbackVerificationDoc>('productFeedbackVerifications');
  const verification = await verificationCollection.findOne({ email });

  if (!verification) {
    throw new Error('No verification request found for this email');
  }

  if (verification.codeExpiresAt.getTime() < Date.now()) {
    await verificationCollection.deleteOne({ _id: verification._id });
    throw new Error('Verification code expired. Request a new one.');
  }

  const codeMatches = await bcrypt.compare(code, verification.codeHash);
  if (!codeMatches) {
    throw new Error('Invalid verification code');
  }

  const existingUser = await findExistingAccount(email);
  if (existingUser) {
    await verificationCollection.deleteOne({ _id: verification._id });
    throw new Error('Email already registered');
  }

  const now = new Date();
  const role = await calculateUserRole(email);
  const user: User = {
    _id: new ObjectId(),
    email,
    passwordHash: verification.passwordHash,
    name: verification.name,
    role,
    emailVerifiedAt: now,
    active: true,
    createdAt: now,
    updatedAt: now,
  };

  await db.collection<User>('users').insertOne(user);
  await verificationCollection.deleteOne({ _id: verification._id });

  return createAuthResultForUser(user);
}

export async function submitProductFeedback(params: {
  productId: string;
  rating: number;
  message: string;
  user: Pick<AuthTokenPayload, 'sub' | 'email' | 'name'>;
}) {
  const productId = params.productId.trim();
  const message = params.message.trim();
  const rating = Number(params.rating);

  if (!/^[a-z0-9-]+$/i.test(productId)) {
    throw new Error('Select a valid product');
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5 stars');
  }

  if (message.length < 2) {
    throw new Error('Feedback message must be at least 2 characters');
  }

  if (message.length > 5000) {
    throw new Error('Feedback message must be 5000 characters or less');
  }

  const db = await getDb();
  const now = new Date();
  const doc: ProductFeedbackDoc = {
    _id: new ObjectId(),
    productId,
    rating,
    message,
    userId: new ObjectId(params.user.sub),
    email: normalizeEmail(params.user.email),
    name: params.user.name.trim(),
    createdAt: now,
    updatedAt: now,
  };
  const result = await db.collection<ProductFeedbackDoc>('productFeedback').insertOne(doc);

  return {
    id: result.insertedId.toString(),
  };
}
