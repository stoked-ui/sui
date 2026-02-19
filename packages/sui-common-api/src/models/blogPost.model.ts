import { ModelDefinition, Prop, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { DefaultSchemaOptions } from "../decorators/defaultSchemaOptions";
import { StdSchema } from "../decorators/stdschema.decorator";
import { File } from "./file.model";
import { BaseModelSchema } from "./base.model";

export type BlogPostDocument = HydratedDocument<BlogPost>;

export type BlogPostStatus = 'draft' | 'published' | 'archived';
export type BlogPostSource = 'native' | 'nostr' | 'import';

@StdSchema(DefaultSchemaOptions)
export class BlogPost extends File {
  @Prop({ type: String, required: true, unique: true, index: true })
  slug: string;

  @Prop({ type: String, required: true })
  body: string;

  @Prop({
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
    index: true,
  })
  status: BlogPostStatus;

  @Prop({ type: [String], default: ['stoked-ui.com'] })
  targetSites: string[];

  @Prop({ type: String, required: false, sparse: true })
  nostrEventId?: string;

  @Prop({
    type: String,
    enum: ['native', 'nostr', 'import'],
    default: 'native',
  })
  source: BlogPostSource;

  @Prop({ type: Date, required: true })
  date: Date;

  @Prop({ type: String, required: false })
  image?: string;

  @Prop({ type: [String], required: true })
  authors: string[];
}

export const BlogPostSchema = SchemaFactory.createForClass(BlogPost);

// Copy methods from BaseModelSchema to BlogPostSchema
BlogPostSchema.methods = BaseModelSchema.methods;

// =============================================================================
// Search Optimization Indexes
// =============================================================================

// Text index for full-text search on title, description, and tags
BlogPostSchema.index(
  { title: 'text', description: 'text', tags: 'text' },
  {
    weights: { title: 10, tags: 5, description: 1 },
    name: 'blogpost_text_search',
    background: true,
  },
);

// Compound index for status + date (listing posts by status chronologically)
BlogPostSchema.index(
  { status: 1, date: -1 },
  { name: 'blogpost_status_date', background: true },
);

// Compound index for targetSites + status + date (site-specific post listing)
BlogPostSchema.index(
  { targetSites: 1, status: 1, date: -1 },
  { name: 'blogpost_targetsites_status_date', background: true },
);

// Unique index on slug
BlogPostSchema.index(
  { slug: 1 },
  { unique: true, name: 'blogpost_slug_unique', background: true },
);

// Sparse index on nostrEventId (only indexes documents where field exists)
BlogPostSchema.index(
  { nostrEventId: 1 },
  { sparse: true, name: 'blogpost_nostr_event_id', background: true },
);

export const BlogPostFeature: ModelDefinition = {
  name: BlogPost.name,
  schema: BlogPostSchema,
};
