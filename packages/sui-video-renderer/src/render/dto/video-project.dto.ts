import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsArray, IsOptional, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum RenderQuality {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  ULTRA = 'ultra',
}

export enum RenderStatus {
  PENDING = 'pending',
  QUEUED = 'queued',
  PROCESSING = 'processing',
  COMPOSING_FRAMES = 'composing_frames',
  ENCODING_VIDEO = 'encoding_video',
  ENCODING_AUDIO = 'encoding_audio',
  MERGING = 'merging',
  UPLOADING = 'uploading',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export class FrameCompositionDto {
  @ApiProperty({ description: 'Frame number in sequence' })
  @IsNumber()
  frameNumber: number;

  @ApiProperty({ description: 'Frame timestamp in milliseconds' })
  @IsNumber()
  timestamp: number;

  @ApiProperty({ description: 'Array of layer data for this frame' })
  @IsArray()
  layers: any[];

  @ApiProperty({ description: 'Frame duration in milliseconds', required: false })
  @IsOptional()
  @IsNumber()
  duration?: number;
}

export class AudioTrackDto {
  @ApiProperty({ description: 'Audio source file path or URL' })
  @IsString()
  source: string;

  @ApiProperty({ description: 'Audio track volume (0-1)' })
  @IsNumber()
  volume: number;

  @ApiProperty({ description: 'Audio start time in milliseconds', required: false })
  @IsOptional()
  @IsNumber()
  startTime?: number;

  @ApiProperty({ description: 'Audio duration in milliseconds', required: false })
  @IsOptional()
  @IsNumber()
  duration?: number;
}

export class VideoProjectDto {
  @ApiProperty({ description: 'Project unique identifier' })
  @IsString()
  projectId: string;

  @ApiProperty({ description: 'User ID who owns this project' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Project title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Video width in pixels' })
  @IsNumber()
  width: number;

  @ApiProperty({ description: 'Video height in pixels' })
  @IsNumber()
  height: number;

  @ApiProperty({ description: 'Frame rate (fps)' })
  @IsNumber()
  frameRate: number;

  @ApiProperty({ description: 'Render quality setting', enum: RenderQuality })
  @IsEnum(RenderQuality)
  quality: RenderQuality;

  @ApiProperty({ description: 'Array of frame composition data', type: [FrameCompositionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FrameCompositionDto)
  frames: FrameCompositionDto[];

  @ApiProperty({ description: 'Array of audio tracks', type: [AudioTrackDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AudioTrackDto)
  audioTracks?: AudioTrackDto[];

  @ApiProperty({ description: 'Output format', required: false, default: 'mp4' })
  @IsOptional()
  @IsString()
  outputFormat?: string;
}
