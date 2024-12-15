import { SortedList } from '@stoked-ui/common';
import ScreenshotQueue, {ScreenshotTimestamps} from "./ScreenshotQueue";
import IMediaFile from '../IMediaFile';

export type Screenshot = {
  timestamp: number; // The timestamp of the screenshot (in seconds)
  resolution: Resolution; // Resolution (e.g., "1920x1080", "1280x720")
  data: any; // The actual image data (could be a URL, blob, base64 string, etc.)
};

export type Resolution = 'full' | 'track' | {width: number, height: number};

export default class ScreenshotStore {
  screenshots:  SortedList<Screenshot> = new SortedList<Screenshot>(
    (a, b) => {
      if (!a || !b || a.timestamp === undefined || b.timestamp === undefined) {
        console.error('Invalid inputs to comparator:', a, b);
        return 0; // Consider equal or adjust logic as needed
      }
      return a.timestamp - b.timestamp;
    }
  );

  private threshold: number; // Threshold in seconds for considering screenshots as close enough

  scaleWidth: number;

  scale: number;

  file: IMediaFile;

  private video: HTMLVideoElement;

  private trackHeight: number = 36 * 1.6;

  private trackWidth: number;

  private aspectRatio: number;

  get count(): number {
    return this.screenshots.length;
  }

  get trackScreenshots() {
    const screens = Array.from(this.screenshots.values()) || [];
    return screens.filter((screen) => screen?.resolution === 'track');
  }

  getDimensions(resolution: Resolution) {
    if (resolution === 'full') {
      return { width: this.video.videoWidth, height: this.video.videoHeight };
    }
    if (resolution === 'track') {
      return { width: this.trackWidth, height: this.trackHeight };
    }
    return resolution;
  }

  constructor({ threshold, video, file }: { threshold: number, video: HTMLVideoElement, file: IMediaFile }) {
    this.video = video;
    this.aspectRatio = video.videoWidth / video.videoHeight;
    this.trackWidth = this.trackHeight * this.aspectRatio;
    this.threshold = threshold;
    this.scaleWidth = 100;
    this.scale = 1;
    this.file = file;
  }

  getScreenshotTimespanCount(height: number, fileTimespan: { start: number; end: number }) {
    const maxWidth = height * this.aspectRatio;
    const trackWidth = (fileTimespan.end - fileTimespan.start) * (this.scaleWidth / this.scale);
    return Math.ceil((trackWidth / maxWidth));
  }

  captureScreenshot = (time: number, canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, resolution: Resolution, onCapture?: (screen: Screenshot) => void): Promise<Screenshot> => new Promise((resolveCapture) => {
    this.video.currentTime = time % this.video.duration
    const res = this.getDimensions(resolution);
    const { width, height } = res;

    this.video.onseeked = () => {
      canvas.width = width;
      canvas.height = height;
      context.drawImage(this.video, 0, 0, canvas.width, canvas.height);
      const data = canvas.toDataURL('image/png');
      // log generated screenshots
      // console.info('data', data);
      const screen = { timestamp: time, data, resolution } as Screenshot;
      this.screenshots.push(screen);
      onCapture?.(screen);

      ScreenshotQueue.getInstance(3).screenshotsUpdate?.(this.file, screen);

      resolveCapture(screen);
    };
  });

  async generateTimestampScreenshots(timestamps: number[], resolution: Resolution, onCapture?: (screen: Screenshot) => void): Promise<Screenshot[]> {
    const screens: Screenshot[] = [];
    if (window) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Failed to create canvas context.');
      }
      for (let i = 0; i < timestamps.length; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        const screen = await this.captureScreenshot(timestamps[i], canvas, context, resolution);
        screens.push(screen);
      }
    }
    return screens;
  }

  // eslint-disable-next-line class-methods-use-this
  async generateTimespanScreenshots(count: number, resolution: Resolution, fileTimespan: {start: number, end: number}, onCapture?: (screen: Screenshot) => void): Promise<Screenshot[]> {
    return new Promise((resolve, reject) => {
      const { start, end } = fileTimespan;
      // Generate screenshots
      const screens: Screenshot[] = [];
      if (window) {

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) {
          reject(new Error('Failed to create canvas context.'));
          return;
        }

        const interval = (end - start) / count;

        (async () => {
          let time = start;
          for (let i = 1; i <= count; i += 1) {
            // eslint-disable-next-line no-await-in-loop
            const screen = await this.captureScreenshot(time, canvas, context, resolution, onCapture);
            screens.push(screen);
            time += interval;
          }
          resolve(screens);
        })();
      } else {
        resolve(screens);
      }

    });
  }

  // Query for a specific number of screenshots within a time range
  async queryScreenshots(
    resolution: Resolution,
    range: { start: number; end: number },
    height: number,
  ): Promise<{ found: Screenshot[], missing: number[] }> {
    const { start, end } = range;

    // First, get all the screenshots within the range of start and end
    const allScreenshots = Array.from(this.screenshots.values()).filter((screenshot) => screenshot?.resolution === resolution && screenshot?.timestamp >= start && (screenshot.timestamp % this.video.duration) <= end);
    const numScreenshots = this.getScreenshotTimespanCount(height, { start, end });

    // If there are enough screenshots in the range, return the closest `numScreenshots` to the specified time range
    const res = this.getClosestScreenshots(allScreenshots, numScreenshots, { start, end });
    if (res.found.length !== numScreenshots) {
      // If not enough screenshots, fetch the missing ones asynchronously

      // console.info('ScreenshotQueue.enqueue', res.missing);
      ScreenshotQueue.getInstance(3).enqueue({ timestamps: res.missing, resolution, file: this.file } as ScreenshotTimestamps);
    }
    return res;
  }

  // Get the closest screenshots to the requested range, while respecting the threshold
  private getClosestScreenshots(
    screenshots: Screenshot[],
    numScreenshots: number,
    range: { start: number; end: number }
  ): { found: Screenshot[], missing: number[] } {
    const { start, end } = range;
    // Filter out screenshots that are too far away from the range (beyond the threshold)
    const interval = (end - start) / numScreenshots;
    let time = start;
    const missingScreens: number[] = [];
    const validScreenshots: Screenshot[] = [];
    for (let i = 1; i <= numScreenshots; i += 1) {

      // eslint-disable-next-line no-await-in-loop,@typescript-eslint/no-loop-func
      const screen = screenshots.find((screenshot: Screenshot) => Math.abs(screenshot.timestamp - time) <= this.threshold);
      if (screen) {
        validScreenshots.push(screen);
      } else {
        missingScreens.push(time)
      }
      time += interval;
    }

    // Return the closest `numScreenshots` to the range
    return { found: validScreenshots, missing: missingScreens };
  }
}

