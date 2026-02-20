import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { MediaModule } from './media/media.module';
import { HealthModule } from './health/health.module';
import { UploadsModule } from './uploads/uploads.module';
import { AuthModule } from './auth/auth.module';
import { BlogModule } from './blog/blog.module';
import { NostrModule } from './nostr/nostr.module';

@Module({
  imports: [
    // ConfigModule must be first AND global so all modules can inject ConfigService
    ConfigModule.forRoot({ isGlobal: true }),
    // AuthModule provides JWT authentication and user management
    AuthModule,
    // DatabaseModule provides MongoDB connection and schemas
    DatabaseModule,
    MediaModule,
    HealthModule,
    UploadsModule,
    BlogModule,
    // NostrModule polls Nostr relays for NIP-23 long-form content (background service)
    NostrModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
