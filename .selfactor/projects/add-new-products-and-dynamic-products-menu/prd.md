# Product Requirements Document: Add New Products and Dynamic Products Menu

## 0. Source Context

| Field | Value |
|-------|-------|
| **Feature Brief** | `./projects/add-new-products-and-dynamic-products-menu/pfb.md` |
| **Target Codebase** | `/opt/worktrees/stoked-ui/stoked-ui-main` |
| **Primary File** | `docs/src/products.tsx` (product definitions, `ALL_PRODUCTS` constant) |
| **Navigation File** | `docs/src/components/header/HeaderNavBar.tsx` (consumes `ALL_PRODUCTS`) |
| **Route File** | `docs/src/route.ts` (route constants) |
| **Page Definitions** | `docs/data/pages.ts` (main pages), `docs/data/fluxPages.ts` (Flux pages) |
| **App Router** | `docs/pages/_app.js` (page context resolution, imports page definitions) |
| **Seed Script** | `docs/scripts/seed-products.ts` (MongoDB seeding pattern) |
| **Product Worktrees** | Mac Mixer: `/opt/worktrees/mac-mixer/master/`, Always Listening: `/opt/worktrees/always-listening/always-listening-main/`, Stokd Cloud: `/opt/worktrees/stokd-cloud/stokd-cloud-main/` |
| **Date** | 2026-02-25 |

### Bug Summary

Line 1039 of `docs/src/products.tsx` reads:

```ts
const ALL_PRODUCTS: Products = new Products([sui, flux]);
```

This hardcodes the unauthenticated Products dropdown to show only Stoked UI and Flux. The `Products` class already has a `.live` getter that filters to `live: true` products, and `Products.menu()` already calls `this.live` to render menu items. The fix is to populate `ALL_PRODUCTS` with all non-consulting products and let the existing `.live` filter handle visibility.

---

## 1. Objectives & Constraints

### Objectives

1. **Register three new products** (Mac Mixer, Always Listening, Stokd Cloud) in `docs/src/products.tsx` with accurate metadata, icons, feature lists, and `live: true`.
2. **Create documentation content** (markdown files) for each new product under `docs/data/{product-id}/docs/`.
3. **Create page definition files** (`macMixerPages.ts`, `alwaysListeningPages.ts`, `stokdCloudPages.ts`) following the `fluxPages.ts` pattern.
4. **Create Next.js page routes** (`docs/pages/{product-id}/`) following the Flux page routing pattern.
5. **Add route constants** to `docs/src/route.ts` for each new product.
6. **Fix the dynamic menu bug** by replacing the hardcoded `ALL_PRODUCTS` with a collection of all non-consulting products, filtered by `live: true` at render time.
7. **Wire page definitions into `_app.js`** so that the Next.js router resolves product doc URLs correctly.
8. **Create MongoDB seed scripts** for each new product following the `seed-products.ts` pattern.
9. **Ensure zero regressions** to existing product pages, navigation, and Flux documentation.

### Constraints

- **Icons**: Only 5 icon name variants exist: `product-core`, `product-advanced`, `product-designkits`, `product-templates`, `product-toolpad`. New products must use one of these.
- **Showcase Components**: New products must provide a `showcaseType` React component. Use `AdvancedShowcase` as a placeholder. Set `hideProductFeatures: true` to avoid homepage showcase rendering.
- **Doc Structure**: Markdown files must live at `docs/data/{product-id}/docs/{slug}/{slug}.md` with YAML front matter containing `productId` and `title`.
- **Page Routes**: Each doc page needs a corresponding `.js` file in `docs/pages/{product-id}/docs/{slug}.js` that imports the markdown via `?muiMarkdown` loader.
- **No New Icons**: Out of scope for this iteration. Custom SVG icons deferred.
- **No Consulting Products Affected**: The `CONSULTING` collection remains unchanged.

---

## 1.5 Required Toolchain

| Tool | Purpose |
|------|---------|
| Node.js 20+ | Runtime for Next.js dev server and build |
| TypeScript | All source files use TypeScript |
| `pnpm` | Package manager (monorepo) |
| MongoDB | Local or hosted instance for seed script testing |
| `npx tsx` | Running seed scripts |
| Git | Version control |

### Key Commands

```bash
# Dev server (from docs/)
pnpm dev

# Type checking
pnpm tsc --noEmit

# Seed products
npx tsx docs/scripts/seed-products.ts

# Build
pnpm build
```

---

## 2. Execution Phases

---

### Phase 1: Foundation -- Product Definitions, Routes, and Dynamic Menu Fix

**Purpose**: Establish the product data model entries, route constants, and fix the hardcoded `ALL_PRODUCTS` array so that the navigation menu dynamically renders all live non-consulting products.

---

#### Work Item 1.1: Add Route Constants for New Products

**File**: `docs/src/route.ts`

**Implementation Details**:

Add the following entries to the `ROUTES` object, after the existing Flux routes (line 32) and before the Consulting section:

```ts
// Mac Mixer
macMixer: '/mac-mixer/',
macMixerDocs: '/mac-mixer/docs/overview/',
// Always Listening
alwaysListening: '/always-listening/',
alwaysListeningDocs: '/always-listening/docs/overview/',
// Stokd Cloud
stokdCloud: '/stokd-cloud/',
stokdCloudDocs: '/stokd-cloud/docs/overview/',
```

**Acceptance Criteria**:

- AC-1.1.a: `ROUTES.macMixer` equals `'/mac-mixer/'`
- AC-1.1.b: `ROUTES.macMixerDocs` equals `'/mac-mixer/docs/overview/'`
- AC-1.1.c: `ROUTES.alwaysListening` equals `'/always-listening/'`
- AC-1.1.d: `ROUTES.alwaysListeningDocs` equals `'/always-listening/docs/overview/'`
- AC-1.1.e: `ROUTES.stokdCloud` equals `'/stokd-cloud/'`
- AC-1.1.f: `ROUTES.stokdCloudDocs` equals `'/stokd-cloud/docs/overview/'`

**Acceptance Tests**:

- Test-1.1.a: Importing `ROUTES` and accessing each new key returns the expected path string.
- Test-1.1.b: Existing routes (e.g., `ROUTES.flux`, `ROUTES.consulting`) are unchanged.

**Verification Commands**:

```bash
grep -q "macMixer: '/mac-mixer/'" docs/src/route.ts && echo "PASS" || echo "FAIL"
grep -q "alwaysListening: '/always-listening/'" docs/src/route.ts && echo "PASS" || echo "FAIL"
grep -q "stokdCloud: '/stokd-cloud/'" docs/src/route.ts && echo "PASS" || echo "FAIL"
grep -q "macMixerDocs: '/mac-mixer/docs/overview/'" docs/src/route.ts && echo "PASS" || echo "FAIL"
grep -q "alwaysListeningDocs: '/always-listening/docs/overview/'" docs/src/route.ts && echo "PASS" || echo "FAIL"
grep -q "stokdCloudDocs: '/stokd-cloud/docs/overview/'" docs/src/route.ts && echo "PASS" || echo "FAIL"
```

---

#### Work Item 1.2: Add Product Definitions for Mac Mixer, Always Listening, and Stokd Cloud

**File**: `docs/src/products.tsx`

**Implementation Details**:

Add three new `TProduct` definitions after the existing `flux` definition (after line 1036) and before the `PRODUCTS` constant (line 1038):

##### Mac Mixer

```ts
const macMixerData: TProduct = {
  id: 'mac-mixer',
  name: "Mac Mixer",
  fullName: "Mac Mixer",
  description: "macOS audio utility with per-app volume control, auto-pause, and system audio recording",
  icon: "product-advanced",
  url: "/mac-mixer",
  hideProductFeatures: true,
  live: true,
  showcaseType: AdvancedShowcase,
  features: [{
    name: 'Overview',
    description: 'Features, system requirements, and getting started',
    id: 'overview',
  }, {
    name: 'App Volumes',
    description: 'Per-application volume control with boost',
    id: 'app-volumes',
  }, {
    name: 'Auto-Pause',
    description: 'Automatically pause music when other audio plays',
    id: 'auto-pause',
  }, {
    name: 'Roadmap',
    description: 'Current status and future plans',
    id: 'roadmap',
  }],
};
const macMixer = new Product(macMixerData);
```

##### Always Listening

```ts
const alwaysListeningData: TProduct = {
  id: 'always-listening',
  name: "Always Listening",
  fullName: "Always Listening",
  description: "Cross-platform voice pipeline tray app with Voice-to-Claude, Dictation, and Combined modes",
  icon: "product-templates",
  url: "/always-listening",
  hideProductFeatures: true,
  live: true,
  showcaseType: AdvancedShowcase,
  features: [{
    name: 'Overview',
    description: 'Voice pipeline overview and tech stack',
    id: 'overview',
  }, {
    name: 'Voice Modes',
    description: 'Voice-to-Claude, Dictation, and Combined mode details',
    id: 'voice-modes',
  }, {
    name: 'Preferences',
    description: 'Configuration, hotkeys, and TTS settings',
    id: 'preferences',
  }, {
    name: 'Roadmap',
    description: 'Development status and planned features',
    id: 'roadmap',
  }],
};
const alwaysListening = new Product(alwaysListeningData);
```

