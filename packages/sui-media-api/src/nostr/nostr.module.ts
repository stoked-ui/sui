import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NostrService } from './nostr.service';
import { DatabaseModule } from '../database/database.module';

/**
 * NostrModule wires up the background Nostr polling service.
 *
 * It imports:
 *   - ConfigModule  – to provide ConfigService for env-var access.
 *   - DatabaseModule – to provide the BlogPost Mongoose model.
 *
 * The NostrService implements OnModuleInit / OnModuleDestroy, so NestJS
 * will automatically start and stop the polling loop with the application.
 */
@Module({
  imports: [ConfigModule, DatabaseModule],
  providers: [NostrService],
  exports: [NostrService],
})
export class NostrModule {}
