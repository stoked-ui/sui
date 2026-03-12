# Migrate Media Components to sui-media Package with NestJS API

## 1. Feature Overview
**Feature Name:** Media Component Migration & Backend API Creation
**Owner:** TBD
**Status:** Draft
**Target Release:** TBD

### Summary
This feature consolidates media-related functionality by migrating from the existing `@stoked-ui/media-selector` package to a new comprehensive `@stoked-ui/media` package while simultaneously creating a dedicated `@stoked-ui/media-api` NestJS backend service. The new frontend package will include all existing media selector functionality plus the MediaCard and MediaViewer components (and their composed components) from the v3 codebase. The backend API will centralize all media-related endpoints and metadata processing capabilities, moving from client-side to a hybrid client-server architecture for better performance and scalability.

---

## 2. Problem Statement
### What problem are we solving?
Currently, media functionality is fragmented across multiple locations with several architectural issues:

1. **Package fragmentation**: The `@stoked-ui/media-selector` package only handles file selection, while critical UI components (MediaCard, MediaViewer) are siloed in the v3 codebase
2. **Missing backend infrastructure**: There's no dedicated API service for media operations, forcing media endpoints to be scattered across different services
3. **Client-heavy processing**: Metadata extraction and processing happens entirely on the client side, leading to:
   - Performance issues on low-end devices
   - Inconsistent metadata quality
   - Increased client-side bundle size
   - Inability to process media server-side before delivery
4. **Code duplication**: Metadata processing logic exists in both client and server codebases but isn't properly unified
5. **Scalability limitations**: Without a dedicated API layer, it's difficult to implement features like thumbnail generation, video transcoding, and advanced metadata extraction

### Who is affected?
- **Primary users**:
  - Frontend developers building media-rich applications in the stoked-ui ecosystem
  - End users experiencing slow media processing on client devices

- **Secondary users**:
  - Backend developers needing standardized media API endpoints
  - DevOps engineers managing media processing infrastructure
  - Product teams requiring consistent media handling across applications

### Why now?
- The v3 codebase has proven MediaCard/MediaViewer components that should be available to all stoked-ui consumers
- Client-side metadata processing is causing performance bottlenecks in production
- The existing `@stoked-ui/media-selector` package naming is too narrow for its intended scope
- Growing demand for server-side media processing capabilities (thumbnails, transcoding, metadata extraction)
- Need to establish a clean separation between media UI components and media API services before adding more features
- The v3 codebase demonstrates a working hybrid approach with both client and server-side metadata processing that should be standardized

---

## 3. Goals & Success Metrics
### Goals
1. **Consolidate media UI components** - Migrate all media-related React components into a single, well-organized package
2. **Deprecate fragmented package** - Sunset `@stoked-ui/media-selector` in favor of the more comprehensive `@stoked-ui/media`
3. **Establish backend API service** - Create a dedicated NestJS API package for all media-related operations
4. **Implement hybrid metadata processing** - Enable both client-side and server-side metadata extraction based on use case
5. **Maintain backward compatibility** - Ensure existing media-selector consumers can migrate with minimal breaking changes
6. **Improve developer experience** - Provide a clear, well-documented API surface for both frontend and backend media operations

### Success Metrics (How we'll know it worked)
- **Migration completion**: 100% of MediaCard, MediaViewer, and their composed components successfully migrated to `@stoked-ui/media`
- **Package adoption**: TBD existing `@stoked-ui/media-selector` consumers migrate to `@stoked-ui/media` within TBD months
- **API coverage**: All media endpoints identified in v3 are implemented in `@stoked-ui/media-api`
- **Performance improvement**: TBD% reduction in client-side bundle size for media processing
- **Processing distribution**: TBD% of metadata extraction operations can be handled server-side
- **Build stability**: Zero build errors in CI/CD after migration
- **Documentation coverage**: 100% of new package APIs have comprehensive documentation
- **Developer satisfaction**: TBD positive feedback from early adopters during migration

---

## 4. User Experience & Scope
### In Scope

**Frontend Package (`@stoked-ui/media`):**
- All existing functionality from `@stoked-ui/media-selector`:
  - File selection and drag-n-drop utilities
  - MediaFile class and file system abstractions
  - FileWithPath functionality
  - WebFile and AppFile classes
  - Metadata extraction utilities (ScreenshotStore, ScreenshotQueue)
  - MediaType utilities and helpers

