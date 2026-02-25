---
productId: stokd-cloud
title: State Tracking API
---

# State Tracking API

<p class="description">A NestJS backend deployed to AWS Lambda that provides runtime state tracking for Claude AI orchestration sessions, task monitoring, and machine management.</p>

## What It Does

The State Tracking API is the central backend for the Stokd Cloud system. It persists orchestration state in MongoDB, manages the unified GitHub service layer, and exposes RESTful endpoints for sessions, tasks, machines, billing, organizations, and telemetry. All GitHub API access from other components routes through this service to ensure consistent authentication, rate limiting, and caching.

The API runs locally via NestJS for development and deploys to AWS Lambda with API Gateway through SST (Serverless Stack) for production.

## Core Modules

### Session Management

Track active Claude AI orchestration sessions with heartbeat monitoring:

- **Create, read, update, delete** sessions.
- **Heartbeat mechanism** -- Sessions report health at regular intervals; stale sessions are detected and flagged.
- **Session health queries** -- Query which sessions are active, idle, or crashed.
- **Project association** -- Each session is linked to a GitHub project number and machine.

### Task Monitoring

Monitor task-level progress within sessions:

- **Task lifecycle** -- Create tasks, update their status, and track completion.
- **Session filtering** -- Query tasks by session ID to see what work is in progress.
- **Progress tracking** -- Tasks carry metadata about completion percentage and blockers.

### Machine Tracking

Manage machine and Docker slot assignments for multi-machine orchestration:

- **Machine registration** -- Register machines with their available slots.
- **Slot allocation** -- Assign sessions to specific machine slots.
- **Capacity monitoring** -- Query available capacity across the fleet.

### Unified GitHub Service Layer

All GitHub operations flow through centralized services:

- **GitHub Auth Service** -- Token management with multi-source authentication, validation, and caching.
- **Projects Service** -- CRUD operations on GitHub Projects via GraphQL.
- **Issues Service** -- CRUD operations on issues via GraphQL and REST.
- **Rate Limiting** -- Automatic throttling to prevent GitHub API quota exhaustion.
- **Error Handling** -- Standardized error responses across all components.
- **Logging and Metrics** -- Centralized logging for debugging and monitoring.

### Additional Modules

| Module | Purpose |
|--------|---------|
| Billing | Usage tracking and cost management |
| Organizations | Multi-org support and configuration |
| Orchestration | Orchestration state coordination |
| Telemetry | Usage metrics and performance data |
| Cache | In-memory caching layer (5-minute TTL) |
| Agent Launcher | Launch and manage Claude agent processes |

## API Endpoints

### Health

- `GET /health` -- Health check (public, no auth required).
- `GET /health/ready` -- Readiness check (public, no auth required).

### Sessions

- `GET /sessions` -- List all sessions.
- `GET /sessions/:id` -- Get session by ID.
- `POST /sessions` -- Create a new session.
- `PUT /sessions/:id` -- Update a session.
- `DELETE /sessions/:id` -- Delete a session.

### Tasks

- `GET /tasks` -- List all tasks (supports `?session_id=xxx` filter).
- `GET /tasks/:id` -- Get task by ID.
- `POST /tasks` -- Create a new task.
- `PUT /tasks/:id` -- Update a task.
- `DELETE /tasks/:id` -- Delete a task.

### Machines

- `GET /machines` -- List all machines.
- `GET /machines/:id` -- Get machine by ID.
- `POST /machines` -- Register a new machine.
- `PUT /machines/:id` -- Update a machine.
- `DELETE /machines/:id` -- Remove a machine.

Full interactive documentation is available at `/api/docs` (Swagger) when the API is running.

## Authentication

All endpoints except `/health` and `/health/ready` require API key authentication. Keys can be sent as a Bearer token or an `X-API-Key` header:

```bash
# Bearer token (recommended)
curl -H "Authorization: Bearer YOUR_API_KEY" http://localhost:3000/sessions

# X-API-Key header
curl -H "X-API-Key: YOUR_API_KEY" http://localhost:3000/sessions
```

In development mode (`NODE_ENV=development`) with no API keys configured, authentication is bypassed. In production, API keys are always required and managed via SST Secrets.

## Infrastructure

### Deployment Architecture

| Component | Technology |
|-----------|-----------|
| Runtime | AWS Lambda (Node.js 20) |
| API Gateway | REST API with custom domain support |
| Database | MongoDB Atlas |
| Memory | 512 MB per Lambda invocation |
| Timeout | 30 seconds |
| Monitoring | CloudWatch Logs and Alarms |
| IaC | SST (Serverless Stack) |

### Deployment Commands

```bash
# Local development
pnpm run start:dev

# SST development mode (deploys to AWS, runs locally with hot reload)
pnpm sst:dev

# Deploy to development
pnpm deploy:dev

# Deploy to staging
pnpm deploy:staging

# Deploy to production
pnpm deploy:prod
```

### Environment Configuration

Required environment variables:

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `API_KEYS` | Comma-separated list of valid API keys (UUID v4 recommended) |
| `PORT` | Application port (default: 3000) |

Production and staging secrets are managed via SST Secrets rather than `.env` files.

## Project Structure

```
packages/api/
  src/
    app.module.ts        -- Root NestJS module
    main.ts              -- Application entry point (local)
    lambda.ts            -- Lambda handler (AWS deployment)
    modules/
      sessions/          -- Session management
      tasks/             -- Task monitoring
      machines/          -- Machine tracking
      auth/              -- Authentication guards
      health/            -- Health check endpoints
      github/            -- Unified GitHub service layer
      github-issues/     -- GitHub Issues service
      billing/           -- Usage and billing
      organizations/     -- Multi-org support
      orchestration/     -- Orchestration coordination
      telemetry/         -- Metrics collection
      cache/             -- In-memory caching
      agent-launcher/    -- Agent process management
      activities/        -- Activity logging
      project-events/    -- Project event handling
      users/             -- User management
    schemas/             -- MongoDB schemas
    common/
      guards/            -- Auth guards
      filters/           -- Exception filters
      interceptors/      -- Request interceptors
    config/              -- Configuration management
  sst.config.ts          -- SST infrastructure definition
  test/                  -- Unit and E2E tests
```

## Client Library

The API includes a TypeScript client library for easy integration with other components:

```typescript
import { StateTrackingApiClient } from './state-tracking-client';

const client = new StateTrackingApiClient({
  baseUrl: 'https://your-api-domain.com',
  apiKey: 'your-api-key',
});

const session = await client.createSession({
  project_id: '123',
  machine_id: 'my-machine',
});
```

Build the standalone client with `pnpm run build:client`. The output goes to `dist/client/`.

## Monitoring

Production includes automated CloudWatch alerts for:

- Lambda error rate exceeding 1%.
- API latency exceeding 2 seconds.
- Lambda throttling detected.
- Database connection issues.

Access the monitoring dashboard at AWS Console, then CloudWatch, then Dashboards, then "stokd-cloud-State-API-Production".
