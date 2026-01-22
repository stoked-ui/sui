import { ModelDefinition, Prop, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { DefaultSchemaOptions } from "../decorators/defaultSchemaOptions";
import { StdSchema } from "../decorators/stdschema.decorator";
import { File } from "./file.model";
import { PlaybackIssue } from "./media.model";

@StdSchema(DefaultSchemaOptions)
export class Video extends File {
  @Prop({ type: String, default: "video" })
  type: string;

  @Prop({ type: String })
  thumbnail?: string;

  @Prop({ type: String })
  thumb: string;

  @Prop([String])
  thumbs?: string[];

  @Prop({ type: String })
  paidThumbnail?: string;

  @Prop({ type: String })
  paidPreview?: string;

  @Prop({ type: Number })
  screenshotStartTime?: number;

  @Prop({ type: Number })
  width?: number;

  @Prop({ type: Number })
  height?: number;

  @Prop({ type: Number })
  aspectRatio?: number;

  @Prop([Object])
  scenes?: object[];

  @Prop([String])
  sceneTimeCodes: string[];

  @Prop({ type: Number })
  duration: number;

  @Prop({ type: String })
  codec?: string;

  @Prop({ type: String, enum: ['mp4', 'mov', 'webm', 'mkv'] })
  container?: string;

  @Prop({ type: String, enum: ['start', 'end'] })
  moovAtomPosition?: string;

  @Prop({ type: Number })
  bitrate?: number;

  @Prop({ type: Boolean, default: false })
  thumbnailGenerationFailed: boolean;

  // Comprehensive metadata processing failure tracking
  @Prop({
    type: [
      {
        task: {
          type: String,
          enum: [
            'video-thumbnail',
            'video-duration',
            'video-codec-metadata',
            'video-sprites',
            'dimensions',
            'paid-thumbnail',
            'heic-conversion',
          ],
        },
        error: String,
        timestamp: { type: Date, default: Date.now },
        attemptCount: { type: Number, default: 1 },
      },
    ],
    default: [],
  })
  metadataProcessingFailures?: Array<{
    task: string;
    error: string;
    timestamp: Date;
    attemptCount: number;
  }>;

  // Track playback issues reported by users
  @Prop({ type: Array, default: [] })
  playbackIssues?: PlaybackIssue[];

  // Flag to indicate if this video has known playback issues
  @Prop({ type: Boolean, default: false })
  hasPlaybackIssues?: boolean;

  @Prop({ type: String })
  posterTransform?: string;

  /**
   * Reference to MediaClass applied to this video
   * When set, player will render before/after idents and video bug
   */
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "MediaClass" })
  mediaClass?: mongoose.Types.ObjectId;

  // ─────────────────────────────────────────────────────────────────────────────
  // Scrubber sprite for hover preview
  // ─────────────────────────────────────────────────────────────────────────────

  /** S3 key for the scrubber sprite image */
  @Prop({ type: String })
  scrubberSprite?: string;

  /** Configuration for parsing the sprite sheet */
  @Prop({
    type: {
      columns: Number,
      rows: Number,
      frameWidth: Number,
      frameHeight: Number,
      interval: Number,
      frameCount: Number,
    },
  })
  scrubberSpriteConfig?: {
    columns: number;
    rows: number;
    frameWidth: number;
    frameHeight: number;
    interval: number;
    frameCount: number;
  };

  /** Whether scrubber sprite has been successfully generated */
  @Prop({ type: Boolean, default: false })
  scrubberGenerated?: boolean;

  /** Whether scrubber sprite generation failed (prevents retry loops) */
  @Prop({ type: Boolean, default: false })
  scrubberGenerationFailed?: boolean;

  // ─────────────────────────────────────────────────────────────────────────────
  // Stream Recording Metadata
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Recording Metadata
   * Links video to its source live stream recording session
   */
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'StreamRecording' })
  recordingSessionId?: mongoose.Types.ObjectId;

  /** Flag to identify videos created from streams */
  @Prop({ type: Boolean, default: false })
  isStreamRecording?: boolean;

  /** Original stream date (may differ from video upload date) */
  @Prop({ type: Date })
  streamRecordedAt?: Date;

  /** Peak concurrent viewers during live stream */
  @Prop({ type: Number })
  streamPeakViewers?: number;

  /** Aggregate watch time during live stream */
  @Prop({ type: Number })
  streamTotalViewMinutes?: number;

  /** Featured users (co-stars) in this video/stream recording */
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], default: [] })
  featuredUsers?: mongoose.Types.ObjectId[];
}

export const VideoSchema = SchemaFactory.createForClass(Video);

VideoSchema.virtual("mediaType").get(function () {
  return "video";
});

export const VideoFeature: ModelDefinition = {
  name: Video.name,
  schema: VideoSchema,
};
