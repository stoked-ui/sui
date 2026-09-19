# Build Multi-Platform Blog System

## 1. Feature Overview
**Feature Name:** Multi-Platform Blog System
**Owner:** Stoked Consulting / Brian Stoker
**Status:** Draft
**Target Release:** Q2 2026
**Repository:** stoked-ui/sui (GitHub monorepo)

### Summary
Build a complete blog management system spanning API, MCP tooling, and front-end UX that enables blog posts to be authored, managed, and published across stoked-ui.com (also served as stokedconsulting.com) and brianstoker.com. The system replaces the current static-only markdown blog infrastructure (forked from MUI) with a hybrid approach: a NestJS API backed by MongoDB for dynamic blog content, an MCP server for agent-driven authoring, a web-based editor for human authors, domain-based access control, and Nostr public key integration to pull in decentralized posts. The existing 71 MUI blog posts continue to render via the current SSG pipeline while new SUI-native posts are served through the API and also available for SSG at build time.

---

## 2. Problem Statement
### What problem are we solving?
The stoked-ui documentation site has a fully functional blog listing page (`docs/pages/blog.tsx`) and post renderer (`docs/src/modules/components/TopLayoutBlog.js`), but the entire system is oriented around MUI's content. Specifically:

1. **No SUI blog content exists.** The `sourcing.ts` file has a duplicate directory bug where both `blogMuiDir` and `blogDir` resolve to `pages/blog/mui`, and the `docs/pages/blog/sui/` directory does not exist. There are zero Stoked UI blog posts.
2. **No API for blog management.** The existing `sui-media-api` NestJS backend handles media CRUD but has no blog endpoints. All blog content is currently compiled at build time from markdown files -- there is no way for an agent, an external service, or a CMS-like tool to create or update posts without committing to the git repository.
3. **No authoring UX.** There is no admin interface or editor for writing posts. The only workflow is manually creating a markdown file with the correct frontmatter.
4. **No multi-site publishing.** Blog content lives only on stoked-ui.com/stokedconsulting.com. brianstoker.com (a separate site) has no blog integration mechanism.
5. **No access control.** The blog is either fully public (reading) or requires git commit access (writing). There is no concept of authorized authors, domain-based access, or user management for blog operations.
6. **Authors list is MUI-only.** The `authors` object in `TopLayoutBlog.js` contains only MUI team members -- no stoked-ui or Stoked Consulting authors.
7. **RSS feed points to mui.com.** The `generateRSSFeed.ts` script hardcodes `https://mui.com/feed` as the site URL instead of a stoked-ui domain.
8. **Previously existing blog posts were lost.** Blog posts that existed before the codebase reverted to MUI defaults need to be restored or recreated.

### Who is affected?
- **Brian Stoker / Stoked Consulting** -- cannot publish blog content to their own sites without manual git operations
- **AI agents** -- no programmatic API to create blog posts, blocking automation workflows
- **Future team members and authorized bloggers** -- no way to grant blog authoring access
- **Site visitors** -- see only MUI blog content on stoked-ui.com instead of original Stoked UI content
- **brianstoker.com visitors** -- no blog content available from the shared system

### Why now?
The stoked-ui ecosystem has matured to include multiple shipped products (File Explorer, Timeline, Editor, Media), a consulting practice, and an API layer (`sui-media-api`). A blog is essential for announcing releases, publishing technical content, building SEO presence, and establishing thought leadership. The existing blog infrastructure from the MUI fork provides a strong rendering foundation but needs an API layer and authoring system. The NestJS backend and MongoDB infrastructure already exist in `sui-media-api` and can be extended. Additionally, Nostr integration aligns with the project's interest in decentralized social platforms (the `SocialLinks` component already supports Nostr).

---

