import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JWT authentication guard.
 * Delegates to the Passport 'jwt' strategy (JwtStrategy).
 * Use this guard on routes that require a valid Bearer token.
 *
 * Usage:
 *   @UseGuards(JwtAuthGuard)
 *   @Get('protected')
 *   getProtected(@Request() req) { ... }
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
