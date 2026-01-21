import { IsString, IsOptional, IsEnum, IsNumber, IsArray, Min, IsBoolean } from 'class-validator';

/**
 * DTO for creating a media entry
 * Used after file upload to create database record
 */
export class CreateMediaDto {
  @IsString()
  author: string; // User ID of the owner

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(['image', 'video', 'album'])
  mediaType: 'image' | 'video' | 'album';

  @IsString()
  mime: string;

  @IsString()
  file: string; // S3 key or URL

  @IsOptional()
  @IsString()
  bucket?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  width?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  height?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  duration?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  size?: number;

  @IsOptional()
  @IsString()
  thumbnail?: string;

  @IsOptional()
  @IsString()
  paidThumbnail?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  thumbnailKeys?: string[];

  @IsOptional()
  @IsEnum(['public', 'private', 'paid', 'subscription'])
  publicity?: 'public' | 'private' | 'paid' | 'subscription';

  @IsOptional()
  @IsEnum(['ga', 'nc17'])
  rating?: 'ga' | 'nc17';

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  starring?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  mediaClass?: string;

  @IsOptional()
  @IsString()
  videoBug?: string;

  @IsOptional()
  @IsString()
  uploadSessionId?: string;

  @IsOptional()
  @IsEnum(['pending', 'processing', 'complete', 'failed'])
  processingStatus?: 'pending' | 'processing' | 'complete' | 'failed';
}
