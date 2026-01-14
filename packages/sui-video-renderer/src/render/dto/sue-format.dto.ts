import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * SUE file format types
 * Represents the .sue JSON file structure for video rendering
 */

export class FormatFileMetaDto {
  @ApiProperty({ description: 'File size in bytes' })
  @IsNumber()
  size: number;

  @ApiProperty({ description: 'Original filename' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'MIME type' })
  @IsString()
  type: string;
}

export enum FitMode {
  FILL = 'fill',
  CONTAIN = 'contain',
  COVER = 'cover',
  NONE = 'none',
}

export enum BlendMode {
  NORMAL = 'normal',
  MULTIPLY = 'multiply',
  SCREEN = 'screen',
  OVERLAY = 'overlay',
}

/**
 * Volume keyframe format: [[value, timestamp], [value, timestamp]]
 * Value: 0-1 (or higher for amplification)
 * Timestamp: seconds in timeline
 */
export type FormatVolumeKeyframe = [number, number];

export class FormatActionDto {
  @ApiProperty({ description: 'Action identifier' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Start time in timeline (seconds)' })
  @IsNumber()
  start: number;

  @ApiProperty({ description: 'End time in timeline (seconds)' })
  @IsNumber()
  end: number;

  @ApiProperty({ description: 'Trim start time in source media (seconds)' })
  @IsNumber()
  trimStart: number;

  @ApiProperty({ description: 'Volume keyframes array', required: false })
  @IsOptional()
  volume?: FormatVolumeKeyframe[];

  @ApiProperty({ description: 'Z-index layer order (higher = on top)' })
  @IsNumber()
  z: number;

  @ApiProperty({ description: 'Fit mode for scaling', enum: FitMode, required: false })
  @IsOptional()
  fit?: FitMode;

  @ApiProperty({ description: 'Blend mode', enum: BlendMode, required: false })
  @IsOptional()
  blendMode?: BlendMode;

  @ApiProperty({ description: 'Loop count (0 = no loop)', required: false })
  @IsOptional()
  @IsNumber()
  loop?: number;

  @ApiProperty({ description: 'Source media duration', required: false })
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiProperty({ description: 'Output width in pixels', required: false })
  @IsOptional()
  @IsNumber()
  width?: number;

  @ApiProperty({ description: 'Output height in pixels', required: false })
  @IsOptional()
  @IsNumber()
  height?: number;

  @ApiProperty({ description: 'X position in output canvas', required: false })
  @IsOptional()
  @IsNumber()
  x?: number;

  @ApiProperty({ description: 'Y position in output canvas', required: false })
  @IsOptional()
  @IsNumber()
  y?: number;
}

export class FormatTrackDto {
  @ApiProperty({ description: 'Track controller type (video, audio, image, text)' })
  @IsString()
  controllerName: string;

  @ApiProperty({ description: 'Media file identifier' })
  @IsString()
  fileId: string;

  @ApiProperty({ description: 'Track unique identifier' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Track display name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Local file path or URL to media' })
  @IsString()
  url: string;

  @ApiProperty({ description: 'Array of actions/clips in this track', type: [FormatActionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FormatActionDto)
  actions: FormatActionDto[];
}

export class SueFormatDto {
  @ApiProperty({ description: 'Project unique identifier' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Project name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Sue format version' })
  @IsNumber()
  version: number;

  @ApiProperty({ description: 'File metadata array', type: [FormatFileMetaDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FormatFileMetaDto)
  filesMeta: FormatFileMetaDto[];

  @ApiProperty({ description: 'Timeline tracks', type: [FormatTrackDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FormatTrackDto)
  tracks: FormatTrackDto[];

  @ApiProperty({ description: 'Canvas background color' })
  @IsString()
  backgroundColor: string;

  @ApiProperty({ description: 'Output video width in pixels' })
  @IsNumber()
  width: number;

  @ApiProperty({ description: 'Output video height in pixels' })
  @IsNumber()
  height: number;

  @ApiProperty({ description: 'Output frame rate', required: false, default: 30 })
  @IsOptional()
  @IsNumber()
  frameRate?: number;

  @ApiProperty({ description: 'Output duration in seconds (auto-calculated from tracks)', required: false })
  @IsOptional()
  @IsNumber()
  duration?: number;
}

/**
 * Timeline item extracted from SUE format for rendering
 */
export interface TimelineItem {
  /** Layer z-order (for overlay composition) */
  z: number;

  /** Track reference */
  trackId: string;

  /** Media controller type */
  controllerName: string;

  /** Local file path to media */
  mediaPath: string;

  /** Start time in output timeline (seconds) */
  start: number;

  /** End time in output timeline (seconds) */
  end: number;

  /** Trim start time in source media (seconds) */
  trimStart: number;

  /** Duration in output timeline (seconds) */
  outputDuration: number;

  /** Volume keyframes (for audio tracks) */
  volume?: FormatVolumeKeyframe[];

  /** Scaling fit mode */
  fit: FitMode;

  /** Blend mode for composition */
  blendMode: BlendMode;

  /** Loop count */
  loop: number;

  /** Output dimensions */
  width?: number;
  height?: number;
  x?: number;
  y?: number;
}

/**
 * Parsed timeline manifest for FFmpeg rendering
 */
export interface TimelineManifest {
  /** Output video configuration */
  output: {
    width: number;
    height: number;
    frameRate: number;
    duration: number;
    backgroundColor: string;
  };

  /** All timeline items sorted by z-order */
  items: TimelineItem[];

  /** Unique media files referenced */
  mediaFiles: Map<string, string>; // mediaPath -> FFmpeg input index

  /** Has audio tracks */
  hasAudio: boolean;

  /** Has video tracks */
  hasVideo: boolean;
}
