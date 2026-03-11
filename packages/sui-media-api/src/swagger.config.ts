import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule, OpenAPIObject } from '@nestjs/swagger';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version } = require('../package.json');

/**
 * Creates the shared Swagger/OpenAPI DocumentBuilder configuration.
 * This is the single source of truth — used by both the runtime app and
 * the offline export script.
 */
export function createSwaggerConfig() {
  return new DocumentBuilder()
    .setTitle('Stoked UI Media API')
    .setDescription(
      'REST API for Stoked UI Media Components - Upload, manage, and process media files ' +
        'with support for images, videos, and albums. Features include multipart uploads, ' +
        'metadata extraction, thumbnail generation, and comprehensive media management.',
    )
    .setVersion(version)
    .setContact(
      'Brian Stoker',
      'https://github.com/stoked-ui/sui',
      'brian@stoked-ui.com',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer('http://localhost:3001/v1', 'Local development server')
    .addServer('https://api.stoked-ui.com/v1', 'Production server')
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
    .addTag('Health', 'Health check endpoints')
    .addTag('Media', 'Media CRUD operations and metadata management')
    .addTag('Uploads', 'Multipart file upload operations')
    .addTag('auth', 'Authentication and user management')
    .build();
}

/**
 * Creates a Swagger document from the given NestJS application.
 */
export function createSwaggerDocument(app: INestApplication): OpenAPIObject {
  return SwaggerModule.createDocument(app, createSwaggerConfig());
}

/**
 * Sets up Swagger UI on the running NestJS application at `/api/docs`.
 */
export function setupSwaggerUI(app: INestApplication): void {
  const document = createSwaggerDocument(app);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Stoked UI Media API Documentation',
    customfavIcon: 'https://stoked-ui.com/favicon.ico',
    customCss: '.swagger-ui .topbar { display: none }',
  });
}