- Migrated components from v3:
  - **MediaCard** component and all its dependencies:
    - MediaCard.animations.css
    - MediaCard.styles.ts
    - MediaCard.types.ts
    - MediaCard.utils.ts
    - MediaCard.constants.ts
    - All composed sub-components
  - **MediaViewer** component and all its dependencies:
    - MediaViewerPrimary
    - MediaViewerHeader
    - MediaViewerControls
    - MediaViewerVideoControls
    - MediaViewerPreview
    - All supporting hooks (useMediaViewerLayout, useMediaViewerState)
    - All composed sub-components
  - Supporting components:
    - MediaProcessingOverlay
    - TagFriendsDialog
    - ExplicitIcon/GeneralAudiencesIcon
    - NextUpHeader
    - NowPlayingIndicator
    - QueueManagementPanel

- Client-side metadata processing:
  - Video metadata extraction (duration, dimensions, codec info)
  - Audio waveform generation
  - Screenshot/thumbnail capture
  - EXIF data reading for images

**Backend Package (`@stoked-ui/media-api`):**
- NestJS API service with endpoints for:
  - Media upload and storage
  - Server-side metadata extraction using ffprobe
  - Thumbnail generation
  - Video sprite sheet generation for scrubbing
  - Media CRUD operations
  - Media search and filtering
  - Media access control and permissions

- Server-side metadata processing:
  - Video processing using ffmpeg/ffprobe
  - Audio metadata extraction
  - Image processing and optimization
  - HEIC conversion service
  - Mass processing utilities

- API endpoints ported from v3:
  - `/media/*` routes from media.controller.ts
  - File upload and management endpoints
  - Metadata update endpoints
  - Thumbnail generation and upload
  - Media discovery and search

**Migration & Deprecation:**
- Deprecation notice and migration guide for `@stoked-ui/media-selector`
- Automated migration tooling where possible (e.g., codemod for import paths)
- Compatibility layer to ease transition period

### Out of Scope
- Rewriting existing component functionality (migration should preserve behavior)
- Advanced video transcoding (beyond basic metadata and thumbnails)
- Real-time video streaming infrastructure (RTMP/WebRTC - handled by separate package)
- Content moderation and AI-based media analysis
- Integration with third-party media services (Cloudinary, etc.)
- Mobile-specific implementations (React Native components)
- Payment/Lightning Network integration (exists in v3 but separate concern)
- Report submission functionality (exists in v3 but separate concern)
- Media class/category management (separate feature)
- Queue management context (may be extracted to separate package)

---

## 5. Assumptions & Constraints
### Assumptions
1. The v3 MediaCard and MediaViewer components are production-ready and their current implementation represents the desired behavior
2. Developers consuming `@stoked-ui/media-selector` are willing to migrate to the new package name
3. NestJS is the chosen framework for the backend API service
4. The existing metadata processing code in v3 represents best practices for hybrid client/server processing
5. AWS S3 (or compatible object storage) will be used for media file storage
6. The stoked-ui monorepo build system supports both React component packages and NestJS API packages
7. Current metadata extraction libraries (browser-based and ffmpeg/ffprobe) are sufficient for requirements

### Constraints
**Technical:**
- Must maintain compatibility with existing file selection APIs to minimize breaking changes
- MediaCard and MediaViewer components depend on Material-UI (MUI) design system
- Server-side processing requires ffmpeg/ffprobe to be installed in the deployment environment
- Client-side browser APIs required for file system access, drag-and-drop, and media element metadata
- Package must support both modern and stable build targets as per existing stoked-ui packages
- Must work in both browser and Node.js environments where applicable

**Dependencies:**
- Depends on `@stoked-ui/common` package for shared utilities
- Depends on Material-UI (@mui/material) for component library
- Depends on Redux/Redux Toolkit for state management (MediaCard/MediaViewer)
- Depends on authentication system for secure media operations
- Backend depends on Mongoose for MongoDB data persistence
- Backend depends on S3-compatible storage service

**Timeline:**
- TBD - Needs project scoping and resource allocation

**Resources:**
- Requires access to v3 codebase for component migration
- Requires developer familiar with both React component development and NestJS backend development
- May require DevOps support for backend deployment infrastructure

---

