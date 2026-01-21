import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { S3Module } from '../s3/s3.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule, S3Module],
  controllers: [UploadsController],
  providers: [UploadsService],
  exports: [UploadsService],
})
export class UploadsModule {}
