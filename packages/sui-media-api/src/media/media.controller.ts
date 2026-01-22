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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
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
@ApiTags('Media')
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
  @ApiOperation({
    summary: 'Get API information',
    description: 'Get API version, statistics, and general information. Does not require authentication.',
  })
  @ApiResponse({
    status: 200,
    description: 'API information retrieved successfully',
  })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'List media',
    description: 'List media with filtering, search, sorting, and pagination. Supports both offset and cursor-based pagination.',
  })
  @ApiResponse({
    status: 200,
    description: 'Media list retrieved successfully',
    type: PaginatedMediaResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - authentication required',
  })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get media by ID',
    description: 'Get a single media item by ID. Increments view count on each access.',
  })
  @ApiParam({
    name: 'id',
    description: 'Media ID',
    example: 'media_1',
  })
  @ApiResponse({
    status: 200,
    description: 'Media item retrieved successfully',
    type: MediaResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Media not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - authentication required',
  })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create media entry',
    description: 'Create a new media entry in the database. Used after file upload to create the metadata record.',
  })
  @ApiBody({
    type: CreateMediaDto,
    description: 'Media creation data',
  })
  @ApiResponse({
    status: 201,
    description: 'Media created successfully',
    type: MediaResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - authentication required',
  })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update media',
    description: 'Update media metadata. Only the owner can update their media.',
  })
  @ApiParam({
    name: 'id',
    description: 'Media ID',
    example: 'media_1',
  })
  @ApiBody({
    type: UpdateMediaDto,
    description: 'Fields to update',
  })
  @ApiResponse({
    status: 200,
    description: 'Media updated successfully',
    type: MediaResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Media not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - user is not the owner',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - authentication required',
  })
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
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete media',
    description: 'Delete media (file + database). Default is soft delete. Use hardDelete=true query parameter for permanent deletion.',
  })
  @ApiParam({
    name: 'id',
    description: 'Media ID',
    example: 'media_1',
  })
  @ApiQuery({
    name: 'hardDelete',
    required: false,
    type: Boolean,
    description: 'Whether to permanently delete (default: false)',
  })
  @ApiResponse({
    status: 204,
    description: 'Media deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Media not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - user is not the owner',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - authentication required',
  })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Restore deleted media',
    description: 'Restore a soft-deleted media item. Only the owner can restore their media.',
  })
  @ApiParam({
    name: 'id',
    description: 'Media ID',
    example: 'media_1',
  })
  @ApiResponse({
    status: 200,
    description: 'Media restored successfully',
    type: MediaResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Media not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - user is not the owner',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - authentication required',
  })
  async restore(@Param('id') id: string, @UserId() userId: string): Promise<MediaResponseDto> {
    return this.mediaService.restore(id, userId);
  }

  /**
   * Extract metadata from a media file
   * POST /media/:id/extract-metadata
   */
  @Post(':id/extract-metadata')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Extract media metadata',
    description: 'Extract metadata from a media file (video/audio/image properties).',
  })
  @ApiParam({
    name: 'id',
    description: 'Media ID',
    example: 'media_1',
  })
  @ApiResponse({
    status: 200,
    description: 'Metadata extracted successfully',
    type: ExtractMetadataResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Media not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Unable to extract metadata',
  })
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
  @ApiOperation({
    summary: 'Generate video thumbnail',
    description: 'Generate a thumbnail for a video at a specific timestamp.',
  })
  @ApiParam({
    name: 'id',
    description: 'Media ID',
    example: 'media_1',
  })
  @ApiBody({
    type: GenerateThumbnailDto,
    description: 'Thumbnail generation parameters',
  })
  @ApiResponse({
    status: 200,
    description: 'Thumbnail generated successfully',
    type: ThumbnailResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Media not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request or media type',
  })
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
  @ApiOperation({
    summary: 'Generate video sprite sheet',
    description: 'Generate a sprite sheet for video scrubbing with VTT file.',
  })
  @ApiParam({
    name: 'id',
    description: 'Media ID',
    example: 'media_1',
  })
  @ApiBody({
    type: GenerateSpriteSheetDto,
    description: 'Sprite sheet generation parameters',
  })
  @ApiResponse({
    status: 200,
    description: 'Sprite sheet generated successfully',
    type: SpriteSheetResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Media not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request or media type',
  })
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
