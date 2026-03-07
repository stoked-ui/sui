import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService, JwtPayload, User } from '../auth.service';

/**
 * Passport JWT strategy.
 * Extracts the JWT from the Authorization: Bearer <token> header,
 * verifies the signature using JWT_SECRET, and loads the user via AuthService.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    configService: ConfigService,
  ) {
    // We cannot use await in constructor, so we use a little trick
    // PassportStrategy calls `validate` after verification.
    // We can provide a getter or just use process.env as fallback.
    
    const getSecret = () => {
      let secret: string | undefined;
      // In Lambda, SST sets these up before the handler runs
      // but they are available via globalThis.Resource in SST v4
      try {
        secret = (globalThis as any).Resource?.JWT_SECRET?.value;
        if (!secret) {
          secret = (globalThis as any).$SST_LINKS?.JWT_SECRET?.value;
        }
      } catch { /* ignore */ }

      if (!secret) {
        secret = configService?.get?.<string>('JWT_SECRET') || process.env.JWT_SECRET || 'dev-secret-change-me';
      }
      return secret;
    };

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: (request, rawJwtToken, done) => {
        done(null, getSecret());
      },
    });
  }

  /**
   * Called by Passport after the JWT signature is verified.
   * Returns the user object or throws UnauthorizedException.
   */
  async validate(payload: JwtPayload): Promise<User> {
    const user = await this.authService.validateToken(payload);
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }
    return user;
  }
}
