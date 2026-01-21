import { ModelDefinition, Prop, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document, Types } from "mongoose";
import { DefaultSchemaOptions } from "../decorators/defaultSchemaOptions";
import { StdSchema } from "../decorators/stdschema.decorator";
import { File } from "./file.model";
import { BaseModelSchema } from "./base.model";
import type { EmbedVisibilityType } from "../interfaces/embed-visibility";

// Interface for playback issue reports
export interface PlaybackIssue {
  reportedBy: string;
  issueType: string;
  errorInfo: string;
  userAgent: string;
  timestamp: Date;
}

// Interface for data source metadata on Media documents
export interface MediaDataSourceMetadata {
  sourceId: Types.ObjectId;
  sourceType: string;
  externalId: string;
  lastSyncedAt: Date;
}

@StdSchema(DefaultSchemaOptions)
export class Media extends File {
  @Prop({ type: String })
  thumbnail?: string;

  @Prop({ type: String }) thumb: string;

  @Prop([String]) thumbs?: string[];

  @Prop({ type: String })
  paidThumbnail?: string;

  @Prop([Object]) scenes?: object[];

  @Prop([String]) sceneTimeCodes: string[];

  @Prop({ type: Number }) duration: number;

  @Prop({ type: String })
  mediaType: string;

  @Prop({ type: String })
  location: string;

  // Track playback issues reported by users
  @Prop({ type: Array, default: [] })
  playbackIssues?: PlaybackIssue[];

  // Flag to indicate if this media has known playback issues
  @Prop({ type: Boolean, default: false })
  hasPlaybackIssues?: boolean;

  @Prop({ type: String })
  posterTransform?: string;

  @Prop({ type: Number })
  width?: number;

  @Prop({ type: Number })
  height?: number;

  /**
   * Embed visibility controls whether this media can be shown through embed endpoints.
   * - 'public': Can be embedded on any allowed domain without authentication
   * - 'authenticated': Can be embedded only with authenticated embed tokens
   * - 'private': Never appears in embed endpoints (default)
   *
   * This is independent from the general `publicity` field.
   */
  @Prop({ type: String, enum: ['public', 'authenticated', 'private'], default: 'private', index: true })
  embedVisibility?: EmbedVisibilityType;

  /**
   * Data source metadata for media imported from external platforms
   * (Google Photos, Microsoft OneDrive, Amazon Photos, etc.)
   */
  @Prop({ type: Object })
  dataSource?: MediaDataSourceMetadata;

}

export type MediaDocument = Media & Document & {
  createdAt: Date;
  updatedAt: Date;
};

export const MediaSchema = SchemaFactory.createForClass(Media);

// Copy methods from BaseModelSchema to MediaSchema
MediaSchema.methods = BaseModelSchema.methods;

// =============================================================================
// Search Optimization Indexes
// =============================================================================

// Text index for full-text search on title, description, and tags
MediaSchema.index(
  { title: "text", description: "text", tags: "text" },
  {
    weights: { title: 10, tags: 5, description: 1 },
    name: 'media_text_search',
    background: true,
  }
);

// Compound index for views-based sorting (common query: $views > N sorted by date)
MediaSchema.index(
  { views: -1, createdAt: -1 },
  { name: 'media_views_date', background: true }
);

// Compound index for author + date (user mentions with chronological order)
MediaSchema.index(
  { author: 1, createdAt: -1 },
  { name: 'media_author_date', background: true }
);

// Compound index for media type filtering with date sort
MediaSchema.index(
  { mediaType: 1, createdAt: -1 },
  { name: 'media_type_date', background: true }
);

// Compound index for price-based queries (free vs paid content)
MediaSchema.index(
  { price: 1, createdAt: -1 },
  { name: 'media_price_date', background: true }
);

// Compound index for publicity + date (public content listing)
MediaSchema.index(
  { publicity: 1, createdAt: -1 },
  { name: 'media_publicity_date', background: true }
);

// Compound index for score-based ranking
MediaSchema.index(
  { score: -1, createdAt: -1 },
  { name: 'media_score_date', background: true }
);

// Duration filtering (video length queries)
MediaSchema.index(
  { duration: 1 },
  { name: 'media_duration', background: true, sparse: true }
);

export const MediaFeature: ModelDefinition = {
  name: Media.name,
  schema: MediaSchema,
};
