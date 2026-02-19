import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { ThumbnailGenerationService } from './thumbnail-generation.service';
import { MetadataExtractionService } from './metadata/metadata-extraction.service';
import { VideoProcessingService } from './metadata/video-processing.service';
import { S3Module } from '../s3/s3.module';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { AuthGuard } from './guards/auth.guard';

@Module({
  imports: [DatabaseModule, S3Module, AuthModule],
  controllers: [MediaController],
  providers: [
    MediaService,
    ThumbnailGenerationService,
    MetadataExtractionService,
    VideoProcessingService,
    AuthGuard,
  ],
  exports: [
    MediaService,
    ThumbnailGenerationService,
    MetadataExtractionService,
    VideoProcessingService,
  ],
})
export class MediaModule {}
