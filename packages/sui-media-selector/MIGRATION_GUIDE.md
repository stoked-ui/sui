# Migration Guide: @stoked-ui/media-selector to @stoked-ui/media

This guide will help you migrate from the deprecated `@stoked-ui/media-selector` package to the new `@stoked-ui/media` package.

## Why Migrate?

The `@stoked-ui/media-selector` package is deprecated and will no longer receive updates. The new `@stoked-ui/media` package offers:

- Enhanced functionality for media handling
- Better TypeScript support
- Improved performance
- NestJS API integration for server-side media processing
- Active maintenance and new features
- Better documentation and examples

## Migration Steps

### Step 1: Install the New Package

First, install the `@stoked-ui/media` package in your project:

```bash
npm install @stoked-ui/media
# or
yarn add @stoked-ui/media
# or
pnpm add @stoked-ui/media
```

### Step 2: Update Your Imports

Replace imports from `@stoked-ui/media-selector` with imports from `@stoked-ui/media`:

**Before:**
```typescript
import { MediaFile, App, WebFile } from '@stoked-ui/media-selector';
import FileWithPath from '@stoked-ui/media-selector/FileWithPath';
```

**After:**
```typescript
import { MediaFile, App, WebFile } from '@stoked-ui/media';
import { FileWithPath } from '@stoked-ui/media';
```

### Step 3: Update API Calls (if using DragEvent or File Input)

The API remains largely compatible, but some improvements have been made:

**Before:**
```typescript
import FileWithPath from '@stoked-ui/media-selector/FileWithPath';

document.addEventListener('drop', async evt => {
  const files = await FileWithPath.from(evt);
  console.log(files);
});
```

**After:**
```typescript
import { FileWithPath } from '@stoked-ui/media';

document.addEventListener('drop', async evt => {
  const files = await FileWithPath.from(evt);
  console.log(files);
});
```

### Step 4: Remove the Old Package

Once you've updated all imports and verified that your application works correctly:

```bash
npm uninstall @stoked-ui/media-selector
# or
yarn remove @stoked-ui/media-selector
# or
pnpm remove @stoked-ui/media-selector
```

## Troubleshooting

### Import Errors

If you encounter import errors after updating to `@stoked-ui/media`, ensure that:

1. The package is properly installed: `npm list @stoked-ui/media`
2. Your TypeScript configuration includes the necessary types
3. You're using compatible Node.js and npm/yarn versions

### Feature Compatibility

Most features from `@stoked-ui/media-selector` are available in `@stoked-ui/media`. If you're missing a specific feature:

1. Check the `@stoked-ui/media` documentation
2. File an issue on the [GitHub repository](https://github.com/stoked-ui/sui)
3. Consider using both packages temporarily while you migrate (not recommended for long-term)

## Complete Migration Checklist

- [ ] Install `@stoked-ui/media`
- [ ] Update all imports from `@stoked-ui/media-selector` to `@stoked-ui/media`
- [ ] Test your application thoroughly
- [ ] Verify all media functionality works as expected
- [ ] Remove `@stoked-ui/media-selector` from dependencies
- [ ] Update any documentation references
- [ ] Deploy to production

## Need Help?

If you encounter issues during migration:

1. Check the [official documentation](https://github.com/stoked-ui/sui)
2. Search for existing [issues on GitHub](https://github.com/stoked-ui/sui/issues)
3. Create a new issue with details about your problem
4. Contact the maintainers in the community channels

## Timeline

- **Current:** `@stoked-ui/media-selector` is deprecated
- **Future versions:** The package may be moved to a separate maintenance branch
- **Long-term:** The package will eventually be archived

Please plan your migration accordingly to ensure your application continues to receive updates and support.