## 3. Goals & Success Metrics
### Goals
1. **Blog API** -- Deliver a RESTful NestJS blog module within the existing `sui-media-api` package (or a new `sui-blog-api` package) with full CRUD operations, tag management, author management, and multi-site publishing support
2. **MCP Server** -- Build an MCP (Model Context Protocol) server that exposes blog operations so that AI agents (Claude, etc.) can create, edit, and publish blog posts programmatically
3. **Blog Editor UX** -- Ship a web-based blog authoring interface accessible at `/blog/editor` (or similar) on stoked-ui.com with markdown editing, preview, image upload, frontmatter management, and publish controls
4. **Access Control** -- Implement domain-based and user-based access control: anyone with an email ending in `@stokedconsulting.com`, `@stoked-ui.com`, or `@brianstoker.com` gets automatic access; the owner can add individual users or additional domains
5. **Multi-Site Publishing** -- Enable posts to be published to stoked-ui.com/stokedconsulting.com and/or brianstoker.com with per-post site targeting
6. **Nostr Integration** -- Pull in posts from configured Nostr public keys and display them in the blog feed alongside native posts
7. **Fix Existing Bugs** -- Resolve the duplicate directory bug in `sourcing.ts`, fix the RSS feed URL, add SUI authors, create the `docs/pages/blog/sui/` directory
8. **Restore Lost Posts** -- Recover or recreate any previously existing SUI blog posts that were reverted to MUI defaults
9. **Hybrid Rendering** -- Support both SSG (build-time) and API-served (runtime) blog content, so posts authored via the API are available without requiring a site rebuild

### Success Metrics
| Metric | Target |
|--------|--------|
| Blog API endpoints operational (CRUD + search + publish) | All endpoints passing integration tests |
| MCP server tools functional | Agents can create, update, list, and publish posts via MCP |
| Blog editor accessible and functional | Authors can write, preview, and publish posts without touching git |
| Access control enforced | Unauthorized users cannot create/edit posts; domain-based auto-access works |
| Multi-site publishing | Posts can target stoked-ui.com, brianstoker.com, or both |
| Nostr posts visible in feed | Posts from configured npub keys appear in the blog listing |
| RSS feed URL corrected | Feed URL points to `https://stoked-ui.com/feed/blog/rss.xml` |
| SUI blog directory functional | `docs/pages/blog/sui/` exists and sourcing reads from it |
| Sourcing bug fixed | `blogDir` in `sourcing.ts` points to `pages/blog/sui` (not `pages/blog/mui`) |
| At least 1 SUI author in authors list | Brian Stoker added to `TopLayoutBlog.js` authors object |
| Time to publish a new post (API) | Under 30 seconds from submission to live |
| Time to publish a new post (Editor UX) | Under 5 minutes from starting to write to live |

---

## 4. User Experience & Scope

### In Scope

**Blog API (`sui-media-api` or `sui-blog-api`):**
- `BlogPost` MongoDB model extending the existing `BaseModel` pattern from `sui-common-api` -- fields: title, slug, body (markdown), description, image, tags, authors, date, status (draft/published/archived), targetSites (array of domains), nostrEventId (optional), createdAt, updatedAt
- CRUD endpoints: `POST /blog`, `GET /blog`, `GET /blog/:slug`, `PATCH /blog/:slug`, `DELETE /blog/:slug`
- Publishing workflow: `POST /blog/:slug/publish`, `POST /blog/:slug/unpublish`
- Tag management: `GET /blog/tags`, auto-validation against the `ALLOWED_TAGS` + `SUI_TAGS` whitelist from `sourcing.ts`
- Author management: `GET /blog/authors`, `POST /blog/authors`, `PATCH /blog/authors/:id`
- Search and filtering: by tag, author, date range, status, target site
- Pagination matching the existing `QueryMediaDto` pattern
- OpenAPI/Swagger documentation (following `sui-media-api` conventions)

**MCP Server:**
- MCP tool definitions for: `create_blog_post`, `update_blog_post`, `list_blog_posts`, `get_blog_post`, `publish_blog_post`, `unpublish_blog_post`, `delete_blog_post`, `list_tags`, `list_authors`
- Authentication via API key or token passed through MCP configuration
- Support for markdown body content with frontmatter

