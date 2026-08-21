import { Injectable, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { setupSwaggerUI } from './swagger.config';
import { createCorsOptions, getAllowedCorsOrigins } from './cors';

@Injectable()
export class Server {
  private readonly logger = new Logger(Server.name);

  async start() {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'debug', 'log', 'verbose'],
    });

    app.use(cookieParser());

    const config = app.get(ConfigService);
    const apiVersion = config.get('API_PATH_PREFIX', '/v1');

    this.logger.log('api version: ' + apiVersion);
    app.setGlobalPrefix(apiVersion);

    const allowedOrigins = getAllowedCorsOrigins();
    this.logger.log(`CORS allowed origins: ${[...allowedOrigins].join(', ')}`);

    this.logger.log('CORS ENABLED');
    app.enableCors(createCorsOptions());

    // Configure Swagger OpenAPI documentation (shared config in swagger.config.ts)
    setupSwaggerUI(app);
    this.logger.log('Swagger API docs enabled at /api/docs');

    const port = process.env.PORT || 3001;
    const host = '0.0.0.0';

    this.logger.log('Media API listening on port: ' + port);
    await app.listen(port, host);

    return app;
  }
}
