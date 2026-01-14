import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RenderJob, RenderJobDocument } from '../schemas/render-job.schema';
import { VideoProject, VideoProjectDocument } from '../schemas/video-project.schema';
import {
  CreateRenderJobDto,
  RenderJobResponseDto,
  RenderJobStatusDto,
  VideoProjectDto,
  RenderStatus,
  RenderQuality,
  SueManifestDto,
} from '../dto';
import { v4 as uuidv4 } from 'uuid';
import { SueParserService } from './sue-parser.service';
import { FFmpegFilterBuilderService } from './ffmpeg-filter-builder.service';
import { FFmpegRendererService, FFmpegProgress } from './ffmpeg-renderer.service';
import { FrameStreamPipelineService, RenderProgress } from './frame-stream-pipeline.service';
import { StorageService } from '../../storage/services/storage.service';
import * as path from 'path';
import * as fs from 'fs/promises';

/**
 * RenderOrchestratorService
 *
 * Orchestrates the FFmpeg-based video rendering pipeline:
 * 1. Parse .sue file format to extract timeline
 * 2. Build FFmpeg filtergraph for composition
 * 3. Execute FFmpeg render with progress tracking
 * 4. Stream output to S3
 * 5. Handle job lifecycle and callbacks
 */
@Injectable()
export class RenderOrchestratorService {
  private readonly logger = new Logger(RenderOrchestratorService.name);

  constructor(
    @InjectModel(RenderJob.name)
    private readonly renderJobModel: Model<RenderJobDocument>,
    @InjectModel(VideoProject.name)
    private readonly videoProjectModel: Model<VideoProjectDocument>,
    private readonly sueParser: SueParserService,
    private readonly filterBuilder: FFmpegFilterBuilderService,
    private readonly ffmpegRenderer: FFmpegRendererService,
    private readonly frameStreamPipeline: FrameStreamPipelineService,
    private readonly storageService: StorageService,
  ) {}

  /**
   * Create a new video project from .sue file
   */
  async createProjectFromSue(
    sueFilePath: string,
    userId: string,
  ): Promise<VideoProject> {
    this.logger.log(`Creating project from .sue file: ${sueFilePath}`);

    // Parse .sue file
    const manifest = await this.sueParser.parseFile(sueFilePath);

    // Validate timeline
    await this.sueParser.validateTimeline(manifest);

    // Get statistics
    const stats = this.sueParser.getTimelineStats(manifest);

    // Create project DTO (legacy format compatibility)
    const projectDto: VideoProjectDto = {
      projectId: uuidv4(),
      userId,
      title: path.basename(sueFilePath, '.sue'),
      width: manifest.output.width,
      height: manifest.output.height,
      frameRate: manifest.output.frameRate,
      quality: RenderQuality.HIGH,
      frames: [], // Not used in FFmpeg pipeline
      audioTracks: [],
      outputFormat: 'mp4',
    };

    const project = new this.videoProjectModel(projectDto);
    return await project.save();
  }

  /**
   * Create a new video project from VideoProjectDto
   */
  async createProject(projectDto: VideoProjectDto): Promise<VideoProject> {
    this.logger.log(`Creating video project: ${projectDto.projectId}`);

    // Validate project data
    if (projectDto.width <= 0 || projectDto.height <= 0) {
      throw new Error('Invalid project dimensions');
    }

    if (projectDto.frameRate <= 0) {
      throw new Error('Invalid frame rate');
    }

    const project = new this.videoProjectModel(projectDto);
    return await project.save();
  }

  /**
   * Create a new render job
   */
  async createRenderJob(createJobDto: CreateRenderJobDto): Promise<RenderJobResponseDto> {
    this.logger.log(`Creating render job for project: ${createJobDto.projectId}`);

    // Fetch the video project
    const project = await this.videoProjectModel.findOne({
      projectId: createJobDto.projectId,
      userId: createJobDto.userId,
    });

    if (!project) {
      throw new Error(`Project not found: ${createJobDto.projectId}`);
    }

    // Create render job
    const jobId = uuidv4();
    const renderJob = new this.renderJobModel({
      jobId,
      projectId: createJobDto.projectId,
      userId: createJobDto.userId,
      status: RenderStatus.QUEUED,
      priority: createJobDto.priority || 5,
      quality: project.quality,
      width: project.width,
      height: project.height,
      frameRate: project.frameRate,
      totalFrames: project.frames?.length || 0,
      callbackUrl: createJobDto.callbackUrl,
    });

    await renderJob.save();

    return {
      jobId,
      status: RenderStatus.QUEUED,
      createdAt: new Date(),
      estimatedProcessingTime: this.estimateProcessingTime(project),
    };
  }

