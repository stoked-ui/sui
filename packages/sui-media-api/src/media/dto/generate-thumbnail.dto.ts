import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ThumbnailSize } from '../thumbnail-generation.service';

/**
 * DTO for generating a single thumbnail
 */
export class GenerateThumbnailDto {
  @ApiProperty({
    description: 'Timestamp in seconds where to capture the thumbnail',
    example: 60.5,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  timestamp: number;

  @ApiPropertyOptional({
    description: 'Thumbnail size preset',
    enum: ThumbnailSize,
    example: ThumbnailSize.MEDIUM,
    default: ThumbnailSize.MEDIUM,
  })
  @IsEnum(ThumbnailSize)
  @IsOptional()
  size?: ThumbnailSize = ThumbnailSize.MEDIUM;
}

/**
 * DTO for generating sprite sheets
 */
export class GenerateSpriteSheetDto {
  @ApiPropertyOptional({
    description: 'Width of each frame in pixels',
    example: 160,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  frameWidth?: number;

  @ApiPropertyOptional({
    description: 'Height of each frame in pixels',
    example: 90,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  frameHeight?: number;

  @ApiPropertyOptional({
    description: 'Number of frames per row in sprite sheet',
    example: 10,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  framesPerRow?: number;

  @ApiPropertyOptional({
    description: 'Interval between frames in seconds',
    example: 5,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  interval?: number;
}

/**
 * Response DTO for thumbnail generation
 */
export class ThumbnailResponseDto {
  @ApiProperty({
    description: 'Thumbnail URL',
    example: 'https://cdn.example.com/thumbnails/thumb.jpg',
  })
  thumbnailUrl: string;

  @ApiProperty({
    description: 'S3 key for thumbnail',
    example: 'media/123/thumbnails/thumb.jpg',
  })
  thumbnailKey: string;

  @ApiProperty({
    description: 'Thumbnail width in pixels',
    example: 320,
  })
  width: number;

  @ApiProperty({
    description: 'Thumbnail height in pixels',
    example: 180,
  })
  height: number;
}

/**
 * Response DTO for sprite sheet generation
 */
export class SpriteSheetResponseDto {
  @ApiProperty({
    description: 'Sprite sheet URL',
    example: 'https://cdn.example.com/sprites/sprite.jpg',
  })
  spriteSheetUrl: string;

  @ApiProperty({
    description: 'S3 key for sprite sheet',
    example: 'media/123/sprites/sprite.jpg',
  })
  spriteSheetKey: string;

  @ApiProperty({
    description: 'VTT file URL',
    example: 'https://cdn.example.com/sprites/sprite.vtt',
  })
  vttUrl: string;

  @ApiProperty({
    description: 'S3 key for VTT file',
    example: 'media/123/sprites/sprite.vtt',
  })
  vttKey: string;

  @ApiProperty({
    description: 'Sprite sheet configuration',
    example: {
      totalFrames: 24,
      framesPerRow: 10,
      frameWidth: 160,
      frameHeight: 90,
      spriteSheetWidth: 1600,
      spriteSheetHeight: 270,
      interval: 5,
    },
  })
  spriteConfig: {
    totalFrames: number;
    framesPerRow: number;
    frameWidth: number;
    frameHeight: number;
    spriteSheetWidth: number;
    spriteSheetHeight: number;
    interval: number;
  };
}
