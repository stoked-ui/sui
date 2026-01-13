import { ProcessingStage } from '../components/showcase/VideoProcessingProgress';

export interface ProcessingProgress {
  stage: ProcessingStage;
  progress: number;
  currentStage: number;
  statusMessage: string;
  complete: boolean;
  error?: string;
}

export interface ProcessingConfig {
  /** Upload duration in milliseconds (default: 2000ms) */
  uploadDuration?: number;
  /** Processing duration in milliseconds (default: 4000ms) */
  processingDuration?: number;
  /** S3 storage duration in milliseconds (default: 1000ms) */
  s3Duration?: number;
  /** Download preparation duration in milliseconds (default: 2000ms) */
  downloadDuration?: number;
  /** Whether to simulate an error (for testing) */
  simulateError?: boolean;
  /** Which stage to fail on if simulateError is true */
  errorStage?: ProcessingStage;
  /** Error message to display */
  errorMessage?: string;
  /** Progress update interval in milliseconds (default: 100ms) */
  updateInterval?: number;
}

export type ProgressCallback = (progress: ProcessingProgress) => void;

const defaultConfig: Required<ProcessingConfig> = {
  uploadDuration: 2000,
  processingDuration: 4000,
  s3Duration: 1000,
  downloadDuration: 2000,
  simulateError: false,
  errorStage: 'processing',
  errorMessage: 'Processing failed due to network timeout',
  updateInterval: 100,
};

const stageMessages = {
  upload: 'Uploading video to backend server...',
  processing: 'Processing video with FFmpeg on AWS ECS...',
  s3: 'Storing processed video in S3...',
  download: 'Preparing download link...',
};

export class VideoProcessingSimulator {
  private config: Required<ProcessingConfig>;
  private onProgress: ProgressCallback;
  private intervals: NodeJS.Timeout[] = [];
  private currentProgress: ProcessingProgress;
  private isCancelled: boolean = false;

  constructor(onProgress: ProgressCallback, config: ProcessingConfig = {}) {
    this.config = { ...defaultConfig, ...config };
    this.onProgress = onProgress;
    this.currentProgress = {
      stage: 'upload',
      progress: 0,
      currentStage: 1,
      statusMessage: stageMessages.upload,
      complete: false,
    };
  }

  /**
   * Start the simulated processing workflow
   */
  start(): void {
    this.isCancelled = false;
    this.processUploadStage();
  }

  /**
   * Cancel the current processing workflow
   */
  cancel(): void {
    this.isCancelled = true;
    this.clearIntervals();
  }

  /**
   * Reset the simulator to initial state
   */
  reset(): void {
    this.cancel();
    this.currentProgress = {
      stage: 'upload',
      progress: 0,
      currentStage: 1,
      statusMessage: stageMessages.upload,
      complete: false,
    };
  }

  private clearIntervals(): void {
    this.intervals.forEach((interval) => clearInterval(interval));
    this.intervals = [];
  }

  private updateProgress(updates: Partial<ProcessingProgress>): void {
    this.currentProgress = { ...this.currentProgress, ...updates };
    this.onProgress(this.currentProgress);
  }

  private processUploadStage(): void {
    if (this.isCancelled) return;

    this.updateProgress({
      stage: 'upload',
      progress: 0,
      currentStage: 1,
      statusMessage: stageMessages.upload,
    });

    if (this.config.simulateError && this.config.errorStage === 'upload') {
      this.triggerError();
      return;
    }

    this.simulateStageProgress(
      this.config.uploadDuration,
      () => this.processProcessingStage(),
    );
  }

  private processProcessingStage(): void {
    if (this.isCancelled) return;

    this.updateProgress({
      stage: 'processing',
      progress: 0,
      currentStage: 2,
      statusMessage: stageMessages.processing,
    });

    if (this.config.simulateError && this.config.errorStage === 'processing') {
      this.triggerError();
      return;
    }

    this.simulateStageProgress(this.config.processingDuration, () =>
      this.processS3Stage(),
    );
  }

  private processS3Stage(): void {
    if (this.isCancelled) return;

    this.updateProgress({
      stage: 's3',
      progress: 0,
      currentStage: 3,
      statusMessage: stageMessages.s3,
    });

    if (this.config.simulateError && this.config.errorStage === 's3') {
      this.triggerError();
      return;
    }

    this.simulateStageProgress(this.config.s3Duration, () =>
      this.processDownloadStage(),
    );
  }

  private processDownloadStage(): void {
    if (this.isCancelled) return;

    this.updateProgress({
      stage: 'download',
      progress: 0,
      currentStage: 4,
      statusMessage: stageMessages.download,
    });

    if (this.config.simulateError && this.config.errorStage === 'download') {
      this.triggerError();
      return;
    }

    this.simulateStageProgress(this.config.downloadDuration, () =>
      this.completeProcessing(),
    );
  }

  private simulateStageProgress(duration: number, onComplete: () => void): void {
    const steps = duration / this.config.updateInterval;
    const increment = 100 / steps;
    let currentProgress = 0;

    const interval = setInterval(() => {
      if (this.isCancelled) {
        clearInterval(interval);
        return;
      }

      currentProgress += increment;
      if (currentProgress >= 100) {
        currentProgress = 100;
        this.updateProgress({ progress: 100 });
        clearInterval(interval);
        // Small delay before transitioning to next stage for better UX
        setTimeout(() => {
          if (!this.isCancelled) {
            onComplete();
          }
        }, 100);
      } else {
        this.updateProgress({ progress: Math.min(currentProgress, 100) });
      }
    }, this.config.updateInterval);

    this.intervals.push(interval);
  }

  private completeProcessing(): void {
    if (this.isCancelled) return;

    this.updateProgress({
      complete: true,
      progress: 100,
    });

    this.clearIntervals();
  }

  private triggerError(): void {
    this.updateProgress({
      error: this.config.errorMessage,
      progress: 0,
    });

    this.clearIntervals();
  }

  /**
   * Get current processing state
   */
  getCurrentState(): ProcessingProgress {
    return { ...this.currentProgress };
  }
}

/**
 * Factory function to create and start a processing simulation
 */
export function simulateVideoProcessing(
  onProgress: ProgressCallback,
  config: ProcessingConfig = {},
): VideoProcessingSimulator {
  const simulator = new VideoProcessingSimulator(onProgress, config);
  simulator.start();
  return simulator;
}
