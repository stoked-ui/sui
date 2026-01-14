import { Test, TestingModule } from '@nestjs/testing';
import { ChromiumRendererService } from '../src/render/services/chromium-renderer.service';
import { FFmpegEncoderService } from '../src/render/services/ffmpeg-encoder.service';
import { FrameStreamPipelineService } from '../src/render/services/frame-stream-pipeline.service';
import { TimelineEvaluatorService } from '../src/render/services/timeline-evaluator.service';
import { SueManifestDto } from '../src/render/dto';
import * as path from 'path';
import * as fs from 'fs';

describe('Chromium Render Pipeline Integration Tests', () => {
  let chromiumRenderer: ChromiumRendererService;
  let ffmpegEncoder: FFmpegEncoderService;
  let frameStreamPipeline: FrameStreamPipelineService;
  let timelineEvaluator: TimelineEvaluatorService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChromiumRendererService,
        FFmpegEncoderService,
        FrameStreamPipelineService,
        TimelineEvaluatorService,
      ],
    }).compile();

    chromiumRenderer = module.get<ChromiumRendererService>(ChromiumRendererService);
    ffmpegEncoder = module.get<FFmpegEncoderService>(FFmpegEncoderService);
    frameStreamPipeline = module.get<FrameStreamPipelineService>(FrameStreamPipelineService);
    timelineEvaluator = module.get<TimelineEvaluatorService>(TimelineEvaluatorService);
  });

  afterAll(async () => {
    await chromiumRenderer.closeBrowser();
  });

  describe('TimelineEvaluator', () => {
    it('should correctly identify active actions at specific time', () => {
      const manifest: SueManifestDto = createTestManifest();
      const activeActions = timelineEvaluator.getActiveActions(manifest, 5.0);

      expect(activeActions).toBeDefined();
      expect(activeActions.length).toBeGreaterThan(0);
      expect(activeActions[0].start).toBeLessThanOrEqual(5.0);
      expect(activeActions[0].end).toBeGreaterThanOrEqual(5.0);
    });

    it('should calculate correct duration from manifest', () => {
      const manifest: SueManifestDto = createTestManifest();
      const duration = timelineEvaluator.calculateDuration(manifest);

      expect(duration).toBeGreaterThan(0);
    });

    it('should calculate fit positions correctly', () => {
      const result = timelineEvaluator.calculateFitPosition(1280, 720, 1920, 1080, 'contain');

      expect(result).toHaveProperty('x');
      expect(result).toHaveProperty('y');
      expect(result).toHaveProperty('w');
      expect(result).toHaveProperty('h');
      expect(result.w).toBeLessThanOrEqual(1920);
      expect(result.h).toBeLessThanOrEqual(1080);
    });

    it('should detect stable scenes', () => {
      const manifest: SueManifestDto = createTestManifest();
      const scenes = timelineEvaluator.detectStableScenes(manifest);

      expect(scenes).toBeDefined();
      expect(Array.isArray(scenes)).toBe(true);
    });
  });

  describe('ChromiumRenderer', () => {
    it('should launch browser successfully', async () => {
      const browser = await chromiumRenderer.launchBrowser();
      expect(browser).toBeDefined();
    });

    it('should initialize render page with manifest', async () => {
      const manifest: SueManifestDto = createTestManifest();
      const page = await chromiumRenderer.initializeRenderPage(manifest);

      expect(page).toBeDefined();

      const isReady = await chromiumRenderer.isRenderPageReady(page);
      expect(isReady).toBe(true);
    });

    it('should render single frame', async () => {
      const manifest: SueManifestDto = createTestManifest();
      const page = await chromiumRenderer.initializeRenderPage(manifest);

      const frameData = await chromiumRenderer.renderFramePNG(page, 0);
      expect(frameData).toBeDefined();
      expect(frameData).toContain('data:image/png;base64,');
    }, 30000);

    it('should render RGBA buffer', async () => {
      const manifest: SueManifestDto = createTestManifest();
      const page = await chromiumRenderer.initializeRenderPage(manifest);

      const buffer = await chromiumRenderer.renderFrameRGBA(page, 0);
      expect(buffer).toBeDefined();
      expect(Buffer.isBuffer(buffer)).toBe(true);
      expect(buffer.length).toBeGreaterThan(0);
    }, 30000);
  });

  describe('FFmpegEncoder', () => {
    it('should create encoder process', () => {
      const options = {
        width: 1920,
        height: 1080,
        fps: 60,
        outputPath: '/tmp/test-output.mp4',
      };

      const { process: ffmpegProcess, stdin } = ffmpegEncoder.createEncoderProcess(options);

      expect(ffmpegProcess).toBeDefined();
      expect(stdin).toBeDefined();

      ffmpegProcess.kill('SIGKILL');
    });

    it('should encode audio track', async () => {
      // Skip if no test audio file available
      const testAudioPath = path.join(__dirname, 'fixtures', 'test-audio.mp3');
      if (!fs.existsSync(testAudioPath)) {
        console.log('Skipping audio encode test - no test fixture');
        return;
      }

      const outputPath = '/tmp/test-audio-output.aac';

      await ffmpegEncoder.encodeAudioTrack(testAudioPath, outputPath, {
        codec: 'aac',
        bitrate: '192k',
      });

      expect(fs.existsSync(outputPath)).toBe(true);

      // Cleanup
      fs.unlinkSync(outputPath);
    }, 30000);
  });

  describe('FrameStreamPipeline (Short Test)', () => {
    it('should render short video (5 seconds)', async () => {
      const manifest: SueManifestDto = createShortTestManifest();
      const outputPath = '/tmp/test-render-short.mp4';

      const progressUpdates: any[] = [];

      await frameStreamPipeline.render({
        manifest,
        outputPath,
        fps: 30, // Lower FPS for faster test
        quality: 'low',
        onProgress: (progress) => {
          progressUpdates.push(progress);
        },
      });

      // Verify output exists
      expect(fs.existsSync(outputPath)).toBe(true);

      // Verify progress updates
      expect(progressUpdates.length).toBeGreaterThan(0);
      expect(progressUpdates[progressUpdates.length - 1].progress).toBeCloseTo(100);

      // Verify video properties using FFprobe
      const duration = await ffmpegEncoder.getVideoDuration(outputPath);
      expect(duration).toBeCloseTo(manifest.duration || 5, 1);

      // Cleanup
      fs.unlinkSync(outputPath);
    }, 60000); // 1 minute timeout for short render
  });
});

