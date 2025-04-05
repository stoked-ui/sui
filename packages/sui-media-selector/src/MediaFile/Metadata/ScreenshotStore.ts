/**
 * @typedef Screenshot
 * @type {object}
 * @property {number} timestamp - The timestamp of the screenshot (in seconds)
 * @property {Resolution} resolution - Resolution (e.g., "1920x1080", "1280x720")
 * @property {any} data - The actual image data (could be a URL, blob, base64 string, etc.)
 */

/**
 * @typedef Resolution
 * @type {'full' | 'track' | {width: number, height: number}}
 */

/**
 * Represents a store for managing screenshots.
 */
export default class ScreenshotStore {
  /**
   * The sorted list of screenshots.
   * @type {SortedList<Screenshot>}
   */
  screenshots = new SortedList<Screenshot>(
    (a, b) => {
      if (!a || !b || a.timestamp === undefined || b.timestamp === undefined) {
        console.error('Invalid inputs to comparator:', a, b);
        return 0; // Consider equal or adjust logic as needed
      }
      return a.timestamp - b.timestamp;
    }
  );

  /**
   * The threshold in seconds for considering screenshots as close enough.
   * @type {number}
   */
  private threshold: number;

  /**
   * The width for scaling.
   * @type {number}
   */
  scaleWidth: number;

  /**
   * The scale factor.
   * @type {number}
   */
  scale: number;

  /**
   * The associated media file.
   * @type {IMediaFile}
   */
  file: IMediaFile;

  /**
   * The HTML video element.
   * @type {HTMLVideoElement}
   */
  private video: HTMLVideoElement;

  /**
   * The height of the track.
   * @type {number}
   */
  private trackHeight: number = 36 * 1.6;

  /**
   * The width of the track.
   * @type {number}
   */
  private trackWidth: number;

  /**
   * The aspect ratio of the video.
   * @type {number}
   */
  private aspectRatio: number;

  /**
   * Returns the count of screenshots.
   * @returns {number} The count of screenshots.
   */
  get count(): number {
    return this.screenshots.length;
  }

  /**
   * Gets the screenshots with 'track' resolution.
   * @returns {Screenshot[]} The screenshots with 'track' resolution.
   */
  get trackScreenshots() {
    const screens = Array.from(this.screenshots.values()) || [];
    return screens.filter((screen) => screen?.resolution === 'track');
  }

  /**
   * Get the dimensions based on the resolution.
   * @param {Resolution} resolution - The resolution type.
   * @returns {{ width: number, height: number }} The width and height based on the resolution.
   */
  getDimensions(resolution: Resolution) {
    if (resolution === 'full') {
      return { width: this.video.videoWidth, height: this.video.videoHeight };
    }
    if (resolution === 'track') {
      return { width: this.trackWidth, height: this.trackHeight };
    }
    return resolution;
  }

  /**
   * Constructs a new ScreenshotStore.
   * @param {Object} params - The constructor parameters.
   * @param {number} params.threshold - The threshold in seconds.
   * @param {HTMLVideoElement} params.video - The HTML video element.
   * @param {IMediaFile} params.file - The media file.
   */
  constructor({ threshold, video, file }: { threshold: number, video: HTMLVideoElement, file: IMediaFile }) {
    this.video = video;
    this.aspectRatio = video.videoWidth / video.videoHeight;
    this.trackWidth = this.trackHeight * this.aspectRatio;
    this.threshold = threshold;
    this.scaleWidth = 100;
    this.scale = 1;
    this.file = file;
  }

  /**
   * Captures a screenshot.
   * @param {number} time - The timestamp for the screenshot.
   * @param {HTMLCanvasElement} canvas - The canvas element for capturing the screenshot.
   * @param {CanvasRenderingContext2D} context - The 2D rendering context of the canvas.
   * @param {Resolution} resolution - The resolution of the screenshot.
   * @param {function} onCapture - Callback function for capturing the screenshot.
   * @returns {Promise<Screenshot>} A promise that resolves with the captured screenshot.
   */
  captureScreenshot = (time: number, canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, resolution: Resolution, onCapture?: (screen: Screenshot) => void): Promise<Screenshot> => new Promise((resolveCapture) => {
    this.video.currentTime = time % this.video.duration;
    const res = this.getDimensions(resolution);
    const { width, height } = res;

    this.video.onseeked = () => {
      canvas.width = width;
      canvas.height = height;
      context.drawImage(this.video, 0, 0, canvas.width, canvas.height);
      const data = canvas.toDataURL('image/png');
      const screen = { timestamp: time, data, resolution } as Screenshot;
      this.screenshots.push(screen);
      onCapture?.(screen);

      ScreenshotQueue.getInstance(3).screenshotsUpdate?.(this.file, screen);

      resolveCapture(screen);
    };
  });

