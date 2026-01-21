# @stoked-ui/media-api

NestJS API for Stoked UI Media Components

## Description

Backend API service built with NestJS for handling media operations in the Stoked UI ecosystem.

This API supports both local development and AWS Lambda deployment, following the same deployment patterns as the main Desirable v3 API.

## Features

- **Health Check Endpoint**: `GET /health` for monitoring
- **Swagger API Documentation**: Available at `/api` when running locally
- **Lambda-Ready**: Includes `lambda.bootstrap.ts` for AWS Lambda deployment
- **CORS Support**: Configurable CORS with environment-based settings
- **TypeScript**: Full TypeScript support with strict type checking

## Installation

```bash
pnpm install
```

## Environment Configuration

Copy `.env.example` to `.env` and configure as needed:

```bash
cp .env.example .env
```

Key environment variables:
- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment mode (development/production)
- `API_PATH_PREFIX`: API route prefix (default: /v1)
- `SST_STAGE`: Deployment stage for SST

## Running the app

```bash
# development with watch mode
pnpm dev

# standard development
pnpm start

# debug mode
pnpm start:debug

# production mode
pnpm start:prod
```

## Testing

```bash
# unit tests
pnpm test

# watch mode
pnpm test:watch

# e2e tests
pnpm test:e2e

# test coverage
pnpm test:cov

# CI test mode
pnpm test:ci
```

## Building

```bash
# build for production
pnpm build

# type checking
pnpm type-check
```

## API Endpoints

### Health Check

```
GET /health
```

Returns:

```json
{
  "status": "ok",
  "timestamp": "2024-01-18T00:00:00.000Z",
  "service": "@stoked-ui/media-api",
  "version": "0.1.0"
}
```

### Media

```
GET /media
```

Returns basic API information.

## Deployment

This API is designed to be deployed using AWS Lambda. The `lambda.bootstrap.ts` file provides the Lambda handler function.

For SST deployment, the API will be configured in the infrastructure as code.

## Project Structure

```
src/
├── app.module.ts          # Main application module
├── app.ts                 # Server class for local development
├── main.ts                # Local development entry point
├── lambda.bootstrap.ts    # Lambda handler for AWS deployment
├── health/                # Health check module
│   ├── health.controller.ts
│   └── health.module.ts
└── media/                 # Media module (stub for routes)
    ├── media.controller.ts
    ├── media.service.ts
    └── media.module.ts
```

## Next Steps

Future work will add specific media-related routes:
- File upload endpoints
- Media metadata management
- Transcoding operations
- Storage integration

## License

MIT
