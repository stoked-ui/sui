# @stoked-ui/media-api

NestJS API for Stoked UI Media Components

## Description

Backend API service built with NestJS for handling media operations in the Stoked UI ecosystem.

## Installation

```bash
pnpm install
```

## Running the app

```bash
# development
pnpm start

# watch mode
pnpm start:dev

# production mode
pnpm start:prod
```

## Test

```bash
# unit tests
pnpm test

# e2e tests
pnpm test:e2e

# test coverage
pnpm test:cov
```

## Health Check

The API includes a health check endpoint at `GET /health` that returns:

```json
{
  "status": "ok",
  "timestamp": "2024-01-18T00:00:00.000Z",
  "service": "@stoked-ui/media-api",
  "version": "0.1.0"
}
```

## License

MIT
