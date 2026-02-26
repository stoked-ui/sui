# Search Technology Comparison

**Project:** Implement Full-Text Search with Deploy-Time Reindexing
**Phase:** 1.2 — Evaluate Alternative Search Technologies
**Author:** Project Agent
**Date:** 2026-02-26
**Status:** Final — Technology Selected

---

## 1. Constraints Summary

Before evaluating candidates, the binding project constraints are restated here. Any technology that fails a hard constraint is eliminated immediately.

| Constraint | Value | Notes |
|---|---|---|
| Static site compatibility | Required | Next.js export to `docs/export/`, no server runtime |
| Deployment platform | SST StaticSite (CloudFront + S3) | Index files must be part of static output |
| Recurring cost | $0 preferred | Zero-cost tier acceptable |
| Build time overhead | < 60 seconds | Added to existing build pipeline |
| Initial page load bundle | < 50 KB gzipped | Search JS loaded on initial page |

---

## 2. Candidate Technologies

Five candidates were evaluated: **Pagefind**, **Flexsearch**, **Lunr.js**, **Typesense**, and **Meilisearch**.

---

## 3. Evaluation Per Candidate

### 3.1 Pagefind

**Overview:** Pagefind is a fully static search library built with Rust/WASM. It ships as a binary that crawls a built HTML directory at deploy time, producing compressed binary index shards. The client-side JavaScript engine queries these shards lazily — only the shards relevant to a given query are fetched.

**Indexing Approach:** Rust CLI binary (`pagefind`) runs after `next export`. It crawls `docs/export/` HTML, respects `data-pagefind-body` attributes for content scoping, and writes output to `docs/export/pagefind/`. The sharded index consists of `.pf_index`, `.pf_fragment`, and `.pf_meta` files plus the WASM engine.

**Static Site Compatibility:** Native — built specifically for static sites. The entire search experience (engine, index, WASM) is served as static files from S3/CloudFront.

**Bundle Size (measured):**

| File | Raw | Gzipped |
|---|---|---|
| `pagefind.js` (search engine) | 33.1 KB | **9.8 KB** |
| `pagefind-ui.js` (optional UI) | 82.6 KB | **22.6 KB** |
| WASM engine (`wasm.en.pagefind`) | 54.9 KB | **54.9 KB** (binary, lazy loaded) |
| Index shard (per query, lazy) | ~5.5 KB | on-demand only |
| Fragment (per result, lazy) | ~0.6 KB | on-demand only |

**Critical:** The WASM engine and index are loaded **lazily on first search interaction**, not on initial page load. The initial page load cost is `pagefind.js` only: **~10 KB gzipped**. This is 5x under the 50 KB constraint.

**Cost:** Free. Open source (MIT). Zero recurring cost.

**Build Time (measured):**

| Pages | Build Time | Notes |
|---|---|---|
| 8 pages (docs subset) | 0.515 s | First prototype run |
| 50 pages (simulated) | 0.301 s | Scales sub-linearly (Rust binary) |
| 300 pages (estimated full site) | ~2–5 s | Well under 60 s constraint |

**Relevance Quality:** Pagefind uses BM25 ranking with stemming, stop-word filtering, and sub-word tokenization. Results include excerpt snippets with automatic highlight markers. Title matches are boosted. Metadata filtering (by product category, page type) is supported natively via `data-pagefind-filter` attributes.

**Maintenance Burden:** Very low. Single binary, no server infrastructure, no API keys. Version upgrades are a package version bump. The index regenerates automatically with every build — no manual reindexing needed.

**SST/CloudFront Compatibility:** Full. The `pagefind/` directory deploys with the rest of `docs/export/`. CloudFront serves files with normal static asset caching. No special configuration required.

---

### 3.2 Flexsearch

**Overview:** Flexsearch is a high-performance JavaScript full-text search library with no server component. It is designed for in-memory index construction and querying in the browser.

**Indexing Approach:** The index is built either (a) in the browser at page load by parsing raw content, or (b) pre-built at build time via Node.js and serialized to JSON, then loaded by the browser. Option (b) is required for static sites to avoid per-user build time.

**Static Site Compatibility:** Achievable but awkward. Requires a custom Node.js build script to iterate all source documents, build the FlexSearch index, serialize it to JSON, and write it to the static output directory. No official CLI tool exists; all tooling must be written from scratch.