  /**
   * Generates screenshots for an array of timestamps.
   * @param {number[]} timestamps - The array of timestamps.
   * @param {Resolution} resolution - The resolution of the screenshots.
   * @param {function} onCapture - Callback function for capturing each screenshot.
   * @returns {Promise<Screenshot[]>} A promise that resolves with an array of generated screenshots.
   */
  async generateTimestampScreenshots(timestamps: number[], resolution: Resolution, onCapture?: (screen: Screenshot) => void): Promise<Screenshot[]> {
    const screens: Screenshot[] = [];
    if (window) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Failed to create canvas context.');
      }
      for (let i = 0; i < timestamps.length; i += 1) {
        const screen = await this.captureScreenshot(timestamps[i], canvas, context, resolution);
        screens.push(screen);
      }
    }
    return screens;
  }

  /**
   * Generates screenshots at specific intervals within a time range.
   * @param {number} count - The number of screenshots to generate.
   * @param {Resolution} resolution - The resolution of the screenshots.
   * @param {Object} fileTimespan - The time range for generating screenshots.
   * @param {function} onCapture - Callback function for capturing each screenshot.
   * @returns {Promise<Screenshot[]>} A promise that resolves with an array of generated screenshots.
   */
  async generateTimespanScreenshots(count: number, resolution: Resolution, fileTimespan: { start: number, end: number }, onCapture?: (screen: Screenshot) => void): Promise<Screenshot[]> {
    return new Promise((resolve, reject) => {
      const { start, end } = fileTimespan;
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

  /**
   * Queries for screenshots within a time range.
   * @param {Resolution} resolution - The resolution of the screenshots to query.
   * @param {Object} range - The time range to query.
   * @param {number} height - The height for scaling.
   * @returns {Promise<{ found: Screenshot[], missing: number[] }>} A promise that resolves with found and missing screenshots.
   */
  async queryScreenshots(
    resolution: Resolution,
    range: { start: number; end: number },
    height: number,
  ): Promise<{ found: Screenshot[], missing: number[] }> {
    const { start, end } = range;
    const allScreenshots = Array.from(this.screenshots.values()).filter((screenshot) => screenshot?.resolution === resolution && screenshot?.timestamp >= start && (screenshot.timestamp % this.video.duration) <= end);
    const numScreenshots = this.getScreenshotTimespanCount(height, { start, end });
    const res = this.getClosestScreenshots(allScreenshots, numScreenshots, { start, end });
    if (res.found.length !== numScreenshots) {
      ScreenshotQueue.getInstance(3).enqueue({ timestamps: res.missing, resolution, file: this.file } as ScreenshotTimestamps);
    }
    return res;
  }

  /**
   * Gets the closest screenshots to the requested range, respecting the threshold.
   * @param {Screenshot[]} screenshots - The available screenshots.
   * @param {number} numScreenshots - The number of screenshots to find.
   * @param {Object} range - The time range.
   * @returns {{ found: Screenshot[], missing: number[] }} The closest found screenshots and missing timestamps.
   */
  private getClosestScreenshots(
    screenshots: Screenshot[],
    numScreenshots: number,
    range: { start: number; end: number }
  ): { found: Screenshot[], missing: number[] } {
    const { start, end } = range;
    const interval = (end - start) / numScreenshots;
    let time = start;
    const missingScreens: number[] = [];
    const validScreenshots: Screenshot[] = [];
    for (let i = 1; i <= numScreenshots; i += 1) {
      const screen = screenshots.find((screenshot: Screenshot) => Math.abs(screenshot.timestamp - time) <= this.threshold);
      if (screen) {
        validScreenshots.push(screen);
      } else {
        missingScreens.push(time);
      }
      time += interval;
    }
    return { found: validScreenshots, missing: missingScreens };
  }
}