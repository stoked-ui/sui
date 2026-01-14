import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('app')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Root endpoint' })
  getHello(): { message: string; service: string } {
    return {
      message: 'Video Renderer Service',
      service: 'video-renderer',
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check' })
  healthCheck(): {
    status: string;
    timestamp: string;
    service: string;
  } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'video-renderer',
    };
  }
}
