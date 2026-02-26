# Search System

The Stoked UI docs site uses [Pagefind](https://pagefind.app/) (v1.4.0) for full-text search.
Pagefind is a static, client-side search library — no server, no API keys, no recurring cost.

## How It Works

1. **Build**: Next.js generates static HTML into `docs/export/`
2. **Index**: Pagefind crawls `docs/export/` and writes a search index to `docs/export/pagefind/`
3. **Deploy**: SST uploads `docs/export/` (including `pagefind/`) to S3 / CloudFront
4. **Runtime**: The `PagefindSearch` component lazy-loads `/pagefind/pagefind.js` when the user opens search (Cmd+K)

## Building

```bash
# Full build + index (from docs/)
pnpm build:export

# Index only (when export already exists)
npx pagefind --site export --output-subdir pagefind

# Validate the index
node scripts/validateSearchIndex.mjs
```

## Component

The search UI is implemented in:
```
docs/src/modules/components/PagefindSearch.tsx
```

It is lazy-loaded via `DeferredAppSearch` in `AppFrame.js` and appears in the site header.

**Features:**
- Cmd+K / Ctrl+K keyboard shortcut
- Product filter chips (Media, Timeline, File Explorer, Editor, Flux, Blog, Consulting)
- Results grouped by product when multiple products match
- Shimmer skeleton loading state
- Keyboard navigation (arrows, Enter, Escape)
- Full accessibility (combobox, listbox, live region)

## Content Markers

Pagefind discovers content through HTML attributes set in `AppLayoutDocs.js`:

| Attribute | What it marks |
|---|---|
| `data-pagefind-body` | The main content area — only pages with this are indexed |
| `data-pagefind-filter="product:X"` | Assigns a product facet for filtering |
| `data-pagefind-ignore` | Excludes navigation, headers, footers, TOC from the index |

## Deploy Runbook

See `projects/implement-full-text-search-with-deploy-time-reindexing/deploy-runbook.md` for:
- Complete build → index → deploy flow
- SST configuration details
- CloudFront cache invalidation
- Debugging guide
