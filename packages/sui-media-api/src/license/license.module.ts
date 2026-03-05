import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema, License, LicenseSchema } from '@stoked-ui/common-api';
import { DatabaseModule } from '../database/database.module';
import { LicenseController } from './license.controller';
import { ProductController } from './product.controller';
import { StripeController } from './stripe.controller';
import { LicenseService } from './license.service';
import { StripeService } from './stripe.service';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule,
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: License.name, schema: LicenseSchema },
    ]),
  ],
  controllers: [LicenseController, ProductController, StripeController],
  providers: [LicenseService, StripeService],
  exports: [LicenseService],
})
export class LicenseModule {}
