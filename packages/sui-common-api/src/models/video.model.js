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
exports.VideoFeature = exports.VideoSchema = exports.Video = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = __importDefault(require("mongoose"));
const defaultSchemaOptions_1 = require("../decorators/defaultSchemaOptions");
const stdschema_decorator_1 = require("../decorators/stdschema.decorator");
const file_model_1 = require("./file.model");
let Video = class Video extends file_model_1.File {
};
exports.Video = Video;
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: "video" }),
    __metadata("design:type", String)
], Video.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Video.prototype, "thumbnail", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Video.prototype, "thumb", void 0);
__decorate([
    (0, mongoose_1.Prop)([String]),
    __metadata("design:type", Array)
], Video.prototype, "thumbs", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Video.prototype, "paidThumbnail", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Video.prototype, "paidPreview", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number }),
    __metadata("design:type", Number)
], Video.prototype, "screenshotStartTime", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number }),
    __metadata("design:type", Number)
], Video.prototype, "width", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number }),
    __metadata("design:type", Number)
], Video.prototype, "height", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number }),
    __metadata("design:type", Number)
], Video.prototype, "aspectRatio", void 0);
__decorate([
    (0, mongoose_1.Prop)([Object]),
    __metadata("design:type", Array)
], Video.prototype, "scenes", void 0);
__decorate([
    (0, mongoose_1.Prop)([String]),
    __metadata("design:type", Array)
], Video.prototype, "sceneTimeCodes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number }),
    __metadata("design:type", Number)
], Video.prototype, "duration", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Video.prototype, "codec", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: ['mp4', 'mov', 'webm', 'mkv'] }),
    __metadata("design:type", String)
], Video.prototype, "container", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: ['start', 'end'] }),
    __metadata("design:type", String)
], Video.prototype, "moovAtomPosition", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number }),
    __metadata("design:type", Number)
], Video.prototype, "bitrate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], Video.prototype, "thumbnailGenerationFailed", void 0);
__decorate([
    (0, mongoose_1.Prop)({
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
    }),
    __metadata("design:type", Array)
], Video.prototype, "metadataProcessingFailures", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Array, default: [] }),
    __metadata("design:type", Array)
], Video.prototype, "playbackIssues", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], Video.prototype, "hasPlaybackIssues", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Video.prototype, "posterTransform", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.default.Schema.Types.ObjectId, ref: "MediaClass" }),
    __metadata("design:type", mongoose_2.default.Types.ObjectId)
], Video.prototype, "mediaClass", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Video.prototype, "scrubberSprite", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            columns: Number,
            rows: Number,
            frameWidth: Number,
            frameHeight: Number,
            interval: Number,
            frameCount: Number,
        },
    }),
    __metadata("design:type", Object)
], Video.prototype, "scrubberSpriteConfig", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], Video.prototype, "scrubberGenerated", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], Video.prototype, "scrubberGenerationFailed", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.default.Schema.Types.ObjectId, ref: 'StreamRecording' }),
    __metadata("design:type", mongoose_2.default.Types.ObjectId)
], Video.prototype, "recordingSessionId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], Video.prototype, "isStreamRecording", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], Video.prototype, "streamRecordedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number }),
    __metadata("design:type", Number)
], Video.prototype, "streamPeakViewers", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number }),
    __metadata("design:type", Number)
], Video.prototype, "streamTotalViewMinutes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: mongoose_2.default.Schema.Types.ObjectId, ref: 'User' }], default: [] }),
    __metadata("design:type", Array)
], Video.prototype, "featuredUsers", void 0);
exports.Video = Video = __decorate([
    (0, stdschema_decorator_1.StdSchema)(defaultSchemaOptions_1.DefaultSchemaOptions)
], Video);
exports.VideoSchema = mongoose_1.SchemaFactory.createForClass(Video);
exports.VideoSchema.virtual("mediaType").get(function () {
    return "video";
});
exports.VideoFeature = {
    name: Video.name,
    schema: exports.VideoSchema,
};
//# sourceMappingURL=video.model.js.map