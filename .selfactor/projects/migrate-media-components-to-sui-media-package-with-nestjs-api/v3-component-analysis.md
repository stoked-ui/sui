# V3 Media Components Dependency Analysis Report

**Analysis Date:** 2026-01-18
**V3 Location:** `/Users/stoked/work/v3/apps/site/src/components/Media/`
**Analyst:** Phase 2.1 Analysis Agent
**Status:** COMPLETE

## Executive Summary

Comprehensive analysis of MediaCard and MediaViewer components from v3 codebase for migration to `@stoked-ui/media` package.

**Key Metrics:**
- **Total Lines of Code:** ~29,000 lines
- **Primary Components:** 2 (MediaCard, MediaViewer)
- **Sub-Components:** 35+
- **Custom Hooks:** 18+
- **Context Providers:** 4 media-specific
- **Migration Complexity:** HIGH
- **Estimated Effort:** 6-8 weeks (2-3 developers)

## 1. Component Inventory

### 1.1 MediaCard Component (~4,426 lines)
**Location:** `/Users/stoked/work/v3/apps/site/src/components/Media/MediaCard.tsx`

Interactive media card with preview, editing, and ownership controls.

**Sub-components:**
- `ThumbnailStrip.tsx` - Video hover preview thumbnails
- `VideoProgressBar.tsx` - Playback progress tracking
- `MediaCard.styles.ts` - Styled components (7,524 lines)
- `MediaCard.constants.ts` - Constants and configuration
- `MediaCard.utils.ts` - Utility functions
- `MediaCard.types.ts` - TypeScript interfaces
- `MediaCard.animations.css` - CSS animations

### 1.2 MediaViewer Component (~2,970 lines)
**Location:** `/Users/stoked/work/v3/apps/site/src/components/Media/MediaViewer.tsx`

Full-screen/theater mode media viewer with queue management.

**Sub-components:**
- `MediaViewerPrimary.tsx` (476 lines) - Primary media display
- `MediaViewerHeader.tsx` (213 lines) - Header with title/close controls
- `MediaViewerControls.tsx` (287 lines) - Owner action controls (FAB/SpeedDial)
- `MediaViewerPreview.tsx` (260 lines) - Bottom preview card grid
- `MediaViewerVideoControls.tsx` (333 lines) - Video playback controls
- `NextUpHeader.tsx` (144 lines) - "Next Up" queue header
- `NowPlayingIndicator.tsx` (156 lines) - Visual playback indicator

### 1.3 Supporting Components

**Display & Layout:**
- `MediaScroller.tsx` (3,481 lines) - Main scrolling container with keyboard shortcuts
- `MediaGridItem.tsx` (161 lines) - Grid layout item wrapper
- `MediaListItem.tsx` (201 lines) - List layout item wrapper
- `MediaDisplayStyles.tsx` (232 lines) - Display mode styling
- `VirtualizedMasonryGrid.tsx` (412 lines) - Masonry layout with virtualization
- `VirtualizedMediaGrid.tsx` (265 lines) - Grid layout with virtualization

**Queue & Management:**
- `QueueManagementPanel.tsx` (779 lines) - Queue management UI
- `QueueButton.tsx` (198 lines) - Add to queue button
- `QueuePanelToggleButton.tsx` (115 lines) - Toggle queue panel
- `QueueSourceIndicator.tsx` (142 lines) - Queue source badge

**Dialogs & Overlays:**
- `TagFriendsDialog.tsx` (374 lines) - Tag users in media
- `ProcessMediaDialog.tsx` (555 lines) - Batch media processing
- `PriceEditPopover.tsx` (263 lines) - Edit media price
- `MediaProcessingOverlay.tsx` (177 lines) - Processing status overlay
- `VideoBugOverlay.tsx` (309 lines) - Video watermark/branding overlay

## 2. Custom Hooks

### 2.1 MediaViewer Hooks

1. **useMediaViewerLayout.ts** (577 lines)
   - Advanced layout calculation with optimal grid fitting
   - Handles responsive design for media + preview cards
   - Manages viewport constraints and aspect ratios

