# Product Requirements Document (Sequential)

## 0. Source Context
**Derived From:** Feature Brief (`projects/build-multi-platform-blog-system/pfb.md`)
**Feature Name:** Multi-Platform Blog System
**PRD Owner:** Brian Stoker / Stoked Consulting
**Last Updated:** 2026-02-19

### Feature Brief Summary
Build a complete blog management system spanning API, MCP tooling, and front-end UX that enables blog posts to be authored, managed, and published across stoked-ui.com (also served as stokedconsulting.com) and brianstoker.com. The system replaces the current static-only markdown blog infrastructure (forked from MUI) with a hybrid approach: a NestJS API backed by MongoDB for dynamic blog content, an MCP server for agent-driven authoring, a web-based editor for human authors, domain-based access control, and Nostr public key integration. The existing 71 MUI blog posts continue to render via the current SSG pipeline while new SUI-native posts are served through the API and also available for SSG at build time.

---

## 1. Objectives & Constraints

### Objectives
1. **Fix existing bugs** -- Resolve the duplicate directory bug in `docs/lib/sourcing.ts` (line 6), fix the hardcoded `mui.com` RSS feed URL in `docs/scripts/generateRSSFeed.ts` (line 10), add SUI authors to `docs/src/modules/components/TopLayoutBlog.js`, and create the missing `docs/pages/blog/sui/` directory
2. **Blog API** -- Deliver a RESTful NestJS blog module within the existing `sui-media-api` package with full CRUD operations, tag management, author management, publishing workflow, and multi-site support
3. **JWT Authentication** -- Replace the mock `AuthGuard` with real JWT-based authentication supporting domain-based auto-authorization for `@stokedconsulting.com`, `@stoked-ui.com`, and `@brianstoker.com` email domains
4. **Blog Editor UX** -- Ship a web-based blog authoring interface within the docs site with markdown editing, live preview, frontmatter management, image upload, and publish controls
5. **MCP Server** -- Build an MCP tool server that exposes blog operations for AI agent-driven authoring, as a thin wrapper over the REST API
6. **Multi-Site Publishing** -- Enable posts to target stoked-ui.com, brianstoker.com, or both, with a public read endpoint for cross-site consumption
7. **Nostr Integration** -- Poll configured Nostr relays for long-form content events (NIP-23, kind 30023) from specified npub keys and surface them in the blog feed
8. **Hybrid Rendering** -- Support both SSG (build-time markdown) and API-served (runtime) blog content so posts authored via the API are available without requiring a full site rebuild
9. **Restore Lost Posts** -- Recover or recreate previously existing SUI blog posts lost during the MUI default reversion

### Constraints

**Technical:**
- Must integrate with the existing pnpm + Turbo monorepo build system
- NestJS 10.x, Mongoose 8.x, MongoDB -- matching existing `sui-media-api` stack
- React 18.3.1, Next.js (pages router), MUI v5 -- matching existing docs site
- SST (Serverless Stack) deployment to AWS -- matching existing `sst.config.ts` infrastructure
- Blog API must support AWS Lambda deployment (following the `lambda.bootstrap.ts` pattern in `sui-media-api`)

**Operational:**
- The blog must not break the existing MUI blog post rendering pipeline (71 markdown posts in `docs/pages/blog/mui/`)
- RSS feed generation must continue to work at build time and should include API-sourced posts
- The `ALLOWED_TAGS` / `SUI_TAGS` / `ALL_TAGS` validation in `sourcing.ts` must remain compatible with both markdown-sourced and API-sourced posts

**Security:**
- Blog authoring must be authenticated and authorized (JWT with role-based access)
- Public read endpoints must not expose draft content or private metadata
- API keys for MCP access must be securely managed via environment variables

**Performance:**
- Blog listing page must remain fast (currently SSG); API-sourced posts should be cached or pre-rendered at build time
- Nostr polling must not block page rendering; it runs as a background service

---

## 1.5 Required Toolchain

> All tools below must be available before implementation begins. The project primarily uses the standard Node.js/TypeScript toolchain already present in the monorepo, plus a few additions for the blog API and integrations.

| Tool | Min Version | Install Command | Verify Command |
|------|------------|-----------------|----------------|
| node | 18+ | `nvm install 18` | `node --version` |
| pnpm | 8+ | `npm install -g pnpm` | `pnpm --version` |
| turbo | 1.10+ | `pnpm add -g turbo` | `turbo --version` |
| nest CLI | 10.3+ | `pnpm add -g @nestjs/cli` | `nest --version` |
| MongoDB | 6.0+ | Docker: `docker run -d -p 27017:27017 mongo:6` | `mongosh --eval "db.runCommand({ping:1})"` |
| AWS CLI | 2.0+ | `brew install awscli` | `aws --version` |
| git | 2.30+ | (pre-installed) | `git --version` |

---

## 2. Execution Phases

> Phases below are ordered and sequential.
> A phase cannot begin until all acceptance criteria of the previous phase are met.

---

## Phase 1: Foundation & Bug Fixes
**Purpose:** Establish the SUI blog infrastructure by fixing known bugs, creating the missing directory structure, adding SUI authors, restoring lost posts, and ensuring the existing blog pipeline works correctly for both MUI and SUI content. This phase has zero external dependencies and unblocks all subsequent phases.

### 1.1 Fix `sourcing.ts` Duplicate Directory Bug

The `blogDir` variable on line 6 of `docs/lib/sourcing.ts` currently duplicates `blogMuiDir`, both pointing to `pages/blog/mui`. This means `getBlogFilePaths()` reads the MUI directory twice and never reads SUI posts. Additionally, `getBlogPost()` on line 28 reads from `blogDir` which should be the SUI directory but currently reads from the MUI directory.

**Implementation Details**
- File affected: `docs/lib/sourcing.ts`
- Change line 6 from `const blogDir = path.join(process.cwd(), 'pages/blog/mui');` to `const blogDir = path.join(process.cwd(), 'pages/blog/sui');`
- Update `getBlogPost()` to determine the correct directory based on which source the file came from (MUI vs SUI). Currently it always reads from `blogDir`. Refactor to accept or derive the source directory.
- Add the `sui: true` flag to posts sourced from the SUI directory so the blog listing page routes them correctly (the `blog.tsx` PostPreview already checks `props.sui` for link routing)
- Ensure `getBlogFilePaths()` handles the case where `docs/pages/blog/sui/` is empty (no error on `readdirSync` of an empty directory)
- Failure mode: If `docs/pages/blog/sui/` does not exist, `readdirSync` will throw ENOENT. Add a guard with `fs.existsSync()`.

**Acceptance Criteria**

_Structural (code exists and is correct):_
- AC-1.1.a: `blogDir` on line 6 of `docs/lib/sourcing.ts` resolves to `pages/blog/sui` (not `pages/blog/mui`)
- AC-1.1.b: `getBlogFilePaths()` returns file paths from both `pages/blog/mui` and `pages/blog/sui` without duplicates
- AC-1.1.c: `getBlogPost()` reads files from the correct source directory (MUI files from MUI dir, SUI files from SUI dir)

_Executable (verified by running a command):_
- AC-1.1.d: `grep -n "pages/blog/sui" docs/lib/sourcing.ts` returns at least one match on line 6
- AC-1.1.e: The docs site builds successfully with the fix applied

**Acceptance Tests**
- Test-1.1.a: Unit -- Verify `blogDir` does not equal `blogMuiDir` by inspecting the source
- Test-1.1.b: Integration -- `getBlogFilePaths()` called with an empty `sui/` dir returns only MUI posts without error
- Test-1.1.c: Integration -- `getBlogFilePaths()` with a test `.md` file in `sui/` returns that file in the concatenated list
- Test-1.1.d: Regression -- Existing MUI blog post rendering is unaffected
- Test-1.1.e: Integration -- Posts from the SUI directory have `sui: true` set in their `BlogPost` output

**Verification Commands**
```bash
# Verify blogDir points to sui
grep -n "pages/blog/sui" /Users/stoked/work/stoked-ui/docs/lib/sourcing.ts | grep "blogDir" && echo "PASS: blogDir points to sui" || echo "FAIL"

# Verify blogMuiDir still points to mui
grep -n "pages/blog/mui" /Users/stoked/work/stoked-ui/docs/lib/sourcing.ts | grep "blogMuiDir" && echo "PASS: blogMuiDir points to mui" || echo "FAIL"

# Verify the docs site type-checks
cd /Users/stoked/work/stoked-ui && pnpm --filter docs run typescript
```

