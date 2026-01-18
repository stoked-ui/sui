import { Injectable } from '@nestjs/common';

@Injectable()
export class MediaService {
  getInfo() {
    return {
      name: '@stoked-ui/media-api',
      version: '0.1.0',
      description: 'NestJS API for Stoked UI Media Components',
    };
  }
}