**Blog Editor UX:**
- Route: accessible from the blog listing page (e.g., "New Post" button visible to authorized users)
- Markdown editor with live preview (side-by-side or tabbed)
- Frontmatter form: title, description, tags (multi-select from allowed tags), authors (multi-select), featured image upload, target sites (checkboxes)
- Draft auto-save
- Publish/unpublish controls
- Post listing with status filters (drafts, published, archived)

**Access Control:**
- Authentication integration (JWT-based, extending the existing `AuthGuard` pattern in `sui-media-api`)
- Domain-based automatic authorization: email domains `stokedconsulting.com`, `stoked-ui.com`, `brianstoker.com` grant blog authoring access
- Owner-managed access list: ability to add individual email addresses or additional domains
- Role levels: `reader` (public, no auth needed), `author` (can create/edit own posts), `editor` (can edit any post), `admin` (full access including user management)

**Multi-Site Publishing:**
- Each post has a `targetSites` field: `['stoked-ui.com', 'brianstoker.com']` or a subset
- API endpoint for fetching posts by target site (for brianstoker.com to query)
- Public read endpoint: `GET /blog/public?site=brianstoker.com` -- no auth required for published posts

**Nostr Integration:**
- Configuration for one or more Nostr public keys (npub)
- Background service or cron job to poll configured Nostr relays for new posts (kind 30023 long-form content events)
- Mapping of Nostr events to the `BlogPost` model with `source: 'nostr'` flag
- Display in blog feed alongside native posts, with attribution link back to Nostr

**Bug Fixes & Restoration:**
- Fix `sourcing.ts` line 6: change `blogDir` from `path.join(process.cwd(), 'pages/blog/mui')` to `path.join(process.cwd(), 'pages/blog/sui')`
- Create `docs/pages/blog/sui/` directory
- Fix `generateRSSFeed.ts` line 10: change `siteUrl` from `https://mui.com/feed` to `https://stoked-ui.com`
- Add Brian Stoker (and any other SUI team members) to the `authors` object in `TopLayoutBlog.js`
- Identify and restore any previously existing SUI blog posts (from git history or backups)

### Out of Scope
- **Comment system** -- no reader comments on blog posts in the initial release
- **Full CMS** -- this is a blog system, not a general-purpose content management system; pages, docs, and other content types are not included
- **WYSIWYG editor** -- the editor uses markdown with preview, not a rich text WYSIWYG editor
- **Blog monetization** -- no paywall, subscription, or premium content features
- **Email newsletter integration** -- no automatic email distribution of new posts
- **Blog analytics dashboard** -- basic view counts via the `BaseModel.views` field, but no dedicated analytics UI
- **Internationalization** -- blog posts are English-only in the initial release
- **Native mobile app** -- the editor and blog are web-only

---

## 5. Assumptions & Constraints

### Assumptions
- The existing `sui-media-api` NestJS infrastructure (MongoDB via Mongoose, AWS S3, Swagger, AuthGuard pattern) can be extended or paralleled for blog functionality without major refactoring
- The `BaseModel` from `sui-common-api` provides a suitable foundation for the blog post model (likes, dislikes, views, publicity, access control fields are all relevant)
- stoked-ui.com and stokedconsulting.com will continue to be the same build/deployment, so blog posts appear on both automatically
- brianstoker.com is a separate deployment that will consume the blog API as a client (fetching published posts via a public API endpoint)
- JWT-based authentication will be implemented for the API (the current `AuthGuard` uses a mock `x-user-id` header and explicitly notes JWT as a TODO)
- The MUI blog posts in `docs/pages/blog/mui/` will continue to be rendered but may be de-prioritized in the feed or filtered to an "MUI Archive" section
- Nostr relay infrastructure is publicly accessible and does not require payment or special access
- The `SUI_TAGS` list in `sourcing.ts` represents the initial set of SUI-specific tags but can be extended