##### Stokd Cloud

```ts
const stokdCloudData: TProduct = {
  id: 'stokd-cloud',
  name: "Stokd Cloud",
  fullName: "Stokd Cloud",
  description: "AI-powered project orchestration with VSCode extension, NestJS API, and MCP server",
  icon: "product-toolpad",
  url: "/stokd-cloud",
  hideProductFeatures: true,
  live: true,
  showcaseType: AdvancedShowcase,
  features: [{
    name: 'Overview',
    description: 'Platform overview and architecture',
    id: 'overview',
  }, {
    name: 'VSCode Extension',
    description: 'Project management and Claude AI integration',
    id: 'vscode-extension',
  }, {
    name: 'State API',
    description: 'NestJS session and task tracking API',
    id: 'state-api',
  }, {
    name: 'Roadmap',
    description: 'Development status and plans',
    id: 'roadmap',
  }],
};
const stokdCloud = new Product(stokdCloudData);
```

**Acceptance Criteria**:

- AC-1.2.a: `macMixerData` object exists with `id: 'mac-mixer'`, `live: true`, `icon: 'product-advanced'`, `url: '/mac-mixer'`, and 4 features.
- AC-1.2.b: `alwaysListeningData` object exists with `id: 'always-listening'`, `live: true`, `icon: 'product-templates'`, `url: '/always-listening'`, and 4 features.
- AC-1.2.c: `stokdCloudData` object exists with `id: 'stokd-cloud'`, `live: true`, `icon: 'product-toolpad'`, `url: '/stokd-cloud'`, and 4 features.
- AC-1.2.d: Each product uses `AdvancedShowcase` as `showcaseType` and sets `hideProductFeatures: true`.
- AC-1.2.e: Each product is instantiated via `new Product(...)`.

**Acceptance Tests**:

- Test-1.2.a: Grep for `id: 'mac-mixer'` in `products.tsx` returns a match.
- Test-1.2.b: Grep for `id: 'always-listening'` in `products.tsx` returns a match.
- Test-1.2.c: Grep for `id: 'stokd-cloud'` in `products.tsx` returns a match.

**Verification Commands**:

```bash
grep -q "id: 'mac-mixer'" docs/src/products.tsx && echo "PASS" || echo "FAIL"
grep -q "id: 'always-listening'" docs/src/products.tsx && echo "PASS" || echo "FAIL"
grep -q "id: 'stokd-cloud'" docs/src/products.tsx && echo "PASS" || echo "FAIL"
grep -c "new Product(" docs/src/products.tsx | xargs -I{} test {} -ge 14 && echo "PASS" || echo "FAIL"
```

---

#### Work Item 1.3: Fix the Dynamic Products Menu

**File**: `docs/src/products.tsx`

**Implementation Details**:

Replace line 1039:

```ts
const ALL_PRODUCTS: Products = new Products([sui, flux]);
```

With a dynamic collection that includes Stoked UI plus all non-consulting products. The `Products.live` getter already filters to `live: true` at render time, so we include all non-consulting product instances:

```ts
const ALL_PRODUCTS: Products = new Products([
  sui, fileExplorer, media, timeline, videoEditor, flux, macMixer, alwaysListening, stokdCloud
]);
```

This ensures:
- All products with `live: true` appear in the menu (via `Products.menu()` which calls `this.live`).
- Products with `live: false` (e.g., `common`, `mediaApi`, `mediaSelector`) are excluded at render time.
- Consulting products remain in their separate `CONSULTING` collection.
- Future products added to this array with `live: true` automatically appear in the menu.

Also update the `ALL_PACKAGES` collection to include the three new products:

```ts
const ALL_PACKAGES: Products = new Products([
  fileExplorer, media, common, mediaApi, mediaSelector, timeline, videoEditor, flux,
  macMixer, alwaysListening, stokdCloud,
  consultingFrontEnd, consultingBackEnd, consultingDevops, consultingAi
]);
```

And update the exports to include the new individual product instances if needed externally:

```ts
export { PRODUCTS, ALL_PRODUCTS, ALL_PACKAGES, CONSULTING }
```

**Acceptance Criteria**:

- AC-1.3.a: The `ALL_PRODUCTS` constructor no longer contains the hardcoded `[sui, flux]` array.
- AC-1.3.b: `ALL_PRODUCTS` includes `sui`, `fileExplorer`, `media`, `timeline`, `videoEditor`, `flux`, `macMixer`, `alwaysListening`, and `stokdCloud`.
- AC-1.3.c: `ALL_PRODUCTS.live` returns only products where `data.live === true`.
- AC-1.3.d: `CONSULTING` collection is unchanged (still `[consultingFrontEnd, consultingBackEnd, consultingDevops, consultingAi]`).
- AC-1.3.e: `HeaderNavBar.tsx` requires zero changes -- it continues to call `ALL_PRODUCTS.menu()` and renders all live products.

**Acceptance Tests**:

- Test-1.3.a: Grep for `new Products([sui, flux])` in `products.tsx` returns zero matches.
- Test-1.3.b: The `ALL_PRODUCTS` constructor includes `macMixer`, `alwaysListening`, and `stokdCloud`.
- Test-1.3.c: `HeaderNavBar.tsx` has not been modified (git diff shows no changes).

**Verification Commands**:

```bash
# Hardcoded array is removed
grep -c "new Products(\[sui, flux\])" docs/src/products.tsx | xargs -I{} test {} -eq 0 && echo "PASS" || echo "FAIL"

# New products are in ALL_PRODUCTS
grep "ALL_PRODUCTS" docs/src/products.tsx | grep -q "macMixer" && echo "PASS" || echo "FAIL"
grep "ALL_PRODUCTS" docs/src/products.tsx | grep -q "alwaysListening" && echo "PASS" || echo "FAIL"
grep "ALL_PRODUCTS" docs/src/products.tsx | grep -q "stokdCloud" && echo "PASS" || echo "FAIL"

# HeaderNavBar unchanged
git diff --name-only docs/src/components/header/HeaderNavBar.tsx | wc -l | xargs -I{} test {} -eq 0 && echo "PASS" || echo "FAIL"
```

---

#### Work Item 1.4: Add Page Definition Files for New Products

**Files to create**:
- `docs/data/macMixerPages.ts`
- `docs/data/alwaysListeningPages.ts`
- `docs/data/stokdCloudPages.ts`

**Implementation Details**:

Follow the exact pattern of `docs/data/fluxPages.ts`.

##### macMixerPages.ts

```ts
import type { MuiPage } from '../src/MuiPage';

const macMixerPages: MuiPage[] = [
  {
    pathname: '/mac-mixer/docs',
    title: 'Mac Mixer',
    alpha: true,
    children: [
      { pathname: '/mac-mixer/docs/overview', title: 'Overview' },
      { pathname: '/mac-mixer/docs/app-volumes', title: 'App Volumes' },
      { pathname: '/mac-mixer/docs/auto-pause', title: 'Auto-Pause' },
      { pathname: '/mac-mixer/docs/recording', title: 'Recording' },
      { pathname: '/mac-mixer/docs/download', title: 'Download' },
      { pathname: '/mac-mixer/docs/roadmap' },
    ],
  },
];

export default macMixerPages;
```

##### alwaysListeningPages.ts

```ts
import type { MuiPage } from '../src/MuiPage';

const alwaysListeningPages: MuiPage[] = [
  {
    pathname: '/always-listening/docs',
    title: 'Always Listening',
    dev: true,
    children: [
      { pathname: '/always-listening/docs/overview', title: 'Overview' },
      { pathname: '/always-listening/docs/voice-modes', title: 'Voice Modes' },
      { pathname: '/always-listening/docs/preferences', title: 'Preferences' },
      { pathname: '/always-listening/docs/roadmap' },
    ],
  },
];

export default alwaysListeningPages;
```

##### stokdCloudPages.ts

```ts
import type { MuiPage } from '../src/MuiPage';

const stokdCloudPages: MuiPage[] = [
  {
    pathname: '/stokd-cloud/docs',
    title: 'Stokd Cloud',
    dev: true,
    children: [
      { pathname: '/stokd-cloud/docs/overview', title: 'Overview' },
      { pathname: '/stokd-cloud/docs/vscode-extension', title: 'VSCode Extension' },
      { pathname: '/stokd-cloud/docs/state-api', title: 'State API' },
      { pathname: '/stokd-cloud/docs/review-commands', title: 'Review Commands' },
      { pathname: '/stokd-cloud/docs/roadmap' },
    ],
  },
];

export default stokdCloudPages;
```

**Acceptance Criteria**:

