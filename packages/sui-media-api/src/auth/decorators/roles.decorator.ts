import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../auth.service';

export const ROLES_KEY = 'roles';

/**
 * @Roles decorator – specify the minimum role required to access a route.
 *
 * Usage:
 *   @Roles('author')   // requires at least the 'author' role
 *   @Roles('admin')    // requires the 'admin' role
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