---

### 1.2 Create `docs/pages/blog/sui/` Directory and Add Placeholder Post

The SUI blog directory does not exist. Without it, `sourcing.ts` will fail on `readdirSync`. A placeholder introductory blog post should be created to validate the full pipeline.

**Implementation Details**
- Create directory: `docs/pages/blog/sui/`
- Create a placeholder blog post: `docs/pages/blog/sui/introducing-stoked-ui.md` with valid frontmatter (title, description, tags from `SUI_TAGS`, authors including `brianstoker`, date, `manualCard: false`)
- Create the corresponding `.js` page file (`docs/pages/blog/sui/introducing-stoked-ui.js`) following the pattern of MUI blog `.js` files (which import `TopLayoutBlog` and the markdown content)
- The placeholder post serves as an end-to-end validation that SUI blog posts render correctly
- Failure mode: If the `.js` page file is missing, Next.js will not route to the blog post

**Acceptance Criteria**

_Structural (code exists and is correct):_
- AC-1.2.a: Directory `docs/pages/blog/sui/` exists
- AC-1.2.b: File `docs/pages/blog/sui/introducing-stoked-ui.md` exists with valid frontmatter containing `title`, `description`, `tags` (from SUI_TAGS or ALLOWED_TAGS), `authors` (including `brianstoker`), `date`, and `manualCard`
- AC-1.2.c: File `docs/pages/blog/sui/introducing-stoked-ui.js` exists and exports a page component using `TopLayoutBlog`

_Executable (verified by running a command):_
- AC-1.2.d: `ls docs/pages/blog/sui/introducing-stoked-ui.md` exits 0
- AC-1.2.e: The docs site builds without errors and the post is included in `getAllBlogPosts()` output

**Acceptance Tests**
- Test-1.2.a: Filesystem -- The `sui/` directory and both files exist
- Test-1.2.b: Content -- The markdown frontmatter passes the `ALL_TAGS` validation in `getAllBlogPosts()`
- Test-1.2.c: Rendering -- The `.js` page file is a valid Next.js page that renders without error
- Test-1.2.d: Integration -- `getAllBlogPosts()` returns the new post with `sui: true`
- Test-1.2.e: Regression -- The 71 MUI blog posts still appear in `getAllBlogPosts()` output

**Verification Commands**
```bash
# Directory exists
test -d /Users/stoked/work/stoked-ui/docs/pages/blog/sui && echo "PASS: sui dir exists" || echo "FAIL"

# Markdown file exists
test -f /Users/stoked/work/stoked-ui/docs/pages/blog/sui/introducing-stoked-ui.md && echo "PASS: md file exists" || echo "FAIL"

# JS page file exists
test -f /Users/stoked/work/stoked-ui/docs/pages/blog/sui/introducing-stoked-ui.js && echo "PASS: js file exists" || echo "FAIL"

# Build docs to validate pipeline
cd /Users/stoked/work/stoked-ui && pnpm --filter docs run build
```

---

### 1.3 Fix RSS Feed URL and Add SUI Authors

Two independent fixes: (a) The RSS feed generator hardcodes `https://mui.com/feed` as the site URL, and (b) the `authors` object in `TopLayoutBlog.js` contains only MUI team members.

**Implementation Details**

*RSS Feed Fix:*
- File: `docs/scripts/generateRSSFeed.ts`, line 10
- Change `const siteUrl = 'https://mui.com/feed';` to `const siteUrl = 'https://stoked-ui.com';`
- The `/feed` suffix was incorrect; the `siteUrl` is used as a base for constructing blog post URLs (`${siteUrl}/blog/${post.slug}`), so it should be the domain root
- The feed links use `${siteUrl}/public${ROUTES.rssFeed}` which resolves to the correct RSS path

*Authors Fix:*
- File: `docs/src/modules/components/TopLayoutBlog.js`, lines 23-129
- Add Brian Stoker to the `authors` object with GitHub username `brianstoker`, avatar URL from `https://avatars.githubusercontent.com/u/<brian-github-id>`, and name `Brian Stoker`
- The author key should be `brianstoker` (lowercase, matching GitHub username convention used by other entries)

*Failure modes:*
- If the siteUrl still contains `/feed`, all blog post links in the RSS will be double-pathed
- If the author key does not match what is used in blog post frontmatter, `TopLayoutBlog` will throw when trying to access `authors[author].name`

**Acceptance Criteria**

_Structural (code exists and is correct):_
- AC-1.3.a: `siteUrl` in `generateRSSFeed.ts` is `'https://stoked-ui.com'` (no `/feed` suffix)
- AC-1.3.b: The `authors` object in `TopLayoutBlog.js` contains a `brianstoker` entry with `name`, `avatar`, and `github` fields

_Executable (verified by running a command):_
- AC-1.3.c: `grep -c "mui.com" docs/scripts/generateRSSFeed.ts` returns `0` (no references to mui.com remain)
- AC-1.3.d: `grep -c "brianstoker" docs/src/modules/components/TopLayoutBlog.js` returns at least `1`

**Acceptance Tests**
- Test-1.3.a: Content -- RSS siteUrl matches `https://stoked-ui.com` exactly
- Test-1.3.b: Content -- `brianstoker` author entry has all three required fields (name, avatar, github)
- Test-1.3.c: Regression -- Existing MUI author entries are unchanged
- Test-1.3.d: Integration -- A blog post with `authors: ['brianstoker']` in frontmatter renders without error in `TopLayoutBlog`

**Verification Commands**
```bash
# No mui.com references in RSS generator
grep -c "mui.com" /Users/stoked/work/stoked-ui/docs/scripts/generateRSSFeed.ts | grep "^0$" && echo "PASS: no mui.com in RSS" || echo "FAIL"

# stoked-ui.com is the siteUrl
grep "stoked-ui.com" /Users/stoked/work/stoked-ui/docs/scripts/generateRSSFeed.ts && echo "PASS: correct siteUrl" || echo "FAIL"

# Brian Stoker author exists
grep "brianstoker" /Users/stoked/work/stoked-ui/docs/src/modules/components/TopLayoutBlog.js && echo "PASS: author exists" || echo "FAIL"

# Type-check passes
cd /Users/stoked/work/stoked-ui && pnpm --filter docs run typescript
```

---

### 1.4 Restore Lost SUI Blog Posts

Previously existing SUI blog posts were lost when the codebase reverted to MUI defaults. Search git history for any committed SUI content and restore it, or create foundational posts if none are recoverable.

**Implementation Details**
- Search git log and reflog for any files previously in `docs/pages/blog/sui/` or any blog-related commits mentioning SUI/stoked
- Command: `git log --all --diff-filter=D -- 'docs/pages/blog/sui/*'` and `git log --all --diff-filter=D -- 'docs/pages/blog/*.md'`
- If posts are found: restore them from the commit where they last existed using `git show <commit>:<path>`
- If no posts are recoverable: create 2-3 foundational blog posts:
  - `introducing-stoked-ui.md` (already created in 1.2)
  - `stoked-ui-file-explorer.md` -- Announcing the File Explorer component
  - `stoked-ui-timeline-editor.md` -- Announcing the Timeline and Editor components
- Each post must have valid frontmatter with tags from `ALL_TAGS`, authors including `brianstoker`, and corresponding `.js` page files
- Failure mode: Restored posts may reference tags not in the current `ALL_TAGS` list -- validate and update tags as needed

**Acceptance Criteria**

_Structural (code exists and is correct):_
- AC-1.4.a: At least 2 SUI blog posts exist in `docs/pages/blog/sui/` (each with `.md` and `.js` files)
- AC-1.4.b: All restored/created posts have valid frontmatter that passes the `ALL_TAGS` whitelist validation

_Executable (verified by running a command):_
- AC-1.4.c: `ls docs/pages/blog/sui/*.md | wc -l` returns at least `2`
- AC-1.4.d: `getAllBlogPosts()` runs without tag validation errors and includes SUI posts

**Acceptance Tests**
- Test-1.4.a: Filesystem -- At least 2 `.md` and 2 `.js` files exist in `docs/pages/blog/sui/`
- Test-1.4.b: Validation -- All SUI post tags are in the `ALL_TAGS` list
- Test-1.4.c: Integration -- The blog listing page renders and shows SUI posts
- Test-1.4.d: Regression -- All 71 MUI posts still render without error

