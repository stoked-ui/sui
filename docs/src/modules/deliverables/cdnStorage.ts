const DEFAULT_DELIVERABLES_CDN_BUCKET = 'cdn.stokedconsulting.com';
const DEFAULT_DELIVERABLES_CDN_BASE_URL = 'https://cdn.stokedconsulting.com';

type DeliverableCdnLocationOptions = {
  clientSlug: string;
  bundleName: string;
  filePath: string;
};

export const DELIVERABLES_CDN_BUCKET =
  process.env.DELIVERABLES_CDN_BUCKET
  || process.env.CDN_S3_BUCKET
  || process.env.BLOG_IMAGE_S3_BUCKET
  || DEFAULT_DELIVERABLES_CDN_BUCKET;

export const DELIVERABLES_CDN_BASE_URL =
  process.env.DELIVERABLES_CDN_BASE_URL
  || process.env.CDN_PUBLIC_BASE_URL
  || process.env.BLOG_IMAGE_CDN_URL
  || DEFAULT_DELIVERABLES_CDN_BASE_URL;

function sanitizeSegment(rawValue: string, fieldName: string) {
  const normalized = rawValue
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-')
    .slice(0, 120);

  if (!normalized) {
    throw new Error(`${fieldName} is invalid`);
  }

  return normalized;
}

export function sanitizeDeliverableFilePath(rawPath: string) {
  const normalized = rawPath.replace(/\\/g, '/').replace(/^\/+/, '');
  if (!normalized || normalized.includes('..')) {
    throw new Error('Invalid filePath');
  }
  return normalized;
}

export function buildDeliverableCdnKey(options: DeliverableCdnLocationOptions) {
  const { clientSlug, bundleName, filePath } = options;
  const safeClientSlug = sanitizeSegment(clientSlug, 'clientSlug');
  const safeBundleName = sanitizeSegment(bundleName, 'bundleName');
  const safePath = sanitizeDeliverableFilePath(filePath);

  return `clients/${safeClientSlug}/deliverables/${safeBundleName}/${safePath}`;
}

export function buildDeliverableCdnUrl(options: DeliverableCdnLocationOptions) {
  const key = buildDeliverableCdnKey(options);
  return new URL(key, `${DELIVERABLES_CDN_BASE_URL.replace(/\/$/, '')}/`).toString();
}
