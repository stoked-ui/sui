import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { RenderStatus, RenderQuality } from '../dto/video-project.dto';

export type RenderJobDocument = RenderJob & Document;

@Schema({ timestamps: true, collection: 'render_jobs' })
export class RenderJob {
  @Prop({ required: true, unique: true, index: true })
  jobId: string;

  @Prop({ required: true, index: true })
  projectId: string;

  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, enum: Object.values(RenderStatus), default: RenderStatus.PENDING, index: true })
  status: RenderStatus;

  @Prop({ default: 0, min: 0, max: 100 })
  progress: number;

  @Prop()
  currentPhase?: string;

  @Prop({ default: 5, min: 1, max: 10 })
  priority: number;

  @Prop()
  totalFrames?: number;

  @Prop({ default: 0 })
  processedFrames?: number;

  @Prop()
  estimatedTimeRemaining?: number;

  @Prop()
  outputUrl?: string;

  @Prop()
  outputPath?: string;

  @Prop()
  error?: string;

  @Prop({ default: 0 })
  retryCount?: number;

  @Prop({ required: true, enum: Object.values(RenderQuality) })
  quality: RenderQuality;

  @Prop({ required: true })
  width: number;

  @Prop({ required: true })
  height: number;

  @Prop({ required: true })
  frameRate: number;

  @Prop()
  callbackUrl?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop()
  startedAt?: Date;

  @Prop()
  completedAt?: Date;

  // Mongoose timestamps (auto-generated when timestamps: true)
  createdAt?: Date;
  updatedAt?: Date;
}

export const RenderJobSchema = SchemaFactory.createForClass(RenderJob);

// Add indexes for efficient querying
RenderJobSchema.index({ status: 1, priority: -1, createdAt: 1 });
RenderJobSchema.index({ userId: 1, createdAt: -1 });
RenderJobSchema.index({ projectId: 1 });
