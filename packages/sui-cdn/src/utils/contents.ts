import { mockObjects } from '../data/mockContents';

export interface CdnFolder {
  name: string;
  path: string;
  url: string;
}

export interface CdnObject {
  name: string;
  path: string;
  size: number;
  lastModified: string;
  url: string;
}

export interface CdnContents {
  folders: CdnFolder[];
  objects: CdnObject[];
}

export function normalizePrefix(prefix: string): string {
  return prefix
    .trim()
    .replace(/\/+/g, '/')
    .replace(/^\//, '')
    .replace(/(.+[^/])$/, '$1/');
}

function splitName(path: string, prefix: string): string {
  return path.slice(prefix.length);
}

export function buildPublicUrl(path: string, publicBaseUrl: string): string {
  return new URL(path, `${publicBaseUrl.replace(/\/$/, '')}/`).toString();
}

function formatFolder(path: string, prefix: string): CdnFolder {
  return {
    name: splitName(path, prefix),
    path,
    url: `/?prefix=${encodeURIComponent(path)}`,
  };
}

function formatObject(
  path: string,
  meta: { size: number; lastModified: string; url?: string },
  prefix: string,
  publicBaseUrl: string,
): CdnObject {
  return {
    name: splitName(path, prefix),
    path,
    size: meta.size,
    lastModified: meta.lastModified,
    url: meta.url || buildPublicUrl(path, publicBaseUrl),
  };
}

export function fromFlatObjects(
  prefix: string,
  objects: Array<{ path: string; size: number; lastModified: string; url?: string }>,
  publicBaseUrl = '',
): CdnContents {
  const folderPaths = new Set<string>();
  const directObjects: CdnObject[] = [];

  for (const object of objects) {
    if (!object.path.startsWith(prefix)) {
      continue;
    }

    const remainder = splitName(object.path, prefix);

    if (!remainder || remainder === '/') {
      continue;
    }

    const slashIndex = remainder.indexOf('/');
    if (slashIndex === -1) {
      directObjects.push(formatObject(object.path, object, prefix, publicBaseUrl));
      continue;
    }

    folderPaths.add(`${prefix}${remainder.slice(0, slashIndex + 1)}`);
  }

  return {
    folders: Array.from(folderPaths)
      .sort((left, right) => left.localeCompare(right))
      .map((path) => formatFolder(path, prefix)),
    objects: directObjects.sort((left, right) => left.path.localeCompare(right.path)),
  };
}

function normalizeJson(
  payload: any,
  prefix: string,
  publicBaseUrl: string,
): CdnContents {
  if (Array.isArray(payload?.items)) {
    return fromFlatObjects(prefix, payload.items, publicBaseUrl);
  }

  return {
    folders: (payload?.folders || []).map((folder: any) => ({
      ...folder,
      url: folder.url || `/?prefix=${encodeURIComponent(folder.path)}`,
    })),
    objects: (payload?.objects || []).map((object: any) => ({
      ...object,
      url: object.url || buildPublicUrl(object.path, publicBaseUrl),
    })),
  };
}

function parseS3Xml(text: string, prefix: string, publicBaseUrl: string): CdnContents {
  const doc = new DOMParser().parseFromString(text, 'application/xml');
  const parserError = doc.querySelector('parsererror');

  if (parserError) {
    throw new Error('Invalid XML response from contents endpoint');
  }

  const folders = Array.from(doc.querySelectorAll('CommonPrefixes > Prefix')).map((node) =>
    formatFolder(node.textContent || '', prefix),
  );

  const objects = Array.from(doc.querySelectorAll('Contents')).map((node) => {
    const path = node.querySelector('Key')?.textContent || '';
    return formatObject(
      path,
      {
        size: Number(node.querySelector('Size')?.textContent || 0),
        lastModified: node.querySelector('LastModified')?.textContent || '',
      },
      prefix,
      publicBaseUrl,
    );
  });

  return {
    folders,
    objects: objects.filter((object) => object.name && object.name !== '/'),
  };
}

async function fetchRemote(
  prefix: string,
  contentsEndpoint: string,
  publicBaseUrl: string,
): Promise<CdnContents> {
  const url = new URL(contentsEndpoint, window.location.origin);
  url.searchParams.set('prefix', prefix);
  url.searchParams.set('delimiter', '/');

  const response = await fetch(url.toString(), {
    credentials: 'include',
  });

  if (!response.ok) {
    const contentType = response.headers.get('content-type') || '';
    const body = contentType.includes('application/json')
      ? await response.json().catch(() => ({}))
      : {};
    const error: any = new Error(body.message || `Contents request failed with ${response.status}`);
    error.status = response.status;
    error.code = body.code;
    throw error;
  }

  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return normalizeJson(await response.json(), prefix, publicBaseUrl);
  }

  return parseS3Xml(await response.text(), prefix, publicBaseUrl);
}

export async function getContents(
  rawPrefix: string,
  contentsEndpoint: string,
  publicBaseUrl = '',
): Promise<CdnContents> {
  const prefix = normalizePrefix(rawPrefix);

  if (!contentsEndpoint) {
    return fromFlatObjects(prefix, mockObjects, publicBaseUrl);
  }

  try {
    return await fetchRemote(prefix, contentsEndpoint, publicBaseUrl);
  } catch (error: any) {
    const hasStatusCode = typeof error === 'object' && error !== null && 'status' in error;
    if (
      typeof window !== 'undefined'
      && window.location.hostname === 'localhost'
      && (!hasStatusCode || error.code === 'credentials_unavailable')
    ) {
      console.warn('Falling back to mock CDN contents for local development.', error);
      return fromFlatObjects(prefix, mockObjects, publicBaseUrl);
    }

    throw error;
  }
}

export function getFileKind(path: string): string {
  const extension = path.split('.').pop()?.toLowerCase() || '';

  if (['mp4', 'mov', 'webm', 'm4v'].includes(extension)) {
    return 'video';
  }

  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'avif'].includes(extension)) {
    return 'image';
  }

  if (['zip', 'dmg', 'exe', 'pkg'].includes(extension)) {
    return 'download';
  }

  if (['js', 'map', 'json', 'xml', 'html', 'css'].includes(extension)) {
    return 'code';
  }

  return 'file';
}

export function formatBytes(size: number): string {
  if (!size) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const exponent = Math.min(Math.floor(Math.log(size) / Math.log(1024)), units.length - 1);
  const value = size / 1024 ** exponent;

  return `${value.toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

export function formatTimestamp(value: string): string {
  if (!value) {
    return 'Unknown';
  }

  return new Date(value).toLocaleString();
}

export function buildCrumbs(
  prefix: string,
): Array<{ label: string; path: string; href: string }> {
  const normalized = normalizePrefix(prefix);
  const segments = normalized.split('/').filter(Boolean);

  return segments.map((segment, index) => {
    const path = `${segments.slice(0, index + 1).join('/')}/`;
    return {
      label: segment,
      path,
      href: `/?prefix=${encodeURIComponent(path)}`,
    };
  });
}
