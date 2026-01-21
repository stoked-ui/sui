import { IsString, IsOptional, IsEnum, IsNumber, IsArray, Min } from 'class-validator';

/**
 * DTO for updating media metadata
 * All fields optional - only updates provided fields
 */
export class UpdateMediaDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

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
  @IsEnum(['pending', 'processing', 'complete', 'failed'])
  processingStatus?: 'pending' | 'processing' | 'complete' | 'failed';
}
