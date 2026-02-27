import type { NextApiResponse } from 'next';
import { LicenseStoreError } from './licenseStore';

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function handleLicenseApiError(
  res: NextApiResponse,
  error: unknown,
  fallback = 'Unexpected server error',
) {
  if (error instanceof LicenseStoreError) {
    return res.status(error.status).json({ message: error.message });
  }

  if (error instanceof Error) {
    return res.status(500).json({ message: error.message || fallback });
  }

  return res.status(500).json({ message: fallback });
}
