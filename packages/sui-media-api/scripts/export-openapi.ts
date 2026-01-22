import * as fs from 'fs';
import * as path from 'path';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';

/**
 * Script to export OpenAPI specification to JSON and YAML files
 * Also generates a Postman collection
 */
async function exportOpenApi() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'],
  });

  // Configure Swagger
  const config = new DocumentBuilder()
    .setTitle('Stoked UI Media API')
    .setDescription(
      'REST API for Stoked UI Media Components - Upload, manage, and process media files with support for images, videos, and albums. Features include multipart uploads, metadata extraction, thumbnail generation, and comprehensive media management.',
    )
    .setVersion('0.1.0')
    .setContact(
      'Brian Stoker',
      'https://github.com/stoked-ui/sui',
      'brian@stoked-ui.com',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer('http://localhost:3001', 'Local development server')
    .addServer('https://api.stoked-ui.com', 'Production server')
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
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Create docs directory if it doesn't exist
  const docsDir = path.join(__dirname, '..', 'docs');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  // Export OpenAPI spec as JSON
  const jsonPath = path.join(docsDir, 'openapi.json');
  fs.writeFileSync(jsonPath, JSON.stringify(document, null, 2));
  console.log(`✅ OpenAPI spec exported to: ${jsonPath}`);

  // Export OpenAPI spec as YAML (using JSON.stringify for simplicity)
  // Note: For proper YAML, you would need a YAML library
  const yamlContent = generateYaml(document);
  const yamlPath = path.join(docsDir, 'openapi.yaml');
  fs.writeFileSync(yamlPath, yamlContent);
  console.log(`✅ OpenAPI spec exported to: ${yamlPath}`);

  // Generate Postman collection
  const postmanCollection = convertToPostman(document);
  const postmanPath = path.join(docsDir, 'postman-collection.json');
  fs.writeFileSync(postmanPath, JSON.stringify(postmanCollection, null, 2));
  console.log(`✅ Postman collection exported to: ${postmanPath}`);

  console.log('\n📚 Documentation files created:');
  console.log(`   - ${jsonPath}`);
  console.log(`   - ${yamlPath}`);
  console.log(`   - ${postmanPath}`);

  await app.close();
}

/**
 * Simple YAML generator (basic implementation)
 * For production, use a proper YAML library like js-yaml
 */
function generateYaml(doc: any): string {
  const yaml = require('js-yaml');
  try {
    return yaml.dump(doc);
  } catch (error) {
    // Fallback to JSON if YAML library not available
    console.warn('⚠️  js-yaml not available, using JSON format for YAML file');
    return JSON.stringify(doc, null, 2);
  }
}

/**
 * Convert OpenAPI spec to Postman Collection v2.1
 */
function convertToPostman(openApiSpec: any): any {
  const postmanCollection: any = {
    info: {
      name: openApiSpec.info.title,
      description: openApiSpec.info.description,
      version: openApiSpec.info.version,
      schema:
        'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    },
    auth: {
      type: 'bearer',
      bearer: [
        {
          key: 'token',
          value: '{{jwt_token}}',
          type: 'string',
        },
      ],
    },
    variable: [
      {
        key: 'baseUrl',
        value: 'http://localhost:3001/v1',
        type: 'string',
      },
      {
        key: 'jwt_token',
        value: '',
        type: 'string',
      },
    ],
    item: [],
  };

  // Group endpoints by tags
  const tags = new Map<string, any[]>();

  for (const [path, methods] of Object.entries(openApiSpec.paths)) {
    for (const [method, spec] of Object.entries(methods as any)) {
      if (method === 'parameters') continue;

      const tag = (spec as any).tags?.[0] || 'Other';
      if (!tags.has(tag)) {
        tags.set(tag, []);
      }

      const request: any = {
        name: (spec as any).summary || `${method.toUpperCase()} ${path}`,
        request: {
          method: method.toUpperCase(),
          header: [
            {
              key: 'Content-Type',
              value: 'application/json',
              type: 'text',
            },
          ],
          url: {
            raw: `{{baseUrl}}${path}`,
            host: ['{{baseUrl}}'],
            path: path.split('/').filter((p) => p),
          },
          description: (spec as any).description,
        },
      };

      // Add auth if required
      if ((spec as any).security) {
        request.request.auth = {
          type: 'bearer',
          bearer: [
            {
              key: 'token',
              value: '{{jwt_token}}',
              type: 'string',
            },
          ],
        };
      }

      // Add request body if present
      if ((spec as any).requestBody) {
        const content = (spec as any).requestBody.content['application/json'];
        if (content?.schema) {
          request.request.body = {
            mode: 'raw',
            raw: JSON.stringify(
              generateExampleFromSchema(content.schema),
              null,
              2,
            ),
            options: {
              raw: {
                language: 'json',
              },
            },
          };
        }
      }

      tags.get(tag)!.push(request);
    }
  }

  // Convert tags to Postman folders
  for (const [tag, requests] of tags.entries()) {
    postmanCollection.item.push({
      name: tag,
      item: requests,
    });
  }

  return postmanCollection;
}

/**
 * Generate example data from OpenAPI schema
 */
function generateExampleFromSchema(schema: any): any {
  if (schema?.example) {
    return schema.example;
  }

  if (schema?.type === 'object' && schema?.properties) {
    const example: any = {};
    for (const [key, prop] of Object.entries(schema.properties)) {
      const propSchema = prop as any;
      example[key] = propSchema?.example || generateExampleFromSchema(propSchema);
    }
    return example;
  }

  if (schema?.type === 'array' && schema?.items) {
    return [generateExampleFromSchema(schema.items)];
  }

  // Default examples by type
  const defaults: any = {
    string: 'string',
    number: 0,
    integer: 0,
    boolean: true,
    object: {},
    array: [],
  };

  return defaults[schema?.type] || null;
}

exportOpenApi().catch((error) => {
  console.error('❌ Error exporting OpenAPI spec:', error);
  process.exit(1);
});
