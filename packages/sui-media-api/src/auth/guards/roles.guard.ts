import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../auth.service';

/**
 * Role hierarchy – higher index means more permissions.
 * A user with role X can access routes that require any role at or below X.
 */
const ROLE_HIERARCHY: UserRole[] = ['reader', 'author', 'editor', 'admin'];

function getRoleLevel(role: UserRole): number {
  return ROLE_HIERARCHY.indexOf(role);
}

/**
 * RolesGuard enforces role-based authorization on top of authentication.
 * It reads the required roles from the @Roles() decorator on the handler (or class),
 * then checks whether the authenticated user's role meets the minimum requirement.
 *
 * Must be used AFTER JwtAuthGuard (or another guard that populates request.user).
 *
 * Usage:
 *   @UseGuards(JwtAuthGuard, RolesGuard)
 *   @Roles('author')
 *   @Post('articles')
 *   createArticle() { ... }
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get required roles from @Roles() decorator (handler takes precedence over class)
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no @Roles decorator, allow access (role check not required)
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.role) {
      return false;
    }

    const userLevel = getRoleLevel(user.role as UserRole);

    // User must meet at least one of the required roles (minimum level check)
    return requiredRoles.some((required) => userLevel >= getRoleLevel(required));
  }
}
