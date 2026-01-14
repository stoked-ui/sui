import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StorageService } from './services/storage.service';

/**
 * StorageModule
 *
 * Handles file storage operations:
 * - Upload rendered videos to S3
 * - Manage temporary file storage
 * - Generate signed URLs for downloads
 * - Handle file cleanup and lifecycle
 */
@Module({
  imports: [ConfigModule],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