### Constraints

**Technical:**
- Must integrate with the existing pnpm + Turbo monorepo build system
- NestJS 10.x, Mongoose 8.x, MongoDB -- matching existing `sui-media-api` stack
- React 18.3.1, Next.js (pages router), MUI v5 -- matching existing docs site
- SST (Serverless Stack) deployment to AWS -- matching existing `sst.config.ts` infrastructure
- Blog API must support AWS Lambda deployment (following the `lambda.bootstrap.ts` pattern in `sui-media-api`)

**Operational:**
- The blog must not break the existing MUI blog post rendering pipeline
- RSS feed generation must continue to work at build time but should also include API-sourced posts
- The `ALLOWED_TAGS` validation in `sourcing.ts` must remain compatible with both markdown-sourced and API-sourced posts

**Security:**
- Blog authoring must be authenticated and authorized
- Public read endpoints must not expose draft content or private metadata
- API keys for MCP access must be securely managed (environment variables, not hardcoded)

**Performance:**
- Blog listing page must remain fast (currently SSG); API-sourced posts should be cached or pre-rendered
- Nostr polling should not block page rendering

---

## 6. Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| **Authentication complexity** -- The current `AuthGuard` is a mock implementation; real JWT auth is a prerequisite for the blog editor and API | HIGH - Blocks the entire authoring workflow | HIGH - Auth is explicitly marked as TODO in the codebase | Implement JWT authentication as the first phase. Consider using an auth provider (Auth0, Clerk, or NextAuth.js) to avoid building auth from scratch. The domain-based access rule simplifies the authorization layer once auth is in place. |
| **Hybrid rendering complexity** -- Mixing SSG blog posts (markdown) with API-served posts (MongoDB) creates two code paths for the blog listing and individual post pages | MEDIUM - Could lead to inconsistent UX or data staleness | MEDIUM - Two data sources is inherently more complex | Design a unified `BlogPost` interface (already exists in `sourcing.ts`) that both sources conform to. At build time, fetch from both markdown and API. At runtime, use ISR (Incremental Static Regeneration) or client-side fetching for API posts. |
| **Nostr relay reliability** -- Nostr relays are decentralized and may be slow, unreliable, or go offline | LOW - Nostr is supplementary, not primary | MEDIUM - Relay reliability varies | Query multiple relays for redundancy. Cache fetched Nostr posts in the database so they persist even if relays go down. Make Nostr integration non-blocking (background job). |
| **brianstoker.com integration** -- Unknown architecture of the brianstoker.com site; may require significant work to consume the blog API | MEDIUM - Could delay multi-site goal | MEDIUM - Separate codebase, unknown stack | Design the public API to be framework-agnostic (standard REST + JSON). Provide a lightweight client SDK or documented fetch examples. Investigate brianstoker.com's stack early in the project. |
| **Lost blog post recovery** -- Previously existing SUI blog posts may not be recoverable from git history if they were never committed or were force-pushed away | LOW - Can recreate content if needed | MEDIUM - Depends on git history | Search git reflog and branch history for any committed SUI blog posts before the revert. If unrecoverable, prioritize creating new introductory posts as part of the launch. |
| **Scope creep into CMS territory** -- Blog system could expand to manage all site content (docs, pages, etc.) | MEDIUM - Could delay the blog launch significantly | MEDIUM - Natural tendency to generalize | Strictly scope this to blog posts only. Document the boundary clearly. Use the blog system as a proof of concept that could inform a future CMS effort. |
| **MCP protocol stability** -- MCP is relatively new; the protocol may evolve in ways that break the server | LOW - MCP is standardized by Anthropic | LOW - Protocol is stabilizing | Pin to a specific MCP SDK version. Design the MCP layer as a thin wrapper over the REST API so the API remains the source of truth. |

---

## 7. Dependencies

