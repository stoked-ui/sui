import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RenderQueueService } from './services/render-queue.service';
import { RenderJobProcessor } from './processors/render-job.processor';

/**
 * QueueModule
 *
 * Manages job queue for video rendering:
 * - Queue management with Bull/Redis
 * - Job prioritization and scheduling
 * - Concurrent job processing
 * - Retry logic and error handling
 * - Progress tracking and events
 */
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
          password: configService.get<string>('REDIS_PASSWORD'),
          db: configService.get<number>('REDIS_DB', 0),
        },
        defaultJobOptions: {
          removeOnComplete: 100, // Keep last 100 completed jobs
          removeOnFail: 500, // Keep last 500 failed jobs
          attempts: 3, // Retry failed jobs up to 3 times
          backoff: {
            type: 'exponential',
            delay: 5000, // Start with 5 second delay
          },
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'render-jobs',
      defaultJobOptions: {
        priority: 5,
      },
    }),
  ],
  providers: [RenderQueueService, RenderJobProcessor],
  exports: [RenderQueueService],
})
export class QueueModule {}
