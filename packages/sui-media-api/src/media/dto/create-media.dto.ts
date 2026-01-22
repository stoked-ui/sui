import { IsString, IsOptional, IsEnum, IsNumber, IsArray, Min, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for creating a media entry
 * Used after file upload to create database record
 */
export class CreateMediaDto {
  @ApiProperty({
    description: 'User ID of the owner',
    example: 'user_123',
  })
  @IsString()
  author: string;

  @ApiPropertyOptional({
    description: 'Media title',
    example: 'My Video',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Media description',
    example: 'A great video about nature',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Media type',
    enum: ['image', 'video', 'album'],
    example: 'video',
  })
  @IsEnum(['image', 'video', 'album'])
  mediaType: 'image' | 'video' | 'album';

  @ApiProperty({
    description: 'MIME type',
    example: 'video/mp4',
  })
  @IsString()
  mime: string;

  @ApiProperty({
    description: 'S3 key or URL',
    example: 's3://bucket/uploads/video.mp4',
  })
  @IsString()
  file: string;

  @ApiPropertyOptional({
    description: 'S3 bucket name',
    example: 'my-media-bucket',
  })
  @IsOptional()
  @IsString()
  bucket?: string;

  @ApiPropertyOptional({
    description: 'Width in pixels',
    example: 1920,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  width?: number;

  @ApiPropertyOptional({
    description: 'Height in pixels',
    example: 1080,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  height?: number;

  @ApiPropertyOptional({
    description: 'Duration in seconds',
    example: 120.5,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  duration?: number;

  @ApiPropertyOptional({
    description: 'File size in bytes',
    example: 104857600,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  size?: number;

  @ApiPropertyOptional({
    description: 'Thumbnail URL',
    example: 'https://cdn.example.com/thumbnails/thumb.jpg',
  })
  @IsOptional()
  @IsString()
  thumbnail?: string;

  @ApiPropertyOptional({
    description: 'Paid content thumbnail URL',
    example: 'https://cdn.example.com/thumbnails/paid-thumb.jpg',
  })
  @IsOptional()
  @IsString()
  paidThumbnail?: string;

  @ApiPropertyOptional({
    description: 'S3 keys for thumbnail files',
    type: [String],
    example: ['thumbnails/thumb1.jpg', 'thumbnails/thumb2.jpg'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  thumbnailKeys?: string[];

  @ApiPropertyOptional({
    description: 'Publicity level',
    enum: ['public', 'private', 'paid', 'subscription'],
    example: 'public',
  })
  @IsOptional()
  @IsEnum(['public', 'private', 'paid', 'subscription'])
  publicity?: 'public' | 'private' | 'paid' | 'subscription';

  @ApiPropertyOptional({
    description: 'Content rating',
    enum: ['ga', 'nc17'],
    example: 'ga',
  })
  @IsOptional()
  @IsEnum(['ga', 'nc17'])
  rating?: 'ga' | 'nc17';

  @ApiPropertyOptional({
    description: 'Price for paid content',
    example: 9.99,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({
    description: 'List of performers/actors',
    type: [String],
    example: ['John Doe', 'Jane Smith'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  starring?: string[];

  @ApiPropertyOptional({
    description: 'Media tags',
    type: [String],
    example: ['nature', 'landscape', 'sunset'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Media class ID',
    example: 'class_123',
  })
  @IsOptional()
  @IsString()
  mediaClass?: string;

  @ApiPropertyOptional({
    description: 'Video bug/watermark identifier',
    example: 'bug_logo_1',
  })
  @IsOptional()
  @IsString()
  videoBug?: string;

  @ApiPropertyOptional({
    description: 'Upload session ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsOptional()
  @IsString()
  uploadSessionId?: string;

  @ApiPropertyOptional({
    description: 'Processing status',
    enum: ['pending', 'processing', 'complete', 'failed'],
    example: 'pending',
  })
  @IsOptional()
  @IsEnum(['pending', 'processing', 'complete', 'failed'])
  processingStatus?: 'pending' | 'processing' | 'complete' | 'failed';
}
