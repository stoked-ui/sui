import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';

/**
 * Authentication Guard
 * Validates that the request has a valid user session
 * Currently uses mock authentication - will be replaced with real auth in future phases
 */
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    // Extract user from request
    // In production, this would validate JWT tokens or session cookies
    const userId = this.extractUserId(request);

    if (!userId) {
      throw new UnauthorizedException('Authentication required');
    }

    // Attach user to request for use in controllers
    request.user = { id: userId };

    return true;
  }

  /**
   * Extract user ID from request
   * Priority: x-user-id header > query param > mock fallback
   */
  private extractUserId(request: any): string | null {
    // Check x-user-id header (for development/testing)
    const headerUserId = request.headers['x-user-id'];
    if (headerUserId) {
      return headerUserId;
    }

    // Check query parameter (for development/testing)
    const queryUserId = request.query.userId;
    if (queryUserId) {
      return queryUserId;
    }

    // TODO: In production, extract from JWT token or session
    // const token = request.headers.authorization?.replace('Bearer ', '');
    // if (token) {
    //   const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //   return decoded.userId;
    // }

    return null;
  }
}