- AC-1.4.a: `docs/data/macMixerPages.ts` exists, exports a `MuiPage[]` array with a root `pathname: '/mac-mixer/docs'` and 6 child entries.
- AC-1.4.b: `docs/data/alwaysListeningPages.ts` exists, exports a `MuiPage[]` with root `pathname: '/always-listening/docs'` and 4 child entries.
- AC-1.4.c: `docs/data/stokdCloudPages.ts` exists, exports a `MuiPage[]` with root `pathname: '/stokd-cloud/docs'` and 5 child entries.
- AC-1.4.d: Each file follows the exact export pattern of `fluxPages.ts` (default export of typed array).

**Acceptance Tests**:

- Test-1.4.a: Each file exists on disk at the expected path.
- Test-1.4.b: Each file contains a default export.

**Verification Commands**:

```bash
test -f docs/data/macMixerPages.ts && echo "PASS" || echo "FAIL"
test -f docs/data/alwaysListeningPages.ts && echo "PASS" || echo "FAIL"
test -f docs/data/stokdCloudPages.ts && echo "PASS" || echo "FAIL"
grep -q "export default macMixerPages" docs/data/macMixerPages.ts && echo "PASS" || echo "FAIL"
grep -q "export default alwaysListeningPages" docs/data/alwaysListeningPages.ts && echo "PASS" || echo "FAIL"
grep -q "export default stokdCloudPages" docs/data/stokdCloudPages.ts && echo "PASS" || echo "FAIL"
```

---

#### Work Item 1.5: Wire Page Definitions into _app.js

**File**: `docs/pages/_app.js`

**Implementation Details**:

In `docs/pages/_app.js`, add imports for the new page definition files alongside the existing `fluxPages` import (line 29):

```js
import fluxPages from '../data/fluxPages';
import macMixerPages from '../data/macMixerPages';
import alwaysListeningPages from '../data/alwaysListeningPages';
import stokdCloudPages from '../data/stokdCloudPages';
```

Then update the `pageContextValue` useMemo (around line 253) to route to the correct page set based on `productId`:

Replace:
```js
const pages = productId === 'flux' ? fluxPages : allPages;
```

With:
```js
const productPageMap = {
  'flux': fluxPages,
  'mac-mixer': macMixerPages,
  'always-listening': alwaysListeningPages,
  'stokd-cloud': stokdCloudPages,
};
const pages = productPageMap[productId] || allPages;
```

**Acceptance Criteria**:

- AC-1.5.a: `_app.js` imports `macMixerPages`, `alwaysListeningPages`, and `stokdCloudPages`.
- AC-1.5.b: The `pageContextValue` useMemo uses a lookup map to select pages by `productId`.
- AC-1.5.c: Navigating to `/mac-mixer/docs/overview` uses `macMixerPages` for sidebar navigation.
- AC-1.5.d: Navigating to `/flux/docs/overview` continues to use `fluxPages` (no regression).
- AC-1.5.e: Navigating to `/file-explorer/docs/overview` continues to use `allPages` (no regression).

**Acceptance Tests**:

- Test-1.5.a: Grep for `macMixerPages` in `_app.js` returns matches for both import and usage.
- Test-1.5.b: The hardcoded `productId === 'flux'` ternary is replaced with the lookup map.

**Verification Commands**:

```bash
grep -q "import macMixerPages" docs/pages/_app.js && echo "PASS" || echo "FAIL"
grep -q "import alwaysListeningPages" docs/pages/_app.js && echo "PASS" || echo "FAIL"
grep -q "import stokdCloudPages" docs/pages/_app.js && echo "PASS" || echo "FAIL"
grep -q "productPageMap" docs/pages/_app.js && echo "PASS" || echo "FAIL"
```

---

### Phase 2: Documentation Content -- Markdown Docs and Next.js Page Routes

**Purpose**: Create the actual documentation markdown files and Next.js page route files for all three new products, following the patterns established by Flux.

---

#### Work Item 2.1: Create Mac Mixer Documentation Content

**Directories to create**:
- `docs/data/mac-mixer/docs/overview/`
- `docs/data/mac-mixer/docs/app-volumes/`
- `docs/data/mac-mixer/docs/auto-pause/`
- `docs/data/mac-mixer/docs/recording/`
- `docs/data/mac-mixer/docs/download/`
- `docs/data/mac-mixer/docs/roadmap/`

**Implementation Details**:

Create markdown files with YAML front matter. Content should be derived from the actual Mac Mixer README at `/opt/worktrees/mac-mixer/master/README.md`.

##### `docs/data/mac-mixer/docs/overview/overview.md`

```markdown
---
productId: mac-mixer
title: Mac Mixer - macOS Audio Utility
---

# Overview

<p class="description">Mac Mixer is a macOS audio utility that gives you per-app volume control, auto-pause for your music player, and system audio recording.</p>

## What is Mac Mixer?

Mac Mixer is a macOS menu bar application that installs a virtual audio device to intercept and control system audio on a per-application basis. Whether you need to lower the volume of a single noisy app, automatically pause your music during video calls, or record all system audio, Mac Mixer handles it without requiring a system restart.

## Key Features

- **Per-Application Volume Control** -- Individual volume sliders for every application producing audio, with the ability to boost above 100%.
- **Auto-Pause Music** -- Automatically pauses your music player when other audio sources start and resumes when they stop. Supports iTunes, Spotify, VLC, VOX, Decibel, Hermes, Swinsian, and GPMDP.
- **System Audio Recording** -- Record all system audio via QuickTime Player or any application that supports audio input device selection.
- **No Restart Required** -- Installs and runs without needing a system reboot.
- **Menu Bar Control** -- Lightweight menu bar interface for quick access to all controls.

## System Requirements

| Requirement | Minimum |
|-------------|---------|
| Operating System | macOS 10.13+ |
| Architecture | Apple Silicon or Intel |
| Build Tools | Xcode 10+ (for building from source) |

## Current Status

Mac Mixer is in **alpha**. Core functionality (per-app volume, auto-pause, recording) is working. See the [Roadmap](/mac-mixer/docs/roadmap/) for planned improvements.

## Getting Started

1. **Download** -- Visit the [Download](/mac-mixer/docs/download/) page for installation options.
2. **Launch** -- Run Mac Mixer from Applications. It sets itself as the default output device automatically.
3. **Control** -- Use the menu bar icon to adjust per-app volumes and configure auto-pause.

Continue to [App Volumes](/mac-mixer/docs/app-volumes/) to learn about per-application volume control, or [Auto-Pause](/mac-mixer/docs/auto-pause/) for automatic music pausing.
```

##### `docs/data/mac-mixer/docs/app-volumes/app-volumes.md`

```markdown
---
productId: mac-mixer
title: App Volumes - Per-Application Volume Control
---

# App Volumes

<p class="description">Control the volume of each application independently with per-app volume sliders.</p>

## How It Works

Mac Mixer provides a volume slider for each application running on your system. The virtual audio device intercepts audio from every app, allowing you to adjust levels individually before they reach your speakers or headphones.

## Features

- **Individual Volume Sliders** -- Each running application gets its own volume control.
- **Volume Boost** -- Boost quiet applications above their default maximum volume (up to 150%).
- **Real-Time Updates** -- New applications automatically appear when they start producing audio.
- **More Apps Section** -- Some applications use helper processes for audio. Check "More Apps" for entries like "App Name (Helper)" to control meeting or video chat volumes.

## Known Limitations

- Setting an application's volume above 50% can cause audio clipping. For best results, set your system volume to maximum and lower individual app volumes as needed.
- Only 2-channel (stereo) audio output devices are currently supported.

## Usage

1. Click the Mac Mixer icon in the menu bar.
2. Locate the application you want to adjust.
3. Drag the volume slider left or right.
4. For helper processes, expand the "More Apps" section.
```

##### `docs/data/mac-mixer/docs/auto-pause/auto-pause.md`

```markdown
---
productId: mac-mixer
title: Auto-Pause - Automatic Music Pausing
---

# Auto-Pause

<p class="description">Automatically pause your music player when other audio sources start playing, and resume when they stop.</p>

## How It Works

When Mac Mixer detects audio from a non-music application (such as a video call, YouTube video, or notification sound), it automatically pauses your music player. When that audio source stops, Mac Mixer resumes playback.

## Supported Music Players

- [iTunes / Apple Music](https://www.apple.com/itunes/)
- [Spotify](https://www.spotify.com)
- [VLC](https://www.videolan.org/vlc/)
- [VOX](https://vox.rocks/mac-music-player)
- [Decibel](https://sbooth.org/Decibel/)
- [Hermes](http://hermesapp.org/)
- [Swinsian](https://swinsian.com/)
- [GPMDP](https://www.googleplaymusicdesktopplayer.com/)

## Configuration

The auto-pause delay can be adjusted to avoid false triggers from short notification sounds. Increase the delay if brief system sounds are causing unwanted pauses.

## Adding New Players

Adding support for a new music player is usually straightforward if the player supports AppleScript with `isPlaying`, `isPaused`, `play`, and `pause` events. Players without AppleScript support require additional development effort.
```

##### `docs/data/mac-mixer/docs/recording/recording.md`

