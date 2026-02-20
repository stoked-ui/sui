import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

/**
 * Authentication Guard
 *
 * Supports two authentication modes (tried in order):
 *
 * 1. JWT Bearer token  – Authorization: Bearer <token>
 *    Decodes and validates the token using the configured JWT_SECRET.
 *    Sets request.user = { id, email, role, name } from the token payload.
 *
 * 2. x-user-id header fallback (development only)
 *    When NODE_ENV !== 'production', the legacy x-user-id header is still
 *    accepted so that existing development tooling and tests continue to work.
 *    In production this fallback is disabled and requests without a valid JWT
 *    are rejected.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    // --- 1. Try JWT Bearer token ---
    const authHeader: string | undefined = request.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      try {
        const secret = this.configService.get<string>('JWT_SECRET', 'dev-secret-change-me');
        const payload = this.jwtService.verify(token, { secret }) as {
          sub: string;
          email: string;
          role: string;
          name: string;
        };
        request.user = {
          id: payload.sub,
          email: payload.email,
          role: payload.role,
          name: payload.name,
        };
        return true;
      } catch {
        throw new UnauthorizedException('Invalid or expired token');
      }
    }

    // --- 2. x-user-id header fallback (dev mode only) ---
    if (process.env.NODE_ENV !== 'production') {
      const headerUserId = request.headers['x-user-id'];
      if (headerUserId) {
        request.user = { id: headerUserId };
        return true;
      }

      // Also accept query param userId (for backwards compatibility in dev/test)
      const queryUserId = request.query?.userId;
      if (queryUserId) {
        request.user = { id: queryUserId };
        return true;
      }
    }

    throw new UnauthorizedException('Authentication required');
  }
}
