import { ModelDefinition, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema } from 'mongoose';
import { StdSchema } from '../decorators/stdschema.decorator.js';
import { DefaultSchemaOptions } from '../decorators/defaultSchemaOptions.js';

export type UserRole = 'admin' | 'client' | 'agent';
export type UserDocument = HydratedDocument<User>;

@StdSchema(DefaultSchemaOptions)
export class User {
  @Prop({ type: String, required: true, unique: true, index: true })
  email: string;

  @Prop({ type: String })
  passwordHash?: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true, default: 'client' })
  role: UserRole;

  @Prop({ type: Schema.Types.ObjectId, ref: 'Client' })
  clientId?: any;

  @Prop({ type: [{ type: Schema.Types.ObjectId, ref: 'User' }] })
  agentIds?: any[];

  @Prop({ type: [String] })
  aliases?: string[];

  @Prop({ type: String })
  avatarUrl?: string;

  @Prop({ type: Boolean, default: true })
  active: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

export const UserFeature: ModelDefinition = {
  name: User.name,
  schema: UserSchema,
};
