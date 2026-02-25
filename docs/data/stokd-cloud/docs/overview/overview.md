---
productId: stokd-cloud
title: Stokd Cloud - AI Project Orchestration
---

# Overview

<p class="description">Stokd Cloud is an AI-powered project orchestration system that bridges GitHub Projects, Claude AI, and VSCode into a unified development workflow.</p>

## What is Stokd Cloud?

Stokd Cloud is a distributed system for managing GitHub Projects with deep Claude AI integration. It combines a VSCode extension, a NestJS state tracking API, an MCP (Model Context Protocol) server, and a set of Claude Code review commands into a cohesive platform that lets AI agents plan, execute, and review project work with minimal human intervention.

The system treats GitHub Projects as the single source of truth while layering intelligent orchestration, real-time synchronization, and automated quality review on top.

## Key Features

- **VSCode Extension** -- View and manage GitHub Projects directly in your editor with real-time sync, phase-based organization, and Claude AI session management.
- **State Tracking API** -- A NestJS backend deployed to AWS Lambda that tracks orchestration sessions, tasks, and machine assignments with MongoDB persistence.
- **MCP Server** -- A Model Context Protocol server that gives Claude direct access to project and issue management through 10+ structured tools.
- **Review Commands** -- Three hierarchical Claude Code commands (`/review-item`, `/review-phase`, `/review-project`) that perform automated quality review with parallel execution.
- **Real-Time Notifications** -- WebSocket-based event delivery keeps the VSCode extension in sync when Claude modifies projects through the MCP server.
- **Phase-Based Organization** -- Work items are automatically grouped by naming convention into phases, with master items tracking overall phase progress.
- **Claude Session Monitoring** -- The extension monitors Claude Code sessions for inactivity and sends automatic continuation prompts to keep work moving.
- **Unified GitHub Service Layer** -- All GitHub API access flows through a centralized service with consistent authentication, rate limiting, error handling, and multi-layer caching.

## Architecture

The system follows a layered architecture where GitHub Projects is the authoritative data source and all components synchronize through a unified service layer.

```
GitHub API (Source of Truth)
        |
        v
Unified GitHub Service Layer (State Tracking API - NestJS)
  - Auth Service (token management, validation, caching)
  - Projects Service (CRUD, GraphQL)
  - Issues Service (CRUD, GraphQL)
  - Rate Limiting, Error Handling, Logging & Metrics
        |
   +---------+-----------+-----------+
   |         |           |           |
   v         v           v           v
 VSCode    MCP       Claude Code   Agent
Extension  Server    Commands      Package
```

### Component Responsibilities

| Component | Role |
|-----------|------|
| VSCode Extension | User interface, project browsing, session management, real-time updates |
| State Tracking API | Business logic, data persistence, GitHub operations, session/task/machine tracking |
| MCP Server | AI integration, tool protocols, WebSocket notifications, event bus |
| Review Commands | Automated quality review, parallel sub-agent orchestration, status updates |
| Agent Package | Orchestration loop, state machine, budget tracking, worktree management |

### Key Design Principles

- **Separation of Concerns** -- Each component has a clearly defined responsibility and can operate independently.
- **Single Source of Truth** -- GitHub Projects is authoritative; all components sync from GitHub, not from each other.
- **Fail-Safe Design** -- Components degrade gracefully when services are unavailable; caches serve stale data when the API is unreachable.
- **Centralized GitHub Access** -- No direct `gh` CLI or Octokit calls in client components; everything routes through the unified service layer.
- **Layered Caching** -- L1 in the VSCode extension (5-minute TTL), L2 in the API in-memory cache (5-minute TTL), and L3 in MongoDB for persistent state.

## System Requirements

| Requirement | Minimum |
|-------------|---------|
| VSCode | 1.96.0 or later |
| Node.js | 18 or 20 |
| GitHub CLI | Installed and authenticated |
| Claude Code | Latest version with skills support |
| Database | MongoDB (local or Atlas) |
| Deployment | AWS Lambda via SST (Serverless Stack) |

## Getting Started

1. **Install the VSCode Extension** -- Build and install the extension from `apps/code-ext`. It automatically installs Claude review commands to `~/.claude/commands/` on first activation.
2. **Start the State Tracking API** -- Run `pnpm run start:dev` in `packages/api` for local development, or deploy to AWS with `pnpm deploy:dev`.
3. **Configure the MCP Server** -- Set up API keys in `packages/mcp-server/.env` and add the server to your Claude Desktop configuration.
4. **Open a Project** -- Open the Stokd panel in VSCode, link a GitHub project to your repository, and start working.
5. **Run a Review** -- Use `claude /review-project <number>` to generate a comprehensive project health report.

Continue to the [VSCode Extension](/stokd-cloud/docs/vscode-extension) page to learn about the editor integration, or jump to the [State Tracking API](/stokd-cloud/docs/state-api) for backend details.