**Verification Commands**
```bash
# At least 2 SUI blog posts
test $(ls /Users/stoked/work/stoked-ui/docs/pages/blog/sui/*.md 2>/dev/null | wc -l) -ge 2 && echo "PASS: >=2 SUI posts" || echo "FAIL"

# Matching JS page files
test $(ls /Users/stoked/work/stoked-ui/docs/pages/blog/sui/*.js 2>/dev/null | wc -l) -ge 2 && echo "PASS: >=2 JS page files" || echo "FAIL"

# Full docs build succeeds (validates tag whitelist and rendering)
cd /Users/stoked/work/stoked-ui && pnpm --filter docs run build
```

---

### 1.5 Extend Tag Whitelist for Blog Content

The existing `ALLOWED_TAGS` and `SUI_TAGS` arrays in `sourcing.ts` need new tags to support the blog system's broader content categories (consulting, announcements, tutorials, etc.).

**Implementation Details**
- File: `docs/lib/sourcing.ts`
- Add the following tags to `SUI_TAGS` (or a new `BLOG_TAGS` array merged into `ALL_TAGS`):
  - `Consulting` -- Stoked Consulting content
  - `Announcement` -- Product and company announcements
  - `Tutorial` -- How-to guides and walkthroughs
  - `Release` -- Version release posts
  - `Personal` -- Content for brianstoker.com
  - `Nostr` -- Nostr-sourced content
  - `Editor` -- Stoked UI Editor component (currently `Video Editor`, this provides a shorter alias)
- Ensure `ALL_TAGS` is the union of all tag arrays with no duplicates
- Failure mode: Duplicate tag entries could cause double-counting in `tagInfo`

**Acceptance Criteria**

_Structural (code exists and is correct):_
- AC-1.5.a: Tags `Consulting`, `Announcement`, `Tutorial`, `Release`, `Personal`, and `Nostr` are all present in the tag whitelist (either in `SUI_TAGS`, a new array, or `ALL_TAGS`)
- AC-1.5.b: `ALL_TAGS` has no duplicate entries

_Executable (verified by running a command):_
- AC-1.5.c: `grep -c "'Consulting'" docs/lib/sourcing.ts` returns at least `1`
- AC-1.5.d: The docs site builds without tag validation errors

**Acceptance Tests**
- Test-1.5.a: Content -- All six new tags appear in `ALL_TAGS` after the arrays are merged
- Test-1.5.b: Uniqueness -- `new Set(ALL_TAGS).size === ALL_TAGS.length` (no duplicates)
- Test-1.5.c: Integration -- A blog post using the tag `Announcement` passes validation in `getAllBlogPosts()`

**Verification Commands**
```bash
# New tags present
for tag in Consulting Announcement Tutorial Release Personal Nostr; do
  grep -q "'$tag'" /Users/stoked/work/stoked-ui/docs/lib/sourcing.ts && echo "PASS: $tag found" || echo "FAIL: $tag missing"
done

# Build succeeds
cd /Users/stoked/work/stoked-ui && pnpm --filter docs run typescript
```

---

## Phase 2: Blog API & Data Layer
**Purpose:** This phase builds the server-side blog infrastructure. It cannot start until Phase 1 completes because: (a) the `BlogPost` TypeScript interface in `sourcing.ts` must be stable (fixed in 1.1), (b) the tag whitelist must be finalized (1.5), and (c) the authors list must include SUI authors (1.3) so the API can reference them. Phase 2 delivers the NestJS blog module, MongoDB model, CRUD endpoints, and authentication -- the foundation for the editor UX (Phase 3) and MCP server (Phase 4).

### 2.1 Create BlogPost Mongoose Model

Define the MongoDB data model for blog posts, extending the existing `BaseModel` pattern from `sui-common-api`.

**Implementation Details**
- New file: `packages/sui-common-api/src/models/blogPost.model.ts`
- The `BlogPost` class extends `File` (which extends `BaseModel`), following the same inheritance pattern as `Media`
- Fields:
  - `title` (String, required, indexed) -- Post title
  - `slug` (String, required, unique, indexed) -- URL-safe identifier
  - `body` (String, required) -- Markdown content
  - `description` (String, required) -- Short summary for previews and SEO
  - `image` (String, optional) -- Featured image URL (S3 key or full URL)
  - `tags` (Array of String, required, validated against tag whitelist) -- Content categories
  - `authors` (Array of String, required) -- Author identifiers matching the `authors` object keys
  - `date` (Date, required) -- Publication date
  - `status` (String, enum: `draft` | `published` | `archived`, default: `draft`, indexed) -- Publishing state
  - `targetSites` (Array of String, default: `['stoked-ui.com']`) -- Domains where the post should appear
  - `nostrEventId` (String, optional, sparse index) -- Nostr event ID if sourced from Nostr
  - `source` (String, enum: `native` | `nostr` | `import`, default: `native`) -- Content origin
- Create `BlogPostSchema` with `SchemaFactory.createForClass(BlogPost)`
- Copy `BaseModelSchema.methods` to `BlogPostSchema.methods` (following the `MediaSchema` pattern)
- Add search indexes:
  - Text index on `title`, `description`, `tags` (weights: title=10, tags=5, description=1)
  - Compound index on `status` + `date` (desc) for feed queries
  - Compound index on `targetSites` + `status` + `date` (desc) for multi-site queries
  - Unique index on `slug`
  - Sparse index on `nostrEventId`
- Export `BlogPostFeature: ModelDefinition` for registration in `DatabaseModule`
- Re-export from `packages/sui-common-api/src/models/index.ts`
- Failure modes: Schema validation errors if required fields are missing; unique constraint violations on duplicate slugs

**Acceptance Criteria**

_Structural (code exists and is correct):_
- AC-2.1.a: File `packages/sui-common-api/src/models/blogPost.model.ts` exists and exports `BlogPost` class, `BlogPostSchema`, and `BlogPostFeature`
- AC-2.1.b: `BlogPost` extends `File` (which extends `BaseModel`), inheriting likes, views, publicity, and access control fields
- AC-2.1.c: All required fields (`title`, `slug`, `body`, `description`, `tags`, `authors`, `date`) have `required: true` or equivalent
- AC-2.1.d: `slug` has a unique index
- AC-2.1.e: Text search index is defined on `title`, `description`, `tags`

_Executable (verified by running a command):_
- AC-2.1.f: `pnpm --filter @stoked-ui/common-api run build` exits 0

**Acceptance Tests**
- Test-2.1.a: Unit -- BlogPost model can be instantiated with all required fields
- Test-2.1.b: Unit -- BlogPost model rejects creation without required fields (validation error)
- Test-2.1.c: Unit -- Duplicate `slug` values are rejected by the unique index
- Test-2.1.d: Unit -- `status` only accepts `draft`, `published`, or `archived`
- Test-2.1.e: Unit -- `BlogPostFeature` is a valid `ModelDefinition` with name and schema
- Test-2.1.f: Integration -- `BlogPostSchema` has `like`, `dislike`, `view`, and `delete` methods from `BaseModelSchema`

**Verification Commands**
```bash
# Model file exists
test -f /Users/stoked/work/stoked-ui/packages/sui-common-api/src/models/blogPost.model.ts && echo "PASS" || echo "FAIL"

# Package builds
cd /Users/stoked/work/stoked-ui && pnpm --filter @stoked-ui/common-api run build

# Model is exported from index
grep -q "blogPost" /Users/stoked/work/stoked-ui/packages/sui-common-api/src/models/index.ts && echo "PASS: exported" || echo "FAIL"
```

---

### 2.2 Create Blog NestJS Module with CRUD Endpoints

Build the NestJS module (controller, service, DTOs) for blog post management within the `sui-media-api` package, following the existing `MediaModule` pattern.

**Implementation Details**

*New files in `packages/sui-media-api/src/blog/`:*
- `blog.module.ts` -- NestJS module importing `MongooseModule.forFeature([BlogPostFeature])`, providing `BlogService`, `BlogController`
- `blog.controller.ts` -- REST controller at `/blog` path with Swagger decorators on every endpoint
- `blog.service.ts` -- Service layer with MongoDB operations via Mongoose
- `dto/create-blog-post.dto.ts` -- Validation DTO for creation
- `dto/update-blog-post.dto.ts` -- Partial update DTO
- `dto/query-blog-posts.dto.ts` -- Query/filter/pagination DTO (following `QueryMediaDto` pattern)
- `dto/blog-post-response.dto.ts` -- Response DTO with Swagger decorators
- `dto/index.ts` -- Barrel export

