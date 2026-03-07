import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';

export type UserRole = 'admin' | 'client' | 'agent' | 'reader' | 'author' | 'editor';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: UserRole;
  createdAt: Date;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface AuthResult {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  };
}

/**
 * AuthService handles user registration, login, and token management.
 *
 * NOTE: Users are currently stored in an in-memory Map because there is no
 * User model/collection yet in the database layer. When a User model is
 * added (in a future phase), this should be replaced with a proper
 * UserRepository/UserModel that persists data to MongoDB.
 */
@Injectable()
export class AuthService {
  // In-memory user store (temporary - see note above)
  private readonly users = new Map<string, User>();
  private userIdCounter = 1;

  // Domains that automatically get the 'admin' role
  private readonly autoDomains: string[];

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    // Allow override via AUTH_AUTO_DOMAINS env var (comma-separated list)
    const envDomains = this.configService?.get?.<string>('AUTH_AUTO_DOMAINS') || process.env.AUTH_AUTO_DOMAINS;
    if (envDomains) {
      this.autoDomains = envDomains.split(',').map((d) => d.trim().toLowerCase());
    } else {
      this.autoDomains = ['stokedconsulting.com', 'stoked-ui.com', 'brianstoker.com'];
    }
  }

  /**
   * Determine the role for a given email address based on domain.
   * Emails ending in trusted domains get the 'admin' role.
   * All other emails get the 'client' role.
   */
  private determineRole(email: string): UserRole {
    const domain = email.split('@')[1]?.toLowerCase();
    if (domain && this.autoDomains.includes(domain)) {
      return 'admin';
    }
    return 'client';
  }

  /**
   * Register a new user.
   * Hashes the password with bcryptjs and stores the user in-memory.
   */
  async register(email: string, password: string, name: string): Promise<AuthResult> {
    const normalizedEmail = email.toLowerCase();

    // Check for duplicate email
    for (const user of this.users.values()) {
      if (user.email === normalizedEmail) {
        throw new ConflictException('Email already registered');
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const role = this.determineRole(normalizedEmail);
    const id = String(this.userIdCounter++);

    const newUser: User = {
      id,
      email: normalizedEmail,
      passwordHash,
      name,
      role,
      createdAt: new Date(),
    };

    this.users.set(id, newUser);

    return this.generateAuthResult(newUser);
  }

  /**
   * Validate user credentials and return a JWT on success.
   */
  async login(email: string, password: string): Promise<AuthResult> {
    const normalizedEmail = email.toLowerCase();

    // Find user by email
    let found: User | undefined;
    for (const user of this.users.values()) {
      if (user.email === normalizedEmail) {
        found = user;
        break;
      }
    }

    if (!found) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(password, found.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateAuthResult(found);
  }

  /**
   * Validate a JWT payload (called by JwtStrategy after token verification).
   * Returns the user if found, otherwise null.
   */
  async validateToken(payload: JwtPayload): Promise<User | null> {
    const user = this.users.get(payload.sub);
    if (!user || user.email !== payload.email) {
      return null;
    }
    return user;
  }

  /**
   * Get user by ID.
   */
  getUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  /**
   * Build the AuthResult object (token + public user info).
   */
  private generateAuthResult(user: User): AuthResult {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }
}