```markdown
---
productId: mac-mixer
title: Recording System Audio
---

# Recording System Audio

<p class="description">Record system audio from any application using Mac Mixer as a virtual audio input device.</p>

## Quick Start

1. Ensure Mac Mixer is running.
2. Open **QuickTime Player**.
3. Select **File > New Audio Recording** (or **New Screen Recording** / **New Movie Recording**).
4. Click the dropdown menu next to the record button.
5. Select **Mac Mixer** as the input device.
6. Press record.

## Recording System Audio and Microphone Together

To capture both system audio and your microphone simultaneously:

1. Open **Audio MIDI Setup** (in `/Applications/Utilities/`).
2. Create a new **Aggregate Device**.
3. Add your input device (usually "Built-in Input") and the **Mac Mixer** device to the aggregate.
4. Select this aggregate device as your recording input.

## Privacy Note

Mac Mixer requires "microphone access" permission in macOS. This is because it captures system audio through its virtual input device, which macOS classifies as a microphone. Mac Mixer does not actually listen to your physical microphone unless you configure an aggregate device as described above.
```

##### `docs/data/mac-mixer/docs/download/download.md`

```markdown
---
productId: mac-mixer
title: Download Mac Mixer
---

# Download

<p class="description">Download and install Mac Mixer on your Mac.</p>

## Requirements

- macOS 10.13 or later
- Apple Silicon or Intel Mac

## Option 1: Homebrew

Install using [Homebrew](https://brew.sh/) by running the following command in Terminal:

```bash
brew install --cask background-music
```

## Option 2: Direct Download

Download version 0.4.3:

[BackgroundMusic-0.4.3.pkg](https://github.com/kyleneideck/BackgroundMusic/releases/download/v0.4.3/BackgroundMusic-0.4.3.pkg) (771 KB)

## Option 3: Build from Source

Requires [Xcode](https://developer.apple.com/xcode/download/) version 10 or higher.

1. Open Terminal.
2. Run:

```bash
(set -eo pipefail; URL='https://github.com/kyleneideck/BackgroundMusic/archive/master.tar.gz'; \
    cd $(mktemp -d); echo Downloading $URL to $(pwd); curl -qfL# $URL | gzcat - | tar x && \
    /bin/bash BackgroundMusic-master/build_and_install.sh -w && rm -rf BackgroundMusic-master)
```

The script restarts the system audio process (coreaudiod) at the end, so pause any audio playback before building.

## Uninstall

1. Open Terminal.
2. Run: `cd /Applications/Background\ Music.app/Contents/Resources/`
3. Run: `bash uninstall.sh`
```

##### `docs/data/mac-mixer/docs/roadmap/roadmap.md`

```markdown
---
productId: mac-mixer
title: Roadmap
---

# Mac Mixer Roadmap

<p class="description">Current status and planned features for Mac Mixer.</p>

## Current Version (Alpha)

- Per-application volume control with boost
- Auto-pause music for 8 supported players
- System audio recording via virtual audio device
- Menu bar interface
- Homebrew installation support
- No-restart installation

## Short Term

- **Per-App Audio Output Selection** -- Route individual application audio to different output devices (headphones, speakers, etc.).
- **Performance Optimizations** -- Reduce CPU usage during audio processing.
- **Enhanced Clipping Prevention** -- Better handling of volume boost to prevent audio distortion.

## Medium Term

- **Multi-Channel Support** -- Support for surround sound and multi-channel audio devices.
- **Audio Equalizer** -- Per-app EQ controls.
- **Keyboard Shortcuts** -- Global hotkeys for muting individual apps.

## Long Term

- **Apple Silicon Optimization** -- Native ARM64 audio processing pipeline.
- **App Store Distribution** -- Signed and notarized distribution through the Mac App Store.

## License

Mac Mixer is based on the BackgroundMusic project and is licensed under GPLv2.

---

*This roadmap reflects current development priorities and is subject to change.*
```

**Acceptance Criteria**:

- AC-2.1.a: Directory `docs/data/mac-mixer/docs/overview/` exists and contains `overview.md` with front matter `productId: mac-mixer`.
- AC-2.1.b: Directory `docs/data/mac-mixer/docs/app-volumes/` exists and contains `app-volumes.md`.
- AC-2.1.c: Directory `docs/data/mac-mixer/docs/auto-pause/` exists and contains `auto-pause.md`.
- AC-2.1.d: Directory `docs/data/mac-mixer/docs/recording/` exists and contains `recording.md`.
- AC-2.1.e: Directory `docs/data/mac-mixer/docs/download/` exists and contains `download.md`.
- AC-2.1.f: Directory `docs/data/mac-mixer/docs/roadmap/` exists and contains `roadmap.md`.
- AC-2.1.g: All markdown files contain valid YAML front matter with `productId: mac-mixer` and `title:`.

**Acceptance Tests**:

- Test-2.1.a: All 6 directories and markdown files exist on disk.
- Test-2.1.b: Each file has `productId: mac-mixer` in its front matter.

**Verification Commands**:

```bash
for slug in overview app-volumes auto-pause recording download roadmap; do
  test -f "docs/data/mac-mixer/docs/$slug/$slug.md" && echo "PASS: $slug" || echo "FAIL: $slug"
done

for slug in overview app-volumes auto-pause recording download roadmap; do
  grep -q "productId: mac-mixer" "docs/data/mac-mixer/docs/$slug/$slug.md" && echo "PASS: $slug frontmatter" || echo "FAIL: $slug frontmatter"
done
```

---

#### Work Item 2.2: Create Always Listening Documentation Content

**Directories to create**:
- `docs/data/always-listening/docs/overview/`
- `docs/data/always-listening/docs/voice-modes/`
- `docs/data/always-listening/docs/preferences/`
- `docs/data/always-listening/docs/roadmap/`

**Implementation Details**:

Content derived from the Always Listening source at `/opt/worktrees/always-listening/always-listening-main/`. The app is a Tauri v2 system tray application with Rust backend and React frontend, supporting configurable voice agents with modes like Voice-to-Claude, Dictation, and Home Assistant control.

##### `docs/data/always-listening/docs/overview/overview.md`

```markdown
---
productId: always-listening
title: Always Listening - Voice Pipeline Tray App
---

# Overview

<p class="description">Always Listening is a cross-platform system tray application that provides a configurable voice pipeline with multiple agent modes.</p>

## What is Always Listening?

Always Listening is a Tauri v2 application that lives in your system tray and continuously listens for voice input. It transcribes speech locally using Whisper, routes it to configurable agents (Claude AI, dictation, Home Assistant), and speaks responses back using text-to-speech. Switch between modes with a global hotkey or the tray menu.

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Rust + Tauri v2
- **Speech-to-Text**: Whisper (local, via whisper-rs)
- **Text-to-Speech**: Piper TTS (local) or ElevenLabs (cloud)
- **AI Integration**: Claude AI via API
- **Home Automation**: Home Assistant integration

## Key Features

- **Multiple Voice Modes** -- Configure multiple agents (Voice-to-Claude, Dictation, Home Assistant control) and switch between them with hotkeys.
- **System Tray Interface** -- Lightweight tray icon with animated state indicators (idle, recording, speaking).
- **Global Hotkeys** -- F19 to cycle modes, F18 to mute, plus per-agent custom hotkeys.
- **Local Speech Processing** -- Whisper transcription runs on-device for privacy and speed.
- **Configurable TTS** -- Choose between local Piper TTS voices or cloud ElevenLabs voices per agent.
- **Trigger Words** -- Each mode can have a trigger word to switch to it by voice.
- **Mute Toggle** -- Instantly mute/unmute the pipeline while preserving the active mode.
- **Pipeline Recovery** -- Automatic restart with exponential backoff if the audio pipeline crashes.

## System Requirements

| Requirement | Minimum |
|-------------|---------|
| Operating System | macOS 14+, Windows 10+, or Linux |
| Runtime | Node.js 20+, Rust (latest stable) |
| Hardware | Microphone, speakers or headphones |

## Current Status

Always Listening is in **active development**. The core voice pipeline, mode switching, tray interface, and TTS are functional. See the [Roadmap](/always-listening/docs/roadmap/) for planned features.

## Getting Started

1. Clone the repository and install dependencies.
2. Run `npm run dev` for development mode.
3. Configure agents in the Preferences window.
4. Press F19 to activate the first enabled mode and start talking.

Continue to [Voice Modes](/always-listening/docs/voice-modes/) for details on each mode, or [Preferences](/always-listening/docs/preferences/) for configuration.
```

##### `docs/data/always-listening/docs/voice-modes/voice-modes.md`