*Endpoints:*
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST /blog` | Create | AuthGuard | Create a new blog post (defaults to draft status) |
| `GET /blog` | List | AuthGuard | List/search/filter posts with pagination |
| `GET /blog/public` | Public List | None | List published posts filtered by `site` query param |
| `GET /blog/tags` | Tags | None | Get all available tags with counts |
| `GET /blog/authors` | Authors | None | Get all authors |
| `GET /blog/:slug` | Read | None (published) / AuthGuard (drafts) | Get a single post by slug |
| `PATCH /blog/:slug` | Update | AuthGuard | Update post fields |
| `DELETE /blog/:slug` | Delete | AuthGuard | Soft-delete a post |
| `POST /blog/:slug/publish` | Publish | AuthGuard | Set status to `published` and date to now if unset |
| `POST /blog/:slug/unpublish` | Unpublish | AuthGuard | Set status back to `draft` |

*Registration:*
- Add `BlogModule` to `imports` array in `packages/sui-media-api/src/app.module.ts`
- Add `BlogPostFeature` to `MongooseModule.forFeature()` in `packages/sui-media-api/src/database/database.module.ts`

*Failure modes:*
- 404 on slug lookup (service returns `NotFoundException`)
- 409 on duplicate slug creation (catch MongoDB duplicate key error, return `ConflictException`)
- 400 on invalid tags (validate against whitelist)
- 401 on unauthenticated access to protected endpoints

**Acceptance Criteria**

_Structural (code exists and is correct):_
- AC-2.2.a: `BlogModule` is registered in `AppModule.imports`
- AC-2.2.b: All 10 endpoints listed above exist in `BlogController` with correct HTTP methods and paths
- AC-2.2.c: All endpoints have Swagger decorators (`@ApiOperation`, `@ApiResponse`, `@ApiTags('Blog')`)
- AC-2.2.d: Protected endpoints use `@UseGuards(AuthGuard)`
- AC-2.2.e: `GET /blog/public` does NOT use `AuthGuard` and filters to `status: 'published'` only

_Executable (verified by running a command):_
- AC-2.2.f: `pnpm --filter @stoked-ui/media-api run build` exits 0
- AC-2.2.g: `pnpm --filter @stoked-ui/media-api run test` exits 0 with all blog tests passing

**Acceptance Tests**
- Test-2.2.a: Unit -- `BlogService.create()` creates a blog post in MongoDB and returns it with an `id`
- Test-2.2.b: Unit -- `BlogService.findBySlug()` returns a post when it exists, throws `NotFoundException` when it does not
- Test-2.2.c: Unit -- `BlogService.publish()` sets `status` to `published` and sets `date` if not already set
- Test-2.2.d: Unit -- `BlogService.findAll()` supports pagination with `limit` and `offset`
- Test-2.2.e: Integration -- `POST /blog` with valid body returns 201 with the created post
- Test-2.2.f: Integration -- `GET /blog/public?site=stoked-ui.com` returns only published posts targeting that site
- Test-2.2.g: Integration -- `POST /blog` without auth returns 401
- Test-2.2.h: Integration -- `POST /blog` with duplicate slug returns 409

**Verification Commands**
```bash
# Blog module files exist
test -f /Users/stoked/work/stoked-ui/packages/sui-media-api/src/blog/blog.module.ts && echo "PASS" || echo "FAIL"
test -f /Users/stoked/work/stoked-ui/packages/sui-media-api/src/blog/blog.controller.ts && echo "PASS" || echo "FAIL"
test -f /Users/stoked/work/stoked-ui/packages/sui-media-api/src/blog/blog.service.ts && echo "PASS" || echo "FAIL"

# BlogModule registered in AppModule
grep -q "BlogModule" /Users/stoked/work/stoked-ui/packages/sui-media-api/src/app.module.ts && echo "PASS: registered" || echo "FAIL"

# Package builds and tests pass
cd /Users/stoked/work/stoked-ui && pnpm --filter @stoked-ui/media-api run build
cd /Users/stoked/work/stoked-ui && pnpm --filter @stoked-ui/media-api run test
```

---

### 2.3 Implement JWT Authentication

Replace the mock `AuthGuard` with real JWT-based authentication. This is a prerequisite for the blog editor (Phase 3) and must support domain-based auto-authorization.

**Implementation Details**
- File: `packages/sui-media-api/src/media/guards/auth.guard.ts` -- Replace mock implementation with JWT verification
- New file: `packages/sui-media-api/src/auth/auth.module.ts` -- Auth module with JWT strategy
- New file: `packages/sui-media-api/src/auth/auth.service.ts` -- Token generation and validation
- New file: `packages/sui-media-api/src/auth/auth.controller.ts` -- Login/register endpoints
- New file: `packages/sui-media-api/src/auth/strategies/jwt.strategy.ts` -- Passport JWT strategy
- New file: `packages/sui-media-api/src/auth/guards/roles.guard.ts` -- Role-based authorization guard
- New file: `packages/sui-media-api/src/auth/decorators/roles.decorator.ts` -- `@Roles('author', 'editor', 'admin')` decorator

*Dependencies to add to `sui-media-api`:*
- `@nestjs/passport`, `passport`, `passport-jwt`, `@nestjs/jwt`, `bcryptjs`
- `@types/passport-jwt`, `@types/bcryptjs` (dev)

*Environment variables:*
- `JWT_SECRET` -- Secret key for token signing (required)
- `JWT_EXPIRES_IN` -- Token expiration (default: `7d`)

*Domain-based auto-authorization:*
- When a user registers or logs in with an email ending in `@stokedconsulting.com`, `@stoked-ui.com`, or `@brianstoker.com`, automatically assign the `author` role
- Configurable list of auto-authorized domains (environment variable `AUTH_AUTO_DOMAINS`)

*Role hierarchy:*
- `reader` -- Public access, no auth needed (implicit)
- `author` -- Can create and edit own posts
- `editor` -- Can edit any post
- `admin` -- Full access including user management and domain configuration

*Backward compatibility:*
- The `x-user-id` header fallback should remain for development/testing but only when `NODE_ENV !== 'production'`
- Existing media endpoints continue to work with the updated `AuthGuard`

**Acceptance Criteria**

_Structural (code exists and is correct):_
- AC-2.3.a: `AuthGuard` validates JWT tokens from the `Authorization: Bearer <token>` header
- AC-2.3.b: `AuthModule` is registered in `AppModule`
- AC-2.3.c: Role-based authorization via `@Roles()` decorator is functional
- AC-2.3.d: Domain-based auto-authorization assigns `author` role to users with whitelisted email domains

_Executable (verified by running a command):_
- AC-2.3.e: `pnpm --filter @stoked-ui/media-api run build` exits 0
- AC-2.3.f: `pnpm --filter @stoked-ui/media-api run test` exits 0

**Acceptance Tests**
- Test-2.3.a: Unit -- `AuthService.validateToken()` returns decoded payload for a valid token and throws for an invalid/expired token
- Test-2.3.b: Unit -- `AuthService.register()` with `user@stokedconsulting.com` auto-assigns `author` role
- Test-2.3.c: Unit -- `AuthService.register()` with `user@gmail.com` assigns `reader` role (no auto-upgrade)
- Test-2.3.d: Integration -- `POST /auth/login` with valid credentials returns a JWT token
- Test-2.3.e: Integration -- `GET /blog` with a valid JWT in the `Authorization` header returns 200
- Test-2.3.f: Integration -- `GET /blog` without a token returns 401
- Test-2.3.g: Regression -- `GET /media` still works with the updated AuthGuard
- Test-2.3.h: Integration -- `x-user-id` header fallback works in development mode but not in production

**Verification Commands**
```bash
# Auth module files exist
test -f /Users/stoked/work/stoked-ui/packages/sui-media-api/src/auth/auth.module.ts && echo "PASS" || echo "FAIL"
test -f /Users/stoked/work/stoked-ui/packages/sui-media-api/src/auth/auth.service.ts && echo "PASS" || echo "FAIL"
test -f /Users/stoked/work/stoked-ui/packages/sui-media-api/src/auth/auth.controller.ts && echo "PASS" || echo "FAIL"

# JWT dependencies installed
grep -q "@nestjs/jwt" /Users/stoked/work/stoked-ui/packages/sui-media-api/package.json && echo "PASS: jwt dep" || echo "FAIL"
grep -q "passport-jwt" /Users/stoked/work/stoked-ui/packages/sui-media-api/package.json && echo "PASS: passport-jwt dep" || echo "FAIL"

