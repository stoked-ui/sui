import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { MediaModule } from './media/media.module';
import { HealthModule } from './health/health.module';
import { UploadsModule } from './uploads/uploads.module';

@Module({
  imports: [
    // ConfigModule must be first AND global so all modules can inject ConfigService
    ConfigModule.forRoot({ isGlobal: true }),
    // DatabaseModule provides MongoDB connection and schemas
    DatabaseModule,
    MediaModule,
    HealthModule,
    UploadsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
