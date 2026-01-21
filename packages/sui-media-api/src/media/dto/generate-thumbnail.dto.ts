import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ThumbnailSize } from '../thumbnail-generation.service';

/**
 * DTO for generating a single thumbnail
 */
export class GenerateThumbnailDto {
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  timestamp: number;

  @IsEnum(ThumbnailSize)
  @IsOptional()
  size?: ThumbnailSize = ThumbnailSize.MEDIUM;
}

/**
 * DTO for generating sprite sheets
 */
export class GenerateSpriteSheetDto {
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  frameWidth?: number;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  frameHeight?: number;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  framesPerRow?: number;

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
  thumbnailUrl: string;
  thumbnailKey: string;
  width: number;
  height: number;
}

/**
 * Response DTO for sprite sheet generation
 */
export class SpriteSheetResponseDto {
  spriteSheetUrl: string;
  spriteSheetKey: string;
  vttUrl: string;
  vttKey: string;
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
