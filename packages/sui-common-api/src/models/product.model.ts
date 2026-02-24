import { ModelDefinition, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { StdSchema } from '../decorators/stdschema.decorator';
import { DefaultSchemaOptions } from '../decorators/defaultSchemaOptions';

export type ProductDocument = HydratedDocument<Product>;

@StdSchema(DefaultSchemaOptions)
export class Product {
  @Prop({ type: String, unique: true, index: true })
  productId: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  keyPrefix: string;

  @Prop({ type: String, required: true })
  stripePriceId: string;

  @Prop({ type: Number, default: 365 })
  licenseDurationDays: number;

  @Prop({ type: Number, default: 14 })
  gracePeriodDays: number;

  @Prop({ type: Number, default: 30 })
  trialDurationDays: number;

  @Prop({ type: String })
  purchaseUrl?: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.index({ productId: 1 }, { unique: true, name: 'product_id_unique' });

export const ProductFeature: ModelDefinition = {
  name: Product.name,
  schema: ProductSchema,
};