# Build and test
cd /Users/stoked/work/stoked-ui && pnpm --filter @stoked-ui/media-api run build
cd /Users/stoked/work/stoked-ui && pnpm --filter @stoked-ui/media-api run test
```

---

## Phase 3: Blog Editor UX
**Purpose:** This phase delivers the web-based authoring interface for human blog authors. It cannot start until Phase 2 completes because: (a) the Blog API endpoints must exist for the editor to call, (b) JWT authentication must be in place for the editor to authenticate requests, and (c) the BlogPost model defines the shape of data the editor form must produce.

### 3.1 Blog Editor Page with Markdown Editing

Build the blog editor UI as a route within the docs site, providing markdown authoring with live preview and frontmatter management.

**Implementation Details**

*New files:*
- `docs/pages/blog/editor.tsx` -- Main editor page (Next.js page)
- `docs/pages/blog/editor/[slug].tsx` -- Edit existing post page
- `docs/src/modules/components/BlogEditor.tsx` -- Editor component
- `docs/src/modules/components/BlogEditorForm.tsx` -- Frontmatter form (title, description, tags, authors, target sites, featured image)
- `docs/src/modules/components/BlogMarkdownEditor.tsx` -- Markdown editor with live preview

*Dependencies to add to `docs/package.json`:*
- `@uiw/react-md-editor` or equivalent markdown editor with preview support
- `react-markdown` (if not already present, for rendering preview)

*Features:*
- Side-by-side or tabbed markdown editor with live preview
- Frontmatter form fields:
  - Title (text input, required)
  - Description (text area, required)
  - Tags (multi-select from `ALL_TAGS` + new blog tags)
  - Authors (multi-select, pre-populated from the `authors` object)
  - Target Sites (checkboxes: `stoked-ui.com`, `brianstoker.com`)
  - Featured Image (file upload to S3 via the media API, or URL input)
  - Manual Card toggle (for OG image control)
- Draft auto-save: Periodically POST/PATCH to the blog API to save drafts
- Publish button: calls `POST /blog/:slug/publish`
- Unpublish button: calls `POST /blog/:slug/unpublish`
- Post listing sidebar or separate route showing the user's drafts and published posts

*Authentication:*
- The editor page checks for a valid JWT session on mount
- If not authenticated, redirect to login or show a login prompt
- Use `fetch` with `Authorization: Bearer <token>` for API calls

*Routing:*
- `/blog/editor` -- New post
- `/blog/editor/[slug]` -- Edit existing post
- The blog listing page (`/blog`) should show a "New Post" button visible only to authenticated authors

*Failure modes:*
- Network errors during auto-save should be non-blocking (queue and retry)
- Large markdown content should not lag the preview (debounce rendering)
- Image upload failure should show an error toast, not lose the draft

**Acceptance Criteria**

_Structural (code exists and is correct):_
- AC-3.1.a: Page `docs/pages/blog/editor.tsx` exists and renders the blog editor for new posts
- AC-3.1.b: Page `docs/pages/blog/editor/[slug].tsx` exists and loads an existing post for editing
- AC-3.1.c: The markdown editor provides a live preview of the rendered markdown
- AC-3.1.d: The frontmatter form includes all fields: title, description, tags, authors, target sites, featured image
- AC-3.1.e: Draft auto-save calls the blog API at regular intervals (every 30 seconds or on significant change)

_Executable (verified by running a command):_
- AC-3.1.f: `pnpm --filter docs run build` exits 0 (editor pages compile)
- AC-3.1.g: The editor page is accessible at `/blog/editor` in the dev server

**Acceptance Tests**
- Test-3.1.a: UI -- The editor page renders a markdown editing area and a preview pane
- Test-3.1.b: UI -- Typing in the markdown editor updates the preview within 500ms
- Test-3.1.c: Form -- Submitting the form with a title, body, and at least one tag calls `POST /blog` and receives a 201 response
- Test-3.1.d: Form -- The tags multi-select only allows values from the whitelist
- Test-3.1.e: Auth -- Accessing `/blog/editor` without authentication redirects to login or shows an auth prompt
- Test-3.1.f: Persistence -- After saving a draft and refreshing the page, the draft content is loaded from the API
- Test-3.1.g: Publishing -- Clicking "Publish" calls the publish endpoint and updates the post status indicator in the UI

**Verification Commands**
```bash
# Editor page files exist
test -f /Users/stoked/work/stoked-ui/docs/pages/blog/editor.tsx && echo "PASS" || echo "FAIL"
test -d /Users/stoked/work/stoked-ui/docs/pages/blog/editor && echo "PASS: editor dir" || echo "FAIL"

# Docs build succeeds with editor pages
cd /Users/stoked/work/stoked-ui && pnpm --filter docs run build

# Editor component exists
test -f /Users/stoked/work/stoked-ui/docs/src/modules/components/BlogEditor.tsx && echo "PASS" || echo "FAIL"
```

---

### 3.2 Blog Listing Page Integration with API-Sourced Posts

Extend the existing blog listing page (`docs/pages/blog.tsx`) to merge API-sourced posts with markdown-sourced posts, and add a "New Post" button for authenticated users.

**Implementation Details**
- File: `docs/pages/blog.tsx`
- In `getStaticProps`, add a fetch to the blog API's public endpoint: `GET /blog/public?site=stoked-ui.com&status=published`
- Merge API-sourced posts with markdown-sourced posts from `getAllBlogPosts()` into a single sorted array
- Both sources produce objects conforming to the `BlogPost` interface; API posts should have `sui: true` for routing
- Implement ISR (Incremental Static Regeneration) with `revalidate: 60` so new API posts appear within 60 seconds without a full rebuild
- Add a "New Post" button in the header area, visible only when the user has a valid auth session (check via a lightweight `/auth/me` endpoint or client-side JWT check)
- Extend `PostPreview` to handle posts from both sources seamlessly (no visual difference)

*Failure modes:*
- If the blog API is unreachable during build, fallback to markdown-only posts (try/catch the fetch)
- API posts with missing fields should be filtered out rather than crashing the page

**Acceptance Criteria**

_Structural (code exists and is correct):_
- AC-3.2.a: `getStaticProps` in `blog.tsx` fetches from the blog API public endpoint and merges with markdown posts
- AC-3.2.b: `revalidate` is set in `getStaticProps` return for ISR
- AC-3.2.c: A "New Post" button is present in the UI, conditionally visible based on authentication state
- AC-3.2.d: API fetch failure is handled gracefully (fallback to markdown-only, no build crash)

_Executable (verified by running a command):_
- AC-3.2.e: `pnpm --filter docs run build` exits 0

**Acceptance Tests**
- Test-3.2.a: Integration -- With the API running and a published post in MongoDB, the blog listing page includes that post
- Test-3.2.b: Fallback -- With the API unreachable, the blog listing page renders with only markdown posts (no error)
- Test-3.2.c: Sorting -- API and markdown posts are sorted by date in descending order regardless of source
- Test-3.2.d: Routing -- Clicking a SUI/API post navigates to `/blog/[slug]`; clicking an MUI post navigates to `https://mui.com/blog/[slug]`
- Test-3.2.e: UI -- The "New Post" button is not visible when the user is not authenticated

**Verification Commands**
```bash
# getStaticProps fetches from API
grep -q "blog/public" /Users/stoked/work/stoked-ui/docs/pages/blog.tsx && echo "PASS: API fetch" || echo "FAIL"

# ISR revalidate is set
grep -q "revalidate" /Users/stoked/work/stoked-ui/docs/pages/blog.tsx && echo "PASS: ISR" || echo "FAIL"

# Build succeeds
cd /Users/stoked/work/stoked-ui && pnpm --filter docs run build
```

---

### 3.3 API-Sourced Blog Post Rendering Page

Create a dynamic Next.js page that renders blog posts fetched from the API (as opposed to markdown files) using the existing `TopLayoutBlog` styling.

**Implementation Details**
- New file: `docs/pages/blog/[slug].tsx` -- Dynamic page for API-sourced blog posts
- This page uses `getStaticPaths` to pre-render published API posts at build time and `getStaticProps` to fetch post content by slug
- Falls back to client-side fetching (`fallback: 'blocking'`) for posts created after the last build
- Renders markdown body using `react-markdown` or the existing `MarkdownElement` / `RichMarkdownElement` components
- Applies the same `TopLayoutBlog`-style layout (header, back button, author avatars, date, structured data) for visual consistency
- Must not conflict with existing MUI post routes (MUI posts are at `/blog/mui/[slug]` due to their directory structure)

