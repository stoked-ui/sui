import { ModelDefinition, Prop, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { DefaultSchemaOptions } from "../decorators/defaultSchemaOptions";
import { StdSchema } from "../decorators/stdschema.decorator";

/**
 * Status of a part within a multipart upload
 */
export type UploadPartStatus = "pending" | "uploading" | "completed" | "failed";

/**
 * Status of the overall upload session
 */
export type UploadSessionStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "aborted"
  | "expired";

/**
 * Subdocument representing a single part in a multipart upload
 */
export interface UploadPart {
  /** Part number (1-based, as per S3 requirements) */
  partNumber: number;
  /** ETag returned by S3 after successful upload (required for completion) */
  etag?: string;
  /** Current status of this part */
  status: UploadPartStatus;
  /** Size of this part in bytes */
  size: number;
  /** When this part was successfully uploaded */
  uploadedAt?: Date;
}

/**
 * UploadSession tracks the state of a multipart upload for resume capability.
 *
 * This model enables:
 * - Resumable uploads: Users can continue interrupted uploads
 * - Deduplication: Hash field allows detecting duplicate uploads
 * - Progress tracking: Frontend can display accurate progress
 * - Cleanup: Expired sessions can be cleaned up automatically
 */
@StdSchema(DefaultSchemaOptions)
export class UploadSession {
  /** Virtual id field mapped from _id */
  id: string;

  /** User who initiated the upload */
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true })
  userId: mongoose.Types.ObjectId;

  /** S3 multipart upload ID (returned by CreateMultipartUpload) */
  @Prop({ type: String, required: true, index: true })
  uploadId: string;

  /** S3 object key where the file will be stored */
  @Prop({ type: String, required: true })
  s3Key: string;

  /** Target S3 bucket */
  @Prop({ type: String, required: true })
  bucket: string;

  /** AWS region of the bucket */
  @Prop({ type: String, default: "us-east-1" })
  region: string;

  /** Original filename from the client */
  @Prop({ type: String, required: true })
  filename: string;

  /** MIME type of the file */
  @Prop({ type: String, required: true })
  mimeType: string;

  /** Total file size in bytes */
  @Prop({ type: Number, required: true })
  totalSize: number;

  /** Size of each chunk in bytes (except possibly the last chunk) */
  @Prop({ type: Number, required: true })
  chunkSize: number;

  /** Total number of parts to upload */
  @Prop({ type: Number, required: true })
  totalParts: number;

  /**
   * File content hash for deduplication (e.g., SHA-256)
   * Generated client-side using hash-wasm before upload starts
   */
  @Prop({ type: String, index: true })
  hash?: string;

  /** Current status of the upload session */
  @Prop({
    type: String,
    enum: ["pending", "in_progress", "completed", "aborted", "expired"],
    default: "pending",
    index: true,
  })
  status: UploadSessionStatus;

  /** Array of parts with their upload status */
  @Prop({
    type: [
      {
        partNumber: { type: Number, required: true },
        etag: { type: String },
        status: {
          type: String,
          enum: ["pending", "uploading", "completed", "failed"],
          default: "pending",
        },
        size: { type: Number, required: true },
        uploadedAt: { type: Date },
      },
    ],
    default: [],
  })
  parts: UploadPart[];

  /**
   * When this upload session expires
   * S3 multipart uploads expire after 7 days, so we match that
   */
  @Prop({ type: Date, required: true, index: true })
  expiresAt: Date;

  /** Error message if the upload failed */
  @Prop({ type: String })
  errorMessage?: string;

  /** Timestamps (createdAt, updatedAt) added by DefaultSchemaOptions */
  createdAt?: Date;
  updatedAt?: Date;
}

export type UploadSessionDocument = HydratedDocument<UploadSession>;

export const UploadSessionSchema = SchemaFactory.createForClass(UploadSession);

// Compound index for efficient lookup of user's pending uploads
UploadSessionSchema.index({ userId: 1, status: 1, expiresAt: 1 });

// TTL index for automatic cleanup of expired sessions
// MongoDB will automatically delete documents where expiresAt < now
// Note: This runs every 60 seconds, so there may be slight delays
UploadSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for hash-based deduplication lookup
UploadSessionSchema.index({ hash: 1, status: 1 });

/**
 * Virtual to calculate upload progress percentage
 */
UploadSessionSchema.virtual("progress").get(function () {
  if (this.totalParts === 0) return 0;
  const completedParts = this.parts.filter((p) => p.status === "completed").length;
  return Math.round((completedParts / this.totalParts) * 100);
});

/**
 * Virtual to get count of completed parts
 */
UploadSessionSchema.virtual("completedPartsCount").get(function () {
  return this.parts.filter((p) => p.status === "completed").length;
});

/**
 * Virtual to get total bytes uploaded
 */
UploadSessionSchema.virtual("uploadedBytes").get(function () {
  return this.parts
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.size, 0);
});

export const UploadSessionFeature: ModelDefinition = {
  name: UploadSession.name,
  schema: UploadSessionSchema,
};