2. **useMediaViewerState.ts** (288 lines)
   - Finite state machine for viewer modes
   - States: NORMAL → THEATER → FULLSCREEN
   - Manages browser fullscreen API

3. **useMediaClassPlayback.ts** (226 lines)
   - MediaClass playback sequence management
   - Handles before/after idents
   - Video bug overlay control

### 2.2 Application-Level Hooks (15+ hooks)

- `useMediaQueue` - Queue state management (50-item limit)
- `useMediaTaskDetector` - Detect missing metadata tasks
- `useMediaMetadataProcessor` - Process metadata tasks
- `useMediaDisplay` - Display mode management
- `useMediaLayout` - Layout calculations
- `useGrammarMediaSearch` - Grammar-based search
- `useNextUpContent` - Next Up queue content provider
- `useMediaSelection` - Multi-select management
- `useCurrencyDisplay` - Format satoshi prices
- `usePaymentPreference` - Payment method selection
- And 5+ more specialized hooks

## 3. Context Providers

### 3.1 MediaProvider (900+ lines)
**Location:** `/Users/stoked/work/v3/apps/site/src/contexts/MediaProvider.tsx`

Global media state management with LocalStorage persistence.

**State:**
- `viewingMedia` - Whether media viewer is open
- `currentMediaId` - Currently viewed media ID
- `mediaType` - Filter: all/images/videos/streams
- `publicity` - Filter: all/public/private/paid
- `rating` - Filter: all/nc17/ga
- `orderBy` - Sort order
- `query` - Search query
- `viewType` - Display mode: masonry/grid/list
- `gridSize` - Grid size (1-5)

### 3.2 MediaQueueContext (190 lines)
Application-wide media queue (Next Up functionality).

**Features:**
- Queue operations (add/remove/clear/reorder)
- Queue panel UI state
- 50-item limit
- Source context tracking

### 3.3 MediaMetadataGeneratorContext (500+ lines)
Centralized metadata processing system.

**Tasks:**
- Video thumbnail generation
- Video duration extraction
- Image/video dimensions
- Blurred thumbnail generation (paid media)
- Video sprites (scrubber preview)

### 3.4 KeyboardShortcutsContext (102 lines)
Keyboard shortcuts overlay management.

## 4. Redux Dependencies

### 4.1 mediaSlice (1,178 lines)
Normalized media cache with LRU eviction.

**Features:**
- Collections by query key
- Normalized items (300-item cache max)
- Access tracking for LRU
- Individual item loading states

**Key Exports:**
- `selectMediaItemById`
- `updateMediaItem`
- `deleteMedia`
- `toggleMediaPublic`
- `fetchMediaItemById`

### 4.2 RTK Query - mediaApiService (927 lines)
**Endpoints:**
- `getUserMedia` - Fetch user's media with filters
- `discoverPublicMedia` - Fetch public media feed
- `getMediaItem` - Fetch single media item
- `updateMedia` - Update media metadata
- `uploadThumbnail` - Upload custom thumbnail
- `deleteMedia` - Delete media item
- `togglePublic` - Toggle public/private
- `massProcessMedia` - Batch metadata processing

## 5. Material-UI Dependencies

**Heavily Used Components:**
- **Layout:** Box, Card, Container, Stack
- **Buttons:** Button, IconButton, Fab, SpeedDial
- **Inputs:** TextField, Checkbox, Select
- **Feedback:** Dialog, Tooltip, Skeleton, CircularProgress
- **Data Display:** Typography, Avatar, Divider
- **Icons:** 50+ Material-UI icons

**Styling Approach:**
- `styled()` components
- `sx` prop for inline styles
- Theme integration via `useTheme()`
- Responsive breakpoints

## 6. Next.js Dependencies

### 6.1 Hooks
- `useRouter` - Client-side navigation
- `usePathname` - Current path
- `useSearchParams` - URL query parameters

### 6.2 Components & Patterns
- `<Link>` - Client-side navigation links
- `dynamic()` - Dynamic imports for code splitting
- Client Components (`'use client'` directive)
- URL query param synchronization
- SSR guards (`typeof window !== 'undefined'`)

## 7. Payment Integration

