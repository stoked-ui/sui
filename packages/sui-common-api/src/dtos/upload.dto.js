"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActiveUploadsResponseDto = exports.ActiveUploadDto = exports.CompleteUploadResponseDto = exports.PartCompletionResponseDto = exports.UploadStatusResponseDto = exports.InitiateUploadResponseDto = exports.PresignedUrlDto = exports.PartCompletionDto = exports.GetMoreUrlsDto = exports.InitiateUploadDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class InitiateUploadDto {
}
exports.InitiateUploadDto = InitiateUploadDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Original filename of the file being uploaded",
        example: "my-video.mp4",
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], InitiateUploadDto.prototype, "filename", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "MIME type of the file",
        example: "video/mp4",
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Matches)(/^(video|image)\/[a-z0-9.+-]+$/, {
        message: "mimeType must be a valid video or image MIME type",
    }),
    __metadata("design:type", String)
], InitiateUploadDto.prototype, "mimeType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Total file size in bytes",
        example: 104857600,
        minimum: 1,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], InitiateUploadDto.prototype, "totalSize", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "SHA-256 hash of the file content for deduplication (base64 encoded)",
        example: "Uonfc331cyb83SJZevsfrA==",
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], InitiateUploadDto.prototype, "hash", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "Chunk size in bytes (default: 10MB, min: 5MB, max: 100MB)",
        example: 10485760,
        minimum: 5242880,
        maximum: 104857600,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(5 * 1024 * 1024),
    (0, class_validator_1.Max)(100 * 1024 * 1024),
    __metadata("design:type", Number)
], InitiateUploadDto.prototype, "chunkSize", void 0);
class GetMoreUrlsDto {
}
exports.GetMoreUrlsDto = GetMoreUrlsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Array of part numbers to get presigned URLs for (1-based)",
        example: [5, 6, 7, 8, 9, 10],
        type: [Number],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNumber)({}, { each: true }),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ArrayMaxSize)(50),
    __metadata("design:type", Array)
], GetMoreUrlsDto.prototype, "partNumbers", void 0);
class PartCompletionDto {
}
exports.PartCompletionDto = PartCompletionDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "ETag returned by S3 after uploading the part",
        example: '"d41d8cd98f00b204e9800998ecf8427e"',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PartCompletionDto.prototype, "etag", void 0);
