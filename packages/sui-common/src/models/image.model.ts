import { ModelDefinition, Prop, SchemaFactory } from "@nestjs/mongoose";
import { DefaultSchemaOptions } from "../decorators/defaultSchemaOptions";
import { StdSchema } from "../decorators/stdschema.decorator";
import { File } from "./file.model";

@StdSchema(DefaultSchemaOptions)
export class Image extends File {
  @Prop([Boolean])
  avatar: boolean;

  @Prop([Boolean])
  cover: boolean;

  @Prop({ type: String, default: "image" })
  type: string;

  @Prop({ type: String })
  paidThumbnail?: string;

  @Prop({ type: Number })
  width?: number;

  @Prop({ type: Number })
  height?: number;

  @Prop({ type: Number })
  aspectRatio?: number;

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
}

export const ImageSchema = SchemaFactory.createForClass(Image);

ImageSchema.virtual("mediaType").get(function () {
  return "image";
});

ImageSchema.methods.dislike = function (cb: () => void, userId: string) {
  const dislikeSet = new Set(this.dislikes);
  dislikeSet.add(userId);
  this.dislikes = Array.from(userId);
  this.markModified("dislikes");
  this.save(cb);
};

ImageSchema.methods.like = function (cb: () => void, userId: string) {
  const likeSet = new Set(this.likes);
  likeSet.add(userId);
  this.dislikes = Array.from(userId);
  this.markModified("likeSet");
  this.save(cb);
};

export const ImageFeature: ModelDefinition = {
  name: Image.name,
  schema: ImageSchema,
};
