import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue, Job } from 'bull';

export interface RenderJobData {
  jobId: string;
  projectId: string;
  userId: string;
  priority: number;
}

/**
 * RenderQueueService
 *
 * Manages the render job queue:
 * 1. Add jobs to queue with priority
 * 2. Monitor queue status and metrics
 * 3. Pause/resume queue processing
 * 4. Remove jobs from queue
 * 5. Get job statistics
 */
@Injectable()
export class RenderQueueService {
  private readonly logger = new Logger(RenderQueueService.name);

  constructor(
    @InjectQueue('render-jobs')
    private readonly renderQueue: Queue<RenderJobData>,
  ) {}

  /**
   * Add render job to queue
   */
  async addJob(data: RenderJobData): Promise<Job<RenderJobData>> {
    this.logger.log(`Adding job to queue: ${data.jobId} (priority: ${data.priority})`);

    const job = await this.renderQueue.add('render-video', data, {
      jobId: data.jobId,
      priority: data.priority,
      timeout: 3600000, // 1 hour timeout
    });

    return job;
  }

  /**
   * Remove job from queue
   */
  async removeJob(jobId: string): Promise<void> {
    this.logger.log(`Removing job from queue: ${jobId}`);

    const job = await this.renderQueue.getJob(jobId);
    if (job) {
      await job.remove();
    }
  }

  /**
   * Get job from queue
   */
  async getJob(jobId: string): Promise<Job<RenderJobData> | null> {
    return await this.renderQueue.getJob(jobId);
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    paused: number;
  }> {
    const [waiting, active, completed, failed, delayed, paused] = await Promise.all([
      this.renderQueue.getWaitingCount(),
      this.renderQueue.getActiveCount(),
      this.renderQueue.getCompletedCount(),
      this.renderQueue.getFailedCount(),
      this.renderQueue.getDelayedCount(),
      this.renderQueue.getPausedCount(),
    ]);

    return { waiting, active, completed, failed, delayed, paused };
  }

  /**
   * Pause queue processing
   */
  async pauseQueue(): Promise<void> {
    this.logger.warn('Pausing render queue');
    await this.renderQueue.pause();
  }

  /**
   * Resume queue processing
   */
  async resumeQueue(): Promise<void> {
    this.logger.log('Resuming render queue');
    await this.renderQueue.resume();
  }

  /**
   * Clean completed jobs older than specified age
   */
  async cleanOldJobs(ageMs = 86400000): Promise<void> {
    // Default: 24 hours
    this.logger.debug(`Cleaning jobs older than ${ageMs}ms`);

    await this.renderQueue.clean(ageMs, 'completed');
    await this.renderQueue.clean(ageMs * 7, 'failed'); // Keep failed jobs longer
  }

  /**
   * Get all active jobs
   */
  async getActiveJobs(): Promise<Job<RenderJobData>[]> {
    return await this.renderQueue.getActive();
  }

  /**
   * Get all waiting jobs
   */
  async getWaitingJobs(): Promise<Job<RenderJobData>[]> {
    return await this.renderQueue.getWaiting();
  }

  /**
   * Get failed jobs
   */
  async getFailedJobs(limit = 50): Promise<Job<RenderJobData>[]> {
    return await this.renderQueue.getFailed(0, limit - 1);
  }
}