### Internal Dependencies
| Dependency | Package/File | Purpose |
|------------|-------------|---------|
| NestJS API infrastructure | `packages/sui-media-api/` | Provides the NestJS app framework, module structure, MongoDB connection, S3 integration, Swagger docs, and Lambda deployment pattern |
| Common API models | `packages/sui-common-api/src/models/base.model.ts` | `BaseModel` provides likes, views, publicity, access control fields that the blog post model should extend |
| Common API decorators | `packages/sui-common-api/src/decorators/` | `StdSchema` and `DefaultSchemaOptions` for Mongoose schema generation |
| Blog listing page | `docs/pages/blog.tsx` | Existing blog listing UI with pagination, tag filtering, and post preview cards |
| Blog post renderer | `docs/src/modules/components/TopLayoutBlog.js` | Renders individual blog posts from markdown with author attribution and structured data |
| Blog sourcing | `docs/lib/sourcing.ts` | Reads markdown blog posts, parses frontmatter, validates tags -- needs bug fixes and extension to support API-sourced posts |
| RSS feed generator | `docs/scripts/generateRSSFeed.ts` | Generates RSS feed -- needs URL fix and extension to include API-sourced posts |
| Route configuration | `docs/src/route.ts` | Defines the `/blog/` route and RSS feed path |
| Auth guard | `packages/sui-media-api/src/media/guards/auth.guard.ts` | Existing (mock) authentication guard pattern to extend with real JWT auth |
| SST deployment config | `sst.config.ts` | AWS deployment infrastructure for both the docs site and API |
| Database module | `packages/sui-media-api/src/database/database.module.ts` | MongoDB connection configuration and schema registration |

### External Dependencies
| Dependency | Purpose | Notes |
|------------|---------|-------|
| MongoDB | Blog post storage | Already used by `sui-media-api`; `MONGODB_URI` is a required env var |
| AWS S3 | Blog image/asset storage | Already configured in `sui-media-api` via `s3.service.ts` |
| JWT library (jsonwebtoken or passport-jwt) | API authentication | New dependency; the `AuthGuard` has commented-out JWT code ready to implement |
| Auth provider (Auth0, Clerk, or NextAuth.js) | User authentication and session management | New dependency; needed for the blog editor UX |
| MCP SDK (`@modelcontextprotocol/sdk`) | MCP server implementation | New dependency for agent integration |
| Nostr libraries (`nostr-tools` or similar) | Nostr relay communication and event parsing | New dependency for Nostr integration |
| Markdown editor component (e.g., `@uiw/react-md-editor`, `react-markdown`) | Blog editor UX | New dependency for the authoring interface |
| `feed` npm package | RSS feed generation | Already used in `generateRSSFeed.ts` |

### Knowledge Dependencies
- Nostr protocol: NIP-23 (long-form content), relay communication, event verification
- MCP protocol specification for tool server implementation
- brianstoker.com site architecture (to design the API consumption pattern)
- Git history of the stoked-ui repo (to identify and restore lost SUI blog posts)

---

## 8. Open Questions

1. **Blog API package placement:** Should blog endpoints be added to the existing `sui-media-api` package (as a new NestJS module alongside `MediaModule`), or should a separate `sui-blog-api` package be created? Adding to `sui-media-api` is simpler and shares infrastructure, but a separate package provides cleaner separation.

2. **Authentication provider:** Which auth provider should be used? Auth0, Clerk, and NextAuth.js are all viable. NextAuth.js integrates most naturally with the existing Next.js docs site, but Auth0/Clerk may be better for the API-first approach.

3. **brianstoker.com architecture:** What is the tech stack of brianstoker.com? Is it also a Next.js site? Can it use the same auth system? This affects how the public API is designed and whether SSG/ISR is viable on that site.

4. **Nostr relay selection:** Which Nostr relays should be queried? What npub key(s) should be configured? Should the system support multiple Nostr identities?