  /**
   * Execute render job using FFmpeg pipeline
   * This is the main rendering workflow
   */
  async executeRenderJob(
    jobId: string,
    sueFilePath: string,
  ): Promise<void> {
    try {
      // Update status to processing
      await this.updateJobStatus(jobId, RenderStatus.PROCESSING);

      // Phase 1: Parse .sue file
      this.logger.log(`[${jobId}] Phase 1: Parsing .sue file`);
      await this.updateJobProgress(jobId, 5, 'Parsing project file');

      const manifest = await this.sueParser.parseFile(sueFilePath);
      await this.sueParser.validateTimeline(manifest);

      // Phase 2: Build FFmpeg filtergraph
      this.logger.log(`[${jobId}] Phase 2: Building filtergraph`);
      await this.updateJobProgress(jobId, 10, 'Building filtergraph');

      const filterComplex = this.filterBuilder.buildFilterComplex(manifest);

      // Get job details for quality setting
      const job = await this.renderJobModel.findOne({ jobId });
      if (!job) {
        throw new Error(`Job not found: ${jobId}`);
      }

      const quality = this.mapQuality(job.quality);

      // Phase 3: Execute FFmpeg render
      this.logger.log(`[${jobId}] Phase 3: Rendering video`);
      await this.updateJobProgress(jobId, 15, 'Starting render');

      // Create temp output path
      const outputPath = `/tmp/render-${jobId}.mp4`;

      const result = await this.ffmpegRenderer.render(
        jobId,
        filterComplex,
        outputPath,
        quality,
        manifest.output.duration,
        (progress: FFmpegProgress) => {
          // Update progress: 15% -> 85% during rendering
          const renderProgress = 15 + (progress.percentage * 0.7);
          this.updateJobProgress(
            jobId,
            Math.round(renderProgress),
            `Rendering: ${progress.fps.toFixed(1)} fps`,
            this.estimateTimeRemaining(progress, manifest.output.duration),
          );
        },
      );

      if (!result.success) {
        throw new Error(`FFmpeg render failed: ${result.error}`);
      }

      // Phase 4: Upload to S3
      this.logger.log(`[${jobId}] Phase 4: Uploading to S3`);
      await this.updateJobProgress(jobId, 90, 'Uploading video');

      const s3Key = `renders/${job.userId}/${jobId}.mp4`;
      const outputUrl = await this.storageService.uploadVideo(
        outputPath,
        s3Key,
        {
          jobId,
          userId: job.userId,
          projectId: job.projectId,
        },
      );

      // Phase 5: Cleanup
      this.logger.log(`[${jobId}] Phase 5: Cleanup`);
      await this.updateJobProgress(jobId, 95, 'Cleaning up');

      await fs.unlink(outputPath).catch(() => {
        this.logger.warn(`Failed to delete temp file: ${outputPath}`);
      });

      // Complete job
      await this.completeJob(jobId, outputUrl);

      this.logger.log(`[${jobId}] Render completed successfully`);
    } catch (error) {
      this.logger.error(`[${jobId}] Render failed:`, error);
      await this.failJob(
        jobId,
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  /**
   * Execute render with streaming upload to S3
   * Avoids writing temp file to disk
   */
  async executeRenderJobStreaming(
    jobId: string,
    sueFilePath: string,
  ): Promise<void> {
    try {
      await this.updateJobStatus(jobId, RenderStatus.PROCESSING);

      // Phase 1: Parse
      await this.updateJobProgress(jobId, 5, 'Parsing project file');
      const manifest = await this.sueParser.parseFile(sueFilePath);
      await this.sueParser.validateTimeline(manifest);

      // Phase 2: Build filtergraph
      await this.updateJobProgress(jobId, 10, 'Building filtergraph');
      const filterComplex = this.filterBuilder.buildFilterComplex(manifest);

      const job = await this.renderJobModel.findOne({ jobId });
      if (!job) throw new Error(`Job not found: ${jobId}`);

      const quality = this.mapQuality(job.quality);

      // Phase 3: Render and stream to S3
      await this.updateJobProgress(jobId, 15, 'Starting render');

      const result = await this.ffmpegRenderer.renderToStream(
        jobId,
        filterComplex,
        quality,
        manifest.output.duration,
        (progress: FFmpegProgress) => {
          const renderProgress = 15 + progress.percentage * 0.75;
          this.updateJobProgress(
            jobId,
            Math.round(renderProgress),
            `Rendering: ${progress.fps.toFixed(1)} fps`,
          );
        },
      );

      if (!result.success || !result.output) {
        throw new Error(`FFmpeg render failed: ${result.error}`);
      }

      // Upload stream to S3
      const s3Key = `renders/${job.userId}/${jobId}.mp4`;
      const outputUrl = await this.storageService.uploadVideoStream(
        result.output as any,
        s3Key,
        {
          jobId,
          userId: job.userId,
          projectId: job.projectId,
        },
      );

      await this.completeJob(jobId, outputUrl);

      this.logger.log(`[${jobId}] Streaming render completed`);
    } catch (error) {
      this.logger.error(`[${jobId}] Streaming render failed:`, error);
      await this.failJob(
        jobId,
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  /**
   * Get render job status
   */
  async getJobStatus(jobId: string): Promise<RenderJobStatusDto> {
    const job = await this.renderJobModel.findOne({ jobId });

    if (!job) {
      throw new Error(`Render job not found: ${jobId}`);
    }

    return {
      jobId: job.jobId,
      status: job.status,
      progress: job.progress,
      currentPhase: job.currentPhase,
      estimatedTimeRemaining: job.estimatedTimeRemaining,
      error: job.error,
      outputUrl: job.outputUrl,
      metadata: job.metadata,
    };
  }

  /**
   * Update render job status
   */
  async updateJobStatus(jobId: string, status: RenderStatus): Promise<void> {
    await this.renderJobModel.updateOne({ jobId }, { $set: { status } });
  }

  /**
   * Update render job progress
   */
  async updateJobProgress(
    jobId: string,
    progress: number,
    phase?: string,
    estimatedTimeRemaining?: number,
  ): Promise<void> {
    this.logger.debug(`[${jobId}] Progress: ${progress}% - ${phase}`);

    await this.renderJobModel.updateOne(
      { jobId },
      {
        $set: {
          progress,
          currentPhase: phase,
          estimatedTimeRemaining,
        },
      },
    );
  }

  /**
   * Mark job as completed
   */
  async completeJob(jobId: string, outputUrl: string): Promise<void> {
    this.logger.log(`Completing job: ${jobId}`);

    await this.renderJobModel.updateOne(
      { jobId },
      {
        $set: {
          status: RenderStatus.COMPLETED,
          progress: 100,
          outputUrl,
          completedAt: new Date(),
        },
      },
    );

    // TODO: Trigger callback notification if configured
  }

  /**
   * Mark job as failed
   */
  async failJob(jobId: string, error: string): Promise<void> {
    this.logger.error(`Job failed: ${jobId} - ${error}`);

    await this.renderJobModel.updateOne(
      { jobId },
      {
        $set: {
          status: RenderStatus.FAILED,
          error,
        },
        $inc: {
          retryCount: 1,
        },
      },
    );

    // TODO: Implement retry logic for transient failures
    // TODO: Trigger error callback notification
  }

  /**
   * Cancel a render job
   */
  async cancelJob(jobId: string, userId: string): Promise<void> {
    this.logger.log(`Canceling job: ${jobId}`);

    const job = await this.renderJobModel.findOne({ jobId, userId });

    if (!job) {
      throw new Error(`Job not found or unauthorized: ${jobId}`);
    }

    if ([RenderStatus.COMPLETED, RenderStatus.FAILED].includes(job.status)) {
      throw new Error(`Cannot cancel job in ${job.status} status`);
    }

    // Cancel FFmpeg process if running
    await this.ffmpegRenderer.cancelRender(jobId);

    await this.renderJobModel.updateOne(
      { jobId },
      {
        $set: {
          status: RenderStatus.FAILED,
          error: 'Canceled by user',
        },
      },
    );
  }

  /**
   * Get user's render jobs
   */
  async getUserJobs(userId: string, limit = 50): Promise<RenderJob[]> {
    return await this.renderJobModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  /**
   * Estimate processing time based on project complexity
   */
  private estimateProcessingTime(project: VideoProject): number {
    // TODO: Implement sophisticated estimation based on:
    // - Duration
    // - Resolution
    // - Quality settings
    // - Layer complexity
    // - Historical processing data

    const baseTimePerFrame = 0.1; // seconds (faster with FFmpeg)
    return Math.ceil((project.frames?.length || 0) * baseTimePerFrame);
  }

  /**
   * Estimate time remaining from FFmpeg progress
   */
  private estimateTimeRemaining(
    progress: FFmpegProgress,
    totalDuration: number,
  ): number {
    if (progress.speed === 0) return 0;

    const remainingDuration = totalDuration - progress.time;
    return Math.ceil(remainingDuration / progress.speed);
  }

  /**
   * Map quality enum to FFmpeg quality setting
   */
  private mapQuality(quality: RenderQuality): 'LOW' | 'MEDIUM' | 'HIGH' | 'ULTRA' {
    const qualityMap: Record<RenderQuality, 'LOW' | 'MEDIUM' | 'HIGH' | 'ULTRA'> = {
      [RenderQuality.LOW]: 'LOW',
      [RenderQuality.MEDIUM]: 'MEDIUM',
      [RenderQuality.HIGH]: 'HIGH',
      [RenderQuality.ULTRA]: 'ULTRA',
    };

    return qualityMap[quality] || 'HIGH';
  }

  /**
   * Execute render job using Chromium-based pipeline
   * Alternative to FFmpeg filtergraph approach
   * Provides pixel-perfect parity with editor preview
   */
  async executeChromiumRenderJob(
    jobId: string,
    manifest: SueManifestDto,
  ): Promise<void> {
    try {
      // Update status to processing
      await this.updateJobStatus(jobId, RenderStatus.PROCESSING);

      // Get job details
      const job = await this.renderJobModel.findOne({ jobId });
      if (!job) {
        throw new Error(`Job not found: ${jobId}`);
      }

      // Phase 1: Initialize
      this.logger.log(`[${jobId}] Phase 1: Initializing Chromium renderer`);
      await this.updateJobProgress(jobId, 5, 'Initializing renderer');

      // Create temp output path
      const outputPath = `/tmp/render-${jobId}.mp4`;

      // Phase 2: Render using Chromium pipeline
      this.logger.log(`[${jobId}] Phase 2: Rendering with Chromium`);
      await this.updateJobProgress(jobId, 10, 'Starting Chromium render');

      const quality = this.mapChromiumQuality(job.quality);

      await this.frameStreamPipeline.render({
        manifest,
        outputPath,
        fps: manifest.fps || 60,
        quality,
        onProgress: (progress: RenderProgress) => {
          // Update progress: 10% -> 85% during rendering
          const totalProgress = 10 + (progress.progress * 0.75);
          this.updateJobProgress(
            jobId,
            Math.round(totalProgress),
            progress.phase,
            progress.estimatedTimeRemaining,
          );
        },
      });

      // Phase 3: Upload to S3
      this.logger.log(`[${jobId}] Phase 3: Uploading to S3`);
      await this.updateJobProgress(jobId, 90, 'Uploading video');

      const s3Key = `renders/${job.userId}/${jobId}.mp4`;
      const outputUrl = await this.storageService.uploadVideo(
        outputPath,
        s3Key,
        {
          jobId,
          userId: job.userId,
          projectId: job.projectId,
        },
      );

      // Phase 4: Cleanup
      this.logger.log(`[${jobId}] Phase 4: Cleanup`);
      await this.updateJobProgress(jobId, 95, 'Cleaning up');

      await fs.unlink(outputPath).catch(() => {
        this.logger.warn(`Failed to delete temp file: ${outputPath}`);
      });

      // Complete job
      await this.completeJob(jobId, outputUrl);

      this.logger.log(`[${jobId}] Chromium render completed successfully`);
    } catch (error) {
      this.logger.error(`[${jobId}] Chromium render failed:`, error);
      await this.failJob(
        jobId,
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  /**
   * Map quality enum to Chromium pipeline quality setting
   */
  private mapChromiumQuality(quality: RenderQuality): 'low' | 'medium' | 'high' | 'ultra' {
    const qualityMap: Record<RenderQuality, 'low' | 'medium' | 'high' | 'ultra'> = {
      [RenderQuality.LOW]: 'low',
      [RenderQuality.MEDIUM]: 'medium',
      [RenderQuality.HIGH]: 'high',
      [RenderQuality.ULTRA]: 'ultra',
    };

    return qualityMap[quality] || 'high';
  }
}
