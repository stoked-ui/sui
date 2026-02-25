---
productId: stokd-cloud
title: VSCode Extension
---

# VSCode Extension

<p class="description">The Stokd VSCode extension brings GitHub Projects into your editor with real-time sync, phase-based organization, and integrated Claude AI session management.</p>

## What It Does

The Stokd extension adds a dedicated panel to VSCode that displays your GitHub Projects organized by phases. It connects to the State Tracking API and MCP Server for real-time updates, and it can launch and monitor Claude Code sessions directly from the project board. When Claude completes work through the MCP server, the extension receives WebSocket notifications and updates the UI instantly.

## Core Features

### Project Viewing and Management

- **Repository Projects** -- Displays projects linked to the current repository.
- **Organization Projects** -- Browse all projects in your GitHub organization.
- **Link/Unlink** -- Right-click an organization project and select "Link to Current Project" to bind it to the active repository.
- **Phase-Based Grouping** -- Items are automatically grouped by naming convention. An item titled `[Phase 2] Development - MASTER` becomes the phase header, and `[P2.1] Implement auth` becomes a child work item.
- **Status Updates** -- Mark items as done, move them between phases, or create new issues directly from the panel.

### Claude AI Session Management

- **Launch Sessions** -- Click the play button on any project to start a Claude Code session with project context.
- **Auto-Continuation** -- The extension monitors Claude sessions for inactivity (default: 60 seconds). If Claude stalls, it sends a continuation prompt automatically.
- **Session Dashboard** -- Use `Cmd+Shift+P` and search "Stokd: View Active Claude Sessions" to see all running sessions.
- **Emergency Controls** -- Stop all sessions at once with "Stokd: Stop All Claude Sessions".

### Real-Time Notifications

- **WebSocket Integration** -- The extension connects to the MCP Server's WebSocket endpoint for live updates.
- **Instant Sync** -- When Claude creates, updates, or deletes issues through the MCP server, the UI refreshes within 100ms.
- **Event Buffering** -- If the connection drops, missed events are replayed on reconnection using sequence-based tracking.
- **Project Subscriptions** -- The extension subscribes only to the projects currently displayed, reducing unnecessary traffic.

### Integrated Review Commands

The extension automatically installs five Claude Code slash commands on first activation:

| Command | Purpose |
|---------|---------|
| `/review-item` | Review a single issue against its acceptance criteria |
| `/review-phase` | Review all items in a phase with parallel sub-agents |
| `/review-project` | Full project review with executive summary |
| `/project-start` | Start working on a project with Claude |
| `/project-create` | Create a new GitHub project with Claude |

Right-click any project, phase, or item in the panel and select "Review" to run the appropriate command.

## Installation

1. Build the extension from source:

```bash
cd apps/code-ext
pnpm install
pnpm run build
```

2. Reload VSCode (`F1` then "Developer: Reload Window").
3. Open the **Stokd** panel in the bottom panel area.

The extension requires VSCode 1.96.0 or later, the GitHub CLI (`gh`) installed and authenticated, and Claude Code installed.

## Configuration

Access settings via `Cmd+,` (or `Ctrl+,`) and search for "Stokd":

| Setting | Default | Description |
|---------|---------|-------------|
| `claudeProjects.notifications.enabled` | `true` | Enable real-time WebSocket notifications |
| `claudeProjects.notifications.websocketUrl` | `ws://localhost:8080/notifications` | WebSocket URL for the MCP notification server |
| `claudeProjects.mcp.apiKey` | _(empty)_ | API key for MCP server authentication |
| Inactivity Threshold | 60 seconds | Time before sending Claude a continuation prompt |
| Check Interval | 10 seconds | How often to check for Claude activity |

### WebSocket Setup

To enable real-time notifications:

1. Start the MCP Server with WebSocket support (`pnpm start` in `packages/mcp-server`).
2. Set `claudeProjects.mcp.apiKey` in VSCode settings to match the `WS_API_KEY` in the MCP server `.env` file.
3. Verify the connection in the VSCode Output panel under the "Stokd" channel. You should see: `WebSocket connected to ws://localhost:8080/notifications`.

When the MCP server and extension run on the same machine, localhost connections are trusted automatically and no API key is needed.

## Project Structure

```
apps/code-ext/
  src/
    extension.ts                  -- Extension entry point and activation
    projects-view-provider.ts     -- Main webview UI provider (project board)
    agent-dashboard-provider.ts   -- Agent session dashboard
    github-api.ts                 -- GitHub GraphQL API client
    phase-logic.ts                -- Phase grouping and naming logic
    claude-monitor.ts             -- Session monitoring and auto-continuation
    cache-manager.ts              -- Data caching with TTL
    api-client.ts                 -- State Tracking API HTTP client
    cost-tracker.ts               -- Session cost tracking
    emergency-controls.ts         -- Emergency stop controls
    loop-validator.ts             -- Orchestration loop validation
    review-agent.ts               -- Review command integration
    agent-session-manager.ts      -- Claude session lifecycle
  commands/                       -- Claude Code slash command definitions
  media/                          -- Webview assets (JS, CSS, icons)
```

## Troubleshooting

### Projects Not Showing

1. Verify you are in a Git repository with a valid GitHub remote.
2. Re-authenticate via VSCode's built-in GitHub integration.
3. Check the Output panel (View then Output then "Stokd") for error messages.
4. Click the refresh button to force a fresh data fetch.

### Claude Sessions Not Working

1. Ensure the `claude` command is available in your terminal PATH.
2. Check `.claude-sessions/` for session error logs.
3. Verify the State Tracking API is reachable if you are using remote orchestration.

### WebSocket Connection Issues

1. Confirm the MCP server is running (`pnpm start` in `packages/mcp-server`).
2. Verify that the `WS_API_KEY` in the MCP server `.env` matches `claudeProjects.mcp.apiKey` in VSCode settings.
3. Check that the WebSocket port (default 8080) is not blocked by a firewall.
4. Look for connection errors in the "Stokd" Output channel.
