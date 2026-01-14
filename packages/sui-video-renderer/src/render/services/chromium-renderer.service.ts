import { Injectable, Logger } from '@nestjs/common';
import puppeteer, { Browser, Page } from 'puppeteer';
import { SueManifestDto } from '../dto';
import * as path from 'path';
import * as fs from 'fs';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);

/**
 * Frame data captured from Chromium
 */
export interface CapturedFrame {
  frameNumber: number;
  timestamp: number;
  buffer: Buffer;
  format: 'png' | 'rgba';
}

/**
 * ChromiumRenderer Service
 *
 * Launches headless Chromium and renders video frames using the canvas-based
 * render engine. Captures frames as PNG or raw RGBA for streaming to FFmpeg.
 */
@Injectable()
export class ChromiumRendererService {
  private readonly logger = new Logger(ChromiumRendererService.name);
  private browser: Browser | null = null;
  private activePage: Page | null = null;

  /**
   * Launch headless Chromium browser
   */
  async launchBrowser(): Promise<Browser> {
    if (this.browser) {
      return this.browser;
    }

    this.logger.log('Launching headless Chromium...');

    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-software-rasterizer',
        '--disable-extensions',
      ],
    });

    this.logger.log('Chromium launched successfully');
    return this.browser;
  }

  /**
   * Close browser instance
   */
  async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.activePage = null;
      this.logger.log('Chromium browser closed');
    }
  }

  /**
   * Initialize render page with .sue manifest
   *
   * @param manifest .sue manifest data
   * @returns Initialized page ready for rendering
   */
  async initializeRenderPage(manifest: SueManifestDto): Promise<Page> {
    const browser = await this.launchBrowser();

    this.logger.log('Creating new page for rendering...');
    const page = await browser.newPage();

    // Set viewport to match canvas size
    await page.setViewport({
      width: manifest.width,
      height: manifest.height,
      deviceScaleFactor: 1,
    });

    // Load render page
    const renderPagePath = path.join(__dirname, '..', 'static', 'render.html');
    const renderPageUrl = `file://${renderPagePath}`;

    this.logger.log(`Loading render page: ${renderPageUrl}`);
    await page.goto(renderPageUrl, { waitUntil: 'networkidle0' });

    // Initialize render engine with manifest
    this.logger.log('Initializing render engine with manifest...');
    const initResult = await page.evaluate((manifestData) => {
      return (window as any).initRenderEngine(manifestData);
    }, manifest);

    this.logger.log(`Render engine initialized: ${JSON.stringify(initResult)}`);

    this.activePage = page;
    return page;
  }

  /**
   * Render a single frame at the specified time
   *
   * @param page Puppeteer page instance
   * @param time Time in seconds
   * @returns PNG data as base64 string
   */
  async renderFramePNG(page: Page, time: number): Promise<string> {
    const frameData = await page.evaluate((t) => {
      return (window as any).renderFrameAtTime(t);
    }, time);

    return frameData;
  }

  /**
   * Render frame and get raw RGBA buffer
   * More efficient for FFmpeg streaming
   *
   * @param page Puppeteer page instance
   * @param time Time in seconds
   * @returns Raw RGBA buffer
   */
  async renderFrameRGBA(page: Page, time: number): Promise<Buffer> {
    // Render frame and get RGBA buffer from canvas
    const rgbaArray = await page.evaluate((t) => {
      return Array.from((window as any).getFrameBuffer(t));
    }, time);

    return Buffer.from(rgbaArray as number[]);
  }

  /**
   * Capture frame as screenshot
   * Alternative method using Puppeteer screenshot API
   *
   * @param page Puppeteer page instance
   * @param time Time in seconds
   * @returns PNG buffer
   */
  async captureFrameScreenshot(page: Page, time: number): Promise<Buffer> {
    // Render frame first
    await page.evaluate((t) => {
      (window as any).renderFrameAtTime(t);
    }, time);

    // Capture screenshot
    const canvas = await page.$('#render-canvas');
    if (!canvas) {
      throw new Error('Canvas element not found');
    }

    const screenshot = await canvas.screenshot({
      type: 'png',
      omitBackground: true,
    });

    return screenshot as Buffer;
  }

  /**
   * Render multiple frames in sequence
   * Generator function for streaming frame capture
   *
   * @param manifest .sue manifest data
   * @param fps Frame rate
   * @param duration Total duration in seconds
   */
  async *renderFrameSequence(
    manifest: SueManifestDto,
    fps: number = 60,
    duration?: number,
  ): AsyncGenerator<CapturedFrame> {
    const page = await this.initializeRenderPage(manifest);

    // Calculate duration if not provided
    const totalDuration = duration || this.calculateDuration(manifest);
    const totalFrames = Math.ceil(totalDuration * fps);

    this.logger.log(`Rendering ${totalFrames} frames at ${fps}fps (${totalDuration}s)`);

    for (let frame = 0; frame < totalFrames; frame++) {
      const time = frame / fps;

      // Render frame and get RGBA buffer
      const buffer = await this.renderFrameRGBA(page, time);

      yield {
        frameNumber: frame,
        timestamp: time,
        buffer,
        format: 'rgba',
      };

      // Progress logging
      if (frame % fps === 0) {
        const progress = Math.floor((frame / totalFrames) * 100);
        this.logger.debug(`Rendering progress: ${progress}% (frame ${frame}/${totalFrames})`);
      }
    }

    this.logger.log('Frame rendering complete');
  }

  /**
   * Calculate total duration from manifest
   */
  private calculateDuration(manifest: SueManifestDto): number {
    if (manifest.duration) {
      return manifest.duration;
    }

    let maxEndTime = 0;
    for (const track of manifest.tracks) {
      for (const action of track.actions) {
        maxEndTime = Math.max(maxEndTime, action.end);
      }
    }

    return maxEndTime;
  }

  /**
   * Check if render page is ready
   */
  async isRenderPageReady(page: Page): Promise<boolean> {
    try {
      const isReady = await page.evaluate(() => {
        return (window as any).renderEngine !== null && (window as any).renderEngine !== undefined;
      });
      return isReady;
    } catch (error) {
      this.logger.error('Failed to check render page readiness', error);
      return false;
    }
  }

  /**
   * Get current page instance
   */
  getActivePage(): Page | null {
    return this.activePage;
  }

  /**
   * Convert PNG base64 to RGBA buffer
   * Uses sharp library for efficient conversion
   *
   * @param pngBase64 Base64 encoded PNG
   * @returns Raw RGBA buffer
   */
  private async pngToRGBA(pngBase64: string, width: number, height: number): Promise<Buffer> {
    const sharp = require('sharp');

    // Remove data:image/png;base64, prefix
    const base64Data = pngBase64.replace(/^data:image\/png;base64,/, '');
    const pngBuffer = Buffer.from(base64Data, 'base64');

    // Convert to raw RGBA
    const rgbaBuffer = await sharp(pngBuffer)
      .ensureAlpha()
      .raw()
      .toBuffer();

    return rgbaBuffer;
  }
}