```markdown
---
productId: always-listening
title: Voice Modes
---

# Voice Modes

<p class="description">Always Listening supports multiple configurable voice agent modes that you can switch between with hotkeys or trigger words.</p>

## How Modes Work

Each mode is an independent agent configuration with its own:
- **Name and Icon** -- Displayed in the tray menu and avatar toast.
- **System Prompt** -- Defines the agent's personality and capabilities.
- **TTS Voice** -- Separate voice configuration per agent.
- **Hotkey** -- Optional global keyboard shortcut to activate.
- **Trigger Word** -- Optional voice command to switch to this mode.

Modes cycle with F19 (global hotkey). Only enabled modes are included in the cycle.

## Built-in Modes

### Voice-to-Claude

The primary mode. Speak naturally and your transcription is sent to Claude AI. Claude's response is spoken back using your configured TTS voice. Useful for:
- Hands-free coding assistance
- Research questions
- Creative brainstorming
- General conversation

### Dictation

Pure speech-to-text mode. Your transcription is typed directly into the active application -- no AI processing. Useful for:
- Writing documents
- Composing messages
- Filling forms

### Home Assistant

Voice commands are routed to a Home Assistant instance for smart home control. Useful for:
- Controlling lights, switches, and scenes
- Checking sensor states
- Running automations

## Custom Modes

You can create custom agent modes in Preferences with:
- Custom system prompts
- Custom TTS voices
- Custom icons (file-based or emoji)
- Custom trigger words
- Custom hotkeys

## Mode Switching

| Method | Action |
|--------|--------|
| F19 (default) | Cycle to next enabled mode |
| Per-agent hotkey | Jump directly to a specific mode |
| Trigger word | Say the mode's trigger word to switch |
| Tray menu | Click a mode in the tray dropdown |
| F18 (default) | Toggle mute (pauses pipeline, preserves mode) |
```

##### `docs/data/always-listening/docs/preferences/preferences.md`

```markdown
---
productId: always-listening
title: Preferences
---

# Preferences

<p class="description">Configure Always Listening agents, hotkeys, TTS voices, and Home Assistant integration.</p>

## Opening Preferences

Click the tray icon and select **Preferences...** from the menu, or use the Tauri command palette.

## Agent Configuration

Each agent mode can be configured with:

- **Name** -- Display name shown in tray menu and avatar.
- **Icon** -- Emoji or image file for the tray menu and avatar toast.
- **System Prompt** -- Instructions sent to the AI model defining the agent's behavior.
- **Hotkey** -- Global keyboard shortcut to activate this mode (e.g., `Cmd+Shift+1`).
- **Trigger Word** -- A spoken phrase that switches to this mode.
- **Enabled/Disabled** -- Toggle whether this mode appears in the F19 cycle.

## TTS Configuration

Each agent can use a different TTS voice:

### Piper TTS (Local)

- Runs entirely on-device -- no internet required.
- Download voice models through the Preferences UI.
- Low latency, privacy-preserving.
- Supports multiple languages and voice styles.

### ElevenLabs (Cloud)

- High-quality AI voices with emotional range.
- Requires an API key.
- Higher latency due to network round-trip.
- Configurable voice selection from your ElevenLabs account.

### macOS `say` Command

- Uses built-in macOS text-to-speech.
- Zero setup required.
- Limited voice quality compared to other options.

## Home Assistant Integration

- **URL** -- Your Home Assistant instance URL.
- **Token** -- Long-lived access token for API authentication.
- **Docker Mode** -- Optionally manage a local HA container.
- **Connection Test** -- Verify connectivity from Preferences.

## Global Hotkeys

| Hotkey | Action |
|--------|--------|
| F19 | Cycle through enabled modes |
| F18 | Toggle mute |
| Custom per-agent | Jump directly to a specific mode |
```

##### `docs/data/always-listening/docs/roadmap/roadmap.md`

```markdown
---
productId: always-listening
title: Roadmap
---

# Always Listening Roadmap

<p class="description">Development status and planned features for Always Listening.</p>

## Current Status (Development)

- Tauri v2 system tray application with React frontend
- Rust-based audio pipeline with Whisper transcription
- Multi-mode agent system with mode cycling
- Piper TTS, ElevenLabs, and macOS say voice output
- Global hotkeys (F18 mute, F19 cycle, per-agent custom)
- Trigger word mode switching
- Animated tray icons (idle, recording, speaking, muted)
- Agent avatar toast display
- Home Assistant integration
- Pipeline crash recovery with exponential backoff
- Preferences UI for agent configuration

## Short Term

- **Push-to-Talk Mode** -- Hold a key to record instead of continuous listening.
- **Audio Input Selection** -- Choose which microphone to use from Preferences.
- **Conversation History** -- Maintain context across multiple voice interactions.
- **Clipboard Integration** -- Paste transcription or AI response to clipboard.

## Medium Term

- **Windows and Linux Builds** -- Cross-platform distribution via Tauri.
- **Wake Word Detection** -- Local wake word engine to reduce false activations.
- **Plugin System** -- Third-party agent mode plugins.
- **Voice Activity Detection** -- Improved silence detection for better transcription segmentation.

## Long Term

- **App Store Distribution** -- Signed macOS distribution.
- **Mobile Companion** -- iOS/Android app for remote mode switching.
- **Multi-Language Support** -- Whisper model selection for non-English languages.
- **Streaming Responses** -- Real-time TTS as Claude generates tokens.

---

*This roadmap reflects current priorities and is subject to change based on user feedback.*
```

**Acceptance Criteria**:

- AC-2.2.a: All 4 directories exist under `docs/data/always-listening/docs/`.
- AC-2.2.b: Each directory contains its corresponding markdown file with `productId: always-listening` front matter.
- AC-2.2.c: Content accurately reflects the actual Always Listening codebase (Tauri v2, Rust, React, Whisper, Piper TTS, mode cycling, Home Assistant).

**Acceptance Tests**:

- Test-2.2.a: All 4 markdown files exist.
- Test-2.2.b: Each file has valid YAML front matter.

**Verification Commands**:

```bash
for slug in overview voice-modes preferences roadmap; do
  test -f "docs/data/always-listening/docs/$slug/$slug.md" && echo "PASS: $slug" || echo "FAIL: $slug"
done

for slug in overview voice-modes preferences roadmap; do
  grep -q "productId: always-listening" "docs/data/always-listening/docs/$slug/$slug.md" && echo "PASS: $slug frontmatter" || echo "FAIL: $slug frontmatter"
done
```

---

#### Work Item 2.3: Create Stokd Cloud Documentation Content

**Directories to create**:
- `docs/data/stokd-cloud/docs/overview/`
- `docs/data/stokd-cloud/docs/vscode-extension/`
- `docs/data/stokd-cloud/docs/state-api/`
- `docs/data/stokd-cloud/docs/review-commands/`
- `docs/data/stokd-cloud/docs/roadmap/`

**Implementation Details**:

Content derived from the Stokd Cloud README and source at `/opt/worktrees/stokd-cloud/stokd-cloud-main/`.

##### `docs/data/stokd-cloud/docs/overview/overview.md`

```markdown
---
productId: stokd-cloud
title: Stokd Cloud - AI Project Orchestration
---

# Overview

<p class="description">Stokd Cloud is an AI-powered project orchestration platform that integrates GitHub Projects with Claude AI for automated development workflows.</p>

## What is Stokd Cloud?

Stokd Cloud is a comprehensive system for managing software development projects with Claude AI integration. It consists of a VSCode extension for project management, a NestJS state tracking API for session persistence, an MCP server for Claude tool integration, and a set of review commands for quality assurance.

## Architecture

The platform follows a unified service layer architecture:

- **GitHub API** -- Source of truth for projects, issues, and status.
- **Unified GitHub Service Layer** -- Centralized authentication, rate limiting, error handling, and caching through the NestJS API.
- **VSCode Extension** -- UI for project viewing, linking, and management.
- **MCP Server** -- Model Context Protocol integration for Claude AI tools.
- **Review Commands** -- Three-tier review system (item, phase, project) for quality assurance.
- **Signal Files** -- File-based IPC for cross-component communication.

## Key Features

- **Project Management** -- View, link, and manage GitHub Projects directly from VSCode.
- **Claude AI Orchestration** -- Auto-continuation system monitors Claude sessions and resends prompts on inactivity.
- **Session State Tracking** -- NestJS API tracks active, idle, and crashed sessions with heartbeat monitoring.
- **Three-Tier Review System** -- Hierarchical review commands (`/review-item`, `/review-phase`, `/review-project`) with parallel execution.
- **Real-Time Sync** -- Extension auto-refreshes when Claude completes tasks via signal files.
- **Phase-Based Organization** -- Projects organized into phases with ordered work items.

## Components

| Component | Technology | Status |
|-----------|-----------|--------|
| VSCode Extension | TypeScript, VSCode API | Complete |
| State Tracking API | NestJS, MongoDB | 75% complete |
| MCP Server | TypeScript, MCP Protocol | Complete |
| Review Commands | Claude Code Skills | Complete |

## Getting Started

See the [VSCode Extension](/stokd-cloud/docs/vscode-extension/) page for installation and the [State API](/stokd-cloud/docs/state-api/) page for API setup.
```

##### `docs/data/stokd-cloud/docs/vscode-extension/vscode-extension.md`