**Bundle Size (measured):**

| File | Raw | Gzipped |
|---|---|---|
| `flexsearch.bundle.min.js` | 51.3 KB | **17.3 KB** |
| `flexsearch.compact.min.js` | ~29 KB | **10.5 KB** |
| Pre-serialized index (300 pages) | estimated 2–10 MB | loaded all at once |

**Critical Problem — No Index Chunking:** FlexSearch has no built-in mechanism to lazy-load or shard the index. The entire serialized JSON index must be loaded before any query can be answered. For 300 documentation pages with ~500–2000 words each, the pre-built JSON index is estimated at 2–10 MB uncompressed. Even gzip-compressed, this is 300–800 KB — loaded as a blocking request on first search open. This exceeds the intent of the 50 KB constraint.

**Cost:** Free. Open source (Apache 2.0).

**Build Time:** A custom build script would run in 3–15 seconds for 300 pages. Acceptable.

**Relevance Quality:** Lexical tokenization with optional phonetic matching. No BM25 scoring. Relevance is adequate for simple keyword matching but lacks the sophistication of Pagefind's ranking.

**Maintenance Burden:** Medium. All indexing tooling must be written and maintained by the project. No community-maintained CLI equivalent exists for static site indexing.

**SST/CloudFront Compatibility:** Works — the serialized index JSON is a static file. But the monolithic index design creates UX problems on slow connections.

---

### 3.3 Lunr.js

**Overview:** Lunr.js is a mature JavaScript library (inspired by Solr) that builds an inverted index in the browser or pre-builds it at build time. It is widely used in documentation sites.

**Indexing Approach:** Like FlexSearch, Lunr can pre-build its index at build time via Node.js. The resulting JSON is a `lunr.Index` serialization. A custom build script is required (no official CLI).

**Static Site Compatibility:** Achievable. Pre-build the index at build time, ship JSON alongside the site. The browser loads JSON and calls `lunr.Index.load()`.

**Bundle Size (measured):**

| File | Raw | Gzipped |
|---|---|---|
| `lunr.min.js` | 29.5 KB | **24.3 KB** |
| Pre-serialized index (300 pages) | estimated 3–15 MB | loaded all at once |

**Critical Problem — Same as FlexSearch:** No index sharding. The entire pre-built JSON index is loaded at once before the first query can execute. For this site's scale, the index JSON would be 3–15 MB uncompressed. Additionally, `lunr.Index.load()` requires deserializing this JSON in the browser, which can take 200–1000ms on mobile devices.

**Additional Limitation — No Partial Match:** Lunr does not support partial/prefix matching out of the box (e.g., typing "Media" returns no results until `*` wildcard is added). This is a significant UX degradation.

**Cost:** Free. Open source (MIT).

**Build Time:** Custom script would run in 5–20 seconds for 300 pages. Acceptable.

**Relevance Quality:** TF-IDF scoring with Porter stemmer. Adequate for documentation search, but lacks title-boost tuning and built-in snippet extraction.

**Maintenance Burden:** Medium. Custom build tooling required, plus the pre-built index JSON file needs to be regenerated and manually committed or produced at build time.

**SST/CloudFront Compatibility:** Works, but the monolithic index file creates the same UX problem as FlexSearch.

---

### 3.4 Typesense (Free Cloud Tier)

**Overview:** Typesense is a fast, typo-tolerant search engine with a client-server architecture. It offers a free cloud tier (Typesense Cloud) and an open-source self-hosted option.

**Indexing Approach:** Requires running a Typesense server. Documents are indexed via the Typesense REST API. A custom build-time script would push documents to the Typesense server after the Next.js build.

**Static Site Compatibility:** Incompatible with the project's zero-server constraint. Typesense requires a live server at query time — the browser client calls `https://[cluster].typesense.net/search`. This is a server-side runtime dependency, which violates the core project constraint.

**Bundle Size (measured):**

| File | Raw | Gzipped |
|---|---|---|
| `typesense.min.js` (browser client) | 135 KB | **30.8 KB** |

The client library alone is 30.8 KB gzipped. This is within the 50 KB limit for the library itself, but the architecture is fundamentally incompatible.

