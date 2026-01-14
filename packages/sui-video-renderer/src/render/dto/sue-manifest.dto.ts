import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * File metadata in .sue format
 */
export class FileMetaDto {
  @ApiProperty({ description: 'File size in bytes' })
  @IsNumber()
  size: number;

  @ApiProperty({ description: 'File name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'MIME type' })
  @IsString()
  type: string;
}

/**
 * Volume keyframe: [value, time, time]
 * Format: [volume_value, start_time, end_time]
 */
export type VolumeKeyframe = [number, number, number];

/**
 * Action within a track (timeline item)
 */
export class ActionDto {
  @ApiProperty({ description: 'Action name/identifier' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Start time in seconds' })
  @IsNumber()
  start: number;

  @ApiProperty({ description: 'End time in seconds' })
  @IsNumber()
  end: number;

  @ApiProperty({ description: 'Trim start offset in seconds', required: false })
  @IsOptional()
  @IsNumber()
  trimStart?: number;

  @ApiProperty({ description: 'Volume keyframes', required: false })
  @IsOptional()
  @IsArray()
  volume?: VolumeKeyframe[];

  @ApiProperty({ description: 'Z-order for layering' })
  @IsNumber()
  z: number;

  @ApiProperty({ description: 'Fit mode: fill, contain, cover, none', required: false })
  @IsOptional()
  @IsString()
  fit?: string;

  @ApiProperty({ description: 'Blend mode', required: false })
  @IsOptional()
  @IsString()
  blendMode?: string;

  @ApiProperty({ description: 'Loop count (0 = no loop)', required: false })
  @IsOptional()
  @IsNumber()
  loop?: number;

  @ApiProperty({ description: 'Duration in seconds', required: false })
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiProperty({ description: 'Width in pixels', required: false })
  @IsOptional()
  @IsNumber()
  width?: number;

  @ApiProperty({ description: 'Height in pixels', required: false })
  @IsOptional()
  @IsNumber()
  height?: number;

  @ApiProperty({ description: 'Opacity (0-1)', required: false })
  @IsOptional()
  @IsNumber()
  opacity?: number;

  @ApiProperty({ description: 'X position', required: false })
  @IsOptional()
  @IsNumber()
  x?: number;

  @ApiProperty({ description: 'Y position', required: false })
  @IsOptional()
  @IsNumber()
  y?: number;

  @ApiProperty({ description: 'Rotation in degrees', required: false })
  @IsOptional()
  @IsNumber()
  rotation?: number;

  @ApiProperty({ description: 'Scale factor', required: false })
  @IsOptional()
  @IsNumber()
  scale?: number;
}

/**
 * Track in the timeline
 */
export class TrackDto {
  @ApiProperty({ description: 'Controller type (video, image, audio, etc.)' })
  @IsString()
  controllerName: string;

  @ApiProperty({ description: 'File ID reference' })
  @IsString()
  fileId: string;

  @ApiProperty({ description: 'Track unique identifier' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Track name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'URL to media file' })
  @IsString()
  url: string;

  @ApiProperty({ description: 'Actions (timeline items) for this track', type: [ActionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActionDto)
  actions: ActionDto[];
}

/**
 * .sue manifest format
 * Complete video project definition with timeline, tracks, and actions
 */
export class SueManifestDto {
  @ApiProperty({ description: 'Project unique identifier' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Project name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Manifest version' })
  @IsNumber()
  version: number;

  @ApiProperty({ description: 'File metadata array', type: [FileMetaDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FileMetaDto)
  filesMeta: FileMetaDto[];

  @ApiProperty({ description: 'Timeline tracks', type: [TrackDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TrackDto)
  tracks: TrackDto[];

  @ApiProperty({ description: 'Background color (CSS color or "transparent")' })
  @IsString()
  backgroundColor: string;

  @ApiProperty({ description: 'Canvas width in pixels' })
  @IsNumber()
  width: number;

  @ApiProperty({ description: 'Canvas height in pixels' })
  @IsNumber()
  height: number;

  @ApiProperty({ description: 'Total duration in seconds', required: false })
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiProperty({ description: 'Frame rate (fps)', required: false, default: 60 })
  @IsOptional()
  @IsNumber()
  fps?: number;
}
