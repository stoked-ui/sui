# Turbo Watch Mode Setup

## Overview

The stoked-ui monorepo now uses **Turbo watch mode** for intelligent hot-reloading across all packages during development.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│   pnpm dev (Turbo Watch Orchestrator)               │
├─────────────────────────────────────────────────────┤
│  1. Initial Setup: dev:prepare (builds dependencies)│
│  2. Watch Mode: turbo watch dev                      │
│     ├─ @stoked-ui/common → Babel --watch            │
│     ├─ @stoked-ui/video-renderer → NestJS --watch   │
│     └─ stokedui-com → Next.js dev server (HMR)      │
└─────────────────────────────────────────────────────┘
        ↓ File change detected ↓
    Auto-rebuild affected packages only
```

## How It Works

### 1. **nx.json Configuration**

Defines build orchestration and dependency tracking:

```json
{
  "targetDefaults": {
    "dev": {
      "cache": false,
      "dependsOn": ["^build"]  // Wait for dependencies to build first
    },
    "dev:prepare": {
      "cache": true,
      "dependsOn": ["^build"],
      "outputs": ["{projectRoot}/build", "{projectRoot}/dist"]
    }
  }
}
```

### 2. **Package Scripts**

Each package implements:

**@stoked-ui/common** (shared library):
```json
{
  "dev:prepare": "pnpm build:modern && pnpm build:types",
  "dev": "pnpm watch",  // Babel --watch mode
  "watch": "babel ... --watch"
}
```

**@stoked-ui/video-renderer** (NestJS service):
```json
{
  "dev:prepare": "pnpm build",
  "dev": "nest start --watch"  // NestJS built-in watch
}
```

**stokedui-com** (Next.js docs):
```json
{
  "dev:prepare": "echo 'Next.js dev server - no build needed'",
  "dev": "next dev -p 5199 --experimental-https"  // Next.js HMR
}
```

### 3. **Root Dev Script**

```bash
pnpm dev
# Equivalent to:
# 1. lerna run dev:prepare --scope @stoked-ui/common --scope @stoked-ui/video-renderer --scope stokedui-com
# 2. turbo watch dev --filter=@stoked-ui/common --filter=@stoked-ui/video-renderer --filter=stokedui-com
```

## Benefits

### ✅ Intelligent Dependency Tracking
- Turbo understands the dependency graph
- Only rebuilds affected packages when files change
- Respects `dependsOn` relationships

### ⚡ Performance
- Nx caching speeds up cold starts
- Parallel execution of independent tasks
- Incremental builds via Babel/NestJS/Next.js

### 🔄 True Hot Reloading
- **Common package changes** → Auto-rebuild → Restart video-renderer
- **Video-renderer changes** → NestJS auto-restart
- **Docs changes** → Next.js HMR (instant)

### 🎯 Unified Developer Experience
- Single command: `pnpm dev`
- Consistent across all packages
- No manual rebuild steps needed

## Usage

### Start Development

```bash
cd /Users/stoked/work/stoked-ui
pnpm dev
```

### Legacy Mode (Manual)

If you need the old behavior:

```bash
pnpm dev:legacy
# Runs: concurrently "pnpm docs:debug" "pnpm video-renderer:dev"
```

### Clean Development Start

```bash
pnpm build:clean && pnpm dev
```

## Troubleshooting

### Common Build Fails

**Problem**: `@stoked-ui/common` build fails during dev:prepare
**Solution**:
```bash
cd packages/sui-common
pnpm build
# Check for TypeScript errors or Babel issues
```

### Watch Mode Not Detecting Changes

**Problem**: File changes not triggering rebuilds
**Solution**:
1. Check file is within package `src/` directory
2. Verify file extension is included in watch patterns
3. Kill and restart: `pnpm kill && pnpm dev`

### Port Conflicts

**Problem**: Ports already in use
**Ports Used**:
- `5199`: stokedui-com (Next.js docs)
- `3000`: video-renderer (NestJS API)

**Solution**:
```bash
# Kill processes on those ports
lsof -ti:5199 | xargs kill -9
lsof -ti:3000 | xargs kill -9
```

## Build System Changes Made

### 1. Fixed Build Script Error Handling

**File**: `scripts/build.mjs`

**Issue**: Script was treating stderr warnings (like browserslist) as fatal errors

**Fix**: Removed incorrect error check that failed on non-fatal warnings:

```diff
- if (stderr) {
-   throw new Error(`'${command}' failed with \n${stderr}`);
- }
+ // Note: exec() throws on non-zero exit code, so if we reach here, command succeeded
+ // stderr may contain warnings (like browserslist) which are non-fatal
```

### 2. Updated Browserslist Data

**Issue**: 9-month-old caniuse-lite database causing warnings

**Fix**:
```bash
npx update-browserslist-db@latest
```

## Implementation Timeline

- **2026-01-13**: Initial Turbo watch configuration
- **Build fix**: Resolved stderr false-positive error detection
- **All packages**: Implemented dev:prepare and dev scripts
- **Testing**: ✅ All 13 packages build successfully

## Next Steps

1. Add watch mode to other shared packages (editor, timeline, media-selector)
2. Configure sourcemaps for better debugging in watch mode
3. Add VS Code tasks for common dev workflows
4. Document per-package development workflows

## References

- [Turbo Watch Documentation](https://turbo.build/repo/docs/reference/watch)
- [Nx Target Defaults](https://nx.dev/reference/nx-json#target-defaults)
- [Lerna 8.x with Nx](https://lerna.js.org/docs/lerna-and-nx)
