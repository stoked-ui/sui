import type { NextApiResponse } from 'next';
import {
  deleteCdnPermission,
  getCdnPermission,
  listCdnPermissions,
  normalizeCdnPath,
  upsertCdnPermission,
} from 'docs/src/modules/cdn/cdnAccess';
import { withAuth, type AuthenticatedRequest } from 'docs/src/modules/auth/withAuth';
import type { UserRole } from 'docs/src/modules/auth/authStore';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  if (req.method === 'GET') {
    const path = Array.isArray(req.query.path) ? req.query.path[0] : req.query.path;
    if (typeof path === 'string' && path.trim()) {
      const permission = await getCdnPermission(path);
      return res.status(200).json(
        permission
          ? {
              ...permission,
              _id: permission._id?.toString(),
            }
          : null,
      );
    }

    const prefix = Array.isArray(req.query.prefix) ? req.query.prefix[0] : req.query.prefix;
    const permissions = await listCdnPermissions(prefix);
    return res.status(200).json(
      permissions.map((permission) => ({
        ...permission,
        _id: permission._id?.toString(),
      })),
    );
  }

  if (req.method === 'PUT') {
    const { path, viewRoles, viewUserIds } = req.body || {};
    if (!path || typeof path !== 'string') {
      return res.status(400).json({ message: 'path is required' });
    }

    const permission = await upsertCdnPermission(
      {
        sub: req.user.sub,
        role: req.user.role,
        clientSlug: req.user.clientSlug,
      },
      {
        path: normalizeCdnPath(path, { directory: path.endsWith('/') }),
        viewRoles: Array.isArray(viewRoles) ? (viewRoles as UserRole[]) : [],
        viewUserIds: Array.isArray(viewUserIds) ? viewUserIds.filter((value): value is string => typeof value === 'string') : [],
      },
    );

    return res.status(200).json({
      ...permission,
      _id: permission?._id?.toString(),
    });
  }

  if (req.method === 'DELETE') {
    const path = Array.isArray(req.query.path) ? req.query.path[0] : req.query.path;
    if (!path || typeof path !== 'string') {
      return res.status(400).json({ message: 'path is required' });
    }

    const result = await deleteCdnPermission(path);
    return res.status(200).json(result);
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

export default withAuth(handler);