### 7.1 Lightning Network
**Components:**
- `<PurchaseDialog>` - Lightning purchase flow
- `<TipDialog>` - Lightning tipping
- Lightning balance display
- NWC (Nostr Wallet Connect) integration

**Features:**
- Satoshi pricing (`price` field)
- Invoice generation
- Payment verification

### 7.2 Crypto Wallet
**Components:**
- `<MetaMaskPurchaseDialog>` - MetaMask purchase flow
- Wallet connection management

**Features:**
- MetaMask integration
- ETH/ERC-20 payments

## 8. Type Definitions

### 8.1 ExtendedMediaItem (Primary Type)
```typescript
interface ExtendedMediaItem {
  _id?: string;
  author?: string;
  title?: string;
  description?: string;

  // Media properties
  mediaType?: 'image' | 'video' | 'album';
  mime?: string;
  file?: string;
  bucket?: string;

  // Dimensions
  width?: number;
  height?: number;
  duration?: number;

  // Thumbnails
  thumbnail?: string;
  paidThumbnail?: string;

  // Access control
  publicity?: 'public' | 'private' | 'paid' | 'subscription';
  rating?: 'ga' | 'nc17';

  // Pricing
  price?: number; // satoshis

  // Social
  starring?: string[]; // tagged users
  views?: number;

  // MediaClass
  mediaClass?: MediaClass;

  // ... 30+ more fields
}
```

## 9. Migration Complexity Assessment

### 9.1 HIGH Complexity Areas
1. **Redux Integration** - Deep coupling with mediaSlice caching
2. **RTK Query** - Extensive mutations and queries
3. **Next.js Routing** - URL synchronization, searchParams
4. **Context Providers** - 4 custom contexts with complex state
5. **Payment Integration** - Lightning + Crypto dual payment system
6. **MediaClass System** - Idents, video bugs, playback sequences
7. **Metadata Processing** - Complex async task queue
8. **Queue Management** - Next Up feature with persistence

### 9.2 MEDIUM Complexity Areas
1. **Material-UI** - Heavy usage but standard patterns
2. **Custom Hooks** - 18+ hooks but well-documented
3. **Utility Functions** - Many utils but isolated
4. **Styled Components** - Extensive but straightforward
5. **TypeScript Types** - Complex but well-defined

### 9.3 LOW Complexity Areas
1. **Icons** - Simple custom SVG components
2. **CSS Animations** - Standard CSS animations
3. **Skeleton Components** - Simple loading states

## 10. Migration Strategy

### Phase 2.2: Create Abstraction Layer
**Purpose:** Decouple from Next.js and v3-specific dependencies

**Required Abstractions:**
1. **Router Abstraction**
   - Interface compatible with Next.js router
   - Implementable with any router library
   - Support navigate, query params, pathname

2. **Authentication Abstraction**
   - User context interface
   - Login state management
   - Permission checking

3. **Payment Callback Interface**
   - Lightning payment callbacks
   - Crypto payment callbacks
   - Purchase verification

4. **Queue Context Interface**
   - Queue operations without Redux dependency
   - Pluggable storage backend

5. **Keyboard Shortcuts Plugin System**
   - Configurable shortcuts
   - Overlay management

### Phase 2.3: Migrate MediaCard
**Steps:**
1. Migrate sub-components (ThumbnailStrip, VideoProgressBar)
2. Migrate styled components
3. Integrate with abstraction layers
4. Test payment flows
5. Test metadata processing
6. Create Storybook stories

### Phase 2.4: Migrate MediaViewer
**Steps:**
1. Migrate viewer sub-components
2. Implement layout hooks
3. Integrate queue management
4. Test fullscreen/theater modes
5. Test keyboard shortcuts
6. Create Storybook stories

### Phase 2.5: Documentation
**Deliverables:**
1. Component API documentation
2. Storybook stories for all components
3. Migration guide for consumers
4. Usage examples
5. Accessibility documentation

## 11. NestJS API Requirements

### 11.1 Required Endpoints

**Media CRUD:**
- `GET /users/:userId/media` - Get user media with filters
- `GET /media/discover` - Get public media feed
- `GET /media/:type/:id` - Get single media item
- `PATCH /media/:type/:id` - Update media metadata
- `DELETE /media/:type/:id` - Delete media

