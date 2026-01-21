import { ModelDefinition, Prop, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { StdSchema } from "../decorators/stdschema.decorator";
import { BaseModel } from "./base.model";

export type FileDocument = HydratedDocument<File>;

@StdSchema()
export class File extends BaseModel {
  @Prop({ type: String })
  title: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "UserRef" })
  author: mongoose.Types.ObjectId;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: "UserRef" }] })
  owners: mongoose.Types.ObjectId[];

  @Prop({ type: String })
  file: string;

  @Prop({ type: String })
  url?: string;

  @Prop([String])
  tags: string[];

  @Prop([{ default: [], type: mongoose.Schema.Types.ObjectId, ref: "UserRef" }])
  starring: mongoose.Types.ObjectId[];

  @Prop({ type: Number })
  price?: number;

  @Prop({ type: String })
  originalName?: string;

  @Prop({ type: String })
  hash: string;

  @Prop({ type: Number })
  size: number;

  @Prop({ type: String })
  mime: string;

  @Prop({ type: String, enum: ['ga', 'nc17'], default: 'nc17' })
  rating?: string;

  // Multi-bucket storage support (optional, defaults to env var if not set)
  @Prop({ type: String, required: false, index: true })
  bucket?: string;

  @Prop({ type: String, required: false })
  region?: string;
}

export const FileSchema = SchemaFactory.createForClass(File);

export const FileFeature: ModelDefinition = {
  name: File.name,
  schema: FileSchema,
};
