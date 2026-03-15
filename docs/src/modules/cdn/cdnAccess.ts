import { ObjectId } from 'mongodb';
import { getDb } from '../db/mongodb';
import type { UserRole } from '../auth/authStore';

export type CdnViewerRole = UserRole | 'anonymous';

export type CdnViewer = {
  sub: string;
  role: CdnViewerRole;
  clientSlug?: string;
};

export type CdnPermissionDoc = {
  _id?: ObjectId;
  path: string;
  viewRoles?: UserRole[];
  viewUserIds?: string[];
  createdAt: Date;
  updatedAt: Date;
  updatedBy: string;
};

type CdnEntry = {
  path: string;
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function uniqueValues(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

export function normalizeCdnPath(rawValue: string, options: { directory?: boolean } = {}) {
  const collapsed = rawValue
    .trim()
    .replace(/\\/g, '/')
    .replace(/\/+/g, '/')
    .replace(/^\/+/, '')
    .replace(/\.\.(\/|\\)/g, '');

  if (!collapsed) {
    return '';
  }

  const normalized = collapsed.replace(/\/$/, '');
  if (options.directory) {
    return `${normalized}/`;
  }

  return normalized;
}

function buildPathCandidates(path: string) {
  const normalized = normalizeCdnPath(path, { directory: path.endsWith('/') });
  if (!normalized) {
    return [];
  }

  const directoryPath = normalized.endsWith('/') ? normalized.slice(0, -1) : normalized;
  const segments = directoryPath.split('/').filter(Boolean);
  const candidates: string[] = [];

  for (let index = 0; index < segments.length - 1; index += 1) {
    candidates.push(`${segments.slice(0, index + 1).join('/')}/`);
  }

  if (normalized.endsWith('/')) {
    candidates.push(normalized);
  } else {
    candidates.push(normalized);
  }

  return uniqueValues(candidates);
}

function userMatchesPermission(viewer: CdnViewer, permission: Pick<CdnPermissionDoc, 'viewRoles' | 'viewUserIds'>) {
  if (viewer.role === 'admin') {
    return true;
  }

  if (viewer.role !== 'anonymous' && permission.viewRoles?.includes(viewer.role)) {
    return true;
  }

  if (permission.viewUserIds?.includes(viewer.sub)) {
    return true;
  }

  return false;
}

async function findMostSpecificPermission(path: string) {
  const candidates = buildPathCandidates(path);
  if (candidates.length === 0) {
    return null;
  }

  const db = await getDb();
  const docs = await db
    .collection<CdnPermissionDoc>('cdnPermissions')
    .find({ path: { $in: candidates } })
    .toArray();

  return docs.sort((left, right) => right.path.length - left.path.length)[0] || null;
}

async function hasAccessibleDescendant(viewer: CdnViewer, prefix: string) {
  const normalizedPrefix = normalizeCdnPath(prefix, { directory: true });

  if (!normalizedPrefix) {
    return true;
  }

  if (viewer.role === 'client' && viewer.clientSlug) {
    const clientRoot = `clients/${viewer.clientSlug}/`;
    if (normalizedPrefix === 'clients/' || clientRoot.startsWith(normalizedPrefix)) {
      return true;
    }
  }

  const db = await getDb();
  const permissions = await db
    .collection<CdnPermissionDoc>('cdnPermissions')
    .find({
      path: { $regex: `^${escapeRegExp(normalizedPrefix)}` },
    })
    .limit(100)
    .toArray();

  return permissions.some((permission) => userMatchesPermission(viewer, permission));
}

export async function canViewCdnPath(viewer: CdnViewer, path: string) {
  if (viewer.role === 'admin') {
    return true;
  }

  const normalizedPath = normalizeCdnPath(path, { directory: path.endsWith('/') });
  if (!normalizedPath) {
    return true;
  }

  const explicitPermission = await findMostSpecificPermission(normalizedPath);
  if (explicitPermission) {
    return userMatchesPermission(viewer, explicitPermission);
  }

  if (normalizedPath === 'clients/' || normalizedPath.startsWith('clients/')) {
    if (viewer.role === 'client' && viewer.clientSlug) {
      const clientRoot = `clients/${viewer.clientSlug}/`;
      return (
        normalizedPath === 'clients/'
        || normalizedPath === clientRoot
        || normalizedPath.startsWith(clientRoot)
      );
    }

    return false;
  }

  return true;
}

export function canManageCdnPath(viewer: CdnViewer) {
  return viewer.role === 'admin';
}

export async function canSeeCdnEntry(viewer: CdnViewer, entry: CdnEntry) {
  const normalizedPath = normalizeCdnPath(entry.path, { directory: entry.path.endsWith('/') });
  if (!normalizedPath) {
    return true;
  }

  if (await canViewCdnPath(viewer, normalizedPath)) {
    return true;
  }

  if (!normalizedPath.endsWith('/')) {
    return false;
  }

  return hasAccessibleDescendant(viewer, normalizedPath);
}

export async function filterCdnContents<
  TFolder extends CdnEntry,
  TObject extends CdnEntry,
>(viewer: CdnViewer, folders: TFolder[], objects: TObject[]) {
  const visibleFolders: TFolder[] = [];
  for (const folder of folders) {
    if (await canSeeCdnEntry(viewer, folder)) {
      visibleFolders.push(folder);
    }
  }

  const visibleObjects: TObject[] = [];
  for (const object of objects) {
    if (await canViewCdnPath(viewer, object.path)) {
      visibleObjects.push(object);
    }
  }

  return {
    folders: visibleFolders,
    objects: visibleObjects,
  };
}

export async function listCdnPermissions(prefix?: string) {
  const db = await getDb();
  const normalizedPrefix = prefix ? normalizeCdnPath(prefix, { directory: prefix.endsWith('/') }) : '';
  const filter = normalizedPrefix
    ? { path: { $regex: `^${escapeRegExp(normalizedPrefix)}` } }
    : {};

  return db
    .collection<CdnPermissionDoc>('cdnPermissions')
    .find(filter)
    .sort({ path: 1 })
    .toArray();
}

export async function getCdnPermission(path: string) {
  const normalizedPath = normalizeCdnPath(path, { directory: path.endsWith('/') });
  if (!normalizedPath) {
    return null;
  }

  const db = await getDb();
  return db.collection<CdnPermissionDoc>('cdnPermissions').findOne({ path: normalizedPath });
}

export async function upsertCdnPermission(
  viewer: CdnViewer,
  input: Pick<CdnPermissionDoc, 'path' | 'viewRoles' | 'viewUserIds'>,
) {
  const normalizedPath = normalizeCdnPath(input.path, { directory: input.path.endsWith('/') });
  if (!normalizedPath) {
    throw new Error('path is required');
  }

  const now = new Date();
  const db = await getDb();

  const nextDoc: Omit<CdnPermissionDoc, '_id'> = {
    path: normalizedPath,
    viewRoles: uniqueValues(input.viewRoles || []) as UserRole[],
    viewUserIds: uniqueValues(input.viewUserIds || []),
    createdAt: now,
    updatedAt: now,
    updatedBy: viewer.sub,
  };

  await db.collection<CdnPermissionDoc>('cdnPermissions').updateOne(
    { path: normalizedPath },
    {
      $set: {
        viewRoles: nextDoc.viewRoles,
        viewUserIds: nextDoc.viewUserIds,
        updatedAt: now,
        updatedBy: viewer.sub,
      },
      $setOnInsert: {
        createdAt: now,
      },
    },
    { upsert: true },
  );

  return db.collection<CdnPermissionDoc>('cdnPermissions').findOne({ path: normalizedPath });
}

export async function deleteCdnPermission(path: string) {
  const normalizedPath = normalizeCdnPath(path, { directory: path.endsWith('/') });
  if (!normalizedPath) {
    throw new Error('path is required');
  }

  const db = await getDb();
  await db.collection<CdnPermissionDoc>('cdnPermissions').deleteOne({ path: normalizedPath });
  return {
    path: normalizedPath,
    deleted: true,
  };
}