**Thumbnails:**
- `POST /media/:type/:id/thumbnail` - Upload thumbnail
- `POST /media/:type/:id/thumbnail/blurred` - Upload blurred preview
- `DELETE /media/:type/:id/thumbnail` - Delete thumbnail

**Toggles:**
- `PATCH /media/:type/:id/toggle-public` - Toggle publicity
- `PATCH /media/:type/:id/toggle-adult` - Toggle rating

**Processing:**
- `POST /media/mass-process` - Batch metadata processing

**MediaClass:**
- `GET /media-classes` - Get all media classes

**Payments:**
- `POST /lightning/purchase/:mediaId` - Create Lightning invoice
- `POST /crypto/purchase/:mediaId` - Create crypto payment
- `GET /purchases/:mediaId/verify` - Verify purchase access

### 11.2 Response Format
```typescript
{
  data: MediaItem[];
  count: number;
  skip: number;
  limit: number;
}
```

## 12. Migration Risks & Mitigation

### 12.1 High-Risk Areas

**1. Redux State Migration**
- **Risk:** Breaking existing caching, losing user data
- **Mitigation:** Maintain exact mediaSlice structure, version API endpoints

**2. Payment Flow Integrity**
- **Risk:** Breaking purchases, losing revenue
- **Mitigation:** Extensive payment testing, maintain API contracts

**3. URL Structure Changes**
- **Risk:** Breaking bookmarks, shares, SEO
- **Mitigation:** Maintain URL compatibility, add migration layer

**4. Context Provider Breaking Changes**
- **Risk:** Breaking parent components across app
- **Mitigation:** Gradual migration, compatibility wrappers

### 12.2 Testing Requirements

**Unit Tests:**
- All utility functions
- All custom hooks
- Redux actions/reducers
- Type definitions

**Integration Tests:**
- Component interactions
- Context provider integration
- Redux integration
- Hook composition

**E2E Tests:**
- Media upload flow
- Purchase flow (Lightning + Crypto)
- Queue management
- Metadata processing
- MediaClass playback

## 13. Success Criteria

**Phase 2.1 Complete:** ✅
- [x] All v3 dependencies documented
- [x] Component inventory created
- [x] Complexity assessment completed
- [x] Migration strategy defined

**Phase 2.2 (Next):**
- [ ] Router abstraction created
- [ ] Auth abstraction created
- [ ] Payment interface created
- [ ] Queue abstraction created
- [ ] Default/noop implementations provided

**Phase 2.3:**
- [ ] MediaCard component migrated
- [ ] All sub-components migrated
- [ ] Payment integration tested
- [ ] Storybook stories created

**Phase 2.4:**
- [ ] MediaViewer component migrated
- [ ] All sub-components migrated
- [ ] Queue management integrated
- [ ] Storybook stories created

**Phase 2.5:**
- [ ] Documentation complete
- [ ] Migration guide written
- [ ] All acceptance criteria met

## 14. Conclusion

### 14.1 Migration Feasibility: COMPLEX BUT ACHIEVABLE

**Estimated Effort:** 6-8 weeks
**Team Size:** 2-3 developers
**Risk Level:** HIGH

### 14.2 Critical Dependencies
1. NestJS backend API endpoints
2. Payment sandbox environment
3. Redux store structure finalized
4. Type definitions approved
5. Testing infrastructure ready

### 14.3 Next Steps
1. ✅ Review analysis with team
2. Create abstraction layer (Phase 2.2)
3. Begin MediaCard migration (Phase 2.3)
4. Set up NestJS backend endpoints
5. Configure payment sandbox

---

**Document Status:** COMPLETE
**Ready for:** Phase 2.2 - Create Abstraction Layers
**Completion:** Phase 2.1 - 100%

---

All acceptance criteria for Phase 2.1 met:
- ✅ AC-2.1.a: MediaCard dependencies documented
- ✅ AC-2.1.b: MediaViewer dependencies documented
- ✅ AC-2.1.c: Redux dependencies cataloged
- ✅ AC-2.1.d: External dependencies documented
- ✅ AC-2.1.e: Component hierarchy documented
