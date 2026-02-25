---
productId: stokd-cloud
title: Roadmap
---

# Roadmap

<p class="description">Current status and planned development for the Stokd Cloud AI project orchestration platform.</p>

## Current Status

Stokd Cloud is under active development as a private tool for Stoked Consulting. The VSCode extension core, review commands, and MCP server are functional. The State Tracking API has completed its foundation phase and is progressing through core session tracking.

## Completed

### VSCode Extension Core

- Project viewing and management with phase-based organization.
- Link and unlink GitHub organization projects to repositories.
- Auto-refresh when Claude completes tasks via signal files.
- Claude session launching with project context.
- Session monitoring with auto-continuation on inactivity.
- Real-time WebSocket notifications from the MCP server.
- Agent dashboard with session cost tracking.
- Emergency stop controls for all running sessions.
- Automatic installation of Claude Code slash commands.

### Review Commands

- Three-tier review system (`/review-item`, `/review-phase`, `/review-project`).
- Parallel sub-agent execution for phase and project reviews.
- Automatic GitHub issue status updates based on review results.
- Signal file notifications to the VSCode extension.
- Structured output with acceptance criteria validation.

### MCP Server

- 10+ MCP tools for project and issue management.
- Real-time WebSocket notification server with event buffering.
- Event bus with sequence-based tracking and replay support.
- Type-safe API client with automatic retries and exponential backoff.
- Claude Desktop and Claude Code integration via stdio transport.
- API key authentication with localhost bypass for local development.

### State Tracking API -- Phase 1: Foundation

- MongoDB schemas for sessions, tasks, and machines.
- NestJS project structure with modular architecture.
- API key authentication (Bearer token and X-API-Key header).
- Health check and readiness endpoints.
- SST (Serverless Stack) infrastructure for AWS Lambda deployment.
- Swagger auto-generated API documentation.
- Unified GitHub service layer with centralized authentication, rate limiting, and caching.

### Agent Package

- Orchestration loop with state machine for agent lifecycle.
- Budget tracking for session cost management.
- Worktree manager for isolated Git operations.
- Ideation agent for project planning.
- Review agent for automated quality checks.
- Template substitution engine for dynamic prompts.

## In Progress

### State Tracking API -- Phase 2: Core Session State Tracking (75%)

- Session CRUD endpoints (complete).
- Heartbeat mechanism for session health monitoring (complete).
- Machine and slot tracking for multi-machine orchestration (complete).
- Session health queries -- querying active, idle, and crashed sessions (in progress).

## Planned

### State Tracking API -- Phase 3: Task Monitoring and Recovery

- Task progress tracking with percentage and blocker metadata.
- Automatic recovery of crashed sessions.
- Task dependency tracking across sessions.
- Failure detection and alerting.

### State Tracking API -- Phase 4: Deployment and Production Readiness

- Production environment deployment pipeline.
- Custom domain configuration with SSL.
- Environment-specific secret management via SST Secrets.
- Blue-green deployment strategy.

### State Tracking API -- Phase 5: Monitoring, Logging, and Polish

- CloudWatch dashboard with key metrics.
- Automated alerts for error rate, latency, throttling, and database issues.
- Structured logging with correlation IDs.
- Operational runbooks and incident response procedures.
- Performance optimization and load testing.

### Review Command Enhancements

- `--dry-run` flag to preview changes without modifying issues.
- `--parallel=N` flag to control sub-agent concurrency.
- `--format=json` for programmatic consumption of review results.
- `--since=date` to review only recent changes.
- CI/CD pipeline integration for automated reviews on pull requests.
- Slack and Teams notifications for review results.
- Automated scheduling for daily or weekly reviews.

### VSCode Extension Enhancements

- Multi-workspace support for managing several projects simultaneously.
- Inline diff view for code changes associated with issues.
- Cost estimation before launching Claude sessions.
- Historical session analytics and trend visualization.

### Platform Expansion

- Web dashboard for project monitoring outside of VSCode.
- Multi-user support with role-based access control.
- Webhook integrations for third-party services.
- Plugin system for custom review criteria and report formats.
