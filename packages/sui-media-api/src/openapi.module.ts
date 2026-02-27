import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { HealthController } from './health/health.controller';
import { MediaController } from './media/media.controller';
import { MediaService } from './media/media.service';
import { ThumbnailGenerationService } from './media/thumbnail-generation.service';
import { UploadsController } from './uploads/uploads.controller';
import { UploadsService } from './uploads/uploads.service';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { InvoicesController } from './invoices/invoices.controller';
import { InvoicesService } from './invoices/invoices.service';
import { AuthGuard } from './media/guards/auth.guard';
import { ApiKeyGuard } from './invoices/guards/api-key.guard';

/**
 * Creates a stub object whose methods all return undefined.
 * NestJS inspects injected values during init (e.g. toString, Symbol checks),
 * so a plain object is safer than a Proxy which can trap those calls.
 */
function createNoopStub(): any {
  return {};
}

/**
 * Lightweight module that registers every controller with noop service
 * stubs. Used exclusively by the OpenAPI export / validation scripts so
 * they can generate a complete spec without starting MongoDB, S3, or any
 * other external dependency.
 */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({}),
  ],
  controllers: [
    HealthController,
    MediaController,
    UploadsController,
    AuthController,
    InvoicesController,
  ],
  providers: [
    { provide: MediaService, useValue: createNoopStub() },
    { provide: ThumbnailGenerationService, useValue: createNoopStub() },
    { provide: UploadsService, useValue: createNoopStub() },
    { provide: AuthService, useValue: createNoopStub() },
    { provide: InvoicesService, useValue: createNoopStub() },
    AuthGuard,
    ApiKeyGuard,
  ],
})
export class OpenApiModule {}
