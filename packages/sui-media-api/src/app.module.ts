import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MediaModule } from './media/media.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    // ConfigModule must be first AND global so all modules can inject ConfigService
    ConfigModule.forRoot({ isGlobal: true }),
    MediaModule,
    HealthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
