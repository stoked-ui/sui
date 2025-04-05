/**
 * Represents a screenshot series with associated file, timespan, and resolution.
 * @typedef {Object} ScreenshotSeries
 * @property {IMediaFile} file - The media file associated with the screenshot series.
 * @property {{ start: number; end: number }} fileTimespan - The timespan of the screenshot series.
 * @property {string} resolution - The resolution of the screenshot series.
 */

/**
 * Represents a screenshot series with associated file, timestamps, and resolution.
 * @typedef {Object} ScreenshotTimestamps
 * @property {IMediaFile} file - The media file associated with the screenshot series.
 * @property {number[]} timestamps - The timestamps of the screenshot series.
 * @property {string} resolution - The resolution of the screenshot series.
 */

/**
 * Manages a queue of screenshot series for processing.
 */
export default class ScreenshotQueue {
  private static instance: ScreenshotQueue; // Singleton instance

  private maxConcurrentJobs: number; // Maximum number of screenshot series to process concurrently

  private queue: (ScreenshotSeries | ScreenshotTimestamps)[] = []; // Queue of screenshot series to be processed

  private activeJobs: number = 0; // Current number of jobs being processed

  private jobProcessingQueue: Promise<void>[] = []; // Holds promises for processing jobs

  screenshotsUpdate?: (mediaFile: IMediaFile, screenshot: Screenshot) => void;

  /**
   * Private constructor to prevent instantiation outside the class.
   * @param {number} maxConcurrentJobs - The maximum number of screenshot series to process concurrently.
   */
  private constructor(maxConcurrentJobs: number) {
    this.maxConcurrentJobs = maxConcurrentJobs;
  }

  /**
   * Get the singleton instance of ScreenshotQueue.
   * @param {number} maxConcurrentJobs - The maximum number of screenshot series to process concurrently.
   * @returns {ScreenshotQueue} The singleton instance of ScreenshotQueue.
   */
  public static getInstance(maxConcurrentJobs: number = 3): ScreenshotQueue {
    if (!ScreenshotQueue.instance) {
      ScreenshotQueue.instance = new ScreenshotQueue(maxConcurrentJobs);
    }
    return ScreenshotQueue.instance;
  }

  /**
   * Add a screenshot series to the queue for processing.
   * @param {ScreenshotSeries | ScreenshotTimestamps} queueItem - The screenshot series to add to the queue.
   */
  public enqueue(queueItem: ScreenshotSeries | ScreenshotTimestamps): void {
    // Logic for handling overlapping items in the queue
  }

  /**
   * Process the next screenshot series in the queue with concurrency control.
   * @returns {Promise<void>} A promise that resolves when the processing is complete.
   */
  private async processNext(): Promise<void {
    // Logic for processing the next screenshot series
  }

  /**
   * Simulate the processing of a screenshot series.
   * @param {ScreenshotSeries | ScreenshotTimestamps} queueItem - The screenshot series to process.
   * @returns {Promise<void>} A promise that resolves when the processing is complete.
   */
  private async processScreenshotSeries(queueItem: ScreenshotSeries | ScreenshotTimestamps): Promise<void {
    // Logic for simulating processing of screenshot series
  }

  /**
   * Wait for all jobs in the queue to finish processing.
   * @returns {Promise<void>} A promise that resolves when all jobs are finished.
   */
  public async waitForAllJobs(): Promise<void {
    // Logic for waiting for all jobs to finish
  }

  /**
   * Get the current status of the queue.
   * @returns {{ queueLength: number; activeJobs: number }} The current queue status.
   */
  public getStatus(): { queueLength: number; activeJobs: number } {
    return { queueLength: this.queue.length, activeJobs: this.activeJobs };
  }
}