class PresignedUrlDto {
}
exports.PresignedUrlDto = PresignedUrlDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Part number (1-based)",
        example: 1,
    }),
    __metadata("design:type", Number)
], PresignedUrlDto.prototype, "partNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Presigned PUT URL for uploading the part directly to S3",
        example: "https://bucket.s3.amazonaws.com/key?X-Amz-...",
    }),
    __metadata("design:type", String)
], PresignedUrlDto.prototype, "url", void 0);
class InitiateUploadResponseDto {
}
exports.InitiateUploadResponseDto = InitiateUploadResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Upload session ID (use this for all subsequent operations)",
        example: "507f1f77bcf86cd799439011",
    }),
    __metadata("design:type", String)
], InitiateUploadResponseDto.prototype, "sessionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "S3 multipart upload ID",
        example: "2~...",
    }),
    __metadata("design:type", String)
], InitiateUploadResponseDto.prototype, "uploadId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Presigned URLs for the first batch of parts",
        type: [PresignedUrlDto],
    }),
    __metadata("design:type", Array)
], InitiateUploadResponseDto.prototype, "presignedUrls", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Total number of parts to upload",
        example: 10,
    }),
    __metadata("design:type", Number)
], InitiateUploadResponseDto.prototype, "totalParts", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Chunk size in bytes",
        example: 10485760,
    }),
    __metadata("design:type", Number)
], InitiateUploadResponseDto.prototype, "chunkSize", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "When the upload session expires",
        example: "2024-01-15T00:00:00.000Z",
    }),
    __metadata("design:type", Date)
], InitiateUploadResponseDto.prototype, "expiresAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "If set, a duplicate file was found and no upload is needed",
    }),
    __metadata("design:type", Object)
], InitiateUploadResponseDto.prototype, "existingMedia", void 0);
class UploadStatusResponseDto {
}
exports.UploadStatusResponseDto = UploadStatusResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Upload session ID",
        example: "507f1f77bcf86cd799439011",
    }),
    __metadata("design:type", String)
], UploadStatusResponseDto.prototype, "sessionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Current status of the upload",
        enum: ["pending", "in_progress", "completed", "aborted", "expired"],
        example: "in_progress",
    }),
    __metadata("design:type", String)
], UploadStatusResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Original filename",
        example: "my-video.mp4",
    }),
    __metadata("design:type", String)
], UploadStatusResponseDto.prototype, "filename", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Total file size in bytes",
        example: 104857600,
    }),
    __metadata("design:type", Number)
], UploadStatusResponseDto.prototype, "totalSize", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Total number of parts",
        example: 10,
    }),
    __metadata("design:type", Number)
], UploadStatusResponseDto.prototype, "totalParts", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Number of completed parts",
        example: 5,
    }),
    __metadata("design:type", Number)
], UploadStatusResponseDto.prototype, "completedParts", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Upload progress percentage (0-100)",
        example: 50,
    }),
    __metadata("design:type", Number)
], UploadStatusResponseDto.prototype, "progress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Part numbers that still need to be uploaded",
        type: [Number],
        example: [6, 7, 8, 9, 10],
    }),
    __metadata("design:type", Array)
], UploadStatusResponseDto.prototype, "pendingPartNumbers", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "Fresh presigned URLs for pending parts (up to 50)",
        type: [PresignedUrlDto],
    }),
    __metadata("design:type", Array)
], UploadStatusResponseDto.prototype, "presignedUrls", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "When the upload session expires",
        example: "2024-01-15T00:00:00.000Z",
    }),
    __metadata("design:type", Date)
], UploadStatusResponseDto.prototype, "expiresAt", void 0);
class PartCompletionResponseDto {
}
exports.PartCompletionResponseDto = PartCompletionResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Number of completed parts",
        example: 5,
    }),
    __metadata("design:type", Number)
], PartCompletionResponseDto.prototype, "completedParts", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Total number of parts",
        example: 10,
    }),
    __metadata("design:type", Number)
], PartCompletionResponseDto.prototype, "totalParts", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Upload progress percentage (0-100)",
        example: 50,
    }),
    __metadata("design:type", Number)
], PartCompletionResponseDto.prototype, "progress", void 0);
class CompleteUploadResponseDto {
}
exports.CompleteUploadResponseDto = CompleteUploadResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "ID of the created media document",
        example: "507f1f77bcf86cd799439011",
    }),
    __metadata("design:type", String)
], CompleteUploadResponseDto.prototype, "mediaId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Type of media created",
        enum: ["video", "image"],
        example: "video",
    }),
    __metadata("design:type", String)
], CompleteUploadResponseDto.prototype, "mediaType", void 0);
class ActiveUploadDto {
}
exports.ActiveUploadDto = ActiveUploadDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Upload session ID",
        example: "507f1f77bcf86cd799439011",
    }),
    __metadata("design:type", String)
], ActiveUploadDto.prototype, "sessionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Original filename",
        example: "my-video.mp4",
    }),
    __metadata("design:type", String)
], ActiveUploadDto.prototype, "filename", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Total file size in bytes",
        example: 104857600,
    }),
    __metadata("design:type", Number)
], ActiveUploadDto.prototype, "totalSize", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Upload progress percentage (0-100)",
        example: 50,
    }),
    __metadata("design:type", Number)
], ActiveUploadDto.prototype, "progress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "When the upload was started",
        example: "2024-01-08T00:00:00.000Z",
    }),
    __metadata("design:type", Date)
], ActiveUploadDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "When the upload session expires",
        example: "2024-01-15T00:00:00.000Z",
    }),
    __metadata("design:type", Date)
], ActiveUploadDto.prototype, "expiresAt", void 0);
class ActiveUploadsResponseDto {
}
exports.ActiveUploadsResponseDto = ActiveUploadsResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "List of active uploads that can be resumed",
        type: [ActiveUploadDto],
    }),
    __metadata("design:type", Array)
], ActiveUploadsResponseDto.prototype, "uploads", void 0);
//# sourceMappingURL=upload.dto.js.map