*Failure modes:*
- Slug not found: Return `notFound: true` from `getStaticProps` (Next.js 404)
- Draft post accessed without auth: Return `notFound: true`

**Acceptance Criteria**

_Structural (code exists and is correct):_
- AC-3.3.a: Page `docs/pages/blog/[slug].tsx` exists with `getStaticPaths` and `getStaticProps`
- AC-3.3.b: The page renders markdown content with the same styling as `TopLayoutBlog`
- AC-3.3.c: Author avatars, date, tags, and structured data (JSON-LD) are rendered
- AC-3.3.d: `fallback: 'blocking'` is set in `getStaticPaths` for runtime rendering of new posts

_Executable (verified by running a command):_
- AC-3.3.e: `pnpm --filter docs run build` exits 0

**Acceptance Tests**
- Test-3.3.a: Integration -- A published API post is accessible at `/blog/[slug]` and renders with correct title, body, and author info
- Test-3.3.b: 404 -- Accessing `/blog/nonexistent-slug` returns a 404 page
- Test-3.3.c: Styling -- The API-sourced post page is visually consistent with markdown-sourced post pages
- Test-3.3.d: SEO -- The page includes `<meta name="author">`, `<meta property="article:published_time">`, and JSON-LD structured data
- Test-3.3.e: Regression -- MUI blog posts at `/blog/mui/*` are unaffected

**Verification Commands**
```bash
# Dynamic slug page exists
test -f /Users/stoked/work/stoked-ui/docs/pages/blog/\\[slug\\].tsx && echo "PASS" || echo "FAIL"

# Build succeeds
cd /Users/stoked/work/stoked-ui && pnpm --filter docs run build
```

---

## Phase 4: MCP Server & Nostr Integration
**Purpose:** This phase adds programmatic access via MCP for AI agents and Nostr integration for decentralized content. It cannot start until Phase 2 completes because the MCP server wraps the Blog API endpoints, and Nostr integration writes to the BlogPost model. Phase 3 (editor UX) can proceed in parallel with Phase 4 if the team is large enough, but sequentially for a solo developer.

### 4.1 MCP Tool Server for Blog Operations

Build an MCP (Model Context Protocol) server that exposes blog CRUD operations as tools, enabling AI agents (Claude, etc.) to author and manage blog posts programmatically.

**Implementation Details**

*New package or directory:* `packages/sui-blog-mcp/` (standalone MCP server) OR `packages/sui-media-api/src/mcp/` (co-located with the API)

Recommended: Standalone package `packages/sui-blog-mcp/` with its own `package.json` for clean separation.

*Dependencies:*
- `@modelcontextprotocol/sdk` -- MCP server SDK
- `node-fetch` or native `fetch` -- HTTP client for calling the Blog API

*MCP Tools (each maps to one or more Blog API endpoints):*
| Tool Name | API Endpoint | Description |
|-----------|-------------|-------------|
| `create_blog_post` | `POST /blog` | Create a new draft post |
| `update_blog_post` | `PATCH /blog/:slug` | Update post fields |
| `get_blog_post` | `GET /blog/:slug` | Get a single post by slug |
| `list_blog_posts` | `GET /blog` | List posts with optional filters |
| `publish_blog_post` | `POST /blog/:slug/publish` | Publish a draft |
| `unpublish_blog_post` | `POST /blog/:slug/unpublish` | Unpublish a post |
| `delete_blog_post` | `DELETE /blog/:slug` | Delete a post |
| `list_tags` | `GET /blog/tags` | Get available tags |
| `list_authors` | `GET /blog/authors` | Get available authors |

*Authentication:*
- The MCP server authenticates to the Blog API using an API key or JWT token provided via MCP configuration (environment variable `BLOG_API_TOKEN`)
- The token should correspond to a user with `author` or `admin` role

*Configuration:*
- `BLOG_API_URL` -- Base URL of the Blog API (e.g., `https://api.stoked-ui.com`)
- `BLOG_API_TOKEN` -- Bearer token for API authentication

*Error handling:*
- API errors are translated to MCP error responses with human-readable messages
- Network failures return a retry-suggestion message

**Acceptance Criteria**

_Structural (code exists and is correct):_
- AC-4.1.a: MCP server package/directory exists with a valid `package.json` and entry point
- AC-4.1.b: All 9 MCP tools listed above are registered and callable
- AC-4.1.c: Each tool correctly calls the corresponding Blog API endpoint with proper authentication
- AC-4.1.d: API errors are mapped to appropriate MCP error responses

_Executable (verified by running a command):_
- AC-4.1.e: `pnpm --filter @stoked-ui/blog-mcp run build` exits 0 (or equivalent build command)
- AC-4.1.f: The MCP server starts without errors when provided valid configuration

**Acceptance Tests**
- Test-4.1.a: Unit -- `create_blog_post` tool sends a `POST /blog` request with the correct body and headers
- Test-4.1.b: Unit -- `list_blog_posts` tool sends a `GET /blog` request and returns the parsed response
- Test-4.1.c: Integration -- With the Blog API running, calling `create_blog_post` via the MCP server creates a post in MongoDB
- Test-4.1.d: Integration -- Calling `publish_blog_post` changes the post status to `published`
- Test-4.1.e: Error -- Calling `get_blog_post` with a non-existent slug returns an MCP error with the message from the API
- Test-4.1.f: Auth -- Calling any tool without a valid `BLOG_API_TOKEN` returns an authentication error

**Verification Commands**
```bash
# MCP package exists
test -f /Users/stoked/work/stoked-ui/packages/sui-blog-mcp/package.json && echo "PASS" || echo "FAIL"

# Build succeeds
cd /Users/stoked/work/stoked-ui && pnpm --filter @stoked-ui/blog-mcp run build

# MCP SDK dependency present
grep -q "@modelcontextprotocol/sdk" /Users/stoked/work/stoked-ui/packages/sui-blog-mcp/package.json && echo "PASS" || echo "FAIL"
```

---

### 4.2 Nostr Integration Service

Build a background service that polls Nostr relays for long-form content events (NIP-23, kind 30023) from configured npub keys and imports them as blog posts.

**Implementation Details**

*New files in `packages/sui-media-api/src/nostr/`:*
- `nostr.module.ts` -- NestJS module
- `nostr.service.ts` -- Service that polls relays and maps events to BlogPost documents
- `nostr.config.ts` -- Configuration for relay URLs and npub keys

*Dependencies to add to `sui-media-api`:*
- `nostr-tools` -- Nostr event parsing, relay communication, key utilities

*Behavior:*
- On startup (and on a configurable interval, default 15 minutes), connect to configured Nostr relays
- Query for events of kind `30023` (long-form content, NIP-23) from the configured npub keys
- For each new event (not already in the database, checked by `nostrEventId`):
  - Parse the event content (markdown body)
  - Extract tags from the event's `t` tags
  - Extract title from the `title` tag or `subject` tag
  - Extract summary from the `summary` tag
  - Extract image from the `image` tag
  - Create a `BlogPost` document with `source: 'nostr'`, `status: 'published'`, `nostrEventId: event.id`
  - Set `targetSites` based on configuration (default: both sites)
- Display Nostr-sourced posts in the blog feed with a "via Nostr" attribution badge
- If a relay is unreachable, log a warning and continue with other relays

*Environment variables:*
- `NOSTR_RELAYS` -- Comma-separated relay URLs (e.g., `wss://relay.damus.io,wss://nos.lol`)
- `NOSTR_NPUBS` -- Comma-separated npub keys to follow
- `NOSTR_POLL_INTERVAL` -- Polling interval in minutes (default: 15)

*Failure modes:*
- Relay connection timeout: Skip that relay, try next
- Duplicate event: Silently skip (upsert with `nostrEventId` check)
- Invalid event content: Log warning, skip

**Acceptance Criteria**

_Structural (code exists and is correct):_
- AC-4.2.a: `NostrModule` is registered in `AppModule`
- AC-4.2.b: `NostrService` connects to configured relays and queries for kind 30023 events
- AC-4.2.c: Nostr events are mapped to `BlogPost` documents with `source: 'nostr'` and `nostrEventId` set
- AC-4.2.d: Duplicate events (same `nostrEventId`) are not re-imported

_Executable (verified by running a command):_
- AC-4.2.e: `pnpm --filter @stoked-ui/media-api run build` exits 0
- AC-4.2.f: `pnpm --filter @stoked-ui/media-api run test` exits 0

