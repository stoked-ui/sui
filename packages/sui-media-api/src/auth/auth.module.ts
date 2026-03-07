import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        let secret: string | undefined;
        try {
          secret = (globalThis as any).Resource?.JWT_SECRET?.value;
          if (!secret) {
            const { Resource } = await import('sst');
            secret = (Resource as any).JWT_SECRET?.value;
          }
        } catch { /* ignore */ }

        if (!secret) {
          secret = configService?.get?.<string>('JWT_SECRET') || process.env.JWT_SECRET || 'dev-secret-change-me';
        }

        return {
          secret,
          signOptions: {
            expiresIn: configService?.get?.<string>('JWT_EXPIRES_IN') || process.env.JWT_EXPIRES_IN || '7d',
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  // Export AuthService and JwtModule so other modules can use them
  // (e.g., the media AuthGuard can inject JwtService for manual token validation)
  exports: [AuthService, JwtModule, PassportModule],
})
export class AuthModule {}
