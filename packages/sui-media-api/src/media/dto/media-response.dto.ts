import { MediaEntity } from '../entities/media.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for media response
 * Ensures consistent response structure
 */
export class MediaResponseDto {
  @ApiProperty({
    description: 'Media ID',
    example: 'media_123',
  })
  _id: string;

  @ApiProperty({
    description: 'User ID of the owner',
    example: 'user_123',
  })
  author: string;

  @ApiPropertyOptional({
    description: 'Media title',
    example: 'My Video',
  })
  title?: string;

  @ApiPropertyOptional({
    description: 'Media description',
    example: 'A great video about nature',
  })
  description?: string;

  @ApiProperty({
    description: 'Media type',
    enum: ['image', 'video', 'album'],
    example: 'video',
  })
  mediaType: 'image' | 'video' | 'album';

  @ApiProperty({
    description: 'MIME type',
    example: 'video/mp4',
  })
  mime: string;

  @ApiProperty({
    description: 'S3 key or URL',
    example: 's3://bucket/uploads/video.mp4',
  })
  file: string;

  @ApiPropertyOptional({
    description: 'S3 bucket name',
    example: 'my-media-bucket',
  })
  bucket?: string;

  @ApiPropertyOptional({
    description: 'Width in pixels',
    example: 1920,
  })
  width?: number;

  @ApiPropertyOptional({
    description: 'Height in pixels',
    example: 1080,
  })
  height?: number;

  @ApiPropertyOptional({
    description: 'Duration in seconds',
    example: 120.5,
  })
  duration?: number;

  @ApiPropertyOptional({
    description: 'File size in bytes',
    example: 104857600,
  })
  size?: number;

  @ApiPropertyOptional({
    description: 'Thumbnail URL',
    example: 'https://cdn.example.com/thumbnails/thumb.jpg',
  })
  thumbnail?: string;

  @ApiPropertyOptional({
    description: 'Paid content thumbnail URL',
    example: 'https://cdn.example.com/thumbnails/paid-thumb.jpg',
  })
  paidThumbnail?: string;

  @ApiProperty({
    description: 'Publicity level',
    enum: ['public', 'private', 'paid', 'subscription'],
    example: 'public',
  })
  publicity: 'public' | 'private' | 'paid' | 'subscription';

  @ApiPropertyOptional({
    description: 'Content rating',
    enum: ['ga', 'nc17'],
    example: 'ga',
  })
  rating?: 'ga' | 'nc17';

  @ApiPropertyOptional({
    description: 'Price for paid content',
    example: 9.99,
  })
  price?: number;

  @ApiPropertyOptional({
    description: 'List of performers/actors',
    type: [String],
    example: ['John Doe', 'Jane Smith'],
  })
  starring?: string[];

  @ApiPropertyOptional({
    description: 'View count',
    example: 1234,
  })
  views?: number;

  @ApiPropertyOptional({
    description: 'Media tags',
    type: [String],
    example: ['nature', 'landscape', 'sunset'],
  })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Media class ID',
    example: 'class_123',
  })
  mediaClass?: string;

  @ApiPropertyOptional({
    description: 'Video bug/watermark identifier',
    example: 'bug_logo_1',
  })
  videoBug?: string;

  @ApiPropertyOptional({
    description: 'Processing status',
    enum: ['pending', 'processing', 'complete', 'failed'],
    example: 'complete',
  })
  processingStatus?: 'pending' | 'processing' | 'complete' | 'failed';

  @ApiPropertyOptional({
    description: 'Processing tasks status',
    example: {
      thumbnails: true,
      duration: true,
      dimensions: true,
      blurredThumbnail: false,
      sprites: false,
    },
  })
  processingTasks?: {
    thumbnails?: boolean;
    duration?: boolean;
    dimensions?: boolean;
    blurredThumbnail?: boolean;
    sprites?: boolean;
  };

  @ApiPropertyOptional({
    description: 'Upload session ID',
    example: '507f1f77bcf86cd799439011',
  })
  uploadSessionId?: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-15T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-15T12:00:00.000Z',
  })
  updatedAt: Date;

  constructor(entity: MediaEntity) {
    this._id = entity._id;
    this.author = entity.author;
    this.title = entity.title;
    this.description = entity.description;
    this.mediaType = entity.mediaType;
    this.mime = entity.mime;
    this.file = entity.file;
    this.bucket = entity.bucket;
    this.width = entity.width;
    this.height = entity.height;
    this.duration = entity.duration;
    this.size = entity.size;
    this.thumbnail = entity.thumbnail;
    this.paidThumbnail = entity.paidThumbnail;
    this.publicity = entity.publicity;
    this.rating = entity.rating;
    this.price = entity.price;
    this.starring = entity.starring;
    this.views = entity.views;
    this.tags = entity.tags;
    this.mediaClass = entity.mediaClass;
    this.videoBug = entity.videoBug;
    this.processingStatus = entity.processingStatus;
    this.processingTasks = entity.processingTasks;
    this.uploadSessionId = entity.uploadSessionId;
    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
  }
}

/**
 * Paginated media response
 * Includes pagination metadata
 */
export class PaginatedMediaResponseDto {
  @ApiProperty({
    description: 'Array of media items',
    type: [MediaResponseDto],
  })
  data: MediaResponseDto[];

  @ApiProperty({
    description: 'Total number of items',
    example: 100,
  })
  total: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 20,
  })
  limit: number;

  @ApiProperty({
    description: 'Number of items skipped',
    example: 0,
  })
  offset: number;

  @ApiProperty({
    description: 'Whether there are more items',
    example: true,
  })
  hasMore: boolean;

  @ApiPropertyOptional({
    description: 'Next cursor for cursor-based pagination',
    example: 'eyJpZCI6Im1lZGlhXzEyMyJ9',
  })
  cursor?: string;

  constructor(data: MediaEntity[], total: number, limit: number, offset: number, cursor?: string) {
    this.data = data.map((entity) => new MediaResponseDto(entity));
    this.total = total;
    this.limit = limit;
    this.offset = offset;
    this.hasMore = offset + data.length < total;
    this.cursor = cursor;
  }
}
