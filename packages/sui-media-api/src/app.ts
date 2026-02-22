import { Injectable, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { setupSwaggerUI } from './swagger.config';

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

    // Parse allowed origins from environment variable (comma-separated list).
    // Default includes localhost for development, stoked-ui.com, and brianstoker.com.
    const defaultOrigins = 'http://localhost:3000,https://stoked-ui.com,https://brianstoker.com';
    const allowedOriginsEnv = process.env.ALLOWED_ORIGINS ?? defaultOrigins;
    const allowedOrigins = new Set(
      allowedOriginsEnv
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean),
    );

    this.logger.log(`CORS allowed origins: ${[...allowedOrigins].join(', ')}`);

    const corsOptions = {
      origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // Allow requests with no origin (like mobile apps, Postman, server-to-server, etc.)
        if (!origin) {
          return callback(null, true);
        }

        // In development, allow any localhost origin
        if (isDevelopment && (origin.startsWith('http://localhost:') || origin.startsWith('https://localhost:'))) {
          return callback(null, true);
        }

        // Check against the configured allowed origins list
        if (allowedOrigins.has(origin)) {
          return callback(null, true);
        }

        callback(new Error(`Origin "${origin}" not allowed by CORS`));
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