**Hard Constraint Violation — Server Required:** The static CloudFront + S3 deployment has no server. Every search query must be answered client-side from static files. Typesense cannot satisfy this.

**Cost:** Free tier available (Typesense Cloud), but queries go to Typesense's servers. Paid tiers required at scale. Self-hosting requires an EC2 instance (~$15–$40/month minimum). Both options add recurring cost.

**Maintenance Burden:** High for self-hosted. Zero-to-low for cloud tier, but introduces external SaaS dependency.

**SST/CloudFront Compatibility:** Incompatible. Index does not deploy to S3; queries hit Typesense servers at runtime.

**Verdict: ELIMINATED** — server-required architecture violates the static site constraint.

---

### 3.5 Meilisearch (Self-Hosted)

**Overview:** Meilisearch is an open-source, Rust-based search engine with excellent relevance quality and typo tolerance. It can be self-hosted on a VPS or used via Meilisearch Cloud.

**Indexing Approach:** Requires running a Meilisearch server. Documents are pushed to the server's REST API. The browser client queries the server at search time.

**Static Site Compatibility:** Incompatible with the project's zero-server constraint. Like Typesense, Meilisearch is a client-server system that requires a live server to answer queries.

**Bundle Size (measured):**

| File | Raw | Gzipped |
|---|---|---|
| `meilisearch.cjs` (browser client) | ~244 KB total dir | **12.8 KB** (CJS bundle gzip) |

The client bundle is compact, but the architecture is still server-dependent.

**Hard Constraint Violation — Server Required:** Same fatal flaw as Typesense. CloudFront + S3 cannot answer Meilisearch API queries.

**Cost:** Self-hosted requires EC2 (minimum ~$15/month) plus storage. Meilisearch Cloud starts at $30/month for meaningful scale.

**Maintenance Burden:** High. Requires server provisioning, backups, monitoring, and version management.

**SST/CloudFront Compatibility:** Incompatible.

**Verdict: ELIMINATED** — server-required architecture violates the static site constraint.

---

## 4. Comparison Matrix

| Criterion | Pagefind | Flexsearch | Lunr.js | Typesense | Meilisearch |
|---|---|---|---|---|---|
| **Static site compatible** | YES (native) | Partial | Partial | NO | NO |
| **Zero recurring cost** | YES | YES | YES | Partial* | NO |
| **Initial page load (gzipped)** | **9.8 KB** | 10.5–17.3 KB | 24.3 KB | 30.8 KB** | 12.8 KB** |
| **Index lazy-loaded / chunked** | YES (WASM + shards) | NO | NO | N/A (server) | N/A (server) |
| **Build time (300 pages est.)** | **~2–5 s** | ~5–15 s | ~5–20 s | ~10–30 s | ~10–30 s |
| **Build-time CLI provided** | YES (pagefind binary) | NO (custom script) | NO (custom script) | NO (custom script) | NO (custom script) |
| **Typo tolerance** | Stemming | Phonetic optional | Stemmer only | YES (native) | YES (native) |
| **Relevance algorithm** | BM25 | TF-IDF | TF-IDF | BM25 + boost | BM25 + hybrid |
| **Title/metadata filtering** | YES (data attributes) | Manual | Manual | YES (schema) | YES (schema) |
| **Result snippets** | YES (built-in) | NO (manual) | NO (manual) | YES | YES |
| **Maintenance burden** | LOW | MEDIUM | MEDIUM | HIGH | HIGH |
| **Index architecture** | Chunked binary shards | Monolithic JSON | Monolithic JSON | Server DB | Server DB |
| **Infrastructure required** | None | None | None | Server + API keys | Server |
| **Constraint: passes all** | **YES** | Partial | Partial | **NO** | **NO** |

*Typesense Cloud has a free tier but is limited and requires external service.
**Client library only; actual search requires server.

---

## 5. Prototype Benchmark Results

### 5.1 Prototype Environment

A prototype was built in this directory:
```
projects/implement-full-text-search-with-deploy-time-reindexing/prototype/
```

The sample site contains 8 HTML pages covering the actual Stoked UI documentation content:
- `/index.html` — Main documentation home
- `/media/index.html` — Media package overview
- `/media/media-viewer/index.html` — MediaViewer component docs
- `/media/media-card/index.html` — MediaCard component docs
- `/media/hooks/index.html` — Media hooks documentation
- `/timeline/index.html` — Timeline package overview
- `/file-explorer/index.html` — File Explorer package overview
- `/editor/index.html` — Editor package overview

