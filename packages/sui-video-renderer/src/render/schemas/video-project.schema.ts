import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { RenderQuality } from '../dto/video-project.dto';

export type VideoProjectDocument = VideoProject & Document;

@Schema({ timestamps: true, collection: 'video_projects' })
export class VideoProject {
  @Prop({ required: true, unique: true, index: true })
  projectId: string;

  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  width: number;

  @Prop({ required: true })
  height: number;

  @Prop({ required: true })
  frameRate: number;

  @Prop({ required: true, enum: Object.values(RenderQuality) })
  quality: RenderQuality;

  @Prop({ type: Array, required: true })
  frames: Array<{
    frameNumber: number;
    timestamp: number;
    layers: any[];
    duration?: number;
  }>;

  @Prop({ type: Array })
  audioTracks?: Array<{
    source: string;
    volume: number;
    startTime?: number;
    duration?: number;
  }>;

  @Prop({ default: 'mp4' })
  outputFormat?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const VideoProjectSchema = SchemaFactory.createForClass(VideoProject);

// Add indexes
VideoProjectSchema.index({ userId: 1, createdAt: -1 });
VideoProjectSchema.index({ projectId: 1, userId: 1 });
