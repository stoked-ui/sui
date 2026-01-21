import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MediaEntity } from './entities/media.entity';
import { CreateMediaDto, UpdateMediaDto, QueryMediaDto, MediaResponseDto, PaginatedMediaResponseDto } from './dto';
import { ExtractMetadataResponseDto } from './dto/extract-metadata.dto';
import { S3Service } from '../s3/s3.service';
import { MetadataExtractionService } from './metadata/metadata-extraction.service';

/**
 * MediaService
 * Handles all media CRUD operations, queries, and business logic
 * Currently uses in-memory storage - will be replaced with database in future phases
 */
@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);
  private mediaStore: Map<string, MediaEntity> = new Map();
  private idCounter = 1;

  constructor(
    private readonly s3Service: S3Service,
    private readonly metadataExtractionService: MetadataExtractionService,
    private readonly configService: ConfigService,
  ) {
    // Initialize with some mock data for testing
    this.seedMockData();
  }

  /**
   * Create a new media entry
   * Called after file upload to create database record
   */
  async create(createMediaDto: CreateMediaDto): Promise<MediaResponseDto> {
    const id = `media_${this.idCounter++}`;

    const media = new MediaEntity({
      _id: id,
      ...createMediaDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.mediaStore.set(id, media);
    this.logger.log(`Created media: ${id} (type: ${media.mediaType}, owner: ${media.author})`);

    return new MediaResponseDto(media);
  }

  /**
   * Find all media with filtering, search, sorting, and pagination
   */
  async findAll(query: QueryMediaDto): Promise<PaginatedMediaResponseDto> {
    let results = Array.from(this.mediaStore.values());

    // Filter out soft-deleted unless explicitly requested
    if (!query.includeDeleted) {
      results = results.filter((media) => !media.deleted);
    }

    // Apply filters
    if (query.mediaType) {
      results = results.filter((media) => media.mediaType === query.mediaType);
    }

    if (query.mime) {
      results = results.filter((media) => media.mime === query.mime);
    }

    if (query.uploadedBy) {
      results = results.filter((media) => media.author === query.uploadedBy);
    }

    if (query.publicity) {
      results = results.filter((media) => media.publicity === query.publicity);
    }

    if (query.rating) {
      results = results.filter((media) => media.rating === query.rating);
    }

    if (query.mediaClass) {
      results = results.filter((media) => media.mediaClass === query.mediaClass);
    }

    if (query.uploadSessionId) {
      results = results.filter((media) => media.uploadSessionId === query.uploadSessionId);
    }

    // Date range filtering
    if (query.dateFrom) {
      const fromDate = new Date(query.dateFrom);
      results = results.filter((media) => media.createdAt >= fromDate);
    }

    if (query.dateTo) {
      const toDate = new Date(query.dateTo);
      results = results.filter((media) => media.createdAt <= toDate);
    }

    // Search functionality
    if (query.search) {
      const searchTerm = query.search.toLowerCase();
      results = results.filter(
        (media) =>
          media.title?.toLowerCase().includes(searchTerm) ||
          media.description?.toLowerCase().includes(searchTerm) ||
          media.file?.toLowerCase().includes(searchTerm) ||
          media.tags?.some((tag) => tag.toLowerCase().includes(searchTerm)),
      );
    }

    // Tag filtering
    if (query.tags) {
      const requiredTags = query.tags.split(',').map((tag) => tag.trim().toLowerCase());
      results = results.filter((media) =>
        requiredTags.every((tag) => media.tags?.some((mediaTag) => mediaTag.toLowerCase() === tag)),
      );
    }

    // Get total before pagination
    const total = results.length;

    // Sorting
    const sortBy = query.sortBy || '-createdAt';
    const isDescending = sortBy.startsWith('-');
    const sortField = isDescending ? sortBy.substring(1) : sortBy;

    results.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;

      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime();
      } else {
        comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }

      return isDescending ? -comparison : comparison;
    });

    // Pagination
    const limit = query.limit || 20;
    const offset = query.offset || 0;
    const paginatedResults = results.slice(offset, offset + limit);

    // Generate cursor for next page (use last item's ID)
    const cursor = paginatedResults.length > 0 ? paginatedResults[paginatedResults.length - 1]._id : undefined;

    return new PaginatedMediaResponseDto(paginatedResults, total, limit, offset, cursor);
  }

  /**
   * Find a single media item by ID
   */
  async findOne(id: string): Promise<MediaResponseDto> {
    const media = this.mediaStore.get(id);

    if (!media || media.deleted) {
      throw new NotFoundException(`Media with ID ${id} not found`);
    }

    // Increment view count
    media.views = (media.views || 0) + 1;
    media.updatedAt = new Date();

    return new MediaResponseDto(media);
  }

  /**
   * Update media metadata
   * Only the owner can update their media
   */
  async update(id: string, updateMediaDto: UpdateMediaDto, userId: string): Promise<MediaResponseDto> {
    const media = this.mediaStore.get(id);

    if (!media || media.deleted) {
      throw new NotFoundException(`Media with ID ${id} not found`);
    }

    // Authorization check - only owner can update
    if (media.author !== userId) {
      throw new ForbiddenException('You can only update your own media');
    }

    // Update fields
    Object.assign(media, updateMediaDto);
    media.updatedAt = new Date();

    this.logger.log(`Updated media: ${id} by user: ${userId}`);

    return new MediaResponseDto(media);
  }

  /**
   * Delete media (file + database)
   * Supports both hard delete and soft delete
   */
  async remove(id: string, userId: string, softDelete: boolean = true): Promise<void> {
    const media = this.mediaStore.get(id);

    if (!media || media.deleted) {
      throw new NotFoundException(`Media with ID ${id} not found`);
    }

    // Authorization check - only owner can delete
    if (media.author !== userId) {
      throw new ForbiddenException('You can only delete your own media');
    }

    if (softDelete) {
      // Soft delete - mark as deleted but keep data
      media.deleted = true;
      media.deletedAt = new Date();
      media.updatedAt = new Date();

      this.logger.log(`Soft deleted media: ${id} by user: ${userId}`);
    } else {
      // Hard delete - remove from S3 and database
      try {
        // Extract S3 keys from URLs
        const fileKey = this.s3Service.extractS3Key(media.file);
        const thumbnailKeys = media.thumbnailKeys || [];

        // Add thumbnail URLs if they exist
        if (media.thumbnail) {
          const thumbKey = this.s3Service.extractS3Key(media.thumbnail);
          if (thumbKey) thumbnailKeys.push(thumbKey);
        }

        if (media.paidThumbnail) {
          const paidThumbKey = this.s3Service.extractS3Key(media.paidThumbnail);
          if (paidThumbKey) thumbnailKeys.push(paidThumbKey);
        }

        // Delete from S3
        if (fileKey) {
          const bucket = media.bucket || this.configService.get<string>('AWS_S3_BUCKET', 'stoked-ui-media');
          await this.s3Service.deleteMediaAndThumbnails({
            fileKey,
            thumbnailKeys,
            bucket,
          });
        }

        // Delete from database
        this.mediaStore.delete(id);

        this.logger.log(`Hard deleted media: ${id} (deleted ${1 + thumbnailKeys.length} files from S3)`);
      } catch (error) {
        this.logger.error(`Failed to delete media ${id}: ${error.message}`, error.stack);
        throw error;
      }
    }
  }

  /**
   * Restore soft-deleted media
   */
  async restore(id: string, userId: string): Promise<MediaResponseDto> {
    const media = this.mediaStore.get(id);

    if (!media) {
      throw new NotFoundException(`Media with ID ${id} not found`);
    }

    if (!media.deleted) {
      return new MediaResponseDto(media);
    }

    // Authorization check - only owner can restore
    if (media.author !== userId) {
      throw new ForbiddenException('You can only restore your own media');
    }

    media.deleted = false;
    media.deletedAt = undefined;
    media.updatedAt = new Date();

    this.logger.log(`Restored media: ${id} by user: ${userId}`);

    return new MediaResponseDto(media);
  }

  /**
   * Extract metadata from a media file
   * Async processing that doesn't block upload completion
   */
  async extractMetadata(id: string): Promise<ExtractMetadataResponseDto> {
    const media = this.mediaStore.get(id);

    if (!media || media.deleted) {
      throw new NotFoundException(`Media with ID ${id} not found`);
    }

    try {
      this.logger.log(`Starting metadata extraction for media: ${id}`);

      // Extract metadata based on media type
      const extractedMetadata = await this.metadataExtractionService.extractMetadata(
        media.file,
        media.mime,
      );

      // Update media entity with extracted metadata
      if (extractedMetadata.video) {
        const videoMeta = extractedMetadata.video;
        if (videoMeta.codec) media.codec = videoMeta.codec;
        if (videoMeta.container) media.container = videoMeta.container as 'mp4' | 'mov' | 'webm' | 'mkv';
        if (videoMeta.bitrate) media.bitrate = videoMeta.bitrate;
        if (videoMeta.duration) media.duration = videoMeta.duration;
        if (videoMeta.width) media.width = videoMeta.width;
        if (videoMeta.height) media.height = videoMeta.height;
        if (videoMeta.framerate) media.framerate = videoMeta.framerate;
        if (videoMeta.moovAtomPosition) media.moovAtomPosition = videoMeta.moovAtomPosition;
      }

      if (extractedMetadata.audio) {
        media.audioCodec = extractedMetadata.audio.codec;
        media.audioBitrate = extractedMetadata.audio.bitrate;
        media.audioSampleRate = extractedMetadata.audio.sampleRate;
        media.audioChannels = extractedMetadata.audio.channels;
        // For audio files, also set duration
        if (!media.duration) {
          media.duration = extractedMetadata.audio.duration;
        }
      }

      if (extractedMetadata.image) {
        media.width = extractedMetadata.image.width;
        media.height = extractedMetadata.image.height;
        media.imageFormat = extractedMetadata.image.format;
        media.exifData = extractedMetadata.image.exif;
      }

      // Mark metadata extraction as complete
      if (!media.processingTasks) {
        media.processingTasks = {};
      }
      media.processingTasks.metadata = true;
      media.updatedAt = new Date();

      this.logger.log(`Successfully extracted metadata for media: ${id}`);

      return {
        success: true,
        metadata: extractedMetadata,
      };
    } catch (error) {
      this.logger.error(`Failed to extract metadata for media ${id}: ${error.message}`, error.stack);

      // Track failure for retry/debugging
      if (!media.metadataProcessingFailures) {
        media.metadataProcessingFailures = [];
      }

      const existingFailure = media.metadataProcessingFailures.find(
        (f) => f.task === 'metadata-extraction',
      );

      if (existingFailure) {
        existingFailure.attemptCount++;
        existingFailure.timestamp = new Date();
        existingFailure.error = error.message;
      } else {
        media.metadataProcessingFailures.push({
          task: 'metadata-extraction',
          error: error.message,
          timestamp: new Date(),
          attemptCount: 1,
        });
      }

      media.updatedAt = new Date();

      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Seed mock data for testing
   */
  private seedMockData(): void {
    const mockMedia = [
      new MediaEntity({
        _id: 'media_1',
        author: 'user_123',
        title: 'Beautiful Sunset',
        description: 'A stunning sunset over the ocean',
        mediaType: 'image',
        mime: 'image/jpeg',
        file: 'https://cdn.example.com/media/sunset.jpg',
        width: 1920,
        height: 1080,
        size: 2048000,
        thumbnail: 'https://cdn.example.com/thumbnails/sunset_thumb.jpg',
        publicity: 'public',
        rating: 'ga',
        views: 42,
        tags: ['nature', 'sunset', 'ocean'],
        createdAt: new Date('2026-01-15T10:00:00Z'),
        updatedAt: new Date('2026-01-15T10:00:00Z'),
      }),
      new MediaEntity({
        _id: 'media_2',
        author: 'user_123',
        title: 'Product Demo Video',
        description: 'Demonstration of our new product features',
        mediaType: 'video',
        mime: 'video/mp4',
        file: 'https://cdn.example.com/media/demo.mp4',
        width: 1920,
        height: 1080,
        duration: 180,
        size: 52428800,
        thumbnail: 'https://cdn.example.com/thumbnails/demo_thumb.jpg',
        publicity: 'public',
        rating: 'ga',
        views: 156,
        tags: ['demo', 'product', 'tutorial'],
        createdAt: new Date('2026-01-18T14:30:00Z'),
        updatedAt: new Date('2026-01-18T14:30:00Z'),
      }),
      new MediaEntity({
        _id: 'media_3',
        author: 'user_456',
        title: 'Premium Content',
        description: 'Exclusive paid content',
        mediaType: 'video',
        mime: 'video/mp4',
        file: 'https://cdn.example.com/media/premium.mp4',
        width: 3840,
        height: 2160,
        duration: 600,
        size: 209715200,
        thumbnail: 'https://cdn.example.com/thumbnails/premium_thumb.jpg',
        paidThumbnail: 'https://cdn.example.com/thumbnails/premium_blurred.jpg',
        publicity: 'paid',
        rating: 'nc17',
        price: 10000,
        views: 28,
        tags: ['premium', 'exclusive'],
        createdAt: new Date('2026-01-20T08:15:00Z'),
        updatedAt: new Date('2026-01-20T08:15:00Z'),
      }),
    ];

    mockMedia.forEach((media) => {
      this.mediaStore.set(media._id, media);
    });

    this.idCounter = 4;
    this.logger.log(`Seeded ${mockMedia.length} mock media items`);
  }

  getInfo() {
    return {
      name: '@stoked-ui/media-api',
      version: '0.1.0',
      description: 'NestJS API for Stoked UI Media Components',
      mediaCount: this.mediaStore.size,
    };
  }
}
