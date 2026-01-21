import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  Min,
  Max,
  IsNotEmpty,
  Matches,
  ArrayMinSize,
  ArrayMaxSize,
} from "class-validator";

// ─────────────────────────────────────────────────────────────────────────────
// Request DTOs
// ─────────────────────────────────────────────────────────────────────────────

export class InitiateUploadDto {
  @ApiProperty({
    description: "Original filename of the file being uploaded",
    example: "my-video.mp4",
  })
  @IsString()
  @IsNotEmpty()
  filename: string;

  @ApiProperty({
    description: "MIME type of the file",
    example: "video/mp4",
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^(video|image)\/[a-z0-9.+-]+$/, {
    message: "mimeType must be a valid video or image MIME type",
  })
  mimeType: string;

  @ApiProperty({
    description: "Total file size in bytes",
    example: 104857600,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  totalSize: number;

  @ApiPropertyOptional({
    description:
      "SHA-256 hash of the file content for deduplication (base64 encoded)",
    example: "Uonfc331cyb83SJZevsfrA==",
  })
  @IsString()
  @IsOptional()
  hash?: string;

  @ApiPropertyOptional({
    description: "Chunk size in bytes (default: 10MB, min: 5MB, max: 100MB)",
    example: 10485760,
    minimum: 5242880,
    maximum: 104857600,
  })
  @IsNumber()
  @IsOptional()
  @Min(5 * 1024 * 1024) // 5 MB minimum (S3 requirement)
  @Max(100 * 1024 * 1024) // 100 MB maximum
  chunkSize?: number;
}

export class GetMoreUrlsDto {
  @ApiProperty({
    description: "Array of part numbers to get presigned URLs for (1-based)",
    example: [5, 6, 7, 8, 9, 10],
    type: [Number],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  partNumbers: number[];
}

export class PartCompletionDto {
  @ApiProperty({
    description: "ETag returned by S3 after uploading the part",
    example: '"d41d8cd98f00b204e9800998ecf8427e"',
  })
  @IsString()
  @IsNotEmpty()
  etag: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Response DTOs
// ─────────────────────────────────────────────────────────────────────────────

export class PresignedUrlDto {
  @ApiProperty({
    description: "Part number (1-based)",
    example: 1,
  })
  partNumber: number;

  @ApiProperty({
    description: "Presigned PUT URL for uploading the part directly to S3",
    example: "https://bucket.s3.amazonaws.com/key?X-Amz-...",
  })
  url: string;
}

export class InitiateUploadResponseDto {
  @ApiProperty({
    description: "Upload session ID (use this for all subsequent operations)",
    example: "507f1f77bcf86cd799439011",
  })
  sessionId: string;

  @ApiProperty({
    description: "S3 multipart upload ID",
    example: "2~...",
  })
  uploadId: string;

  @ApiProperty({
    description: "Presigned URLs for the first batch of parts",
    type: [PresignedUrlDto],
  })
  presignedUrls: PresignedUrlDto[];

  @ApiProperty({
    description: "Total number of parts to upload",
    example: 10,
  })
  totalParts: number;

  @ApiProperty({
    description: "Chunk size in bytes",
    example: 10485760,
  })
  chunkSize: number;

  @ApiProperty({
    description: "When the upload session expires",
    example: "2024-01-15T00:00:00.000Z",
  })
  expiresAt: Date;

  @ApiPropertyOptional({
    description: "If set, a duplicate file was found and no upload is needed",
  })
  existingMedia?: {
    type: "video" | "image";
    id: string;
  };
}

export class UploadStatusResponseDto {
  @ApiProperty({
    description: "Upload session ID",
    example: "507f1f77bcf86cd799439011",
  })
  sessionId: string;

  @ApiProperty({
    description: "Current status of the upload",
    enum: ["pending", "in_progress", "completed", "aborted", "expired"],
    example: "in_progress",
  })
  status: string;

  @ApiProperty({
    description: "Original filename",
    example: "my-video.mp4",
  })
  filename: string;

  @ApiProperty({
    description: "Total file size in bytes",
    example: 104857600,
  })
  totalSize: number;

  @ApiProperty({
    description: "Total number of parts",
    example: 10,
  })
  totalParts: number;

  @ApiProperty({
    description: "Number of completed parts",
    example: 5,
  })
  completedParts: number;

  @ApiProperty({
    description: "Upload progress percentage (0-100)",
    example: 50,
  })
  progress: number;

  @ApiProperty({
    description: "Part numbers that still need to be uploaded",
    type: [Number],
    example: [6, 7, 8, 9, 10],
  })
  pendingPartNumbers: number[];

  @ApiPropertyOptional({
    description: "Fresh presigned URLs for pending parts (up to 50)",
    type: [PresignedUrlDto],
  })
  presignedUrls?: PresignedUrlDto[];

  @ApiProperty({
    description: "When the upload session expires",
    example: "2024-01-15T00:00:00.000Z",
  })
  expiresAt: Date;
}

export class PartCompletionResponseDto {
  @ApiProperty({
    description: "Number of completed parts",
    example: 5,
  })
  completedParts: number;

  @ApiProperty({
    description: "Total number of parts",
    example: 10,
  })
  totalParts: number;

  @ApiProperty({
    description: "Upload progress percentage (0-100)",
    example: 50,
  })
  progress: number;
}

export class CompleteUploadResponseDto {
  @ApiProperty({
    description: "ID of the created media document",
    example: "507f1f77bcf86cd799439011",
  })
  mediaId: string;

  @ApiProperty({
    description: "Type of media created",
    enum: ["video", "image"],
    example: "video",
  })
  mediaType: "video" | "image";
}

export class ActiveUploadDto {
  @ApiProperty({
    description: "Upload session ID",
    example: "507f1f77bcf86cd799439011",
  })
  sessionId: string;

  @ApiProperty({
    description: "Original filename",
    example: "my-video.mp4",
  })
  filename: string;

  @ApiProperty({
    description: "Total file size in bytes",
    example: 104857600,
  })
  totalSize: number;

  @ApiProperty({
    description: "Upload progress percentage (0-100)",
    example: 50,
  })
  progress: number;

  @ApiProperty({
    description: "When the upload was started",
    example: "2024-01-08T00:00:00.000Z",
  })
  createdAt: Date;

  @ApiProperty({
    description: "When the upload session expires",
    example: "2024-01-15T00:00:00.000Z",
  })
  expiresAt: Date;
}

export class ActiveUploadsResponseDto {
  @ApiProperty({
    description: "List of active uploads that can be resumed",
    type: [ActiveUploadDto],
  })
  uploads: ActiveUploadDto[];
}