```markdown
---
productId: stokd-cloud
title: VSCode Extension
---

# VSCode Extension

<p class="description">The Stokd VSCode extension provides project management, Claude AI session monitoring, and GitHub Projects integration directly in your editor.</p>

## Installation

```bash
cd apps/code-ext
pnpm install
pnpm run build
```

Reload VSCode: F1 then "Developer: Reload Window". Open the "Stokd" panel.

## Features

### Project Viewing

- View repository and organization GitHub Projects.
- Phase-based project organization with ordered items.
- Link and unlink projects to repositories.
- Create new projects from the extension.

### Claude AI Integration

- **Start Project** -- Click "Start" to launch Claude with the project context.
- **Auto-Continuation** -- Monitor detects Claude inactivity (60s) and sends continuation prompts automatically.
- **Session Logging** -- All sessions logged to `.claude-sessions/` with timestamps and activity tracking.
- **Multiple Sessions** -- Run multiple projects simultaneously with independent monitoring.

### Real-Time Updates

- Auto-refresh when Claude completes tasks via signal files.
- Mark items as done directly from the extension.
- View active Claude sessions and their status.

## Commands

| Command | Description |
|---------|-------------|
| `Claude Projects: View Active Claude Sessions` | List and inspect active monitoring sessions |
| `Claude Projects: Stop All Claude Sessions` | Stop all active session monitors |

## Configuration

The auto-continuation system can be tuned in `src/claude-monitor.ts`:

- `INACTIVITY_THRESHOLD` -- Seconds before sending a continuation prompt (default: 60).
- `CHECK_INTERVAL` -- Polling interval in seconds (default: 10).
```

##### `docs/data/stokd-cloud/docs/state-api/state-api.md`

```markdown
---
productId: stokd-cloud
title: State Tracking API
---

# State Tracking API

<p class="description">A NestJS API for runtime state tracking of Claude AI sessions, tasks, and machine slots.</p>

## Overview

The State Tracking API provides a centralized backend for persisting and querying the state of Claude AI sessions across multiple machines and projects. It uses MongoDB for persistence and API key authentication for security.

## Features

- **Session CRUD** -- Create, read, update, and delete Claude sessions.
- **Heartbeat Mechanism** -- Sessions report heartbeats; the API detects stale or crashed sessions.
- **Machine/Slot Tracking** -- Manage which machines have available slots for running Claude sessions.
- **Task Monitoring** -- Track individual task status within sessions.
- **API Key Authentication** -- Secure access via API keys.
- **Health Check Endpoints** -- Monitor API availability.

## Setup

```bash
cd packages/api
npm install
npm run start:dev
```

The API starts on the configured port and connects to MongoDB at the URI specified in environment variables.

## Current Status

- **Phase 1 (Complete)**: Foundation and database schema -- MongoDB schemas, NestJS structure, API key auth, health checks.
- **Phase 2 (75%)**: Core session state tracking -- session CRUD, heartbeat, machine/slot tracking.
- **Phase 3 (Planned)**: Task monitoring and recovery.
- **Phase 4 (Planned)**: Deployment and production readiness.

## Unified GitHub Service Layer

The API includes a unified GitHub service layer that centralizes all GitHub API access:

- **Centralized Authentication** -- Single point for GitHub token management.
- **Automatic Rate Limiting** -- Prevents API quota exhaustion.
- **Consistent Error Handling** -- Standardized error responses.
- **Multi-Layer Caching** -- Reduces redundant API calls.
- **Comprehensive Logging** -- Centralized logging for debugging.
```

##### `docs/data/stokd-cloud/docs/review-commands/review-commands.md`

```markdown
---
productId: stokd-cloud
title: Review Commands
---

# Review Commands

<p class="description">A three-tier review system for comprehensive quality assurance using Claude Code skills.</p>

## Overview

Stokd Cloud includes three hierarchical review commands that leverage Claude AI for automated code and project review. Each command operates at a different level of granularity.

## Commands

### /review-item -- Individual Issue Review

Reviews a single GitHub issue and verifies its acceptance criteria.

```bash
claude /review-item 59
claude /review-item 70 2.2
```

**What it does**:
- Reads the issue's acceptance criteria.
- Inspects the code changes associated with the issue.
- Verifies each criterion is met.
- Reports pass/fail with detailed findings.

### /review-phase -- Phase Orchestration

Reviews all items in a project phase using parallel sub-agents.

```bash
claude /review-phase 70 2
claude /review-phase 1
```

**What it does**:
- Identifies all items in the specified phase.
- Spawns parallel review agents for each item.
- Aggregates results into a phase summary.
- Identifies blocking issues.

### /review-project -- Project Orchestration

Full project review with executive summary.

```bash
claude /review-project 70
```

**What it does**:
- Reviews all phases in the project.
- Generates an executive summary.
- Identifies risks and blockers.
- Provides completion percentage and status.

## Installation

Review commands are installed as Claude Code skills at `~/.claude/commands/`. The VSCode extension installs them automatically on first activation.

## Integration

Review commands integrate with:
- **GitHub Projects** -- Read project structure and issue data.
- **State Tracking API** -- Report review results.
- **VSCode Extension** -- Trigger reviews from the UI.
```

##### `docs/data/stokd-cloud/docs/roadmap/roadmap.md`

```markdown
---
productId: stokd-cloud
title: Roadmap
---

# Stokd Cloud Roadmap

<p class="description">Development status and planned features for the Stokd Cloud platform.</p>

## Complete

### VSCode Extension Core
- Project viewing and management
- Link/unlink projects to repositories
- Auto-refresh on Claude task completion
- Phase-based organization
- Claude session monitoring and auto-continuation

### Review Commands
- Three-tier review system (item, phase, project)
- Parallel execution for phase reviews
- Automatic status updates

### State Tracking API -- Phase 1
- MongoDB schemas for sessions, tasks, machines
- NestJS project structure
- API key authentication
- Health check endpoints

## In Progress

### State Tracking API -- Phase 2 (75%)
- Session CRUD endpoints
- Heartbeat mechanism
- Machine/slot tracking
- Session health queries (remaining)

## Planned

### State Tracking API -- Phase 3
- Task monitoring with granular status tracking
- Automatic recovery of crashed sessions
- Task dependency resolution

### State Tracking API -- Phase 4
- Production deployment with Docker
- CI/CD pipeline
- Monitoring and alerting

### State Tracking API -- Phase 5
- Comprehensive logging
- Performance metrics
- Dashboard and analytics

### Platform Enhancements
- **MCP Server Improvements** -- Expanded tool set for Claude AI integration.
- **Multi-Repository Support** -- Manage projects across multiple repositories.
- **Team Collaboration** -- Shared project views and concurrent session management.
- **Web Dashboard** -- Browser-based project management interface.

---

*This roadmap reflects current development priorities and is subject to change.*
```

**Acceptance Criteria**:

- AC-2.3.a: All 5 directories exist under `docs/data/stokd-cloud/docs/`.
- AC-2.3.b: Each directory contains its corresponding markdown file with `productId: stokd-cloud` front matter.
- AC-2.3.c: Content accurately describes the Stokd Cloud components (VSCode extension, NestJS API, MCP server, review commands).

**Acceptance Tests**:

- Test-2.3.a: All 5 markdown files exist.
- Test-2.3.b: Each file has valid YAML front matter.

**Verification Commands**:

```bash
for slug in overview vscode-extension state-api review-commands roadmap; do
  test -f "docs/data/stokd-cloud/docs/$slug/$slug.md" && echo "PASS: $slug" || echo "FAIL: $slug"
done

for slug in overview vscode-extension state-api review-commands roadmap; do
  grep -q "productId: stokd-cloud" "docs/data/stokd-cloud/docs/$slug/$slug.md" && echo "PASS: $slug frontmatter" || echo "FAIL: $slug frontmatter"
done
```

---

#### Work Item 2.4: Create Next.js Page Route Files

**Implementation Details**:

Create Next.js page route files for each product following the Flux pattern. Each product needs:

1. A product landing page: `docs/pages/{product-id}/index.js`
2. A docs index redirect: `docs/pages/{product-id}/docs/index.js`
3. Individual doc page files: `docs/pages/{product-id}/docs/{slug}.js`

Each doc page file follows this exact pattern (from `docs/pages/flux/docs/overview.js`):

```js
import * as React from 'react';
import MarkdownDocs from 'docs/src/modules/components/MarkdownDocs';
import * as pageProps from 'docs/data/{product-id}/docs/{slug}/{slug}.md?muiMarkdown';

export default function Page() {
  return <MarkdownDocs {...pageProps} />;
}
```

##### Mac Mixer Pages

Create:
- `docs/pages/mac-mixer/index.js`
- `docs/pages/mac-mixer/docs/index.js`
- `docs/pages/mac-mixer/docs/overview.js`
- `docs/pages/mac-mixer/docs/app-volumes.js`
- `docs/pages/mac-mixer/docs/auto-pause.js`
- `docs/pages/mac-mixer/docs/recording.js`
- `docs/pages/mac-mixer/docs/download.js`
- `docs/pages/mac-mixer/docs/roadmap.js`

##### Always Listening Pages

Create:
- `docs/pages/always-listening/index.js`
- `docs/pages/always-listening/docs/index.js`
- `docs/pages/always-listening/docs/overview.js`
- `docs/pages/always-listening/docs/voice-modes.js`
- `docs/pages/always-listening/docs/preferences.js`
- `docs/pages/always-listening/docs/roadmap.js`