5. **MUI blog posts disposition:** Should the 71 MUI blog posts continue to appear in the main blog feed, be moved to an archive section, or be hidden entirely? They currently fill the blog but are not SUI content.

6. **Image storage for blog posts:** Should blog images use the same S3 bucket as media uploads, or a separate bucket/prefix? Should there be image optimization (resize, compress) on upload?

7. **Blog post URL structure:** Should API-sourced blog posts use the same `/blog/[slug]` URL pattern as markdown posts, or a different pattern (e.g., `/blog/sui/[slug]`)? The current `blog.tsx` links MUI posts to `https://mui.com/blog/[slug]` and SUI posts to `/blog/[slug]`.

8. **Previously lost blog posts:** What content did the lost SUI blog posts contain? Can any be recovered from git history, backups, or the Wayback Machine? Are there specific posts that should be recreated from memory?

9. **Editor UX access:** Should the blog editor be a route within the existing docs site (e.g., `/blog/editor`) or a separate admin application? Embedding it in the docs site is simpler but mixes public and admin concerns.

10. **Domain-based access implementation:** How should domain verification work? Options include: (a) verify email domain at signup, (b) use Google Workspace / Microsoft 365 SSO for domain-based auth, (c) magic link verification to a domain email. Which approach aligns with the existing infrastructure?

---

## 9. Non-Goals

1. **General-purpose CMS** -- This system manages blog posts only. It does not manage documentation pages, product pages, landing pages, or other site content.

2. **Comment or discussion system** -- No reader comments, replies, or discussions on blog posts. If needed, this would be a separate feature.

3. **Email newsletter** -- No automatic email delivery of new blog posts to subscribers. Integration with Mailchimp, Substack, or similar is not included.

4. **Blog monetization** -- No paywall, premium content tiers, or subscription billing for blog access.

5. **WYSIWYG rich text editing** -- The editor provides markdown authoring with preview, not a drag-and-drop page builder or WYSIWYG editor.

6. **Social media auto-posting** -- No automatic cross-posting of blog content to Twitter/X, LinkedIn, Bluesky, or other social platforms.

7. **Blog analytics dashboard** -- Basic view tracking exists via `BaseModel.views`, but no dedicated analytics UI, traffic reports, or SEO analysis.

8. **Internationalization (i18n)** -- Blog posts are in English only. Multi-language support is not included.

9. **Content scheduling** -- No ability to schedule a post to publish at a future date/time. Posts are either draft or published immediately. (Could be a fast follow-up.)

10. **Full-text search with ranking** -- The API supports basic text search (following the `MediaSchema` text index pattern), but no advanced search features like typo tolerance, faceted search, or relevance tuning.

11. **Migration of MUI blog posts to the API** -- The 71 existing MUI markdown posts remain as static markdown files. They are not migrated into the database.

---

## 10. Notes & References

### Problem Description Source
This feature brief was generated from a user-provided problem description requesting:
- An API for blog management
- An MCP for the API
- A UX for authors (human and agent)
- Domain-based access control with the ability to add users/domains
- Nostr public key integration for pulling in posts
- Restoration of previously existing blog posts lost in MUI default reversion

