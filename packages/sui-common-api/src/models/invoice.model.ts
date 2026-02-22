import { ModelDefinition, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { StdSchema } from '../decorators/stdschema.decorator';
import { DefaultSchemaOptions } from '../decorators/defaultSchemaOptions';

export type InvoiceDocument = HydratedDocument<Invoice>;

class InvoiceTask {
  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: Number, required: true })
  hours: number;
}

class InvoiceWeek {
  @Prop({ type: String, required: true })
  dateRange: string;

  @Prop({ type: Number, required: true })
  totalHours: number;

  @Prop({ type: [InvoiceTask], default: [] })
  tasks: InvoiceTask[];
}

@StdSchema(DefaultSchemaOptions)
export class Invoice {
  @Prop({ type: String, required: true, index: true })
  configId: string;

  @Prop({ type: String, required: true, index: true })
  customer: string;

  @Prop({ type: String, required: true })
  startDate: string;

  @Prop({ type: String, required: true })
  endDate: string;

  @Prop({ type: String, required: true })
  text: string;

  @Prop({ type: Number, required: true })
  totalHours: number;

  @Prop({ type: [InvoiceWeek], default: [] })
  weeks: InvoiceWeek[];

  @Prop({ type: Date, required: true })
  generatedAt: Date;

  @Prop({ type: Date })
  sentAt?: Date;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);

InvoiceSchema.index(
  { customer: 1, generatedAt: -1 },
  { name: 'invoice_customer_date', background: true },
);

InvoiceSchema.index(
  { configId: 1, generatedAt: -1 },
  { name: 'invoice_config_date', background: true },
);

export const InvoiceFeature: ModelDefinition = {
  name: Invoice.name,
  schema: InvoiceSchema,
};
