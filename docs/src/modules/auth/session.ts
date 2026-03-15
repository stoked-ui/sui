import type { NextApiRequest, NextApiResponse } from 'next';
import * as jwt from 'jsonwebtoken';
import { type AuthResult, type AuthTokenPayload, verifyToken } from './authStore';
import {
  STOKED_CONSULTING_CDN_ORIGIN,
  STOKED_CONSULTING_ORIGIN,
  STOKED_UI_ORIGIN,
} from '../utils/siteRouting';

export const AUTH_COOKIE_NAME = 'stoked_auth';

const AUTH_TRANSFER_SECRET = process.env.AUTH_TRANSFER_SECRET || process.env.JWT_SECRET || 'dev-secret-change-me';
const AUTH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const AUTH_TRANSFER_EXPIRES_IN = '5m';

type CookieOptions = {
  httpOnly?: boolean;
  maxAge?: number;
  path?: string;
  sameSite?: 'Lax' | 'Strict' | 'None';
  secure?: boolean;
};

type TransferTokenPayload = {
  sessionToken: string;
  targetOrigin: string;
};

function isProduction() {
  return process.env.NODE_ENV === 'production';
}

function appendSetCookieHeader(res: NextApiResponse, cookieValue: string) {
  const current = res.getHeader('Set-Cookie');
  if (!current) {
    res.setHeader('Set-Cookie', cookieValue);
    return;
  }

  if (Array.isArray(current)) {
    res.setHeader('Set-Cookie', [...current, cookieValue]);
    return;
  }

  res.setHeader('Set-Cookie', [String(current), cookieValue]);
}

function serializeCookie(name: string, value: string, options: CookieOptions = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  const path = options.path || '/';
  parts.push(`Path=${path}`);

  if (options.maxAge !== undefined) {
    parts.push(`Max-Age=${options.maxAge}`);
  }

  if (options.httpOnly !== false) {
    parts.push('HttpOnly');
  }

  parts.push(`SameSite=${options.sameSite || 'Lax'}`);

  if (options.secure ?? isProduction()) {
    parts.push('Secure');
  }

  return parts.join('; ');
}

function parseCookies(header: string | undefined) {
  if (!header) {
    return {};
  }

  return header.split(';').reduce<Record<string, string>>((acc, part) => {
    const [rawName, ...rawValue] = part.trim().split('=');
    if (!rawName) {
      return acc;
    }

    acc[rawName] = decodeURIComponent(rawValue.join('='));
    return acc;
  }, {});
}

export function getRequestOrigin(req: NextApiRequest) {
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:5199';
  const protocolHeader = req.headers['x-forwarded-proto'];
  const protocol = Array.isArray(protocolHeader)
    ? protocolHeader[0]
    : protocolHeader || (String(host).includes('localhost') ? 'http' : 'https');

  return `${protocol}://${String(host).split(',')[0].trim()}`;
}

export function readSessionTokenFromRequest(req: NextApiRequest) {
  const cookies = parseCookies(req.headers.cookie);
  return cookies[AUTH_COOKIE_NAME] || null;
}

export function readSessionUserFromRequest(req: NextApiRequest): AuthTokenPayload | null {
  const token = readSessionTokenFromRequest(req);
  if (!token) {
    return null;
  }

  return verifyToken(token);
}

export function setAuthSession(res: NextApiResponse, authResultOrToken: AuthResult | string) {
  const accessToken =
    typeof authResultOrToken === 'string'
      ? authResultOrToken
      : authResultOrToken.access_token;

  appendSetCookieHeader(
    res,
    serializeCookie(AUTH_COOKIE_NAME, accessToken, {
      httpOnly: true,
      maxAge: AUTH_COOKIE_MAX_AGE_SECONDS,
      path: '/',
      sameSite: 'Lax',
      secure: isProduction(),
    }),
  );
}

export function clearAuthSession(res: NextApiResponse) {
  appendSetCookieHeader(
    res,
    serializeCookie(AUTH_COOKIE_NAME, '', {
      httpOnly: true,
      maxAge: 0,
      path: '/',
      sameSite: 'Lax',
      secure: isProduction(),
    }),
  );
}

export function getAllowedTransferOrigins() {
  const configuredOrigins = (process.env.AUTH_PUBLIC_ORIGINS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  return new Set([
    STOKED_UI_ORIGIN,
    STOKED_CONSULTING_ORIGIN,
    STOKED_CONSULTING_CDN_ORIGIN,
    ...configuredOrigins,
  ]);
}

export function isAllowedTransferOrigin(origin: string) {
  if (!origin) {
    return false;
  }

  if (/^http:\/\/localhost:\d+$/i.test(origin)) {
    return true;
  }

  return getAllowedTransferOrigins().has(origin);
}

export function signAuthTransferToken(sessionToken: string, targetOrigin: string) {
  const payload: TransferTokenPayload = {
    sessionToken,
    targetOrigin,
  };

  return jwt.sign(
    payload,
    AUTH_TRANSFER_SECRET,
    {
      expiresIn: AUTH_TRANSFER_EXPIRES_IN,
      issuer: 'stoked-auth-transfer',
      audience: targetOrigin,
    },
  );
}

export function verifyAuthTransferToken(token: string, targetOrigin: string) {
  const payload = jwt.verify(token, AUTH_TRANSFER_SECRET, {
    issuer: 'stoked-auth-transfer',
    audience: targetOrigin,
  }) as TransferTokenPayload;

  if (payload.targetOrigin !== targetOrigin) {
    throw new Error('Transfer token target mismatch');
  }

  verifyToken(payload.sessionToken);
  return payload.sessionToken;
}
