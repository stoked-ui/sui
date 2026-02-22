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
exports.BaseModelSchema = exports.BaseModel = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const stdschema_decorator_1 = require("../decorators/stdschema.decorator");
const mongoose_2 = __importDefault(require("mongoose"));
let BaseModel = class BaseModel {
};
exports.BaseModel = BaseModel;
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: mongoose_2.default.Schema.Types.ObjectId, ref: "UserRef" }] }),
    __metadata("design:type", Array)
], BaseModel.prototype, "likes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: mongoose_2.default.Schema.Types.ObjectId, ref: "UserRef" }] }),
    __metadata("design:type", Array)
], BaseModel.prototype, "dislikes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean }),
    __metadata("design:type", Boolean)
], BaseModel.prototype, "deleted", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], BaseModel.prototype, "deletedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: mongoose_2.default.Schema.Types.ObjectId, ref: "UserRef" }] }),
    __metadata("design:type", Array)
], BaseModel.prototype, "denyAccess", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: mongoose_2.default.Schema.Types.ObjectId, ref: "UserRef" }] }),
    __metadata("design:type", Array)
], BaseModel.prototype, "canAccess", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: mongoose_2.default.Schema.Types.ObjectId, ref: "UserRef" }] }),
    __metadata("design:type", Array)
], BaseModel.prototype, "canEdit", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: ['public', 'private', 'paid', 'deleted'], default: 'private' }),
    __metadata("design:type", String)
], BaseModel.prototype, "publicity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number }),
    __metadata("design:type", Number)
], BaseModel.prototype, "tokens", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number }),
    __metadata("design:type", Number)
], BaseModel.prototype, "views", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number }),
    __metadata("design:type", Number)
], BaseModel.prototype, "uniqueViews", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number }),
    __metadata("design:type", Number)
], BaseModel.prototype, "score", void 0);
exports.BaseModel = BaseModel = __decorate([
    (0, stdschema_decorator_1.StdSchema)()
], BaseModel);
exports.BaseModelSchema = mongoose_1.SchemaFactory.createForClass(BaseModel);
exports.BaseModelSchema.methods.addToSet = function (path, val) {
    const set = new Set(this[path]);
    set.add(val);
    this[path] = Array.from(set);
    this.markModified(path);
};
exports.BaseModelSchema.methods.removeFromArray = function (path, val) {
    const newArr = this[path].filter((z) => z !== val);
    if (newArr.length !== this[path].length) {
        this[path] = newArr;
        this.markModified(path);
    }
};
exports.BaseModelSchema.methods.dislike = function (userId, save = true) {
    this.addToSet("dislikes", userId);
    this.removeFromArray("likes", userId);
    this.updateScore();
    if (save) {
        this.save();
    }
};
exports.BaseModelSchema.methods.like = function (userId, save = true) {
    this.addToSet("likes", userId);
    this.removeFromArray("dislikes", userId);
    this.updateScore();
    if (save) {
        this.save();
    }
};
exports.BaseModelSchema.methods.view = function (userId, save = true) {
    this.views = this.views + 1;
    this.addToSet("uniqueViews", userId);
    this.updateScore();
    if (save) {
        this.save();
    }
};
exports.BaseModelSchema.methods.delete = function (save = true) {
    this.deleted = true;
    this.deletedAt = new Date();
    this.publicity = 'deleted';
    if (save) {
        this.save();
    }
};
exports.BaseModelSchema.methods.updateScore = function () {
    const likeScore = this.likes.length * 1.6;
    const dislikeScore = this.likes.length * 0.7;
    const views = this.views.length * 0.1;
    const uniqueViews = this.uniqueViews.length * -0.8;
    this.score = likeScore + dislikeScore + views + uniqueViews;
};
//# sourceMappingURL=base.model.js.map