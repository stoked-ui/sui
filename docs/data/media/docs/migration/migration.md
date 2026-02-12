---
productId: media
title: Migration Guide
githubLabel: 'Migration'
packageName: '@stoked-ui/media'
---

# Migration from @stoked-ui/media-selector

<p class="description">Step-by-step guide for migrating from the deprecated @stoked-ui/media-selector package to @stoked-ui/media.</p>

{{"component": "modules/components/ComponentLinkHeader"}}

## Why migrate?

`@stoked-ui/media-selector` has been deprecated in favor of `@stoked-ui/media`, which provides:

- All functionality from media-selector, plus new components (MediaViewer, MediaCard)
- API client hooks for backend integration
- WebFile and File System Access API support
- Framework-agnostic abstractions
- Active maintenance and new feature development

## Step 1: Install the new package

```bash
npm install @stoked-ui/media
# or
pnpm add @stoked-ui/media
```

## Step 2: Update imports

Replace all imports from `@stoked-ui/media-selector` with `@stoked-ui/media`:

```diff
- import { FileWithPath } from '@stoked-ui/media-selector';
+ import { MediaFile } from '@stoked-ui/media';
```

```diff
- import { fromEvent } from '@stoked-ui/media-selector';
+ import { MediaFile } from '@stoked-ui/media';
  // Use MediaFile.from(event) instead of fromEvent
```

## Step 3: Update class names

| Old (media-selector) | New (media) |
|----------------------|-------------|
| `FileWithPath` | `MediaFile` |
| `fromEvent()` | `MediaFile.from()` |
| `toFileWithPath()` | `MediaFile.create()` |

## Step 4: Update event handling

```diff
  input.addEventListener('change', async (evt) => {
-   const files = await FileWithPath.from(evt);
+   const files = await MediaFile.from(evt);
    console.log(files);
  });
```

## Step 5: Remove old package

Once all imports are updated and verified:

```bash
npm uninstall @stoked-ui/media-selector
```

## Need help?

If you encounter issues during migration, please [open an issue](https://github.com/stoked-ui/stoked-ui/issues) on GitHub.
