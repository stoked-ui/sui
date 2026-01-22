import { IsOptional, IsEnum, IsString, IsNumber, Min, Max, IsISO8601 } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for querying media with filtering, search, sorting, and pagination
 * Based on v3 media query patterns
 */
export class QueryMediaDto {
  // Pagination
  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 20,
    minimum: 0,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Number of items to skip',
    example: 0,
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number = 0;

  @ApiPropertyOptional({
    description: 'Cursor for cursor-based pagination',
    example: 'eyJpZCI6Im1lZGlhXzEyMyJ9',
  })
  @IsOptional()
  @IsString()
  cursor?: string;

  // Filtering
  @ApiPropertyOptional({
    description: 'Filter by media type',
    enum: ['image', 'video', 'album'],
    example: 'video',
  })
  @IsOptional()
  @IsEnum(['image', 'video', 'album'])
  mediaType?: 'image' | 'video' | 'album';

  @ApiPropertyOptional({
    description: 'Filter by specific MIME type',
    example: 'video/mp4',
  })
  @IsOptional()
  @IsString()
  mime?: string;

  @ApiPropertyOptional({
    description: 'Filter by author user ID',
    example: 'user_123',
  })
  @IsOptional()
  @IsString()
  uploadedBy?: string;

  @ApiPropertyOptional({
    description: 'Filter by publicity level',
    enum: ['public', 'private', 'paid', 'subscription'],
    example: 'public',
  })
  @IsOptional()
  @IsEnum(['public', 'private', 'paid', 'subscription'])
  publicity?: 'public' | 'private' | 'paid' | 'subscription';

  @ApiPropertyOptional({
    description: 'Filter by content rating',
    enum: ['ga', 'nc17'],
    example: 'ga',
  })
  @IsOptional()
  @IsEnum(['ga', 'nc17'])
  rating?: 'ga' | 'nc17';

  @ApiPropertyOptional({
    description: 'Filter by date range start (ISO date)',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsISO8601()
  dateFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter by date range end (ISO date)',
    example: '2024-12-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsISO8601()
  dateTo?: string;

  @ApiPropertyOptional({
    description: 'Filter by MediaClass ID',
    example: 'class_123',
  })
  @IsOptional()
  @IsString()
  mediaClass?: string;

  @ApiPropertyOptional({
    description: 'Filter by upload session',
    example: '507f1f77bcf86cd799439011',
  })
  @IsOptional()
  @IsString()
  uploadSessionId?: string;

  // Search
  @ApiPropertyOptional({
    description: 'Search in filename, title, description, tags',
    example: 'sunset beach',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Comma-separated tag search',
    example: 'nature,ocean,sunset',
  })
  @IsOptional()
  @IsString()
  tags?: string;

  // Sorting
  @ApiPropertyOptional({
    description: 'Sort field (prefix with - for descending)',
    enum: ['createdAt', 'updatedAt', 'size', 'title', 'views', '-createdAt', '-updatedAt', '-size', '-title', '-views'],
    example: '-createdAt',
    default: '-createdAt',
  })
  @IsOptional()
  @IsEnum(['createdAt', 'updatedAt', 'size', 'title', 'views', '-createdAt', '-updatedAt', '-size', '-title', '-views'])
  sortBy?: string = '-createdAt';

  // Additional filters
  @ApiPropertyOptional({
    description: 'Include soft-deleted items',
    example: false,
    default: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  includeDeleted?: boolean = false;
}