### Key Codebase Files
| File | Path | Relevance |
|------|------|-----------|
| Blog listing page | `docs/pages/blog.tsx` | Primary blog UI -- functional with pagination, tag filtering, post preview cards |
| Blog post renderer | `docs/src/modules/components/TopLayoutBlog.js` | Renders individual posts from markdown; contains the `authors` object (MUI-only) |
| Blog sourcing | `docs/lib/sourcing.ts` | **Has duplicate directory bug** (line 6) and tag whitelist; needs fixes |
| RSS feed generator | `docs/scripts/generateRSSFeed.ts` | **Hardcodes `mui.com` URL** (line 10); needs fix |
| Route config | `docs/src/route.ts` | Defines `/blog/` route at line 29 |
| Media API app module | `packages/sui-media-api/src/app.module.ts` | NestJS module registration -- blog module would be added here |
| Auth guard | `packages/sui-media-api/src/media/guards/auth.guard.ts` | Mock auth guard with JWT TODO -- template for real auth |
| Base model | `packages/sui-common-api/src/models/base.model.ts` | Mongoose base model with likes/views/publicity/access control |
| Media model | `packages/sui-common-api/src/models/media.model.ts` | Example of model extending `File` with Mongoose schema and indexes |
| Database module | `packages/sui-media-api/src/database/database.module.ts` | MongoDB connection and schema registration pattern |
| Media controller | `packages/sui-media-api/src/media/media.controller.ts` | Example NestJS controller with Swagger decorators, auth guards, CRUD pattern |
| SST config | `sst.config.ts` | AWS deployment; requires `ROOT_DOMAIN` and `MONGODB_URI` env vars |
| MUI blog posts | `docs/pages/blog/mui/*.md` | 71 existing MUI blog posts (static markdown) |
| Products config | `docs/src/products.tsx` | Product definitions -- blog is not currently a product but may need integration |
| App wrapper | `docs/pages/_app.js` | Next.js app wrapper with product routing and provider setup |

### Known Bugs to Fix
1. **`docs/lib/sourcing.ts` line 6:** `blogDir` duplicates `blogMuiDir` -- both point to `pages/blog/mui`. `blogDir` should point to `pages/blog/sui`.
2. **`docs/scripts/generateRSSFeed.ts` line 10:** `siteUrl` is `https://mui.com/feed` instead of `https://stoked-ui.com`.
3. **`docs/src/modules/components/TopLayoutBlog.js` lines 23-128:** `authors` object contains only MUI team members. At minimum, Brian Stoker should be added.
4. **`docs/pages/blog/sui/` directory:** Does not exist. Must be created for SUI-native blog posts.

### Architecture Guidance
- **Blog Module Pattern:** Follow the existing `MediaModule` pattern in `sui-media-api`: a NestJS module with controller, service, DTOs, entity, and guards. Register it in `AppModule` alongside `MediaModule`.
- **Model Pattern:** The `BlogPost` Mongoose model should extend `BaseModel` (from `sui-common-api`) to inherit likes, views, publicity, and access control. Add blog-specific fields (title, slug, body, description, image, tags, authors, status, targetSites).
- **API Pattern:** Follow `media.controller.ts` conventions: Swagger decorators on every endpoint, `AuthGuard` for protected routes, `ValidationPipe` for DTOs, consistent error handling.
- **MCP Pattern:** The MCP server should be a thin wrapper around the REST API. Each MCP tool maps to one or more API calls. This keeps the API as the single source of truth and allows the MCP and web UX to evolve independently.
- **Rendering Pattern:** The blog listing page should merge markdown-sourced posts (from `getAllBlogPosts()`) with API-sourced posts (fetched at build time or via client-side hydration) into a single sorted array. The `BlogPost` interface in `sourcing.ts` already supports the `sui` boolean flag for routing.

### Deployment Notes
- The docs site deploys via SST to AWS (`sst.config.ts`), serving `ROOT_DOMAIN` which can be `stoked-ui.com,stokedconsulting.com`
- The API also deploys via SST with Lambda support (`lambda.bootstrap.ts`)
- Blog API endpoints would be served under the same API gateway as media endpoints
- brianstoker.com is a separate deployment that will call the blog API's public endpoints

### Tag Whitelist (from `sourcing.ts`)
**MUI Tags:** Company, Developer Survey, Guide, Product, MUI X, Material UI, Base UI, Pigment CSS, Joy UI, SUI X, SUI System, Toolpad
**SUI Tags:** Stoked UI, SUI, File Explorer, Media Selector, Video Editor, Timeline
**Proposed New Tags for Blog:** Consulting, Nostr, Announcement, Tutorial, Release, Personal (for brianstoker.com content)
