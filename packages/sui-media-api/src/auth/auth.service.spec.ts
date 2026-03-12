import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-jwt-token'),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should assign admin role to email with trusted domain', async () => {
      const result = await service.register(
        'developer@stokedconsulting.com',
        'password123',
        'Dev User',
      );

      expect(result.user.role).toBe('admin');
      expect(result.user.email).toBe('developer@stokedconsulting.com');
      expect(result.access_token).toBe('mock-jwt-token');
    });

    it('should assign admin role to stoked-ui.com domain', async () => {
      const result = await service.register(
        'contributor@stoked-ui.com',
        'password123',
        'Contributor',
      );

      expect(result.user.role).toBe('admin');
    });

    it('should assign admin role to brianstoker.com domain', async () => {
      const result = await service.register(
        'brian@brianstoker.com',
        'securepass',
        'Brian',
      );

      expect(result.user.role).toBe('admin');
    });

    it('should assign client role to external email', async () => {
      const result = await service.register(
        'someone@gmail.com',
        'password123',
        'Some Person',
      );

      expect(result.user.role).toBe('client');
      expect(result.user.email).toBe('someone@gmail.com');
    });

    it('should assign client role to unknown domain', async () => {
      const result = await service.register(
        'user@example.org',
        'password123',
        'Example User',
      );

      expect(result.user.role).toBe('client');
    });

    it('should throw ConflictException if email already registered', async () => {
      await service.register('dup@gmail.com', 'pass1', 'First');

      await expect(
        service.register('dup@gmail.com', 'pass2', 'Second'),
      ).rejects.toThrow(ConflictException);
    });

    it('should return access_token on successful registration', async () => {
      const result = await service.register('new@test.com', 'mypassword', 'Test');

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('user');
      expect(result.user).toHaveProperty('id');
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      // Pre-register a user for login tests
      await service.register('login@example.com', 'correct-password', 'Login User');
    });

    it('should return access_token for valid credentials', async () => {
      const result = await service.login('login@example.com', 'correct-password');

      expect(result.access_token).toBe('mock-jwt-token');
      expect(result.user.email).toBe('login@example.com');
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      await expect(
        service.login('login@example.com', 'wrong-password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      await expect(
        service.login('nobody@example.com', 'any-password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should be case-insensitive for email', async () => {
      const result = await service.login('LOGIN@EXAMPLE.COM', 'correct-password');

      expect(result.user.email).toBe('login@example.com');
    });
  });

  describe('validateToken', () => {
    it('should return user for valid payload', async () => {
      const registered = await service.register('validate@test.com', 'pass', 'Val');
      const user = await service.validateToken({
        sub: registered.user.id,
        email: registered.user.email,
        role: registered.user.role,
        name: registered.user.name,
      });

      expect(user).not.toBeNull();
      expect(user?.email).toBe('validate@test.com');
    });

    it('should return null for unknown user id', async () => {
      const user = await service.validateToken({
        sub: '9999',
        email: 'ghost@test.com',
        role: 'client',
        name: 'Ghost',
      });

      expect(user).toBeNull();
    });
  });
});
