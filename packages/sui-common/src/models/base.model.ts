import { Prop, SchemaFactory } from "@nestjs/mongoose";
import { StdSchema } from "../decorators/stdschema.decorator";
import mongoose from "mongoose";
import type { PublicityType } from "../interfaces/publicity";

@StdSchema()
export class BaseModel {
  id: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: "UserRef" }] })
  likes: mongoose.Types.ObjectId[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: "UserRef" }] })
  dislikes?: mongoose.Types.ObjectId[];

  @Prop({ type: Boolean })
  deleted?: boolean;

  @Prop({ type: Date })
  deletedAt?: Date;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: "UserRef" }] })
  denyAccess?: mongoose.Types.ObjectId[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: "UserRef" }] })
  canAccess: mongoose.Types.ObjectId[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: "UserRef" }] })
  canEdit: mongoose.Types.ObjectId[];

  @Prop({ type: String, enum: ['public', 'private', 'paid', 'deleted'], default: 'private' })
  publicity: PublicityType;

  @Prop({ type: Number })
  tokens?: number;

  @Prop({ type: Number })
  views: number;

  @Prop({ type: Number })
  uniqueViews: number;

  @Prop({ type: Number })
  score: number;
}

export const BaseModelSchema = SchemaFactory.createForClass(BaseModel);

BaseModelSchema.methods.addToSet = function <T>(path: string, val: T) {
  const set = new Set(this[path]);
  set.add(val);
  this[path] = Array.from(set);
  this.markModified(path);
};

BaseModelSchema.methods.removeFromArray = function <T>(path: string, val: T) {
  const newArr = this[path].filter((z: string) => z !== val);
  if (newArr.length !== this[path].length) {
    this[path] = newArr;
    this.markModified(path);
  }
};

BaseModelSchema.methods.dislike = function (userId: string, save = true) {
  this.addToSet("dislikes", userId);
  this.removeFromArray("likes", userId);
  this.updateScore();
  if (save) {
    this.save();
  }
};

BaseModelSchema.methods.like = function (userId: string, save = true) {
  this.addToSet("likes", userId);
  this.removeFromArray("dislikes", userId);
  this.updateScore();
  if (save) {
    this.save();
  }
};

BaseModelSchema.methods.view = function (userId: string, save = true) {
  this.views = this.views + 1;
  this.addToSet("uniqueViews", userId);
  this.updateScore();
  if (save) {
    this.save();
  }
};

BaseModelSchema.methods.delete = function (save = true) {
  this.deleted = true;
  this.deletedAt = new Date();
  this.publicity = 'deleted';
  if (save) {
    this.save();
  }
};

BaseModelSchema.methods.updateScore = function () {
  const likeScore = this.likes.length * 1.6;
  const dislikeScore = this.likes.length * 0.7;
  const views = this.views.length * 0.1;
  const uniqueViews = this.uniqueViews.length * -0.8;
  this.score = likeScore + dislikeScore + views + uniqueViews;
};