**Acceptance Tests**
- Test-4.2.a: Unit -- `NostrService.parseEvent()` correctly maps a kind 30023 event to a `BlogPost` object
- Test-4.2.b: Unit -- `NostrService.importEvent()` creates a BlogPost in MongoDB with correct fields
- Test-4.2.c: Unit -- `NostrService.importEvent()` with a duplicate `nostrEventId` does not create a second document
- Test-4.2.d: Integration -- With a mock Nostr relay, the polling service discovers and imports a test event
- Test-4.2.e: Integration -- Imported Nostr posts appear in the `GET /blog/public` response
- Test-4.2.f: Resilience -- With an unreachable relay, the service logs a warning but continues operating

**Verification Commands**
```bash
# Nostr module files exist
test -f /Users/stoked/work/stoked-ui/packages/sui-media-api/src/nostr/nostr.module.ts && echo "PASS" || echo "FAIL"
test -f /Users/stoked/work/stoked-ui/packages/sui-media-api/src/nostr/nostr.service.ts && echo "PASS" || echo "FAIL"

# nostr-tools dependency
grep -q "nostr-tools" /Users/stoked/work/stoked-ui/packages/sui-media-api/package.json && echo "PASS" || echo "FAIL"

# Build and test
cd /Users/stoked/work/stoked-ui && pnpm --filter @stoked-ui/media-api run build
cd /Users/stoked/work/stoked-ui && pnpm --filter @stoked-ui/media-api run test
```

---

## Phase 5: Multi-Site Publishing & Polish
**Purpose:** This phase delivers the multi-site publishing capability and polishes the system for production readiness. It cannot start until Phases 2-4 complete because: (a) the Blog API must be stable with authentication, (b) the editor must be functional, (c) the MCP server and Nostr integration should be tested. This phase focuses on cross-site content delivery, RSS feed extension, hybrid rendering optimization, and production deployment.

### 5.1 Multi-Site Publishing with Public API

Enable blog posts to target specific sites (`stoked-ui.com`, `brianstoker.com`, or both) and provide a documented public API for brianstoker.com to consume published content.

**Implementation Details**
- The `targetSites` field on `BlogPost` is already defined in Phase 2. This work item ensures the API and UX properly support it end-to-end.
- `GET /blog/public?site=brianstoker.com` must filter to posts where `targetSites` includes `brianstoker.com` and `status === 'published'`
- The public endpoint should support pagination, tag filtering, and sorting by date
- Response format should be clean JSON matching the `BlogPost` interface (no internal MongoDB fields like `__v`, `denyAccess`, etc.)
- Add CORS configuration to allow `brianstoker.com` origin
- Document the public API with a simple README or Swagger page showing how brianstoker.com can fetch posts

*CORS configuration:*
- Add `brianstoker.com` to the allowed origins in the NestJS CORS config
- Consider a configurable `ALLOWED_ORIGINS` env var

*Response sanitization:*
- The public endpoint strips: `denyAccess`, `canAccess`, `canEdit`, `deleted`, `deletedAt`, `tokens`, internal IDs
- Keeps: `title`, `slug`, `body`, `description`, `image`, `tags`, `authors`, `date`, `targetSites`, `source`

**Acceptance Criteria**

_Structural (code exists and is correct):_
- AC-5.1.a: `GET /blog/public?site=brianstoker.com` returns only published posts targeting that site
- AC-5.1.b: Public endpoint response does not include internal fields (`denyAccess`, `canAccess`, `canEdit`, `deleted`, `deletedAt`, `tokens`)
- AC-5.1.c: CORS is configured to allow requests from `brianstoker.com`
- AC-5.1.d: Public endpoint supports `page`, `limit`, `tag`, and `sortBy` query parameters

_Executable (verified by running a command):_
- AC-5.1.e: `pnpm --filter @stoked-ui/media-api run build` exits 0
- AC-5.1.f: `curl -s http://localhost:3001/blog/public?site=brianstoker.com` returns valid JSON (when the API is running locally)

**Acceptance Tests**
- Test-5.1.a: Integration -- A post with `targetSites: ['brianstoker.com']` appears in `GET /blog/public?site=brianstoker.com` but not in `GET /blog/public?site=stoked-ui.com`
- Test-5.1.b: Integration -- A post with `targetSites: ['stoked-ui.com', 'brianstoker.com']` appears in both site queries
- Test-5.1.c: Integration -- Draft posts never appear in the public endpoint regardless of `targetSites`
- Test-5.1.d: Security -- The public endpoint response body does not contain `denyAccess`, `canAccess`, or `canEdit` fields
- Test-5.1.e: CORS -- A request from `Origin: https://brianstoker.com` receives `Access-Control-Allow-Origin: https://brianstoker.com`

**Verification Commands**
```bash
# CORS config includes brianstoker.com
grep -rq "brianstoker.com" /Users/stoked/work/stoked-ui/packages/sui-media-api/src/ && echo "PASS: CORS config" || echo "FAIL"

# Build
cd /Users/stoked/work/stoked-ui && pnpm --filter @stoked-ui/media-api run build

# Test
cd /Users/stoked/work/stoked-ui && pnpm --filter @stoked-ui/media-api run test
```

---

### 5.2 Extend RSS Feed to Include API-Sourced Posts

Update the RSS feed generator to include posts from the Blog API alongside the existing markdown-sourced posts.

**Implementation Details**
- File: `docs/scripts/generateRSSFeed.ts`
- At build time, fetch published posts from the Blog API (`GET /blog/public?site=stoked-ui.com`) and merge with the `allBlogPosts` array
- The `Feed` object receives both markdown and API posts in a single sorted array
- If the API is unreachable at build time, fall back to markdown-only (try/catch)
- Update the feed `title` and `description` if needed (currently references "SUI" correctly)
- Validate that the RSS XML output is well-formed

**Acceptance Criteria**

_Structural (code exists and is correct):_
- AC-5.2.a: `generateRSSFeed.ts` fetches from the Blog API public endpoint at build time
- AC-5.2.b: API-sourced posts are included in the RSS feed alongside markdown posts
- AC-5.2.c: API fetch failure does not break RSS generation (graceful fallback)
- AC-5.2.d: The feed `siteUrl` is `https://stoked-ui.com` (verified in Phase 1, maintained here)

_Executable (verified by running a command):_
- AC-5.2.e: `pnpm --filter docs run build` exits 0 and generates `/public/feed/blog/rss.xml`

**Acceptance Tests**
- Test-5.2.a: Integration -- The generated `rss.xml` contains entries for both markdown and API-sourced posts
- Test-5.2.b: Validation -- The generated `rss.xml` is valid RSS 2.0 (parseable by an RSS reader)
- Test-5.2.c: Fallback -- With the API unreachable, RSS generation completes with markdown posts only
- Test-5.2.d: Content -- Each RSS entry has `title`, `link`, `description`, `pubDate`, and `author`

**Verification Commands**
```bash
# RSS generation in build
cd /Users/stoked/work/stoked-ui && pnpm --filter docs run build

# RSS file exists after build
test -f /Users/stoked/work/stoked-ui/docs/public/feed/blog/rss.xml && echo "PASS: RSS file" || echo "FAIL"

# RSS file is valid XML
xmllint --noout /Users/stoked/work/stoked-ui/docs/public/feed/blog/rss.xml 2>/dev/null && echo "PASS: valid XML" || echo "WARN: xmllint not available or invalid XML"

# No mui.com references in RSS file
grep -c "mui.com" /Users/stoked/work/stoked-ui/docs/public/feed/blog/rss.xml | grep "^0$" && echo "PASS: no mui.com in feed" || echo "FAIL"
```

---

### 5.3 Production Deployment Configuration

Configure the blog system for production deployment via SST, including environment variables, Lambda configuration, and database indexes.

**Implementation Details**
- Update `sst.config.ts` to include blog-related environment variables for the API Lambda function:
  - `JWT_SECRET` -- From SST secrets
  - `AUTH_AUTO_DOMAINS` -- Default: `stokedconsulting.com,stoked-ui.com,brianstoker.com`
  - `NOSTR_RELAYS` -- Nostr relay URLs
  - `NOSTR_NPUBS` -- Nostr public keys to follow
  - `NOSTR_POLL_INTERVAL` -- Default: `15`
  - `BLOG_API_TOKEN` -- For MCP server authentication
