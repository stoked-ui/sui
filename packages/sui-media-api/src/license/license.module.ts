import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../database/database.module';
import { LicenseController } from './license.controller';
import { StripeController } from './stripe.controller';
import { LicenseService } from './license.service';
import { StripeService } from './stripe.service';

@Module({
  imports: [DatabaseModule, ConfigModule],
  controllers: [LicenseController, StripeController],
  providers: [LicenseService, StripeService],
  exports: [LicenseService],
})
export class LicenseModule {}
