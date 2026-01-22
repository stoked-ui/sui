import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  VideoFeature,
  ImageFeature,
  FileFeature,
  UploadSessionFeature,
} from '@stoked-ui/common';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI', 'mongodb://localhost:27017/stoked-media'),
        retryAttempts: 3,
        retryDelay: 1000,
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      VideoFeature,
      ImageFeature,
      FileFeature,
      UploadSessionFeature,
    ]),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
