import { contentsEndpoint, publicBaseUrl } from '../config';
import { mockObjects } from '../data/mockContents';

function normalizePrefix(prefix) {
  return prefix
    .trim()
    .replace(/\/+/g, '/')
    .replace(/^\//, '')
    .replace(/(.+[^/])$/, '$1/');
}

function splitName(path, prefix) {
  return path.slice(prefix.length);
}

function buildPublicUrl(path) {
  return new URL(path, `${publicBaseUrl.replace(/\/$/, '')}/`).toString();
}

function formatFolder(path, prefix) {
  return {
    name: splitName(path, prefix),
    path,
    url: `/?prefix=${encodeURIComponent(path)}`,
  };
}

function formatObject(path, meta, prefix) {
  return {
    name: splitName(path, prefix),
    path,
    size: meta.size,
    lastModified: meta.lastModified,
    url: meta.url || buildPublicUrl(path),
  };
}

function fromFlatObjects(prefix, objects) {
  const folderPaths = new Set();
  const directObjects = [];

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
      directObjects.push(formatObject(object.path, object, prefix));
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

function normalizeJson(payload, prefix) {
  if (Array.isArray(payload?.items)) {
    return fromFlatObjects(prefix, payload.items);
  }

  return {
    folders: (payload?.folders || []).map((folder) => ({
      ...folder,
      url: folder.url || `/?prefix=${encodeURIComponent(folder.path)}`,
    })),
    objects: (payload?.objects || []).map((object) => ({
      ...object,
      url: object.url || buildPublicUrl(object.path),
    })),
  };
}

function parseS3Xml(text, prefix) {
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
    );
  });

  return {
    folders,
    objects: objects.filter((object) => object.name && object.name !== '/'),
  };
}

async function fetchRemote(prefix) {
  const url = new URL(contentsEndpoint, window.location.origin);
  url.searchParams.set('prefix', prefix);
  url.searchParams.set('delimiter', '/');

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Contents request failed with ${response.status}`);
  }

  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return normalizeJson(await response.json(), prefix);
  }

  return parseS3Xml(await response.text(), prefix);
}

export async function getContents(rawPrefix) {
  const prefix = normalizePrefix(rawPrefix);

  if (!contentsEndpoint) {
    return fromFlatObjects(prefix, mockObjects);
  }

  return fetchRemote(prefix);
}

export function getFileKind(path) {
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

export function formatBytes(size) {
  if (!size) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const exponent = Math.min(Math.floor(Math.log(size) / Math.log(1024)), units.length - 1);
  const value = size / 1024 ** exponent;

  return `${value.toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

export function formatTimestamp(value) {
  if (!value) {
    return 'Unknown';
  }

  return new Date(value).toLocaleString();
}

export function buildCrumbs(prefix) {
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
