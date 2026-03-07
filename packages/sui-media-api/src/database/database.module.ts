import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  VideoFeature,
  ImageFeature,
  FileFeature,
  UploadSessionFeature,
  BlogPostFeature,
  InvoiceFeature,
  LicenseFeature,
  ProductFeature,
  ClientFeature,
  UserFeature,
} from '@stoked-ui/common-api';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        let uri: string | undefined;
        try {
          const { Resource } = await import('sst');
          uri = (Resource as any).MONGODB_URI?.value;
        } catch { /* ignore */ }
        
        if (!uri) {
          uri = configService?.get?.<string>('MONGODB_URI') || process.env.MONGODB_URI || 'mongodb://localhost:27017/stoked-media';
        }

        return {
          uri,
          retryAttempts: 3,
          retryDelay: 1000,
          connectTimeoutMS: 5000,
          serverSelectionTimeoutMS: 5000,
        };
      },
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      VideoFeature,
      ImageFeature,
      FileFeature,
      UploadSessionFeature,
      BlogPostFeature,
      InvoiceFeature,
      LicenseFeature,
      ProductFeature,
      ClientFeature,
      UserFeature,
    ]),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