## 6. Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking changes for existing `@stoked-ui/media-selector` consumers | High - Could block adoption and cause friction | Provide comprehensive migration guide, deprecation warnings, and possibly a compatibility shim layer. Maintain `media-selector` in deprecated state with security patches only for 6-12 months. |
| MediaCard/MediaViewer components have hidden dependencies not easily extracted from v3 | High - Could delay migration or result in broken functionality | Perform thorough dependency analysis before migration. Create comprehensive test suite to verify all functionality. Consider incremental migration starting with simpler components. |
| Server-side metadata processing infrastructure costs | Medium - Could be expensive at scale | Implement client-side fallbacks, add request throttling, optimize processing pipeline, consider lazy/on-demand processing model. |
| ffmpeg/ffprobe deployment complexity | Medium - Not available in all environments | Provide clear deployment documentation, Docker images with dependencies pre-installed, graceful degradation when tools unavailable. |
| State management coupling in MediaCard/MediaViewer | Medium - Redux dependency might not fit all use cases | Evaluate if state management can be made pluggable or provide Redux-agnostic versions. Document Redux requirements clearly. |
| Bundle size increase from MediaCard/MediaViewer components | Medium - Could negatively impact load times | Implement proper code splitting, tree-shaking, and lazy loading. Measure and optimize bundle impact. |
| v3 components using deprecated or incompatible APIs | Medium - May require refactoring during migration | Audit components for deprecated APIs before migration. Update to current best practices as part of migration. |
| Incomplete metadata processing parity between client/server | Low - Could lead to inconsistent behavior | Clearly document which metadata operations are available where. Establish test parity suite. |
| Package naming confusion (media vs media-selector) | Low - Could cause developer confusion | Clear communication in README, migration guides, and package deprecation notices. |

---

## 7. Dependencies
### Team dependencies
- Frontend team for component migration and testing
- Backend team for NestJS API development
- DevOps team for deployment infrastructure (ffmpeg, S3, etc.)
- Documentation team for migration guides and API documentation

### External systems / vendors
- **ffmpeg/ffprobe**: Required for server-side video/audio metadata extraction
- **AWS S3 (or compatible)**: Object storage for media files
- **MongoDB**: Database for media metadata persistence (via Mongoose)
- **Material-UI**: Component library dependency for MediaCard/MediaViewer
- **Redux/Redux Toolkit**: State management for media components

### Data or infrastructure dependencies
- S3 bucket configuration for media storage
- CDN setup for media delivery
- Server infrastructure capable of running ffmpeg/ffprobe
- Database schema migration for media metadata
- Authentication/authorization system for media access control

### Package dependencies
**Frontend (`@stoked-ui/media`):**
- `@stoked-ui/common` (peer/dev dependency)
- `react` (peer dependency)
- `@mui/material` (peer dependency)
- `@reduxjs/toolkit` (peer dependency)
- `formdata-node`, `jszip` (existing dependencies)
- Potentially more from v3 MediaCard/MediaViewer analysis

**Backend (`@stoked-ui/media-api`):**
- `@nestjs/common`, `@nestjs/core` (dependencies)
- `@nestjs/mongoose` (dependency)
- `mongoose` (dependency)
- `@desirable/common` or equivalent shared models package
- File upload middleware (multer or similar)

---

## 8. Open Questions
1. **Migration timeline**: What is the acceptable timeline for deprecating `@stoked-ui/media-selector`? 6 months? 12 months? Or should it remain indefinitely with a deprecation warning?

2. **State management approach**: Should MediaCard/MediaViewer components continue using Redux, or should they be refactored to use context/hooks for more flexibility? Is a Redux-free version needed?

3. **Media queue management**: Should the media queue context (used by MediaViewer) be part of `@stoked-ui/media` or extracted to a separate package?

4. **Payment integration**: MediaCard in v3 has Lightning Network and crypto payment integration. Should this be:
   - Included in `@stoked-ui/media` (couples payment to media)
   - Abstracted to payment callbacks/hooks (more flexible)
   - Removed entirely (separate concern)

5. **Authentication integration**: How should the media components and API integrate with various auth systems? Should auth be:
   - Pluggable via context providers
   - Required peer dependency on specific auth package
   - Completely external with callbacks

6. **Thumbnail generation strategy**: Should thumbnails be:
   - Generated on upload (server-side only)
   - Generated on-demand with caching (hybrid)
   - Generated client-side and uploaded (reduces server load)

7. **Metadata processing preference**: Under what conditions should metadata be extracted client-side vs server-side? Should this be:
   - Developer-configurable
   - Automatic based on file size/type
   - Environment-based (mobile=client, desktop=server)

8. **Component versioning**: Should MediaCard/MediaViewer maintain v3 API surface, or is this an opportunity to introduce breaking changes for improved DX?

9. **Storage abstraction**: Should the backend API be storage-agnostic (support S3, Azure, GCP) or S3-specific initially?

10. **Monorepo structure**: Should `@stoked-ui/media-api` live in:
    - `/packages/sui-media-api` (with frontend packages)
    - `/api/sui-media-api` (separate API directory)
    - Separate repository entirely

11. **Testing strategy**: What level of test coverage is required before shipping? Should we:
    - Port all existing tests from v3
    - Write new tests based on current implementation
    - Require minimum coverage percentage (e.g., 80%)

12. **Documentation scope**: Should we include:
    - Component storybook stories
    - Backend API swagger/OpenAPI spec
    - Interactive examples in docs site
    - Video tutorials for complex features

