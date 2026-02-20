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
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'dev-secret-change-me'),
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
