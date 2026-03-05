import { ModelDefinition, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { StdSchema } from '../decorators/stdschema.decorator';
import { DefaultSchemaOptions } from '../decorators/defaultSchemaOptions';

export type LicenseDocument = HydratedDocument<License>;

export type LicenseStatus = 'pending' | 'active' | 'expired' | 'revoked';

@StdSchema(DefaultSchemaOptions)
export class License {
  @Prop({ type: String, unique: true })
  key: string;

  @Prop({ type: String, required: true, index: true })
  email: string;

  @Prop({ type: String, required: true, index: true })
  productId: string;

  @Prop({ type: String, default: null })
  hardwareId: string;

  @Prop({ type: String, default: null })
  machineName: string;

  @Prop({
    type: String,
    enum: ['pending', 'active', 'expired', 'revoked'],
    default: 'pending',
    index: true,
  })
  status: LicenseStatus;

  @Prop({ type: Date })
  activatedAt?: Date;

  @Prop({ type: Date })
  expiresAt?: Date;

  @Prop({ type: Number, default: 14 })
  gracePeriodDays: number;

  @Prop({ type: String, required: true, index: true })
  stripeCustomerId: string;

  @Prop({ type: String, required: true })
  stripeSubscriptionId: string;

  @Prop({ type: Number, default: 0 })
  deactivationCount: number;

  @Prop({ type: [String], default: [] })
  activationHistory: string[];
}

export const LicenseSchema = SchemaFactory.createForClass(License);

LicenseSchema.index({ key: 1 }, { unique: true, name: 'license_key_unique' });

LicenseSchema.index(
  { email: 1, productId: 1 },
  { name: 'license_email_product', background: true },
);

LicenseSchema.index(
  { hardwareId: 1 },
  { sparse: true, name: 'license_hardware', background: true },
);

LicenseSchema.index(
  { stripeSubscriptionId: 1 },
  { name: 'license_subscription', background: true },
);

LicenseSchema.index(
  { status: 1, expiresAt: 1 },
  { name: 'license_status_expiry', background: true },
);

export const LicenseFeature: ModelDefinition = {
  name: License.name,
  schema: LicenseSchema,
};
