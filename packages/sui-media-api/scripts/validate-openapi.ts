import * as fs from 'fs';
import * as path from 'path';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';

// Import from compiled dist/ to avoid transitive module resolution issues.
const { OpenApiModule } = require(path.resolve('dist/openapi.module'));
const { createSwaggerDocument } = require(path.resolve('dist/swagger.config'));

/**
 * Validates that the committed OpenAPI spec is up to date with the
 * current controller decorators.  Exits non-zero when the spec is stale.
 *
 * Usage:  pnpm --filter @stoked-ui/media-api openapi:validate
 * Requires `nest build` to have been run first.
 */
async function validateOpenApi() {
  const docsDir = path.resolve('docs');
  const committedPath = path.join(docsDir, 'openapi.json');

  if (!fs.existsSync(committedPath)) {
    console.error(
      'openapi.json not found. Run `pnpm openapi:export` first.',
    );
    process.exit(1);
  }

  const app = await NestFactory.create(OpenApiModule, {
    logger: false,
  });

  const freshSpec = createSwaggerDocument(app);
  await app.close();

  const committedSpec = JSON.parse(fs.readFileSync(committedPath, 'utf-8'));
  const freshJson = JSON.stringify(freshSpec, null, 2);
  const committedJson = JSON.stringify(committedSpec, null, 2);

  if (freshJson === committedJson) {
    console.log('OpenAPI spec is up to date.');
    process.exit(0);
  }

  console.error(
    'OpenAPI spec is out of date. Run `pnpm --filter @stoked-ui/media-api openapi:export` and commit the result.',
  );
  process.exit(1);
}

validateOpenApi().catch((error) => {
  console.error('Error validating OpenAPI spec:', error);
  process.exit(1);
});
