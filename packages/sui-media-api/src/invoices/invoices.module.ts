import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { ApiKeyGuard } from './guards/api-key.guard';
import { AuthGuard } from '../media/guards/auth.guard';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [InvoicesController],
  providers: [InvoicesService, ApiKeyGuard, AuthGuard],
  exports: [InvoicesService],
})
export class InvoicesModule {}
