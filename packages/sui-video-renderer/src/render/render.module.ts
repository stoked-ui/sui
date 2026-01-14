import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RenderController } from './render.controller';
import {
  RenderOrchestratorService,
  FrameComposerService,
  VideoEncoderService,
  SueParserService,
  FFmpegFilterBuilderService,
  FFmpegRendererService,
  VolumeKeyframeProcessorService,
  TimelineEvaluatorService,
  ChromiumRendererService,
  FFmpegEncoderService,
  FrameStreamPipelineService,
} from './services';
import { RenderJob, RenderJobSchema } from './schemas/render-job.schema';
import { VideoProject, VideoProjectSchema } from './schemas/video-project.schema';
import { QueueModule } from '../queue/queue.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RenderJob.name, schema: RenderJobSchema },
      { name: VideoProject.name, schema: VideoProjectSchema },
    ]),
    QueueModule,
    StorageModule,
  ],
  controllers: [RenderController],
  providers: [
    RenderOrchestratorService,
    FrameComposerService,
    VideoEncoderService,
    SueParserService,
    FFmpegFilterBuilderService,
    FFmpegRendererService,
    VolumeKeyframeProcessorService,
    TimelineEvaluatorService,
    ChromiumRendererService,
    FFmpegEncoderService,
    FrameStreamPipelineService,
  ],
  exports: [
    RenderOrchestratorService,
    FrameComposerService,
    VideoEncoderService,
    SueParserService,
    FFmpegFilterBuilderService,
    FFmpegRendererService,
    VolumeKeyframeProcessorService,
    TimelineEvaluatorService,
    ChromiumRendererService,
    FFmpegEncoderService,
    FrameStreamPipelineService,
  ],
})
export class RenderModule {}
