import { ModelDefinition, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { StdSchema } from '../decorators/stdschema.decorator.js';
import { DefaultSchemaOptions } from '../decorators/defaultSchemaOptions.js';

export type ClientDocument = HydratedDocument<Client>;

@StdSchema(DefaultSchemaOptions)
export class Client {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true, unique: true, index: true })
  slug: string;

  @Prop({ type: String, required: true })
  contactEmail: string;

  @Prop({ type: Boolean, default: true })
  active: boolean;
}

export const ClientSchema = SchemaFactory.createForClass(Client);

export const ClientFeature: ModelDefinition = {
  name: Client.name,
  schema: ClientSchema,
};
