import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { ClientsController } from './clients.controller';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [ClientsController],
  providers: [],
  exports: [],
})
export class ClientsModule {}
