import { RenderStatus, RenderQuality } from '../dto/video-project.dto';

export interface IRenderJob {
  jobId: string;
  projectId: string;
  userId: string;
  status: RenderStatus;
  progress: number;
  currentPhase?: string;
  priority: number;

  // Timestamps
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;

  // Processing metadata
  totalFrames?: number;
  processedFrames?: number;
  estimatedTimeRemaining?: number;

  // Output
  outputUrl?: string;
  outputPath?: string;

  // Error tracking
  error?: string;
  retryCount?: number;

  // Configuration
  quality: RenderQuality;
  width: number;
  height: number;
  frameRate: number;

  // Callback
  callbackUrl?: string;

  // Additional metadata
  metadata?: Record<string, any>;
}

export interface IFrameRenderTask {
  frameNumber: number;
  timestamp: number;
  layers: any[];
  outputPath: string;
  quality: RenderQuality;
}

export interface IRenderProgress {
  jobId: string;
  phase: string;
  progress: number;
  message?: string;
  estimatedTimeRemaining?: number;
}
