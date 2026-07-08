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

  @Prop({ type: String })
  description?: string;

  @Prop({ type: String, required: true })
  keyPrefix: string;

  @Prop({ type: String })
  stripeProductId?: string;

  @Prop({ type: String })
  stripePriceId?: string;

  @Prop({ type: Number, default: 0 })
  price: number;

  @Prop({ type: String, default: 'usd' })
  currency: string;

  @Prop({ type: Number, default: 365 })
  licenseDurationDays: number;

  @Prop({ type: Number, default: 14 })
  gracePeriodDays: number;

  @Prop({ type: Number, default: 30 })
  trialDurationDays: number;

  @Prop({ type: String })
  purchaseUrl?: string;

  // Source URL of the product's install.sh; install.stokd.cloud/<productId>.sh
  // pulls from this URL (e.g. a raw.githubusercontent.com link or release asset).
  @Prop({ type: String })
  installSourceUrl?: string;

  // Operating systems the product supports ('macos' | 'linux' | 'windows').
  @Prop({ type: [String], default: [] })
  supportedOperatingSystems?: string[];

  // Display order across product listings (install.stokd.cloud, products pages).
  @Prop({ type: Number, default: 0 })
  sortOrder?: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.index({ productId: 1 }, { unique: true, name: 'product_id_unique' });

export const ProductFeature: ModelDefinition = {
  name: Product.name,
  schema: ProductSchema,
};
