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
exports.MediaFeature = exports.MediaSchema = exports.Media = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const defaultSchemaOptions_1 = require("../decorators/defaultSchemaOptions");
const stdschema_decorator_1 = require("../decorators/stdschema.decorator");
const file_model_1 = require("./file.model");
const base_model_1 = require("./base.model");
let Media = class Media extends file_model_1.File {
};
exports.Media = Media;
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Media.prototype, "thumbnail", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Media.prototype, "thumb", void 0);
__decorate([
    (0, mongoose_1.Prop)([String]),
    __metadata("design:type", Array)
], Media.prototype, "thumbs", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Media.prototype, "paidThumbnail", void 0);
__decorate([
    (0, mongoose_1.Prop)([Object]),
    __metadata("design:type", Array)
], Media.prototype, "scenes", void 0);
__decorate([
    (0, mongoose_1.Prop)([String]),
    __metadata("design:type", Array)
], Media.prototype, "sceneTimeCodes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number }),
    __metadata("design:type", Number)
], Media.prototype, "duration", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Media.prototype, "mediaType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Media.prototype, "location", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Array, default: [] }),
    __metadata("design:type", Array)
], Media.prototype, "playbackIssues", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], Media.prototype, "hasPlaybackIssues", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Media.prototype, "posterTransform", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number }),
    __metadata("design:type", Number)
], Media.prototype, "width", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number }),
    __metadata("design:type", Number)
], Media.prototype, "height", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: ['public', 'authenticated', 'private'], default: 'private', index: true }),
    __metadata("design:type", String)
], Media.prototype, "embedVisibility", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Media.prototype, "dataSource", void 0);
exports.Media = Media = __decorate([
    (0, stdschema_decorator_1.StdSchema)(defaultSchemaOptions_1.DefaultSchemaOptions)
], Media);
exports.MediaSchema = mongoose_1.SchemaFactory.createForClass(Media);
exports.MediaSchema.methods = base_model_1.BaseModelSchema.methods;
exports.MediaSchema.index({ title: "text", description: "text", tags: "text" }, {
    weights: { title: 10, tags: 5, description: 1 },
    name: 'media_text_search',
    background: true,
});
exports.MediaSchema.index({ views: -1, createdAt: -1 }, { name: 'media_views_date', background: true });
exports.MediaSchema.index({ author: 1, createdAt: -1 }, { name: 'media_author_date', background: true });
exports.MediaSchema.index({ mediaType: 1, createdAt: -1 }, { name: 'media_type_date', background: true });
exports.MediaSchema.index({ price: 1, createdAt: -1 }, { name: 'media_price_date', background: true });
exports.MediaSchema.index({ publicity: 1, createdAt: -1 }, { name: 'media_publicity_date', background: true });
exports.MediaSchema.index({ score: -1, createdAt: -1 }, { name: 'media_score_date', background: true });
exports.MediaSchema.index({ duration: 1 }, { name: 'media_duration', background: true, sparse: true });
exports.MediaFeature = {
    name: Media.name,
    schema: exports.MediaSchema,
};
//# sourceMappingURL=media.model.js.map