/**
 * Create test manifest for integration tests
 */
function createTestManifest(): SueManifestDto {
  return {
    id: 'test-project-001',
    name: 'Test Project',
    version: 2,
    filesMeta: [],
    tracks: [
      {
        controllerName: 'image',
        fileId: 'img-001',
        id: 'track-001',
        name: 'Background',
        url: createTestImageDataUrl(1920, 1080, '#4299e1'),
        actions: [
          {
            name: 'background-action',
            start: 0,
            end: 15,
            z: 0,
            fit: 'fill',
            blendMode: 'normal',
          },
        ],
      },
      {
        controllerName: 'image',
        fileId: 'img-002',
        id: 'track-002',
        name: 'Overlay',
        url: createTestImageDataUrl(640, 360, '#ed8936'),
        actions: [
          {
            name: 'overlay-action',
            start: 3,
            end: 12,
            z: 1,
            fit: 'contain',
            blendMode: 'normal',
            opacity: 0.8,
          },
        ],
      },
    ],
    backgroundColor: '#1a202c',
    width: 1920,
    height: 1080,
    duration: 15,
    fps: 60,
  };
}

/**
 * Create shorter test manifest for faster tests
 */
function createShortTestManifest(): SueManifestDto {
  return {
    id: 'test-project-short',
    name: 'Short Test Project',
    version: 2,
    filesMeta: [],
    tracks: [
      {
        controllerName: 'image',
        fileId: 'img-001',
        id: 'track-001',
        name: 'Background',
        url: createTestImageDataUrl(1920, 1080, '#667eea'),
        actions: [
          {
            name: 'background-action',
            start: 0,
            end: 5,
            z: 0,
            fit: 'fill',
            blendMode: 'normal',
          },
        ],
      },
    ],
    backgroundColor: '#2d3748',
    width: 1920,
    height: 1080,
    duration: 5,
    fps: 30,
  };
}

/**
 * Create test image as data URL
 */
function createTestImageDataUrl(width: number, height: number, color: string): string {
  // Create a simple colored rectangle as SVG data URL
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="${color}"/>
    </svg>
  `.trim();

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}