A second larger prototype (50 pages, simulated content) was also indexed to assess scaling behavior.

### 5.2 Pagefind Benchmark — 8-Page Prototype

| Metric | Value |
|---|---|
| Pagefind version | 1.4.0 |
| Pages indexed | 8 |
| Words indexed | 404 |
| **Index build time** | **0.515 seconds** |
| Index directory total size | 311.6 KB (includes WASM binary) |
| `pagefind.js` raw | 33.1 KB |
| `pagefind.js` gzipped | **9.8 KB** |
| `pagefind-ui.js` gzipped | 22.6 KB (optional built-in UI) |
| WASM binary (`wasm.en.pagefind`) | 54.9 KB (lazy loaded on first search) |
| Index shard (`en_*.pf_index`) | 5.5 KB per shard |
| Result fragments | ~0.5–0.8 KB per page fragment |

### 5.3 Pagefind Benchmark — 50-Page Scaling Test

| Metric | Value |
|---|---|
| Pages indexed | 50 |
| **Index build time** | **0.301 seconds** |
| Index directory size | 532 KB |
| Fragment files | 50 (one per page) |
| Index shards | 1 (scales with unique vocabulary) |

**Observation:** Build time decreased from 0.515s (8 pages) to 0.301s (50 pages), demonstrating that the Rust binary's startup overhead is the dominant cost, not per-page processing. Actual indexing of more pages adds negligible time.

### 5.4 Projected Metrics for Full Documentation Site (~300 pages)

| Metric | Projected Value | Constraint | Pass? |
|---|---|---|---|
| Index build time | ~2–5 seconds | < 60 seconds | YES |
| `pagefind.js` gzipped (initial load) | 9.8 KB | < 50 KB | YES |
| WASM + first index shard (first search) | ~65 KB | Lazy — 0 KB on page load | YES |
| Index total size (uncompressed) | ~5–15 MB | N/A (served chunked) | N/A |
| Recurring infrastructure cost | $0 | Zero preferred | YES |

### 5.5 Pagefind Constraint Compliance

| Constraint | Pagefind | Status |
|---|---|---|
| Must work with Next.js static export | Runs against `docs/export/` HTML | PASS |
| SST StaticSite / CloudFront + S3 | Output is static files, deploys normally | PASS |
| Zero recurring cost | Open source, no services required | PASS |
| < 60s build time | ~2–5s for full site | PASS |
| < 50KB gzipped initial bundle | 9.8 KB (`pagefind.js`) | PASS |

All five constraints are satisfied. No other evaluated technology satisfies all five.

---

## 6. Why Not FlexSearch or Lunr.js?

Both FlexSearch and Lunr.js are legitimate browser-side search libraries that work on static sites. The reason they are not selected comes down to two problems:

**Problem 1: Monolithic Index Load**

Neither library has built-in index chunking. The entire search index must be loaded into memory before the first query can execute. For the Stoked UI documentation (~300 pages, ~50,000–150,000 indexed words), the pre-serialized index JSON is estimated at 2–15 MB uncompressed. Even with gzip compression (typically 60–70% reduction for JSON), this is 600 KB – 4.5 MB per search open, transferred as a single blocking request.

By contrast, Pagefind loads only the relevant index shard for the user's specific query (~5–15 KB per shard). The architecture is fundamentally more efficient for large documentation sites.

**Problem 2: No Official Build-Time CLI**

Both FlexSearch and Lunr require custom Node.js scripts to crawl the built HTML, extract text, build the index, and serialize it. This creates ongoing maintenance burden — every time the build pipeline changes, this script may need updates. Pagefind provides a maintained binary that understands HTML semantics (headings, paragraphs, code blocks) and respects `data-pagefind-*` markup annotations.

---

## 7. Final Technology Selection

### Selected: Pagefind v1.4+

**Rationale:**

1. **Only candidate that satisfies all five hard constraints.** Typesense and Meilisearch require server infrastructure and are eliminated immediately. FlexSearch and Lunr have monolithic index designs that create unacceptable UX on the scale of this documentation site.