---

## 9. Non-Goals
This feature **does not** require:

- **Complete feature parity with v3's full media system**: Only MediaCard and MediaViewer components are migrating, not the entire media management system
- **Video streaming infrastructure**: RTMP/WebRTC streaming is handled by separate packages (`sui-video-renderer`, webRTC package)
- **AI/ML-based media analysis**: Content moderation, face detection, scene analysis, etc. are separate features
- **Social features**: Comments, likes, shares on media (these should be composable, not built into media components)
- **Advanced video editing**: Trimming, filters, effects beyond basic metadata
- **Multi-cloud storage support in v1**: Can be added later, starting with S3 is acceptable
- **Mobile app components**: React Native versions can come later
- **Internationalization (i18n)**: Can be added as enhancement, not blocking for v1
- **Accessibility (a11y) improvements**: Should maintain existing a11y level but comprehensive audit is not required for v1
- **Performance optimization beyond baseline**: Advanced lazy loading, virtualization can come in future iterations
- **Migration automation tooling**: Codemods are nice-to-have but not required if migration guide is comprehensive

---

## 10. Notes & References

### Related Documentation
- **Template source**: `~/.claude/commands/template/PRODUCT_FEATURE_BRIEF.md`
- **Project orchestration state**: `/Users/stoked/work/stoked-ui/projects/migrate-media-components-to-sui-media-package-with-nestjs-api/orchestration-state.json`

### Source Code References

**Existing Package to Deprecate:**
- `/Users/stoked/work/stoked-ui/packages/sui-media-selector/` - Current media selector implementation
- `/Users/stoked/work/stoked-ui/packages/sui-media-selector/package.json` - Published as `@stoked-ui/media-selector@0.1.3`
- `/Users/stoked/work/stoked-ui/packages/sui-media-selector/src/MediaFile/MediaFile.ts` - Core MediaFile class with metadata extraction

**v3 Components to Migrate:**
- `/Users/stoked/work/v3/apps/site/src/components/Media/MediaCard.tsx` - Main MediaCard component
- `/Users/stoked/work/v3/apps/site/src/components/Media/MediaCard/` - MediaCard supporting files
- `/Users/stoked/work/v3/apps/site/src/components/Media/MediaViewer.tsx` - Main MediaViewer component
- `/Users/stoked/work/v3/apps/site/src/components/Media/MediaViewer*.tsx` - MediaViewer sub-components
- `/Users/stoked/work/v3/apps/site/src/components/Media/__tests__/` - Existing component tests

**v3 Backend API References:**
- `/Users/stoked/work/v3/packages/api/src/files/media.service.ts` - Media service implementation
- `/Users/stoked/work/v3/packages/api/src/files/media.controller.ts` - Media API endpoints
- `/Users/stoked/work/v3/packages/api/src/files/video-processing.service.ts` - FFmpeg-based video processing
- `/Users/stoked/work/v3/packages/api/src/files/heic-conversion.service.ts` - Image format conversion
- `/Users/stoked/work/v3/packages/api/src/files/image-processing.service.ts` - Image processing utilities

### Technical Details

**Metadata Processing Capabilities:**
- **Client-side** (from MediaFile.ts):
  - Video: duration, format, dimensions, codec via HTML5 video element
  - Audio: duration, format, waveform generation, metadata from filename
  - Screenshot capture and storage

- **Server-side** (from video-processing.service.ts):
  - FFprobe metadata extraction (codec, container, bitrate, moov atom position)
  - Scrubber sprite sheet generation for hover preview
  - Spawn-based command execution for safety with special characters

**Component Dependencies Identified:**
- Material-UI (MUI) components and styling
- Redux Toolkit for state management (mediaSlice, apiServices)
- Next.js router hooks (useRouter, useSearchParams, usePathname)
- Custom contexts: MediaProvider, MediaQueueContext, KeyboardShortcutsContext, MediaMetadataGeneratorContext
- Authentication: useUser hook, CurrentUser type
- Lightning/crypto payment components (may need abstraction)

### Monorepo Structure
- **Root**: `/Users/stoked/work/stoked-ui/`
- **Packages**: `/packages/` - Contains all sui-* frontend packages
- **API packages**: Currently none, need to determine location for `sui-media-api`
- **Build system**: Turbo for monorepo builds, pnpm for package management
- **Package naming**: `@stoked-ui/*` scope

### Additional Context
- The v3 codebase represents a production application with proven media handling patterns
- Current focus in stoked-ui ecosystem includes video rendering, file exploration, and timeline components
- The repository uses TypeScript throughout
- Build targets include modern, node, and stable as per existing package configurations
