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
exports.FileFeature = exports.FileSchema = exports.File = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = __importDefault(require("mongoose"));
const stdschema_decorator_1 = require("../decorators/stdschema.decorator");
const base_model_1 = require("./base.model");
let File = class File extends base_model_1.BaseModel {
};
exports.File = File;
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], File.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], File.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.default.Schema.Types.ObjectId, ref: "UserRef" }),
    __metadata("design:type", mongoose_2.default.Types.ObjectId)
], File.prototype, "author", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: mongoose_2.default.Schema.Types.ObjectId, ref: "UserRef" }] }),
    __metadata("design:type", Array)
], File.prototype, "owners", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], File.prototype, "file", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], File.prototype, "url", void 0);
__decorate([
    (0, mongoose_1.Prop)([String]),
    __metadata("design:type", Array)
], File.prototype, "tags", void 0);
__decorate([
    (0, mongoose_1.Prop)([{ default: [], type: mongoose_2.default.Schema.Types.ObjectId, ref: "UserRef" }]),
    __metadata("design:type", Array)
], File.prototype, "starring", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number }),
    __metadata("design:type", Number)
], File.prototype, "price", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], File.prototype, "originalName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], File.prototype, "hash", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number }),
    __metadata("design:type", Number)
], File.prototype, "size", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], File.prototype, "mime", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: ['ga', 'nc17'], default: 'nc17' }),
    __metadata("design:type", String)
], File.prototype, "rating", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: false, index: true }),
    __metadata("design:type", String)
], File.prototype, "bucket", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: false }),
    __metadata("design:type", String)
], File.prototype, "region", void 0);
exports.File = File = __decorate([
    (0, stdschema_decorator_1.StdSchema)()
], File);
exports.FileSchema = mongoose_1.SchemaFactory.createForClass(File);
exports.FileFeature = {
    name: File.name,
    schema: exports.FileSchema,
};
//# sourceMappingURL=file.model.js.map