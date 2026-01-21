import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpStatus,
  HttpCode,
  NotFoundException,
  BadRequestException,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { MediaService } from './media.service';
import { ThumbnailGenerationService } from './thumbnail-generation.service';
import {
  CreateMediaDto,
  UpdateMediaDto,
  QueryMediaDto,
  MediaResponseDto,
  PaginatedMediaResponseDto,
  GenerateThumbnailDto,
  GenerateSpriteSheetDto,
  ThumbnailResponseDto,
  SpriteSheetResponseDto,
} from './dto';
import { ExtractMetadataResponseDto } from './dto/extract-metadata.dto';
import { AuthGuard } from './guards/auth.guard';
import { UserId } from './decorators/current-user.decorator';

/**
 * Media Controller
 * RESTful API endpoints for media CRUD operations
 * All endpoints require authentication except /api/info
 */
@Controller('media')
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
    private readonly thumbnailService: ThumbnailGenerationService,
  ) {}

  /**
   * GET /media/api/info
   * Get API information and statistics
   * Does not require authentication
   */
  @Get('api/info')
  getInfo() {
    return this.mediaService.getInfo();
  }

  /**
   * GET /media
   * List media with filtering, search, sorting, and pagination
   * Requires authentication
   *
   * Query parameters:
   * - limit: Number of items per page (default: 20)
   * - offset: Number of items to skip (default: 0)
   * - cursor: Cursor for cursor-based pagination
   * - mediaType: Filter by type (image/video/album)
   * - mime: Filter by MIME type
   * - uploadedBy: Filter by author user ID
   * - publicity: Filter by publicity level
   * - rating: Filter by content rating
   * - dateFrom: Filter by date range start (ISO date)
   * - dateTo: Filter by date range end (ISO date)
   * - search: Search in title, description, filename, tags
   * - tags: Comma-separated tag search
   * - sortBy: Sort field (createdAt/-createdAt/size/-size/etc)
   *
   * @example
   * GET /media?limit=10&mediaType=video&sortBy=-createdAt
   * GET /media?search=sunset&tags=nature,ocean
   * GET /media?uploadedBy=user_123&publicity=public
   */
  @Get()
  @UseGuards(AuthGuard)
  async findAll(@Query(ValidationPipe) query: QueryMediaDto): Promise<PaginatedMediaResponseDto> {
    return this.mediaService.findAll(query);
  }

  /**
   * GET /media/:id
   * Get a single media item by ID
   * Increments view count on each access
   * Requires authentication
   *
   * @param id - Media ID
   * @returns Media item with metadata
   * @throws NotFoundException if media not found
   *
   * @example
   * GET /media/media_1
   */
  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(@Param('id') id: string): Promise<MediaResponseDto> {
    return this.mediaService.findOne(id);
  }

  /**
   * POST /media
   * Create a new media entry
   * Used after file upload to create database record
   * Requires authentication
   *
   * Body should include:
   * - author: User ID (owner)
   * - mediaType: Type (image/video/album)
   * - mime: MIME type
   * - file: S3 key or URL
   * - Optional: title, description, dimensions, thumbnails, etc.
   *
   * @param createMediaDto - Media creation data
   * @returns Created media item
   *
   * @example
   * POST /media
   * {
   *   "author": "user_123",
   *   "title": "My Video",
   *   "mediaType": "video",
   *   "mime": "video/mp4",
   *   "file": "s3://bucket/uploads/video.mp4"
   * }
   */
  @Post()
  @UseGuards(AuthGuard)
  async create(@Body(ValidationPipe) createMediaDto: CreateMediaDto): Promise<MediaResponseDto> {
    return this.mediaService.create(createMediaDto);
  }

  /**
   * PATCH /media/:id
   * Update media metadata
   * Only the owner can update their media
   * Requires authentication
   *
   * Authorization: Checks that userId matches media.author
   *
   * @param id - Media ID
   * @param updateMediaDto - Fields to update
   * @param userId - Current user ID (from auth guard)
   * @returns Updated media item
   * @throws NotFoundException if media not found
   * @throws ForbiddenException if user is not the owner
   *
   * @example
   * PATCH /media/media_1
   * Headers: { "x-user-id": "user_123" }
   * {
   *   "title": "Updated Title",
   *   "description": "New description",
   *   "tags": ["new", "tags"]
   * }
   */
  @Patch(':id')
  @UseGuards(AuthGuard)
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateMediaDto: UpdateMediaDto,
    @UserId() userId: string,
  ): Promise<MediaResponseDto> {
    return this.mediaService.update(id, updateMediaDto, userId);
  }

  /**
   * DELETE /media/:id
   * Delete media (file + database)
   * Only the owner can delete their media
   * Requires authentication
   *
   * Default: Soft delete (marks as deleted, preserves data)
   * Query param hardDelete=true: Hard delete (removes from S3 + database)
   *
   * Authorization: Checks that userId matches media.author
   *
   * Deletes:
   * - Main media file from S3
   * - All thumbnails from S3
   * - Database record (hard delete) or marks as deleted (soft delete)
   *
   * @param id - Media ID
   * @param userId - Current user ID (from auth guard)
   * @param hardDelete - Whether to permanently delete (default: false)
   * @returns 204 No Content on success
   * @throws NotFoundException if media not found
   * @throws ForbiddenException if user is not the owner
   *
   * @example
   * DELETE /media/media_1
   * Headers: { "x-user-id": "user_123" }
   *
   * DELETE /media/media_1?hardDelete=true
   * Headers: { "x-user-id": "user_123" }
   */
  @Delete(':id')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @UserId() userId: string,
    @Query('hardDelete') hardDelete?: string,
  ): Promise<void> {
    const performHardDelete = hardDelete === 'true';
    await this.mediaService.remove(id, userId, !performHardDelete);
  }

  /**
   * POST /media/:id/restore
   * Restore a soft-deleted media item
   * Only the owner can restore their media
   * Requires authentication
   *
   * @param id - Media ID
   * @param userId - Current user ID (from auth guard)
   * @returns Restored media item
   * @throws NotFoundException if media not found
   * @throws ForbiddenException if user is not the owner
   */
  @Post(':id/restore')
  @UseGuards(AuthGuard)
  async restore(@Param('id') id: string, @UserId() userId: string): Promise<MediaResponseDto> {
    return this.mediaService.restore(id, userId);
  }

  /**
   * Extract metadata from a media file
   * POST /media/:id/extract-metadata
   */
  @Post(':id/extract-metadata')
  @HttpCode(HttpStatus.OK)
  async extractMetadata(
    @Param('id') id: string,
  ): Promise<ExtractMetadataResponseDto> {
    return await this.mediaService.extractMetadata(id);
  }

  /**
   * Generate a thumbnail for a video at a specific timestamp
   * POST /media/:id/generate-thumbnail
   */
  @Post(':id/generate-thumbnail')
  @HttpCode(HttpStatus.OK)
  async generateThumbnail(
    @Param('id') id: string,
    @Body() dto: GenerateThumbnailDto,
  ): Promise<ThumbnailResponseDto> {
    // TODO: Fetch media entity from database to get video path and bucket
    // For now, this is a placeholder showing the API structure
    throw new BadRequestException(
      'Thumbnail generation requires database integration (Work Item 3.1)',
    );

    // Example implementation (uncomment when database is ready):
    /*
    const media = await this.mediaService.findById(id);

    if (!media) {
      throw new NotFoundException(`Media with ID ${id} not found`);
    }

    if (media.mediaType !== 'video') {
      throw new BadRequestException('Thumbnails can only be generated for videos');
    }

    // Download video from S3 or use local path
    const videoPath = await this.getVideoPath(media);
    const bucket = media.bucket || this.configService.get('AWS_S3_BUCKET');
    const keyPrefix = `media/${id}`;

    const result = await this.thumbnailService.generateThumbnail(
      videoPath,
      dto.timestamp,
      dto.size,
      bucket,
      keyPrefix,
    );

    // Update media entity with thumbnail URL
    await this.mediaService.update(id, {
      thumbnail: result.thumbnailUrl,
      thumbnailKeys: [...(media.thumbnailKeys || []), result.thumbnailKey],
    });

    return result;
    */
  }

  /**
   * Generate sprite sheet for video scrubbing
   * POST /media/:id/generate-sprites
   */
  @Post(':id/generate-sprites')
  @HttpCode(HttpStatus.OK)
  async generateSpriteSheet(
    @Param('id') id: string,
    @Body() dto: GenerateSpriteSheetDto,
  ): Promise<SpriteSheetResponseDto> {
    // TODO: Fetch media entity from database to get video path and bucket
    // For now, this is a placeholder showing the API structure
    throw new BadRequestException(
      'Sprite generation requires database integration (Work Item 3.1)',
    );

    // Example implementation (uncomment when database is ready):
    /*
    const media = await this.mediaService.findById(id);

    if (!media) {
      throw new NotFoundException(`Media with ID ${id} not found`);
    }

    if (media.mediaType !== 'video') {
      throw new BadRequestException('Sprite sheets can only be generated for videos');
    }

    if (!media.duration) {
      throw new BadRequestException('Video duration is required for sprite generation');
    }

    // Download video from S3 or use local path
    const videoPath = await this.getVideoPath(media);
    const bucket = media.bucket || this.configService.get('AWS_S3_BUCKET');
    const keyPrefix = `media/${id}`;

    const result = await this.thumbnailService.generateSpriteSheet(
      videoPath,
      media.duration,
      bucket,
      keyPrefix,
      {
        frameWidth: dto.frameWidth,
        frameHeight: dto.frameHeight,
        framesPerRow: dto.framesPerRow,
        interval: dto.interval,
      },
    );

    // Update media entity with sprite sheet info
    await this.mediaService.update(id, {
      scrubberGenerated: true,
      scrubberSprite: result.spriteSheetUrl,
      scrubberSpriteConfig: result.spriteConfig,
    });

    return result;
    */
  }
}