##### Stokd Cloud Pages

Create:
- `docs/pages/stokd-cloud/index.js`
- `docs/pages/stokd-cloud/docs/index.js`
- `docs/pages/stokd-cloud/docs/overview.js`
- `docs/pages/stokd-cloud/docs/vscode-extension.js`
- `docs/pages/stokd-cloud/docs/state-api.js`
- `docs/pages/stokd-cloud/docs/review-commands.js`
- `docs/pages/stokd-cloud/docs/roadmap.js`

Each product's `index.js` should follow the Flux pattern:

```js
import * as React from 'react';
import Home from "docs/pages";
export default function Page() {
  return <Home />;
}
```

Each product's `docs/index.js` should redirect to the overview:

```js
import * as React from 'react';
import MarkdownDocs from 'docs/src/modules/components/MarkdownDocs';
import * as pageProps from 'docs/data/{product-id}/docs/overview/overview.md?muiMarkdown';
export default function Page() {
  return <MarkdownDocs {...pageProps} />;
}
```

**Acceptance Criteria**:

- AC-2.4.a: All Mac Mixer page route files exist (8 files).
- AC-2.4.b: All Always Listening page route files exist (6 files).
- AC-2.4.c: All Stokd Cloud page route files exist (7 files).
- AC-2.4.d: Each doc page file imports the correct markdown file path using `?muiMarkdown`.
- AC-2.4.e: Each file exports a default React component that renders `MarkdownDocs`.

**Acceptance Tests**:

- Test-2.4.a: All 21 page route files exist on disk.
- Test-2.4.b: Each file contains `MarkdownDocs` or `Home` import.

**Verification Commands**:

```bash
# Mac Mixer pages
for f in index docs/index docs/overview docs/app-volumes docs/auto-pause docs/recording docs/download docs/roadmap; do
  test -f "docs/pages/mac-mixer/$f.js" && echo "PASS: mac-mixer/$f.js" || echo "FAIL: mac-mixer/$f.js"
done

# Always Listening pages
for f in index docs/index docs/overview docs/voice-modes docs/preferences docs/roadmap; do
  test -f "docs/pages/always-listening/$f.js" && echo "PASS: always-listening/$f.js" || echo "FAIL: always-listening/$f.js"
done

# Stokd Cloud pages
for f in index docs/index docs/overview docs/vscode-extension docs/state-api docs/review-commands docs/roadmap; do
  test -f "docs/pages/stokd-cloud/$f.js" && echo "PASS: stokd-cloud/$f.js" || echo "FAIL: stokd-cloud/$f.js"
done
```

---

### Phase 3: Database Integration -- Seed Scripts

**Purpose**: Create MongoDB seed scripts for the three new products following the established `seed-products.ts` pattern, enabling them to appear in the authenticated admin panel and the public products API.

---

#### Work Item 3.1: Generalize the Seed Script to Support Multiple Products

**File**: `docs/scripts/seed-products.ts`

**Implementation Details**:

Refactor the existing `seed-products.ts` to support seeding all products (not just Flux). The script currently only seeds Flux. Extend it to seed Mac Mixer, Always Listening, and Stokd Cloud as well.

The refactored script should:

1. Define a `ProductSeedConfig` type with `productId`, `name`, `fullName`, `description`, `icon`, `url`, `live`, `managed`, `hideProductFeatures`, `features`, `docsDir`, and `slugOrder`.
2. Create configs for Flux (existing), Mac Mixer, Always Listening, and Stokd Cloud.
3. Loop through all configs and upsert each product and its pages.

Each product config:

##### Mac Mixer

```ts
{
  productId: 'mac-mixer',
  name: 'Mac Mixer',
  fullName: 'Mac Mixer',
  description: 'macOS audio utility with per-app volume control, auto-pause, and system audio recording',
  icon: 'product-advanced',
  url: '/mac-mixer',
  live: true,
  managed: true,
  hideProductFeatures: true,
  prerelease: 'alpha',
  features: [
    { name: 'Overview', description: 'Features, system requirements, and getting started', id: 'overview' },
    { name: 'App Volumes', description: 'Per-application volume control with boost', id: 'app-volumes' },
    { name: 'Auto-Pause', description: 'Automatically pause music when other audio plays', id: 'auto-pause' },
    { name: 'Roadmap', description: 'Current status and future plans', id: 'roadmap' },
  ],
  docsDir: '../data/mac-mixer/docs',
  slugOrder: ['overview', 'app-volumes', 'auto-pause', 'recording', 'download', 'roadmap'],
}
```

##### Always Listening

```ts
{
  productId: 'always-listening',
  name: 'Always Listening',
  fullName: 'Always Listening',
  description: 'Cross-platform voice pipeline tray app with Voice-to-Claude, Dictation, and Combined modes',
  icon: 'product-templates',
  url: '/always-listening',
  live: true,
  managed: true,
  hideProductFeatures: true,
  prerelease: 'alpha',
  features: [
    { name: 'Overview', description: 'Voice pipeline overview and tech stack', id: 'overview' },
    { name: 'Voice Modes', description: 'Voice-to-Claude, Dictation, and Combined mode details', id: 'voice-modes' },
    { name: 'Preferences', description: 'Configuration, hotkeys, and TTS settings', id: 'preferences' },
    { name: 'Roadmap', description: 'Development status and planned features', id: 'roadmap' },
  ],
  docsDir: '../data/always-listening/docs',
  slugOrder: ['overview', 'voice-modes', 'preferences', 'roadmap'],
}
```

##### Stokd Cloud

```ts
{
  productId: 'stokd-cloud',
  name: 'Stokd Cloud',
  fullName: 'Stokd Cloud',
  description: 'AI-powered project orchestration with VSCode extension, NestJS API, and MCP server',
  icon: 'product-toolpad',
  url: '/stokd-cloud',
  live: true,
  managed: true,
  hideProductFeatures: true,
  prerelease: 'alpha',
  features: [
    { name: 'Overview', description: 'Platform overview and architecture', id: 'overview' },
    { name: 'VSCode Extension', description: 'Project management and Claude AI integration', id: 'vscode-extension' },
    { name: 'State API', description: 'NestJS session and task tracking API', id: 'state-api' },
    { name: 'Roadmap', description: 'Development status and plans', id: 'roadmap' },
  ],
  docsDir: '../data/stokd-cloud/docs',
  slugOrder: ['overview', 'vscode-extension', 'state-api', 'review-commands', 'roadmap'],
}
```

**Acceptance Criteria**:

- AC-3.1.a: The seed script defines product configs for Flux, Mac Mixer, Always Listening, and Stokd Cloud.
- AC-3.1.b: Running the script upserts all 4 products to the `products` collection.
- AC-3.1.c: Running the script upserts all doc pages for each product to the `product_pages` collection.
- AC-3.1.d: The script is idempotent -- running it twice does not create duplicate entries.
- AC-3.1.e: Each product has a `prerelease` field set appropriately (`alpha` for new products, omitted for Flux).

**Acceptance Tests**:

- Test-3.1.a: Grep for `mac-mixer` in the seed script returns a match.
- Test-3.1.b: Grep for `always-listening` in the seed script returns a match.
- Test-3.1.c: Grep for `stokd-cloud` in the seed script returns a match.
- Test-3.1.d: The script exits with code 0 when MongoDB is available.

**Verification Commands**:

```bash
grep -q "mac-mixer" docs/scripts/seed-products.ts && echo "PASS" || echo "FAIL"
grep -q "always-listening" docs/scripts/seed-products.ts && echo "PASS" || echo "FAIL"
grep -q "stokd-cloud" docs/scripts/seed-products.ts && echo "PASS" || echo "FAIL"
```

---

#### Work Item 3.2: Verify Seed Script Executes Without Errors

**Implementation Details**:

Run the seed script against a local MongoDB instance and verify all products and pages are created.

**Acceptance Criteria**:

- AC-3.2.a: `npx tsx docs/scripts/seed-products.ts` exits with code 0.
- AC-3.2.b: Console output shows "Created" or "Updated" for each product (Flux, Mac Mixer, Always Listening, Stokd Cloud).
- AC-3.2.c: Console output shows page counts for each product.

**Acceptance Tests**:

- Test-3.2.a: Run the script and capture exit code.
- Test-3.2.b: Verify output contains expected product names.

**Verification Commands**:

```bash
# Requires MongoDB running locally
npx tsx docs/scripts/seed-products.ts 2>&1 | grep -q "Mac Mixer" && echo "PASS" || echo "FAIL"
npx tsx docs/scripts/seed-products.ts 2>&1 | grep -q "Always Listening" && echo "PASS" || echo "FAIL"
npx tsx docs/scripts/seed-products.ts 2>&1 | grep -q "Stokd Cloud" && echo "PASS" || echo "FAIL"
```

---

### Phase 4: Integration and Verification

**Purpose**: Verify the complete integration works end-to-end -- products appear in navigation, doc pages render, and no regressions exist.

