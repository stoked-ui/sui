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
exports.ImageFeature = exports.ImageSchema = exports.Image = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const defaultSchemaOptions_1 = require("../decorators/defaultSchemaOptions");
const stdschema_decorator_1 = require("../decorators/stdschema.decorator");
const file_model_1 = require("./file.model");
let Image = class Image extends file_model_1.File {
};
exports.Image = Image;
__decorate([
    (0, mongoose_1.Prop)([Boolean]),
    __metadata("design:type", Boolean)
], Image.prototype, "avatar", void 0);
__decorate([
    (0, mongoose_1.Prop)([Boolean]),
    __metadata("design:type", Boolean)
], Image.prototype, "cover", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: "image" }),
    __metadata("design:type", String)
], Image.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Image.prototype, "paidThumbnail", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number }),
    __metadata("design:type", Number)
], Image.prototype, "width", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number }),
    __metadata("design:type", Number)
], Image.prototype, "height", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number }),
    __metadata("design:type", Number)
], Image.prototype, "aspectRatio", void 0);
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
], Image.prototype, "metadataProcessingFailures", void 0);
exports.Image = Image = __decorate([
    (0, stdschema_decorator_1.StdSchema)(defaultSchemaOptions_1.DefaultSchemaOptions)
], Image);
exports.ImageSchema = mongoose_1.SchemaFactory.createForClass(Image);
exports.ImageSchema.virtual("mediaType").get(function () {
    return "image";
});
exports.ImageSchema.methods.dislike = function (cb, userId) {
    const dislikeSet = new Set(this.dislikes);
    dislikeSet.add(userId);
    this.dislikes = Array.from(userId);
    this.markModified("dislikes");
    this.save(cb);
};
exports.ImageSchema.methods.like = function (cb, userId) {
    const likeSet = new Set(this.likes);
    likeSet.add(userId);
    this.dislikes = Array.from(userId);
    this.markModified("likeSet");
    this.save(cb);
};
exports.ImageFeature = {
    name: Image.name,
    schema: exports.ImageSchema,
};
//# sourceMappingURL=image.model.js.map