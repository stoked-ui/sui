# Deploy Runbook: Full-Text Search with Pagefind

Project #14 — Implement Full-Text Search with Deploy-Time Reindexing

---

## Overview

The search system uses [Pagefind](https://pagefind.app/) (v1.4.0), a fully static search library.
The index is built at deploy time from the Next.js static export and served as static files
alongside the rest of the site. There is no search server, no API calls, and no third-party service.

---

## Complete Build → Index → Deploy Flow

```
pnpm build:prod                          # root-level command
  └── pnpm build                         # turbo: builds all workspace packages (excludes stokedui-com)
  └── pnpm docs:build                    # runs docs/package.json "build" script
        └── rimraf docs/export           # clean previous export
        └── next build --profile         # Next.js production build → static export
        └── pnpm build-sw               # build service worker
        └── pnpm build:index            # pagefind --site export --output-subdir pagefind
              └── writes docs/export/pagefind/
```

SST is then invoked separately:

```
SST_BUILD=1 sst deploy --stage production
  └── reads infra/site.ts
  └── StaticSite: build command = pnpm build:prod, output = docs/export
  └── uploads docs/export/** to S3 (including docs/export/pagefind/**)
  └── CloudFront distribution invalidation (paths controlled by INVALIDATION_PATHS env var)
```

### Key Environment Variable

| Variable | Purpose |
|---|---|
| `SST_BUILD=1` | Instructs `infra/site.ts` to run `pnpm build:prod` during SST deployment. Without it, SST serves from a pre-built `docs/export/` directory. |
| `INVALIDATION_PATHS` | Comma-separated CloudFront paths to invalidate on deploy (e.g., `/*`). Optional. |

---

## How the Search Index Is Generated

Pagefind crawls the fully rendered HTML in `docs/export/` after the Next.js export completes.
It reads all `<body>` content (respecting `data-pagefind-ignore` attributes to exclude nav/footer)
and writes a compact binary index.

The indexer is invoked via:

```bash
# docs/package.json "build:index" script
npx pagefind --site export --output-subdir pagefind
```

This is equivalent to running from `docs/`:

```bash
cd /opt/worktrees/stoked-ui/stoked-ui-main-project-14/docs
npx pagefind --site export --output-subdir pagefind
```

---

## Where Index Files Live

After a successful build, the pagefind index lives at:

```
docs/export/pagefind/
  pagefind.js           # main entry point loaded by the search component at runtime
  pagefind-ui.js        # pagefind default UI (not used — we have a custom UI)
  pagefind-ui.css       # pagefind default UI styles (not used)
  pagefind.*.pf_index   # binary index shards (one or more)
  pagefind.*.pf_meta    # metadata index shards
  pagefind.*.pf_fragment # result content fragments
  pagefind.*.wasm       # WebAssembly decoder (loaded lazily)
```

These files are included in the SST static site upload because they are inside `docs/export/`,
which is the configured `output` directory.

---

## How SST Deploys Them

`infra/site.ts` configures an `sst.aws.StaticSite` resource:

```typescript
// infra/site.ts (simplified)
const buildData = doBuild
  ? { path: '.', build: { command: 'pnpm build:prod', output: 'docs/export' } }
  : { path: 'docs/export' };

return new sst.aws.StaticSite(domainInfo.resourceName, {
  ...buildData,
  // ...domain, edge, assets config
});
```

SST uploads every file under `docs/export/` to the S3 bucket backing the CloudFront
distribution. The pagefind subdirectory (`docs/export/pagefind/`) is uploaded as-is, becoming
available at the `/pagefind/` URL path on the deployed site.

---

## Expected Content-Type Headers for Pagefind Files

| File pattern | Content-Type | Cache-Control |
|---|---|---|
| `pagefind.js` | `application/javascript` | `max-age=31536000,public,immutable` |
| `pagefind-ui.js` | `application/javascript` | `max-age=31536000,public,immutable` |
| `pagefind-ui.css` | `text/css` | `max-age=31536000,public,immutable` |
| `*.pf_index` / `*.pf_meta` / `*.pf_fragment` | `application/octet-stream` (binary) | `max-age=31536000,public,immutable` |
| `*.wasm` | `application/wasm` | `public,max-age=31536000,immutable` |

The `**/*.wasm` rule is explicitly configured in `infra/site.ts` with `contentType: "application/wasm"`.
This is required — without the correct MIME type, some browsers refuse to instantiate the
WebAssembly module with a MIME type mismatch error.

The pagefind `.pf_*` binary shard files do not require special content-type configuration;
`application/octet-stream` (the S3 default for unknown extensions) is correct and acceptable.

---

## How to Debug Search Issues

### 1. Verify pagefind.js loads

Open DevTools → Network tab. On the deployed site, trigger a search (Cmd+K / Ctrl+K). Look for:

```
GET /pagefind/pagefind.js   → 200 OK
```

If this request is missing or returns 404, the pagefind directory was not included in the build
output. Re-run the build and verify `docs/export/pagefind/pagefind.js` exists locally.

### 2. Check for MIME type errors

In the browser Console, look for errors like:

```
Failed to instantiate WebAssembly module: ...MIME type is not a Wasm module
```

This means the `.wasm` file is being served with `application/octet-stream` instead of
`application/wasm`. Verify the `**/*.wasm` `fileOptions` rule is present in `infra/site.ts`
and redeploy.

### 3. Check for 403 / access errors

If pagefind files return 403, the S3 bucket policy or CloudFront OAC configuration may not
include the `pagefind/` path. SST's `StaticSite` handles this automatically for all files
under the output directory.

### 4. Verify index content

Run locally after a build:

```bash
cd /opt/worktrees/stoked-ui/stoked-ui-main-project-14/docs
ls -lh export/pagefind/
```

You should see multiple `.pf_index`, `.pf_meta`, and `.pf_fragment` files. A near-empty
`pagefind/` directory (just `pagefind.js` and WASM, no shards) means the crawler found no
indexable content. Check that HTML pages have a `<body>` element and do not have the entire
body wrapped in `data-pagefind-ignore`.

### 5. Test search locally with a static server

Pagefind's dynamic `import('/pagefind/pagefind.js')` requires the files to be served over
HTTP — it cannot load from `file://`. To test locally:

```bash
cd /opt/worktrees/stoked-ui/stoked-ui-main-project-14/docs
pnpm build:export    # builds and indexes
npx serve export -l 3000
# then open http://localhost:3000
```

---

## How to Manually Rebuild the Index Locally

**Quick rebuild (index only):**

```bash
cd /opt/worktrees/stoked-ui/stoked-ui-main-project-14/docs
npx pagefind --site export --output-subdir pagefind
```

Use this when you have a current `docs/export/` and only want to re-run the indexer
(e.g., after changing pagefind configuration or metadata attributes in templates).

**Full rebuild (Next.js + index):**

```bash
cd /opt/worktrees/stoked-ui/stoked-ui-main-project-14/docs
pnpm build:export
# equivalent to: bash scripts/build-export.sh
```

The `build-export.sh` script:
1. Removes `export/` and `.next-export/`
2. Runs `next build` with `NEXT_DIST_DIR=.next-export`
3. Moves `.next-export/` to `export/`
4. Runs pagefind

**Full monorepo rebuild (packages + docs + index):**

```bash
cd /opt/worktrees/stoked-ui/stoked-ui-main-project-14
pnpm build:prod
```

---

## Cache Invalidation Considerations

Pagefind generates index files with **content-addressed filenames** (e.g.,
`pagefind.abc123.pf_index`). Each rebuild produces different filenames when content changes,
so old index shards are naturally replaced.

However, `pagefind.js` itself has a **fixed filename**. It is configured with
`max-age=31536000,public,immutable` in `infra/site.ts`. This means:

- Browsers that have cached `pagefind.js` from a previous deploy will continue using
  the old version until the cache expires (1 year) or is explicitly invalidated.
- On every deploy, CloudFront should invalidate at minimum `/pagefind/pagefind.js`
  and `/pagefind/pagefind-ui.js`.

### Recommended Invalidation Strategy

Set the `INVALIDATION_PATHS` environment variable before deploying:

```bash
export INVALIDATION_PATHS="/*"
SST_BUILD=1 sst deploy --stage production
```

Or for a targeted invalidation:

```bash
export INVALIDATION_PATHS="/pagefind/*,/_next/*"
SST_BUILD=1 sst deploy --stage production
```

SST passes this to the `invalidation` property of `StaticSite`, which calls CloudFront
`CreateInvalidation` and waits for completion (`wait: true`).

Alternatively, trigger a manual CloudFront invalidation after deploy:

```bash
aws cloudfront create-invalidation \
  --distribution-id <DISTRIBUTION_ID> \
  --paths "/pagefind/*" \
  --profile stoked
```

> Note: Always use `--profile stoked` for personal infrastructure AWS CLI commands.

---

## SST Configuration Verification

`infra/site.ts` has been verified against the following checklist:

- [x] Build command (`pnpm build:prod`) includes pagefind indexing via `docs:build` → `build:index`
- [x] Output directory (`docs/export`) contains the `pagefind/` subdirectory after build
- [x] WASM content-type explicitly set: `**/*.wasm` → `application/wasm`
- [x] JS files served with correct cache headers (`max-age=31536000,public,immutable`)
- [x] CSS files served with correct cache headers
- [x] HTML files served with no-cache headers (`max-age=0,no-cache,no-store,must-revalidate`)
- [x] `SST_BUILD` env var controls whether SST runs the build or serves a pre-built export
- [x] `INVALIDATION_PATHS` env var controls CloudFront path invalidation scope

No additional SST configuration is required for pagefind to work correctly.

---

## Quick Reference

| Task | Command |
|---|---|
| Full monorepo build (packages + docs + index) | `pnpm build:prod` (from repo root) |
| Docs build + index only | `pnpm build:export` (from `docs/`) |
| Index only (reindex existing export) | `npx pagefind --site export --output-subdir pagefind` (from `docs/`) |
| Serve locally for testing | `npx serve docs/export -l 3000` (from repo root) |
| Deploy to production | `SST_BUILD=1 INVALIDATION_PATHS=/* pnpm deploy:prod` (from repo root) |
| Invalidate CloudFront manually | `aws cloudfront create-invalidation --distribution-id <ID> --paths "/pagefind/*" --profile stoked` |
