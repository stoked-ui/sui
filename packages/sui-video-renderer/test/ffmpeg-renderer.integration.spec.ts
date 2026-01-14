import { Test, TestingModule } from '@nestjs/testing';
import { SueParserService } from '../src/render/services/sue-parser.service';
import { FFmpegFilterBuilderService } from '../src/render/services/ffmpeg-filter-builder.service';
import { FFmpegRendererService } from '../src/render/services/ffmpeg-renderer.service';
import { VolumeKeyframeProcessorService } from '../src/render/services/volume-keyframe-processor.service';
import { SueProjectDto, FitMode, BlendMode } from '../src/render/dto/sue-format.dto';
import * as path from 'path';
import * as fs from 'fs/promises';

describe('FFmpeg Renderer Integration', () => {
  let sueParser: SueParserService;
  let filterBuilder: FFmpegFilterBuilderService;
  let ffmpegRenderer: FFmpegRendererService;
  let volumeProcessor: VolumeKeyframeProcessorService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SueParserService,
        FFmpegFilterBuilderService,
        FFmpegRendererService,
        VolumeKeyframeProcessorService,
      ],
    }).compile();

    sueParser = module.get<SueParserService>(SueParserService);
    filterBuilder = module.get<FFmpegFilterBuilderService>(FFmpegFilterBuilderService);
    ffmpegRenderer = module.get<FFmpegRendererService>(FFmpegRendererService);
    volumeProcessor = module.get<VolumeKeyframeProcessorService>(VolumeKeyframeProcessorService);
  });

  describe('FFmpeg availability', () => {
    it('should detect FFmpeg installation', async () => {
      const result = await ffmpegRenderer.validateFFmpeg();
      expect(result.installed).toBe(true);
      expect(result.version).toBeDefined();
      console.log(`FFmpeg version: ${result.version}`);
    });
  });

  describe('Sue Parser', () => {
    it('should parse .sue project structure', () => {
      const sueProject: SueProjectDto = {
        id: 'test-project',
        name: 'Test Video Project',
        version: 2,
        filesMeta: [
          { size: 12353921, name: 'video.mp4', type: 'video/mp4' },
          { size: 5432100, name: 'audio.mp3', type: 'audio/mp3' },
        ],
        tracks: [
          {
            controllerName: 'video',
            fileId: 'mediafile-001',
            id: 'track-001',
            name: 'Main Video',
            url: '/path/to/video.mp4',
            actions: [
              {
                name: 'clip-1',
                start: 0,
                end: 15.3,
                trimStart: 1.0,
                volume: [[0, 0], [1, 5.5], [0.5, 10.2]],
                z: 0,
                fit: FitMode.FILL,
                blendMode: BlendMode.NORMAL,
                loop: 0,
                duration: 16.975,
                width: 1280,
                height: 720,
              },
            ],
          },
          {
            controllerName: 'audio',
            fileId: 'mediafile-002',
            id: 'track-002',
            name: 'Background Music',
            url: '/path/to/audio.mp3',
            actions: [
              {
                name: 'audio-1',
                start: 5.0,
                end: 20.0,
                trimStart: 0,
                volume: [[0.8, 5.0], [0.8, 20.0]],
                z: 0,
                fit: FitMode.NONE,
                blendMode: BlendMode.NORMAL,
                loop: 0,
              },
            ],
          },
        ],
        backgroundColor: '#000000',
        width: 1920,
        height: 1080,
        frameRate: 30,
      };

      const manifest = sueParser.parseProject(sueProject);

      expect(manifest.output.width).toBe(1920);
      expect(manifest.output.height).toBe(1080);
      expect(manifest.output.frameRate).toBe(30);
      expect(manifest.items.length).toBe(2);
      expect(manifest.hasVideo).toBe(true);
      expect(manifest.hasAudio).toBe(true);
    });

    it('should calculate timeline statistics', () => {
      const sueProject: SueProjectDto = {
        id: 'test-project',
        name: 'Test',
        version: 2,
        filesMeta: [],
        tracks: [
          {
            controllerName: 'video',
            fileId: 'file-1',
            id: 'track-1',
            name: 'Video',
            url: '/test.mp4',
            actions: [
              {
                name: 'clip-1',
                start: 0,
                end: 10,
                trimStart: 0,
                z: 0,
                fit: FitMode.FILL,
              },
            ],
          },
        ],
        backgroundColor: 'black',
        width: 1920,
        height: 1080,
      };

      const manifest = sueParser.parseProject(sueProject);
      const stats = sueParser.getTimelineStats(manifest);

      expect(stats.totalItems).toBe(1);
      expect(stats.totalDuration).toBe(10);
      expect(stats.hasVideo).toBe(true);
      expect(stats.hasAudio).toBe(false);
      expect(stats.complexity).toBeGreaterThan(0);
    });
  });

  describe('Volume Keyframe Processor', () => {
    it('should generate volume filter for single keyframe', () => {
      const keyframes: [[number, number]] = [[0.5, 0]];
      const filter = volumeProcessor.generateVolumeFilter(keyframes);

      expect(filter).toBe('volume=0.5');
    });

    it('should generate linear interpolation for two keyframes', () => {
      const keyframes: [[number, number], [number, number]] = [
        [0, 0],
        [1, 10],
      ];
      const filter = volumeProcessor.generateVolumeFilter(keyframes);

      expect(filter).toContain('volume=enable=');
      expect(filter).toContain('between(t,0,10)');
      expect(filter).toContain('0.1 * (t - 0)'); // slope calculation
    });

    it('should handle multiple keyframes with piecewise interpolation', () => {
      const keyframes: [[number, number], [number, number], [number, number]] = [
        [0, 0],
        [1, 5],
        [0.5, 10],
      ];
      const filter = volumeProcessor.generateVolumeFilter(keyframes);

      expect(filter).toContain('if(lt(t,');
      expect(filter).toBeDefined();
    });

    it('should simplify constant volume', () => {
      const keyframes: [[number, number], [number, number]] = [
        [0.8, 0],
        [0.8, 10],
      ];
      const filter = volumeProcessor.simplifyVolumeFilter(keyframes);

      expect(filter).toBe('volume=0.8');
    });
  });

  describe('FFmpeg Filter Builder', () => {
    it('should build basic filter complex', () => {
      const sueProject: SueProjectDto = {
        id: 'test',
        name: 'Test',
        version: 2,
        filesMeta: [],
        tracks: [
          {
            controllerName: 'video',
            fileId: 'file-1',
            id: 'track-1',
            name: 'Video',
            url: '/test.mp4',
            actions: [
              {
                name: 'clip-1',
                start: 0,
                end: 10,
                trimStart: 2,
                z: 0,
                fit: FitMode.CONTAIN,
              },
            ],
          },
        ],
        backgroundColor: '#FF0000',
        width: 1920,
        height: 1080,
        frameRate: 30,
      };

      const manifest = sueParser.parseProject(sueProject);
      const filterComplex = filterBuilder.buildFilterComplex(manifest);

      expect(filterComplex.inputs.length).toBeGreaterThan(0);
      expect(filterComplex.filterGraph).toContain('color=');
      expect(filterComplex.filterGraph).toContain('overlay=');
      expect(filterComplex.outputMaps).toContain('[vout]');
      expect(filterComplex.complexity).toBeGreaterThan(0);
    });

    it('should handle multiple video layers with z-ordering', () => {
      const sueProject: SueProjectDto = {
        id: 'test',
        name: 'Test',
        version: 2,
        filesMeta: [],
        tracks: [
          {
            controllerName: 'video',
            fileId: 'file-1',
            id: 'track-1',
            name: 'Background',
            url: '/bg.mp4',
            actions: [
              {
                name: 'bg',
                start: 0,
                end: 20,
                trimStart: 0,
                z: 0,
                fit: FitMode.FILL,
              },
            ],
          },
          {
            controllerName: 'video',
            fileId: 'file-2',
            id: 'track-2',
            name: 'Foreground',
            url: '/fg.mp4',
            actions: [
              {
                name: 'fg',
                start: 5,
                end: 15,
                trimStart: 0,
                z: 1,
                fit: FitMode.CONTAIN,
              },
            ],
          },
        ],
        backgroundColor: 'transparent',
        width: 1920,
        height: 1080,
      };

      const manifest = sueParser.parseProject(sueProject);
      const filterComplex = filterBuilder.buildFilterComplex(manifest);

      // Should have 2 inputs
      expect(filterComplex.inputs.length).toBe(4); // 2 files × 2 args (-i path)

      // Should have overlay operations
      expect(filterComplex.filterGraph).toContain('overlay=');
      expect(filterComplex.filterGraph).toContain('enable=');
    });

    it('should handle audio tracks with volume keyframes', () => {
      const sueProject: SueProjectDto = {
        id: 'test',
        name: 'Test',
        version: 2,
        filesMeta: [],
        tracks: [
          {
            controllerName: 'video',
            fileId: 'file-1',
            id: 'track-1',
            name: 'Video',
            url: '/video.mp4',
            actions: [
              {
                name: 'clip',
                start: 0,
                end: 10,
                trimStart: 0,
                z: 0,
              },
            ],
          },
          {
            controllerName: 'audio',
            fileId: 'file-2',
            id: 'track-2',
            name: 'Audio',
            url: '/audio.mp3',
            actions: [
              {
                name: 'audio',
                start: 0,
                end: 10,
                trimStart: 0,
                volume: [[0, 0], [1, 5], [0, 10]],
                z: 0,
              },
            ],
          },
        ],
        backgroundColor: 'black',
        width: 1920,
        height: 1080,
      };

      const manifest = sueParser.parseProject(sueProject);
      const filterComplex = filterBuilder.buildFilterComplex(manifest);

      expect(filterComplex.filterGraph).toContain('atrim=');
      expect(filterComplex.filterGraph).toContain('volume=');
      expect(filterComplex.outputMaps).toContain('[aout]');
    });
  });

  describe('FFmpeg Command Generation', () => {
    it('should generate valid FFmpeg arguments', () => {
      const sueProject: SueProjectDto = {
        id: 'test',
        name: 'Test',
        version: 2,
        filesMeta: [],
        tracks: [
          {
            controllerName: 'video',
            fileId: 'file-1',
            id: 'track-1',
            name: 'Video',
            url: '/test.mp4',
            actions: [
              {
                name: 'clip',
                start: 0,
                end: 5,
                trimStart: 0,
                z: 0,
              },
            ],
          },
        ],
        backgroundColor: 'black',
        width: 1280,
        height: 720,
        frameRate: 30,
      };

      const manifest = sueParser.parseProject(sueProject);
      const filterComplex = filterBuilder.buildFilterComplex(manifest);
      const args = filterBuilder.buildFFmpegArgs(
        filterComplex,
        '/tmp/output.mp4',
        'HIGH',
      );

      expect(args).toContain('-i');
      expect(args).toContain('-filter_complex');
      expect(args).toContain('-c:v');
      expect(args).toContain('libx264');
      expect(args).toContain('-crf');
      expect(args).toContain('-y');
      expect(args).toContain('/tmp/output.mp4');
    });

    it('should use correct quality presets', () => {
      const manifest = {
        output: { width: 1920, height: 1080, frameRate: 30, duration: 10, backgroundColor: 'black' },
        items: [],
        mediaFiles: new Map(),
        hasAudio: false,
        hasVideo: false,
      };

      const filterComplex = filterBuilder.buildFilterComplex(manifest);

      const ultraArgs = filterBuilder.buildFFmpegArgs(filterComplex, '/tmp/out.mp4', 'ULTRA');
      const lowArgs = filterBuilder.buildFFmpegArgs(filterComplex, '/tmp/out.mp4', 'LOW');

      expect(ultraArgs).toContain('15'); // CRF 15 for ULTRA
      expect(ultraArgs).toContain('slow'); // slow preset for ULTRA

      expect(lowArgs).toContain('28'); // CRF 28 for LOW
      expect(lowArgs).toContain('veryfast'); // veryfast preset for LOW
    });
  });
});