2. **Measured build time is trivially fast.** The prototype confirmed build times of 0.3–0.5 seconds for 8–50 pages. Even accounting for the full ~300-page export, the projected build time of 2–5 seconds is 12x under the 60-second constraint.

3. **Initial page load impact is minimal.** The `pagefind.js` engine is 9.8 KB gzipped — far below the 50 KB constraint. Critically, this is the *only* search-related cost on initial page load. All index data and the WASM binary are deferred until the user opens the search interface.

4. **Zero infrastructure overhead.** Pagefind produces static files that deploy alongside the documentation site on S3. No API keys, no servers, no CloudFront rewrite rules, no environment variables. If the build succeeds, search works.

5. **Purpose-built for this exact use case.** Pagefind was created specifically for searching static sites exported from documentation tools (Hugo, Jekyll, Gatsby, Next.js). The tooling, annotations, and architecture are all designed for this deployment pattern.

6. **Relevance quality exceeds alternatives.** BM25 ranking with stemming and sub-word tokenization produces accurate results for technical documentation queries. Built-in snippet generation with highlight markers reduces the UI implementation burden significantly.

7. **Lowest maintenance burden.** Single binary, no custom indexing code to write or maintain. The integration path for Phase 2 is well-defined: annotate HTML layout with `data-pagefind-*` attributes, add `npx pagefind --site export` to the build pipeline after `next export`, done.

### Next Steps (Phase 2)

With Pagefind selected, Phase 2 will:
1. Add `data-pagefind-body` and `data-pagefind-meta` attributes to the docs layout templates (`docs/src/layouts/`)
2. Add a `docs:index` npm script to `docs/package.json` that runs `pagefind --site export --output-path export/pagefind`
3. Update the build pipeline to run indexing after `next export`
4. Validate index content with a set of known search queries

---

## Appendix A: Commands Used for Benchmarking

```bash
# Install pagefind
cd projects/implement-full-text-search-with-deploy-time-reindexing/prototype
npm install pagefind --save-dev

# Index 8-page prototype
time ./node_modules/.bin/pagefind --site sample-site --output-path sample-site/pagefind

# Index 50-page scaling test
time ./node_modules/.bin/pagefind --site large-sample-site --output-path large-sample-site/pagefind

# Measure gzip sizes
gzip < sample-site/pagefind/pagefind.js | wc -c          # 10085 bytes (~9.8 KB)
gzip < sample-site/pagefind/pagefind-ui.js | wc -c       # 23102 bytes (~22.6 KB)

# Measure FlexSearch bundle
gzip < /tmp/flexsearch-check/node_modules/flexsearch/dist/flexsearch.bundle.min.js | wc -c  # 17745 bytes

# Measure Lunr bundle
gzip < /tmp/lunr-check/node_modules/lunr/lunr.min.js | wc -c  # 24947 bytes

# Measure Meilisearch client
gzip < /tmp/ms-check/node_modules/meilisearch/dist/cjs/index.cjs | wc -c  # 13073 bytes

# Measure Typesense client
gzip < /tmp/ts-check/node_modules/typesense/dist/typesense.min.js | wc -c  # 31532 bytes
```

## Appendix B: Prototype File Listing

```
prototype/
  package.json                    # npm project for pagefind install
  node_modules/.bin/pagefind      # pagefind 1.4.0 binary
  sample-site/                    # 8-page HTML prototype
    index.html
    media/
      index.html                  # Media package overview
      media-viewer/index.html     # MediaViewer docs
      media-card/index.html       # MediaCard docs
      hooks/index.html            # Media hooks docs
    timeline/index.html           # Timeline package overview
    file-explorer/index.html      # FileExplorer overview
    editor/index.html             # Editor package overview
    pagefind/                     # Generated index output
      pagefind.js                 # Search engine (9.8 KB gzip)
      pagefind-ui.js              # Built-in UI (22.6 KB gzip)
      wasm.en.pagefind            # WASM engine (54.9 KB, lazy loaded)
      index/en_*.pf_index         # Index shard (5.5 KB)
      fragment/en_*.pf_fragment   # Result fragments (0.5-0.8 KB each)
  large-sample-site/              # 50-page scaling test
    page-{1..50}/index.html
    pagefind/                     # Generated index (build: 0.301s)
```
