# Common Overview

<p class="description">Shared utilities, hooks, and components used across all Stoked UI packages.</p>

## Introduction

The `@stoked-ui/common` package provides foundational utilities shared by all Stoked UI packages. It includes hooks for resize handling, a local database abstraction, color utilities, MIME type helpers, and more.

## Installation

```bash
npm install @stoked-ui/common
# or
pnpm add @stoked-ui/common
```

## Key exports

- **useResize** — Hook for tracking element resize events
- **useResizeWindow** — Hook for tracking window resize events
- **LocalDb** — IndexedDB-backed local database utility
- **Colors** — Color manipulation and palette utilities
- **MimeType** — MIME type detection and classification helpers
- **GrokLoader** — Component loader with progress indication
- **Provider** — State management provider utilities

## What's next

- See the [Usage](/common/docs/usage/) page for detailed examples
- Check the [Roadmap](/common/docs/roadmap/) for planned features
