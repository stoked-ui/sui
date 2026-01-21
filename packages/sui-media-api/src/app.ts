import { Injectable, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

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

    // Dynamic CORS configuration
    const isDevelopment =
      process.env.NODE_ENV !== 'production' &&
      process.env.SST_STAGE !== 'production' &&
      process.env.SST_STAGE !== 'prod';

    const corsOptions = {
      origin: (origin: string, callback: (err: Error | null, allow?: boolean) => void) => {
        // Allow requests with no origin (like mobile apps, Postman, etc.)
        if (!origin) {
          return callback(null, true);
        }

        // In development, allow any localhost origin
        if (isDevelopment && (origin.startsWith('http://localhost:') || origin.startsWith('https://localhost:'))) {
          return callback(null, true);
        }

        // In production, you would check against allowed origins
        // For now, allow all in development
        if (isDevelopment) {
          return callback(null, true);
        }

        callback(new Error('Not allowed by CORS'));
      },
      methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'PATCH', 'DELETE', 'HEAD'],
      allowedHeaders: [
        'Authorization',
        'Content-Type',
        'Accept',
        'Origin',
        'X-Requested-With',
        'Cookie',
      ],
      exposedHeaders: [
        'Content-Range',
        'Content-Length',
        'Accept-Ranges',
        'Content-Type',
      ],
      maxAge: 86400,
      credentials: true,
    };

    this.logger.log('CORS ENABLED');
    app.enableCors(corsOptions);

    // Configure Swagger OpenAPI documentation
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Stoked UI Media API')
      .setDescription('REST API for Stoked UI Media Components')
      .setVersion('0.1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api', app, document);

    this.logger.log('Swagger API docs enabled at /api');

    const port = process.env.PORT || 3001;
    const host = '0.0.0.0';

    this.logger.log('Media API listening on port: ' + port);
    await app.listen(port, host);

    return app;
  }
}
