# @stoked-ui/media-api

Dedicated NestJS backend for Stoked UI media-component APIs.

This package serves media CRUD, resumable multipart uploads, metadata extraction, thumbnail/sprite generation infrastructure, JWT authentication, S3 operations, Swagger/OpenAPI output, and Lambda deployment support. It is scoped to media-component backend behavior only.

Do not add business/domain routes here. Products, clients, licenses, invoices, users, and other non-media application APIs belong in the Docs Next.js API layer under `docs/pages/api/*`.

## Installation

```bash
pnpm add @stoked-ui/media-api
```

For local development in this monorepo:

```bash
pnpm install
pnpm --filter @stoked-ui/media-api dev
```

Runtime services and tools:

- MongoDB via `MONGODB_URI`
- AWS S3 credentials and bucket configuration for upload storage
- `JWT_SECRET` for authentication
- `ffmpeg` and `ffprobe` for video/audio metadata extraction
- `sharp` for thumbnail and sprite-sheet processing

## Running Locally

```bash
pnpm --filter @stoked-ui/media-api dev
```

The standard server listens on `PORT` or `3001` and uses `API_PATH_PREFIX` or `/v1`.

Swagger UI is mounted at `/api/docs` by the server bootstrap. Generated OpenAPI files live under `packages/sui-media-api/docs`.

## API Surface

Runtime entry points:

- `src/main.ts` starts the standard NestJS HTTP server.
- `src/lambda.ts` and `src/lambda.bootstrap.ts` provide the AWS Lambda handler path.

Primary controllers:

- `GET /health` returns service health.
- `POST /auth/register`, `POST /auth/login`, and `GET /auth/me` handle JWT auth.
- `/media` routes list, read, create, update, soft delete, hard delete, restore, and process media records.
- `/uploads` routes initiate multipart uploads, issue presigned part URLs, record completed parts, sync with S3, complete uploads, abort uploads, and list active sessions.

## Integration Notes

- `@stoked-ui/media` is the primary client-side consumer. Its `MediaApiClient`, `UploadClient`, hooks, and `MediaApiProvider` are designed for this API.
- `@stoked-ui/common-api` provides the shared Mongoose features and upload DTOs registered by this service.
- The service supports both a standard Express/NestJS server and Lambda through `@codegenie/serverless-express`.
- Most media endpoints expect `Authorization: Bearer <jwt>`.
- Upload sessions and media records currently include in-memory service behavior in several areas; check the source and OpenAPI output before relying on persistence semantics.

## Environment

Common variables:

```env
PORT=3001
API_PATH_PREFIX=/v1
ALLOWED_ORIGINS=http://localhost:5199
MONGODB_URI=mongodb://localhost:27017/media
JWT_SECRET=change-me
AWS_REGION=us-east-1
AWS_S3_BUCKET=stoked-ui-media
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
FFMPEG_PATH=/usr/local/bin/ffmpeg
FFPROBE_PATH=/usr/local/bin/ffprobe
```

## Local Development

```bash
pnpm --filter @stoked-ui/media-api build
pnpm --filter @stoked-ui/media-api type-check
pnpm --filter @stoked-ui/media-api test
pnpm --filter @stoked-ui/media-api test:e2e
pnpm --filter @stoked-ui/media-api openapi:export
pnpm --filter @stoked-ui/media-api openapi:validate
```

## Related Docs

- Client package: `@stoked-ui/media`
- Shared backend models: `@stoked-ui/common-api`
- OpenAPI output: `packages/sui-media-api/docs/openapi.json`
- Source: `packages/sui-media-api/src`

## License

MIT
