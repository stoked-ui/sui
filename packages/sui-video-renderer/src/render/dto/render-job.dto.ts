import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsNumber, IsObject } from 'class-validator';
import { RenderStatus } from './video-project.dto';

export class CreateRenderJobDto {
  @ApiProperty({ description: 'Video project ID to render' })
  @IsString()
  projectId: string;

  @ApiProperty({ description: 'User ID requesting the render' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Priority level (1-10, higher is more urgent)', required: false, default: 5 })
  @IsOptional()
  @IsNumber()
  priority?: number;

  @ApiProperty({ description: 'Optional callback URL for job completion notification', required: false })
  @IsOptional()
  @IsString()
  callbackUrl?: string;
}

export class RenderJobStatusDto {
  @ApiProperty({ description: 'Render job ID' })
  @IsString()
  jobId: string;

  @ApiProperty({ description: 'Current job status', enum: RenderStatus })
  @IsEnum(RenderStatus)
  status: RenderStatus;

  @ApiProperty({ description: 'Progress percentage (0-100)' })
  @IsNumber()
  progress: number;

  @ApiProperty({ description: 'Current processing phase description', required: false })
  @IsOptional()
  @IsString()
  currentPhase?: string;

  @ApiProperty({ description: 'Estimated time remaining in seconds', required: false })
  @IsOptional()
  @IsNumber()
  estimatedTimeRemaining?: number;

  @ApiProperty({ description: 'Error message if job failed', required: false })
  @IsOptional()
  @IsString()
  error?: string;

  @ApiProperty({ description: 'Output file URL when completed', required: false })
  @IsOptional()
  @IsString()
  outputUrl?: string;

  @ApiProperty({ description: 'Additional metadata', required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class RenderJobResponseDto {
  @ApiProperty({ description: 'Render job ID' })
  jobId: string;

  @ApiProperty({ description: 'Initial job status', enum: RenderStatus })
  status: RenderStatus;

  @ApiProperty({ description: 'Job creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Estimated processing time in seconds', required: false })
  estimatedProcessingTime?: number;
}
