import IMediaFile from "../IMediaFile";
import { Screenshot } from "./ScreenshotStore";

export interface ScreenshotSeries {
  file: IMediaFile;
  fileTimespan: { start: number; end: number };
  resolution: string;
}


export interface ScreenshotTimestamps {
  file: IMediaFile;
  timestamps: number[];
  resolution: string;
}

export default class ScreenshotQueue {
  private static instance: ScreenshotQueue; // Singleton instance

  private maxConcurrentJobs: number; // Maximum number of screenshot series to process concurrently

  private queue: (ScreenshotSeries | ScreenshotTimestamps)[] = []; // Queue of screenshot series
  // to be processed

  private activeJobs: number = 0; // Current number of jobs being processed

  private jobProcessingQueue: Promise<void>[] = []; // Holds promises for processing jobs

  screenshotsUpdate?: (mediaFile: IMediaFile, screenshot: Screenshot) => void;

  // Private constructor to prevent instantiation outside the class
  private constructor(maxConcurrentJobs: number) {
    this.maxConcurrentJobs = maxConcurrentJobs;
  }

  // Static method to get the singleton instance
  public static getInstance(maxConcurrentJobs: number = 3): ScreenshotQueue {
    if (!ScreenshotQueue.instance) {
      ScreenshotQueue.instance = new ScreenshotQueue(maxConcurrentJobs);
    }
    return ScreenshotQueue.instance;
  }

  // Add a screenshot series to the queue
  public enqueue(queueItem: ScreenshotSeries | ScreenshotTimestamps): void {
    if ("fileTimespan" in queueItem) {
      const { file, fileTimespan, resolution } = queueItem;
      const { start, end } = fileTimespan;
      // Check for overlapping items in the queue
      this.queue = this.queue.map((item) => {
        if (item.file.id === file.id && item.resolution === resolution && "fileTimespan" in item) {
          // If there's a full overlap with an existing item's range, adjust its range
          if (start <= item.fileTimespan.end && end >= item.fileTimespan.start) {
            // Partial overlap: modify the existing item's timespan to exclude the overlap
            if (start > item.fileTimespan.start && end < item.fileTimespan.end) {
              // Split existing item into two segments (before and after overlap)
              const before = { ...item, fileTimespan: { end: start, start: item.fileTimespan.start }};
              const after = { ...item, fileTimespan: { start: end, end: item.fileTimespan.end }};
              this.queue.push(before, after); // Push adjusted ranges back into the queue
              return null; // Remove the original item
            }
            if (start <= item.fileTimespan.start && end >= item.fileTimespan.end) {
              // Full overlap: existing item is fully covered, remove it
              return null;
            }
            if (start > item.fileTimespan.start && start <= item.fileTimespan.end) {
              // Overlap at the end of the existing range
              item.fileTimespan.end = start;
            } else if (end >= item.fileTimespan.start && end < item.fileTimespan.end) {
              // Overlap at the beginning of the existing range
              item.fileTimespan.start = end;
            }
          }
        }
        return item;
      }).filter(Boolean) as ScreenshotSeries[]; // Remove null items from the queue
    } else {
      const { file, timestamps, resolution } = queueItem;
      this.queue = this.queue.map((item) => {
        if (item.file.id === file.id && item.resolution === resolution && "timestamps" in item) {
          // If there's a full overlap with an existing item's timestamps, remove the existing item
          queueItem.timestamps = queueItem.timestamps.filter((timestamp) => !item.timestamps.includes(timestamp));
        }
        return item;
      });
    }

    // Check if the new range is fully overlapped by existing items
    const isFullyOverlapped = this.queue.some(
      (item) => {
        if ("fileTimespan" in item && "fileTimespan" in queueItem) {
          const { start, end } = item.fileTimespan;
          return start <= queueItem.fileTimespan.start && end >= queueItem.fileTimespan.end
        }
        return false;
      }
    );

    if (!isFullyOverlapped) {
      // Add the new item to the queue if it isn't fully overlapped
      this.queue.push(queueItem);
      this.processNext();
    }
  }

  // Process the next screenshot series in the queue (with concurrency control)
  private async processNext(): Promise<void> {
    if (this.activeJobs >= this.maxConcurrentJobs || this.queue.length === 0) {
      // If we have hit the max concurrent jobs, return and wait for a worker to finish
      return;
    }

    // Get the next series from the queue
    const screenshotSeries = this.queue.shift();

    if (!screenshotSeries) {
      return;
    } // In case the queue is unexpectedly empty

    // Start processing this screenshot series
    this.activeJobs += 1;

    // Process the series (this is an async task, so we wrap it in a promise)
    const jobPromise = this.processScreenshotSeries(screenshotSeries);

    // Once the job is done, reduce the active jobs and try processing the next one
    jobPromise.finally(() => {
      this.activeJobs -= 1;
      this.processNext(); // Process the next job if available
    });

    // Add the job to the list of ongoing jobs
    this.jobProcessingQueue.push(jobPromise);
  }

  // Simulate the processing of a screenshot series (could be a CPU-intensive task)
  // eslint-disable-next-line class-methods-use-this
  private async processScreenshotSeries(queueItem: ScreenshotSeries | ScreenshotTimestamps): Promise<void> {
    const { screenshotStore } = queueItem.file.media;

    if ("fileTimespan" in queueItem) {
      const res = screenshotStore.getDimensions(queueItem.resolution);
      // Simulate screenshot generation (this could be a complex CPU-intensive task)
      // Replace with actual screenshot generation logic
      const count = screenshotStore?.getScreenshotTimespanCount(res.height, queueItem.fileTimespan);

      await screenshotStore?.generateTimespanScreenshots(count, queueItem.resolution, queueItem.fileTimespan);
    } else {
      await screenshotStore?.generateTimestampScreenshots(queueItem.timestamps, queueItem.resolution);
    }
  }

  // Wait for all jobs to finish processing
  public async waitForAllJobs(): Promise<void> {
    // Wait for all ongoing jobs to finish
    await Promise.all(this.jobProcessingQueue);
  }

  // Get the current status of the queue
  public getStatus(): { queueLength: number; activeJobs: number } {
    return { queueLength: this.queue.length, activeJobs: this.activeJobs };
  }
}

