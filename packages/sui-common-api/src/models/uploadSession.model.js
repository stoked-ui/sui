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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadSessionFeature = exports.UploadSessionSchema = exports.UploadSession = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = __importDefault(require("mongoose"));
const defaultSchemaOptions_1 = require("../decorators/defaultSchemaOptions");
const stdschema_decorator_1 = require("../decorators/stdschema.decorator");
let UploadSession = class UploadSession {
};
exports.UploadSession = UploadSession;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.default.Schema.Types.ObjectId, ref: "User", required: true, index: true }),
    __metadata("design:type", mongoose_2.default.Types.ObjectId)
], UploadSession.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true, index: true }),
    __metadata("design:type", String)
], UploadSession.prototype, "uploadId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], UploadSession.prototype, "s3Key", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], UploadSession.prototype, "bucket", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: "us-east-1" }),
    __metadata("design:type", String)
], UploadSession.prototype, "region", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], UploadSession.prototype, "filename", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], UploadSession.prototype, "mimeType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, required: true }),
    __metadata("design:type", Number)
], UploadSession.prototype, "totalSize", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, required: true }),
    __metadata("design:type", Number)
], UploadSession.prototype, "chunkSize", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, required: true }),
    __metadata("design:type", Number)
], UploadSession.prototype, "totalParts", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, index: true }),
    __metadata("design:type", String)
], UploadSession.prototype, "hash", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: ["pending", "in_progress", "completed", "aborted", "expired"],
        default: "pending",
        index: true,
    }),
    __metadata("design:type", String)
], UploadSession.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({
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
    }),
    __metadata("design:type", Array)
], UploadSession.prototype, "parts", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, required: true, index: true }),
    __metadata("design:type", Date)
], UploadSession.prototype, "expiresAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], UploadSession.prototype, "errorMessage", void 0);
exports.UploadSession = UploadSession = __decorate([
    (0, stdschema_decorator_1.StdSchema)(defaultSchemaOptions_1.DefaultSchemaOptions)
], UploadSession);
exports.UploadSessionSchema = mongoose_1.SchemaFactory.createForClass(UploadSession);
exports.UploadSessionSchema.index({ userId: 1, status: 1, expiresAt: 1 });
exports.UploadSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
exports.UploadSessionSchema.index({ hash: 1, status: 1 });
exports.UploadSessionSchema.virtual("progress").get(function () {
    if (this.totalParts === 0)
        return 0;
    const completedParts = this.parts.filter((p) => p.status === "completed").length;
    return Math.round((completedParts / this.totalParts) * 100);
});
exports.UploadSessionSchema.virtual("completedPartsCount").get(function () {
    return this.parts.filter((p) => p.status === "completed").length;
});
exports.UploadSessionSchema.virtual("uploadedBytes").get(function () {
    return this.parts
        .filter((p) => p.status === "completed")
        .reduce((sum, p) => sum + p.size, 0);
});
exports.UploadSessionFeature = {
    name: UploadSession.name,
    schema: exports.UploadSessionSchema,
};
//# sourceMappingURL=uploadSession.model.js.map