---

#### Work Item 4.1: TypeScript Compilation Check

**Implementation Details**:

Run TypeScript type checking to ensure all new code compiles without errors.

**Acceptance Criteria**:

- AC-4.1.a: `pnpm tsc --noEmit` in the docs directory exits with code 0 (or shows no new errors related to the changed files).
- AC-4.1.b: No TypeScript errors in `products.tsx`, `route.ts`, or any new page definition files.

**Acceptance Tests**:

- Test-4.1.a: Run tsc and verify exit code.

**Verification Commands**:

```bash
cd docs && npx tsc --noEmit 2>&1 | grep -c "error TS" | xargs -I{} test {} -eq 0 && echo "PASS" || echo "FAIL"
```

---

#### Work Item 4.2: Dev Server Smoke Test

**Implementation Details**:

Start the Next.js dev server and verify that the new product pages are accessible.

**Acceptance Criteria**:

- AC-4.2.a: `pnpm dev` starts without build errors.
- AC-4.2.b: `/mac-mixer/docs/overview/` returns HTTP 200 and renders the overview markdown.
- AC-4.2.c: `/always-listening/docs/overview/` returns HTTP 200.
- AC-4.2.d: `/stokd-cloud/docs/overview/` returns HTTP 200.
- AC-4.2.e: `/flux/docs/overview/` continues to return HTTP 200 (no regression).
- AC-4.2.f: The Products dropdown in the unauthenticated nav shows: Stoked UI, File Explorer, Media, Timeline, Editor, Flux, Mac Mixer, Always Listening, and Stokd Cloud (all with `live: true`).
- AC-4.2.g: The Consulting dropdown is unchanged.

**Acceptance Tests**:

- Test-4.2.a: Start dev server, curl each product overview URL, verify 200 response.
- Test-4.2.b: Visually inspect the Products dropdown in a browser.

**Verification Commands**:

```bash
# After starting dev server on port 3000:
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/mac-mixer/docs/overview/ | xargs -I{} test {} -eq 200 && echo "PASS" || echo "FAIL"
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/always-listening/docs/overview/ | xargs -I{} test {} -eq 200 && echo "PASS" || echo "FAIL"
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/stokd-cloud/docs/overview/ | xargs -I{} test {} -eq 200 && echo "PASS" || echo "FAIL"
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/flux/docs/overview/ | xargs -I{} test {} -eq 200 && echo "PASS" || echo "FAIL"
```

---

#### Work Item 4.3: Regression Verification

**Implementation Details**:

Verify that existing product pages and navigation are unaffected.

**Acceptance Criteria**:

- AC-4.3.a: `/file-explorer/docs/overview` returns HTTP 200.
- AC-4.3.b: `/timeline/docs/overview` returns HTTP 200.
- AC-4.3.c: `/editor/docs/overview` returns HTTP 200.
- AC-4.3.d: `/media/docs/overview` returns HTTP 200.
- AC-4.3.e: `/stoked-ui/docs/overview` returns HTTP 200.
- AC-4.3.f: The Consulting dropdown still shows Front End, Back End, Devops, and AI.
- AC-4.3.g: `HeaderNavBar.tsx` has zero modifications from this project.

**Acceptance Tests**:

- Test-4.3.a: Curl each existing product page and verify 200.
- Test-4.3.b: Verify HeaderNavBar.tsx has no git diff.

**Verification Commands**:

```bash
# After starting dev server:
for path in file-explorer/docs/overview timeline/docs/overview editor/docs/overview media/docs/overview stoked-ui/docs/overview; do
  curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/$path/" | xargs -I{} test {} -eq 200 && echo "PASS: $path" || echo "FAIL: $path"
done

git diff --name-only docs/src/components/header/HeaderNavBar.tsx | wc -l | xargs -I{} test {} -eq 0 && echo "PASS: HeaderNavBar unchanged" || echo "FAIL: HeaderNavBar changed"
```

---

#### Work Item 4.4: Public Products API Verification

**Implementation Details**:

After seeding, verify the public products API returns the new products.

**Acceptance Criteria**:

- AC-4.4.a: `GET /api/products/public` returns a JSON array that includes entries with `productId: 'mac-mixer'`, `productId: 'always-listening'`, and `productId: 'stokd-cloud'`.
- AC-4.4.b: The response continues to include `productId: 'flux'`.
- AC-4.4.c: The response does not include `productId: 'stoked-ui'` (excluded by the API query).

**Acceptance Tests**:

- Test-4.4.a: Curl the API endpoint and parse JSON for expected product IDs.

**Verification Commands**:

```bash
# After starting dev server with MongoDB seeded:
curl -s http://localhost:3000/api/products/public | python3 -c "import sys,json; data=json.load(sys.stdin); ids=[p['productId'] for p in data]; print('PASS' if 'mac-mixer' in ids and 'always-listening' in ids and 'stokd-cloud' in ids else 'FAIL')"
```

---

## 3. Completion Criteria

All of the following must be true for this project to be considered complete:

1. **Three new products defined** in `docs/src/products.tsx` with `live: true`, each with accurate metadata derived from their source repositories.
2. **Route constants added** to `docs/src/route.ts` for all three products (6 new entries).
3. **Dynamic menu fix applied**: `ALL_PRODUCTS` no longer hardcodes `[sui, flux]` and instead includes all non-consulting products.
4. **Page definition files created** (`macMixerPages.ts`, `alwaysListeningPages.ts`, `stokdCloudPages.ts`).
5. **Page definitions wired into `_app.js`** via a product-to-pages lookup map.
6. **15 markdown documentation files created** across the three products (6 for Mac Mixer, 4 for Always Listening, 5 for Stokd Cloud).
7. **21 Next.js page route files created** (8 for Mac Mixer, 6 for Always Listening, 7 for Stokd Cloud).
8. **Seed script updated** to support all three new products.
9. **TypeScript compiles** without new errors.
10. **All new doc pages return HTTP 200** when accessed via the dev server.
11. **All existing doc pages continue to return HTTP 200** (no regressions).
12. **Products dropdown** shows all live non-consulting products dynamically.
13. **HeaderNavBar.tsx is unmodified** -- the fix is entirely in `products.tsx`.

---

## 4. Rollout & Validation

### Pre-Deployment Checklist

- [ ] TypeScript compilation passes (`npx tsc --noEmit`)
- [ ] Dev server starts without errors (`pnpm dev`)
- [ ] All 15 new doc pages render correctly in the browser
- [ ] Products dropdown shows 9 products (Stoked UI + 8 sub-products/apps with `live: true`)
- [ ] Consulting dropdown shows 4 consulting products (unchanged)
- [ ] Existing product pages render correctly (no regressions)
- [ ] Seed script runs successfully against MongoDB
- [ ] Public products API returns new products after seeding

### Deployment Steps

1. Merge the changes to `main`.
2. Run `npx tsx docs/scripts/seed-products.ts` against the production MongoDB to seed new product data.
3. Deploy the Next.js application.
4. Verify all product pages are accessible in production.
5. Verify the Products dropdown renders correctly.

### Post-Deployment Verification

- [ ] Visit `/mac-mixer/docs/overview/` in production -- page renders.
- [ ] Visit `/always-listening/docs/overview/` in production -- page renders.
- [ ] Visit `/stokd-cloud/docs/overview/` in production -- page renders.
- [ ] Products dropdown includes all new products.
- [ ] `/api/products/public` returns new products.
- [ ] Authenticated admin nav shows new products with "ALPHA" badges.

---

## 5. Open Questions

1. **Product-specific icons**: Should custom SVG icons be created for Mac Mixer, Always Listening, and Stokd Cloud for this iteration, or is reusing existing generic product icons acceptable? **Current decision**: Reuse existing icons (`product-advanced`, `product-templates`, `product-toolpad`).

2. **Showcase components**: Should new products appear in the homepage `ProductsPreviews` section? **Current decision**: No -- `hideProductFeatures: true` prevents homepage showcase rendering. Custom showcases deferred.

3. **Product grouping in menu**: With 9+ items in the Products dropdown, should it be split into categories (e.g., "Components" vs. "Applications")? **Current decision**: Defer to a future iteration. The existing Popper/dropdown supports scrolling.

4. **Stokd Cloud naming**: Should the product-facing name be "Stokd Cloud" or "Stokd"? **Current decision**: Use "Stokd Cloud" to distinguish the platform from the broader brand.

5. **Runtime vs. static menu**: Should the unauthenticated nav fetch products from MongoDB at runtime? **Current decision**: No -- keep the static TypeScript definitions as the source of truth for the public nav. The MongoDB data serves the authenticated admin nav.

6. **Mac Mixer licensing (GPLv2)**: Does the GPLv2 license affect how Mac Mixer is presented on the commercial site? **Current decision**: Document the license on the download/roadmap page. Presentation as a product is acceptable.

7. **Alpha/Beta badges in public menu**: Should products display status badges in the Products dropdown? **Current decision**: Defer. The `prerelease` field in MongoDB enables admin-nav badges, but public nav badges are out of scope.
