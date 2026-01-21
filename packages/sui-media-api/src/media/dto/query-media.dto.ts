import { IsOptional, IsEnum, IsString, IsNumber, Min, Max, IsISO8601 } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for querying media with filtering, search, sorting, and pagination
 * Based on v3 media query patterns
 */
export class QueryMediaDto {
  // Pagination
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  limit?: number = 20;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number = 0;

  // Cursor-based pagination (alternative to offset)
  @IsOptional()
  @IsString()
  cursor?: string;

  // Filtering
  @IsOptional()
  @IsEnum(['image', 'video', 'album'])
  mediaType?: 'image' | 'video' | 'album';

  @IsOptional()
  @IsString()
  mime?: string; // Filter by specific MIME type

  @IsOptional()
  @IsString()
  uploadedBy?: string; // User ID - filter by author

  @IsOptional()
  @IsEnum(['public', 'private', 'paid', 'subscription'])
  publicity?: 'public' | 'private' | 'paid' | 'subscription';

  @IsOptional()
  @IsEnum(['ga', 'nc17'])
  rating?: 'ga' | 'nc17';

  @IsOptional()
  @IsISO8601()
  dateFrom?: string; // ISO date string for date range start

  @IsOptional()
  @IsISO8601()
  dateTo?: string; // ISO date string for date range end

  @IsOptional()
  @IsString()
  mediaClass?: string; // Filter by MediaClass ID

  @IsOptional()
  @IsString()
  uploadSessionId?: string; // Filter by upload session

  // Search
  @IsOptional()
  @IsString()
  search?: string; // Search in filename, title, description, tags

  @IsOptional()
  @IsString()
  tags?: string; // Comma-separated tag search

  // Sorting
  @IsOptional()
  @IsEnum(['createdAt', 'updatedAt', 'size', 'title', 'views', '-createdAt', '-updatedAt', '-size', '-title', '-views'])
  sortBy?: string = '-createdAt'; // Default: newest first

  // Additional filters
  @IsOptional()
  @Type(() => Boolean)
  includeDeleted?: boolean = false; // Include soft-deleted items
}