- Ensure the Blog API Lambda has sufficient memory and timeout for Nostr polling (if co-located)
- Alternatively, create a separate Lambda function for Nostr polling on a CloudWatch Events schedule
- Create a MongoDB migration script (or initialization script) that ensures:
  - BlogPost collection exists
  - All indexes defined in the schema are created
  - An admin user exists with the correct role
- Update the MCP server deployment:
  - If the MCP server runs as a standalone process, add it to the SST config
  - If it runs on-demand (e.g., via Claude Desktop config), document the configuration

**Acceptance Criteria**

_Structural (code exists and is correct):_
- AC-5.3.a: Blog-related environment variables are defined in `sst.config.ts` (or equivalent deployment config)
- AC-5.3.b: The API Lambda function includes `BlogModule` and `AuthModule` in the deployed bundle
- AC-5.3.c: Nostr polling is either co-located or configured as a separate scheduled function
- AC-5.3.d: A database initialization script exists for creating indexes and an admin user

_Executable (verified by running a command):_
- AC-5.3.e: `pnpm --filter @stoked-ui/media-api run build` produces a deployable bundle
- AC-5.3.f: The full monorepo builds without errors: `pnpm run build`

**Acceptance Tests**
- Test-5.3.a: Deployment -- The SST deployment completes without errors (in staging environment)
- Test-5.3.b: Smoke -- After deployment, `GET /blog/public?site=stoked-ui.com` returns 200
- Test-5.3.c: Smoke -- After deployment, `POST /auth/login` with valid credentials returns a JWT token
- Test-5.3.d: Smoke -- After deployment, the blog editor page loads and is accessible to authenticated users
- Test-5.3.e: Nostr -- The Nostr polling function runs on schedule and imports events (visible in MongoDB)

**Verification Commands**
```bash
# Blog env vars in SST config
grep -q "JWT_SECRET" /Users/stoked/work/stoked-ui/sst.config.ts && echo "PASS: JWT_SECRET in SST" || echo "FAIL"

# Full monorepo build
cd /Users/stoked/work/stoked-ui && pnpm run build

# API build produces dist
test -d /Users/stoked/work/stoked-ui/packages/sui-media-api/dist && echo "PASS: dist exists" || echo "FAIL"
```

---

## 3. Completion Criteria
The project is considered complete when:
- All Phase 1-5 acceptance criteria pass
- All acceptance tests are green (verified by executing test commands, not just reading code)
- All Verification Commands from every work item exit 0
- Full monorepo build succeeds: `cd /Users/stoked/work/stoked-ui && pnpm run build`
- Full docs site build succeeds: `cd /Users/stoked/work/stoked-ui && pnpm --filter docs run build`
- API test suite passes: `cd /Users/stoked/work/stoked-ui && pnpm --filter @stoked-ui/media-api run test`
- MCP server builds: `cd /Users/stoked/work/stoked-ui && pnpm --filter @stoked-ui/blog-mcp run build`
- No open P0 (system crash, data loss, auth bypass) or P1 (broken CRUD, broken publishing) issues remain
- The following end-to-end flows work in staging:
  1. An author logs in, creates a post in the editor, publishes it, and it appears on the blog listing page
  2. An AI agent creates a post via the MCP server, publishes it, and it appears on the blog listing page
  3. A Nostr long-form content event from a configured npub appears in the blog feed
  4. `GET /blog/public?site=brianstoker.com` returns published posts targeting that site
  5. The RSS feed includes posts from all three sources (markdown, API, Nostr)

---

## 4. Rollout & Validation

### Rollout Strategy
1. **Phase 1 (Foundation):** Merge to `main` immediately. Bug fixes and new SUI posts are safe to deploy without feature flags.
2. **Phase 2 (API):** Deploy the API to a staging environment first. Run integration tests against staging MongoDB. Gate production deployment on passing all Phase 2 acceptance tests.
3. **Phase 3 (Editor):** Gate the editor behind a feature flag (`ENABLE_BLOG_EDITOR=true` environment variable). Deploy to production with the flag off. Enable for internal team first (Brian Stoker, Stoked Consulting), then open to authorized domains.
4. **Phase 4 (MCP + Nostr):** Deploy MCP server separately. Nostr polling is enabled via environment variable (`NOSTR_RELAYS` being set). Start with a single relay and one npub key. Monitor for relay connectivity issues before adding more.
5. **Phase 5 (Multi-Site):** Enable public API for brianstoker.com. CORS configuration is the gate. Test the full cross-origin flow before removing the restriction.

### Progressive Exposure
- Week 1: Deploy Phases 1-2. Internal testing only.
- Week 2: Deploy Phase 3 with feature flag. Editor available to `@stokedconsulting.com` emails only.
- Week 3: Deploy Phase 4. MCP server available to Claude agents with configured API tokens.
- Week 4: Deploy Phase 5. Public API live for brianstoker.com. Nostr polling active.
- Week 5: Remove feature flag. Blog editor publicly visible to all authorized users.

### Post-Launch Validation
**Metrics to Monitor:**
- Blog API response times (p50 < 200ms, p99 < 1000ms)
- Error rate on blog endpoints (target: < 1%)
- Blog post count by source (native, nostr, markdown)
- Editor usage (drafts created, posts published)
- RSS feed subscriber count (track via feed access logs)
- Nostr polling success rate (events fetched / polling cycles)
- Public API usage from brianstoker.com (requests/day)

**Rollback Triggers:**
- API error rate exceeds 5% for 10+ minutes -- Roll back API deployment
- Authentication bypass detected -- Immediately disable blog endpoints, roll back auth changes
- Data corruption in BlogPost collection -- Disable write endpoints, investigate, restore from backup
- Nostr polling causes excessive database writes -- Disable Nostr polling via env var (`NOSTR_RELAYS=""`)
- Blog editor causes docs site build failures -- Disable editor via feature flag

---

## 5. Open Questions

1. **Blog API package placement:** Should blog endpoints be added to the existing `sui-media-api` package (as a new NestJS module alongside `MediaModule`), or should a separate `sui-blog-api` package be created? This PRD assumes co-location in `sui-media-api` for simplicity. Revisit if the blog module's dependencies or deployment needs diverge significantly.

2. **Authentication provider:** Which auth provider should be used for the blog editor? Options include NextAuth.js (integrates with Next.js pages router), Auth0 (managed service, fast to implement), or Clerk (modern developer UX). This PRD assumes a JWT-based approach integrated directly into the NestJS API. The choice of frontend auth provider for the editor UX should be decided before Phase 3 begins.

3. **brianstoker.com architecture:** What is the tech stack of brianstoker.com? If it is also a Next.js site, it could use the same auth system and ISR pattern. If it is a static site, it will consume the public API via client-side JavaScript. The public API design in Phase 5 is framework-agnostic to support either case.

4. **Nostr relay selection:** Which Nostr relays should be queried? Recommended starting set: `wss://relay.damus.io`, `wss://nos.lol`, `wss://relay.nostr.band`. Which npub key(s) should be configured? Decision needed before Phase 4 begins.

5. **MUI blog posts disposition:** Should the 71 MUI blog posts continue to appear in the main blog feed, be moved to an "MUI Archive" section, or be de-prioritized? This PRD maintains the status quo (they appear in the feed) but the blog listing page could be updated to add an "SUI Only" filter toggle.

6. **Image storage for blog posts:** Should blog images use the same S3 bucket as media uploads or a separate prefix? Recommended: Same bucket with a `blog/` key prefix (e.g., `blog/2026/02/image.webp`). Image optimization (resize, compress via Sharp) should be applied on upload, leveraging the existing `sharp` dependency in `sui-media-api`.

7. **Blog post URL structure:** This PRD uses `/blog/[slug]` for API-sourced posts and `/blog/mui/[slug]` for MUI markdown posts (matching the existing directory structure). Confirm this does not conflict with any existing routes.

8. **Previously lost blog posts:** A git history search should be performed early in Phase 1 (Work Item 1.4) to determine if any SUI blog content is recoverable. If nothing is found, the fallback is creating 2-3 foundational posts.

9. **Editor UX access:** This PRD places the editor at `/blog/editor` within the docs site. If there is a preference for a separate admin application, the editor components can be extracted into a standalone Next.js app. Decision should be finalized before Phase 3.

10. **Domain-based access implementation:** This PRD implements domain verification at registration time (check email domain, assign role). For stronger verification, consider requiring email confirmation (magic link) or SSO integration. The simplest approach for Phase 2 is email domain check at registration.

---
