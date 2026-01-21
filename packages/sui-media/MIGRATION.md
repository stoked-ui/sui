# Migration Guide: @stoked-ui/media-selector to @stoked-ui/media

This guide provides comprehensive instructions for migrating from the deprecated `@stoked-ui/media-selector` package to the new `@stoked-ui/media` package using automated tooling.

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Using the Migration Tool](#using-the-migration-tool)
4. [Manual Migration](#manual-migration)
5. [Validation](#validation)
6. [Rollback](#rollback)
7. [Troubleshooting](#troubleshooting)
8. [API Changes](#api-changes)
9. [Breaking Changes](#breaking-changes)
10. [Common Scenarios](#common-scenarios)

## Overview

### Why Migrate?

The `@stoked-ui/media-selector` package is **deprecated** and will no longer receive updates. Migration to `@stoked-ui/media` provides:

- **Enhanced functionality** - Comprehensive media file handling
- **Better TypeScript support** - Full type definitions and IntelliSense
- **Improved performance** - Optimized for modern browsers
- **NestJS API integration** - Server-side media processing capabilities
- **Active maintenance** - Regular updates and bug fixes
- **Better documentation** - Comprehensive guides and examples

### What's New in @stoked-ui/media

The new package includes everything from the deprecated package, plus:

- **MediaViewer component** - Full-screen media viewing with queue management
- **MediaCard component** - Interactive media item display cards
- **Advanced media types** - Enhanced MIME type handling
- **File System API integration** - Modern file picker support
- **Zip utilities** - Built-in compression and archiving
- **Framework abstractions** - Integration with routing, auth, and payments

## Quick Start

### Option 1: Automated Migration (Recommended)

```bash
# Install the new package
npm install @stoked-ui/media

# Run the migration tool with dry-run mode first
npx @stoked-ui/media migrate --dry-run

# If the preview looks good, run the actual migration
npx @stoked-ui/media migrate

# Validate the migration
npx @stoked-ui/media validate-migration

# Remove the old package
npm uninstall @stoked-ui/media-selector
```

### Option 2: Step-by-step Manual Migration

See [Manual Migration](#manual-migration) section below.

## Using the Migration Tool

### Installation

The migration tool is included with the `@stoked-ui/media` package. No additional installation is required.

### Basic Usage

```bash
npx @stoked-ui/media migrate
```

This command will:
1. Scan your project for files using the deprecated package
2. Update all import statements
3. Update package.json dependencies
4. Create a backup of modified files
5. Generate a migration report

### Command Options

#### Dry-Run Mode (Preview Changes)

```bash
npx @stoked-ui/media migrate --dry-run
```

**What it does:**
- Shows what files would be modified
- Displays a preview of import changes
- Verifies package.json would be updated
- Does NOT modify any files

**Output includes:**
- List of files to be changed
- Before/after comparison of imports
- Summary of changes

#### Custom Target Path

```bash
npx @stoked-ui/media migrate --path /path/to/your/project
```

Useful when running the tool from a different directory.

#### Verbose Output

```bash
npx @stoked-ui/media migrate --verbose
```

Provides detailed debugging information during migration.

#### Combined Options

```bash
npx @stoked-ui/media migrate --dry-run --path ./packages/my-app --verbose
```

### Migration Process

The tool performs the following steps:

1. **File Discovery** - Scans project for TypeScript and JavaScript files
2. **Import Analysis** - Identifies all imports from deprecated package
3. **Backup Creation** - Creates a backup of all files to be modified
4. **Import Transformation** - Updates all import statements
5. **Package.json Update** - Migrates dependencies
6. **Validation** - Checks for potential issues
7. **Report Generation** - Provides detailed summary

### Example Output

```
[10:23:45] INFO   Starting migration from @stoked-ui/media-selector to @stoked-ui/media
[10:23:45] INFO   Target path: /home/user/my-app
[10:23:45] INFO   Dry run mode: No
[10:23:45] INFO   Scanning for source files...
[10:23:46] SUCCESS Found 42 source files
[10:23:46] INFO   Creating backup...
[10:23:46] SUCCESS Backup created: /home/user/my-app/.migration-backup-1706000626000
[10:23:46] INFO   Processing files...
[10:23:47] INFO   Processing package.json...
[10:23:47] SUCCESS Updated package.json
[10:23:47] INFO   Validating migration...
[10:23:47] INFO   Starting validation...

╔════════════════════════════════════════════════════════════════╗
║         Migration Report: media-selector to media              ║
╚════════════════════════════════════════════════════════════════╝

⏱️  Duration: 2.34s

📊 Summary:
  • Files analyzed: 42
  • Files modified: 28
  • Imports updated: 58
  • package.json updated: Yes

📝 Modified Files:
  ✓ src/components/MediaUpload.tsx (3 imports)
  ✓ src/hooks/useMediaHandler.ts (2 imports)
  ✓ src/api/mediaService.ts (1 imports)
  ...

✅ Migration complete!
```

## Manual Migration

If you prefer to migrate manually or the automated tool doesn't work for your setup:

### Step 1: Install the New Package

```bash
npm install @stoked-ui/media
# or
yarn add @stoked-ui/media
# or
pnpm add @stoked-ui/media
```

### Step 2: Update Import Statements

Replace all imports from `@stoked-ui/media-selector` with `@stoked-ui/media`:

#### Named Imports

**Before:**
```typescript
import { MediaFile, WebFile, App } from '@stoked-ui/media-selector';
```

**After:**
```typescript
import { MediaFile, WebFile, App } from '@stoked-ui/media';
```

#### Default Imports

**Before:**
```typescript
import MediaFile from '@stoked-ui/media-selector/MediaFile';
```

**After:**
```typescript
import { MediaFile } from '@stoked-ui/media';
```

#### Type Imports

**Before:**
```typescript
import type { IMediaFile } from '@stoked-ui/media-selector';
```

**After:**
```typescript
import type { IMediaFile } from '@stoked-ui/media';
```

### Step 3: Update package.json

Update your dependencies in `package.json`:

**Before:**
```json
{
  "dependencies": {
    "@stoked-ui/media-selector": "^0.1.3"
  }
}
```

**After:**
```json
{
  "dependencies": {
    "@stoked-ui/media": "^0.1.0"
  }
}
```

Then run:
```bash
npm install
# or
yarn install
# or
pnpm install
```

### Step 4: Remove the Deprecated Package

Once everything is working:

```bash
npm uninstall @stoked-ui/media-selector
# or
yarn remove @stoked-ui/media-selector
# or
pnpm remove @stoked-ui/media-selector
```

## Validation

After migration, validate that everything is working correctly:

### Using the Validation Tool

```bash
npx @stoked-ui/media validate-migration
```

**Checks performed:**
- No remaining imports from deprecated package
- All imports resolve correctly
- API compatibility
- package.json consistency
- Breaking changes

### Custom Path

```bash
npx @stoked-ui/media validate-migration --path /path/to/your/project
```

### Example Output

```
╔════════════════════════════════════════════════════════════════╗
║      Validation Report: Media Selector Migration              ║
╚════════════════════════════════════════════════════════════════╝

⏱️  Duration: 1.23s

✅ Passed (6):
  ✓ No imports from deprecated package found
  ✓ New package found in dependencies: @stoked-ui/media
  ✓ 28 imports from new package found
  ✓ FileWithPath API usage detected in migrated code
  ✓ MediaFile API usage detected in migrated code
  ✓ TypeScript configuration found

═══════════════════════════════════════════════════════════════════
✅ Migration validation PASSED
═══════════════════════════════════════════════════════════════════
```

### Manual Validation Steps

1. **Check imports:**
   ```bash
   grep -r "from '@stoked-ui/media-selector'" src/
   ```
   Should return no results.

2. **Verify package.json:**
   ```bash
   cat package.json | grep -A 5 dependencies
   ```
   Should show `@stoked-ui/media`, not `@stoked-ui/media-selector`.

3. **Run tests:**
   ```bash
   npm test
   # or
   yarn test
   ```

4. **Build project:**
   ```bash
   npm run build
   # or
   yarn build
   ```

5. **Type check:**
   ```bash
   npx tsc --noEmit
   ```

## Rollback

If you need to revert the migration:

### Option 1: Using the Rollback Tool

```bash
npx @stoked-ui/media rollback
```

This will:
1. Find the migration backup
2. Restore all files from backup
3. Restore package.json
4. Generate a rollback report

### Option 2: Git Revert

If using Git, you can revert the migration commit:

```bash
git revert <migration-commit-hash>
git push origin <branch-name>
```

### Option 3: Manual Restoration

If using Git:
```bash
git checkout HEAD~1 -- .
```

Or restore from your own backups.

## Troubleshooting

### Common Issues

#### Issue: "Cannot find module '@stoked-ui/media'"

**Solution:**
1. Verify package is installed: `npm list @stoked-ui/media`
2. Install if missing: `npm install @stoked-ui/media`
3. Restart TypeScript language server in your IDE
4. Clear node_modules and reinstall: `rm -rf node_modules && npm install`

#### Issue: "Property 'X' does not exist on type 'Y'"

**Possible causes:**
- Type definitions not loaded
- Using API that doesn't exist in new package
- TypeScript cache not updated

**Solutions:**
1. Rebuild: `npm run build`
2. Check TypeScript version: `npx tsc --version`
3. Clear TypeScript cache: `rm -rf dist tsconfig.build.tsbuildinfo`
4. Verify API exists in new package documentation

#### Issue: "Import cycles" or "Circular dependency" warnings

**Solution:**
These warnings often clear up after:
1. Running `npm install` again
2. Restarting your development server
3. Clearing build artifacts

#### Issue: Tests failing after migration

**Debug steps:**
1. Ensure all imports are updated to new package
2. Check that API usage is compatible (see API Changes section)
3. Review test file imports
4. Verify mocks reference correct package
5. Run: `npm test -- --clearCache`

#### Issue: Subpath import errors

**Before:**
```typescript
import something from '@stoked-ui/media-selector/something';
```

**After:**
```typescript
import { something } from '@stoked-ui/media';
```

#### Issue: Unexpected compilation errors

**Steps to resolve:**
1. Verify migration completed successfully: `npx @stoked-ui/media validate-migration`
2. Check for any import errors: `grep -r "media-selector" src/`
3. Clear build cache: `npm run clean && npm install`
4. Rebuild everything: `npm run build`

### Getting Help

If you encounter issues:

1. **Check documentation:** https://github.com/stoked-ui/sui
2. **Search issues:** https://github.com/stoked-ui/sui/issues
3. **Create new issue:** Include:
   - Error message
   - Steps to reproduce
   - Your environment (Node.js, npm versions)
   - Migration tool output

## API Changes

### Fully Compatible (No Changes Needed)

These exports work exactly the same in both packages:

```typescript
import {
  MediaFile,
  WebFile,
  App,
  Stage,
  getMediaType,
  MediaType,
  createZip,
  IZipMetadata,
  ZipMetadata,
} from '@stoked-ui/media';
```

### New in @stoked-ui/media

The new package includes additional exports:

```typescript
import {
  // MediaViewer Component
  MediaViewer,
  MediaViewerHeader,
  useMediaViewerState,
  useMediaViewerLayout,
  type MediaViewerProps,
  type MediaItem,
  type MediaViewerMode,

  // MediaCard Component
  MediaCard,
  ThumbnailStrip,
  VideoProgressBar,
  type MediaCardProps,
  type ExtendedMediaItem,
  type MediaCardDisplayMode,

  // File System API
  openFileApi,
  saveFileApi,

  // Abstractions
  IRouter,
  IAuth,
  IPayment,
  IQueue,
  IKeyboardShortcuts,
  noOpRouter,
  noOpAuth,
  createMockPayment,
  createInMemoryQueue,

  // Framework Abstractions
  WebFileFactory,
} from '@stoked-ui/media';
```

## Breaking Changes

### There are NO breaking changes between packages

All existing APIs from `@stoked-ui/media-selector` are fully compatible with `@stoked-ui/media`. The new package is a superset with additional features.

### Deprecated Patterns (Not Removed, But Updated)

#### Subpath Imports

**Old pattern (still works but not recommended):**
```typescript
import FileWithPath from '@stoked-ui/media-selector/FileWithPath';
```

**New pattern (recommended):**
```typescript
import { FileWithPath } from '@stoked-ui/media';
```

The migration tool automatically updates these.

## Common Scenarios

### Scenario 1: React Component Using MediaFile

**Before:**
```typescript
import React from 'react';
import { MediaFile } from '@stoked-ui/media-selector';

export const ImageUploader = () => {
  const handleDrop = async (e: React.DragEvent) => {
    const files = await MediaFile.from(e);
    console.log(files);
  };

  return <div onDrop={handleDrop}>Drop images here</div>;
};
```

**After:**
```typescript
import React from 'react';
import { MediaFile } from '@stoked-ui/media';

export const ImageUploader = () => {
  const handleDrop = async (e: React.DragEvent) => {
    const files = await MediaFile.from(e);
    console.log(files);
  };

  return <div onDrop={handleDrop}>Drop images here</div>;
};
```

### Scenario 2: Type Definitions

**Before:**
```typescript
import type { IMediaFile } from '@stoked-ui/media-selector';

interface Props {
  files: IMediaFile[];
}
```

**After:**
```typescript
import type { IMediaFile } from '@stoked-ui/media';

interface Props {
  files: IMediaFile[];
}
```

### Scenario 3: Multiple Imports in One File

**Before:**
```typescript
import {
  MediaFile,
  WebFile,
  App,
  getMediaType,
  createZip,
  type IMediaFile,
} from '@stoked-ui/media-selector';
```

**After:**
```typescript
import {
  MediaFile,
  WebFile,
  App,
  getMediaType,
  createZip,
  type IMediaFile,
} from '@stoked-ui/media';
```

### Scenario 4: Using New Features

Now you can also use new features like MediaViewer:

```typescript
import { MediaViewer, type MediaViewerProps } from '@stoked-ui/media';

export const MyMediaViewer = (props: MediaViewerProps) => {
  return <MediaViewer {...props} />;
};
```

## Migration Checklist

- [ ] Read this migration guide
- [ ] Install `@stoked-ui/media`
- [ ] Run `npx @stoked-ui/media migrate --dry-run`
- [ ] Review the proposed changes
- [ ] Run `npx @stoked-ui/media migrate` (without --dry-run)
- [ ] Run `npx @stoked-ui/media validate-migration`
- [ ] Run your project's test suite
- [ ] Build your project: `npm run build`
- [ ] Test all media-related functionality manually
- [ ] Uninstall deprecated package: `npm uninstall @stoked-ui/media-selector`
- [ ] Commit changes: `git commit -m "migrate: @stoked-ui/media-selector -> @stoked-ui/media"`
- [ ] Push to repository
- [ ] Deploy to production

## Additional Resources

- **Official Repository:** https://github.com/stoked-ui/sui
- **Package Documentation:** https://github.com/stoked-ui/sui/tree/main/packages/sui-media
- **Issue Tracker:** https://github.com/stoked-ui/sui/issues
- **Changelog:** https://github.com/stoked-ui/sui/releases

## FAQ

### Q: Is the migration reversible?

**A:** Yes! You can use the rollback tool or git to revert: `npx @stoked-ui/media rollback`

### Q: Will my code break?

**A:** No, the new package is 100% backward compatible. All existing APIs work the same way.

### Q: Can I use both packages together?

**A:** Not recommended. It can cause conflicts and confusion. Migrate completely to the new package.

### Q: How long does migration take?

**A:** Depends on project size. Usually a few seconds to a couple of minutes.

### Q: What if the migration tool breaks something?

**A:** Use the rollback tool to restore: `npx @stoked-ui/media rollback`

### Q: Do I need to update version numbers?

**A:** Only in package.json. The new package uses semantic versioning starting from 0.1.0.

### Q: Can I migrate incrementally?

**A:** Not recommended. Complete migration ensures consistency. But you can technically use both temporarily (not advised).

## Support

For issues, questions, or feedback about this migration guide:

1. Check existing GitHub issues
2. Create a new GitHub issue with details
3. Contact the maintainers

---

**Last Updated:** January 2026
**Migration Tool Version:** 1.0.0
