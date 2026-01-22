# Migration Guide: @stoked-ui/media-selector to @stoked-ui/media

This guide provides comprehensive instructions for migrating from the deprecated `@stoked-ui/media-selector` package to the new `@stoked-ui/media` package using automated tooling.

## Table of Contents

1. [Overview](#overview)
2. [Migration Time Estimates](#migration-time-estimates)
3. [Quick Start](#quick-start)
4. [Using the Migration Tool](#using-the-migration-tool)
5. [Manual Migration](#manual-migration)
6. [Validation](#validation)
7. [Rollback](#rollback)
8. [Troubleshooting](#troubleshooting)
9. [API Changes](#api-changes)
10. [Breaking Changes](#breaking-changes)
11. [Common Scenarios](#common-scenarios)
12. [Team Migration Strategy](#team-migration-strategy)

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

## Migration Time Estimates

Migration duration depends on project size and complexity:

| Project Size | File Count | Estimated Time | Complexity |
|---|---|---|---|
| **Tiny** | <50 files | 1-2 minutes | Minimal |
| **Small** | 50-200 files | 3-5 minutes | Low |
| **Medium** | 200-500 files | 5-10 minutes | Moderate |
| **Large** | 500-1000 files | 10-15 minutes | High |
| **Enterprise** | >1000 files | 15-30 minutes | Very High |

**Time Breakdown (for typical 100-file project):**
- Package installation: 1-2 minutes
- Migration tool execution: 30-60 seconds
- Validation: 15-30 seconds
- Testing & verification: 2-5 minutes
- **Total: ~5-10 minutes**

**Notes:**
- Automated migration tool handles most transformations
- Manual verification time increases with project complexity
- Testing time depends on test suite size
- Enterprise projects may require team coordination

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

#### Issue: "Maximum call stack size exceeded" after migration

**Cause:** Usually circular dependency or infinite loop in imports

**Solution:**
1. Run migration validation: `npx @stoked-ui/media validate-migration`
2. Check for mixed imports (shouldn't have both old and new package)
3. Clear node_modules: `rm -rf node_modules package-lock.json && npm install`
4. Verify no self-references in imports

#### Issue: Package manager showing conflicts

**Error example:**
```
npm ERR! peer dep missing: @stoked-ui/media@*, you have @stoked-ui/media-selector@0.1.3
```

**Solution:**
1. Ensure old package is removed: `npm uninstall @stoked-ui/media-selector`
2. Clear lockfile: `rm -rf package-lock.json`
3. Reinstall: `npm install`
4. Verify: `npm list @stoked-ui/media`

#### Issue: IDE/Editor not recognizing types after migration

**Symptoms:** Red squiggles in editor, autocomplete doesn't work

**Solution:**
1. **VS Code:**
   - Open Command Palette: `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
   - Run: "TypeScript: Restart TS Server"

2. **WebStorm:**
   - Menu: Preferences → Languages & Frameworks → TypeScript
   - Click "Recompile"

3. **Vim/Neovim:**
   - Restart LSP: `:LspRestart`

4. **Generic:**
   - Close and reopen the editor
   - Clear editor cache if applicable

#### Issue: Hot reload/HMR not working after migration

**Cause:** Files may have changed but bundler needs refresh

**Solution:**
1. Stop dev server (Ctrl+C)
2. Clear build artifacts: `npm run clean` or `rm -rf .next dist build`
3. Restart dev server: `npm run dev`

#### Issue: "old imports still appear in compiled code"

**Symptoms:** Output shows `@stoked-ui/media-selector` in bundled code

**Cause:** Build cache contains old references

**Solution:**
1. Clean build: `npm run clean`
2. Check tree-shaking config in bundler (webpack, rollup, etc.)
3. Rebuild: `npm run build`
4. Verify: `grep -r "media-selector" dist/` should be empty

#### Issue: Migration tool reports errors but changes were made

**Cause:** Partial migration - some files changed, others didn't

**Solution:**
1. Don't worry - the automated tool handles this
2. Check tool output for specific files with errors
3. You can fix those files manually if needed
4. Run validation to confirm: `npx @stoked-ui/media validate-migration`

#### Issue: Different results between dry-run and actual migration

**Cause:** File system state changed between runs

**Solution:**
1. This is rare but can happen with concurrent file modifications
2. Rollback: `npx @stoked-ui/media rollback`
3. Check for unsaved changes in editors
4. Try again: `npx @stoked-ui/media migrate --dry-run` then migrate

### Getting Help

If you encounter issues not listed above:

1. **Check existing GitHub issues**
   - Your issue may already have a solution
   - Search: https://github.com/stoked-ui/sui/issues

2. **Review documentation again**
   - Go through this entire guide
   - Check MIGRATION_TOOLING.md for tool specifics
   - Review component READMEs

3. **Try troubleshooting steps in order**
   - Run validation tool
   - Clear caches (npm, node_modules, build)
   - Restart tools (IDE, dev server)
   - Try a fresh clone if very stuck

4. **Create detailed GitHub issue with:**
   - Exact error message (full text, not truncated)
   - Steps to reproduce the issue
   - Your environment:
     - `node --version`
     - `npm --version`
     - `npm list @stoked-ui/media`
     - `npm list @stoked-ui/media-selector` (if still present)
   - Complete output from migration tool
   - Which phase of migration failed (installation, migration, testing, etc.)
   - Any non-standard project setup (monorepo, custom webpack, etc.)

5. **Contact maintainers (for urgent issues)**
   - Open issue with "urgent" label
   - Reference this guide page/section
   - Provide minimum reproducible example if possible

## API Changes

### API Compatibility Matrix

| Export | Old Package | New Package | Status | Notes |
|---|---|---|---|---|
| `MediaFile` | ✓ | ✓ | Compatible | No changes required |
| `WebFile` | ✓ | ✓ | Compatible | No changes required |
| `App` | ✓ | ✓ | Compatible | No changes required |
| `Stage` | ✓ | ✓ | Compatible | No changes required |
| `getMediaType()` | ✓ | ✓ | Compatible | No changes required |
| `MediaType` | ✓ | ✓ | Compatible | No changes required |
| `createZip()` | ✓ | ✓ | Compatible | No changes required |
| `IZipMetadata` | ✓ | ✓ | Compatible | No changes required |
| `ZipMetadata` | ✓ | ✓ | Compatible | No changes required |
| `FileWithPath` | ✓ | ✓ | Compatible | Prefer named imports |
| **New: MediaViewer** | ✗ | ✓ | New Feature | Optional, not required |
| **New: MediaCard** | ✗ | ✓ | New Feature | Optional, not required |
| **New: IRouter** | ✗ | ✓ | New Feature | Optional abstraction |
| **New: IAuth** | ✗ | ✓ | New Feature | Optional abstraction |
| **New: IPayment** | ✗ | ✓ | New Feature | Optional abstraction |
| **New: IQueue** | ✗ | ✓ | New Feature | Optional abstraction |
| **New: IKeyboardShortcuts** | ✗ | ✓ | New Feature | Optional abstraction |

### Fully Compatible (No Changes Needed)

These exports work exactly the same in both packages:

```typescript
import {
  // Core Classes
  MediaFile,
  WebFile,
  App,
  Stage,
  FileWithPath,

  // Utilities
  getMediaType,
  MediaType,
  createZip,
  IZipMetadata,
  ZipMetadata,
} from '@stoked-ui/media';
```

**Usage remains identical:**
```typescript
// Before and after - works the same
const files = await MediaFile.from(dragEvent);
const mediaType = getMediaType('image/jpeg');
const zipFile = await createZip(fileArray);
```

### New in @stoked-ui/media

The new package includes additional exports (optional to use):

```typescript
import {
  // MediaViewer Component - NEW
  MediaViewer,
  MediaViewerHeader,
  useMediaViewerState,
  useMediaViewerLayout,
  type MediaViewerProps,
  type MediaItem,
  type MediaViewerMode,

  // MediaCard Component - NEW
  MediaCard,
  ThumbnailStrip,
  VideoProgressBar,
  type MediaCardProps,
  type ExtendedMediaItem,
  type MediaCardDisplayMode,

  // File System API - NEW
  openFileApi,
  saveFileApi,

  // Abstractions - NEW
  IRouter,
  IAuth,
  IPayment,
  IQueue,
  IKeyboardShortcuts,
  noOpRouter,
  noOpAuth,
  createMockPayment,
  createInMemoryQueue,

  // Framework Abstractions - NEW
  WebFileFactory,
} from '@stoked-ui/media';
```

**These are new features you can optionally adopt:**
- Components are available but not required
- Abstractions are helpful for framework integration
- Can be used alongside existing code without conflicts

## Breaking Changes

### Guarantee: ZERO Breaking Changes

All existing APIs from `@stoked-ui/media-selector` are **100% backward compatible** with `@stoked-ui/media`. The new package is a strict superset that adds functionality without removing or changing existing behavior.

**What this means:**
- ✓ All imports work the same way
- ✓ All function signatures are identical
- ✓ All types are compatible
- ✓ All behavior is preserved
- ✓ All existing code will continue to work

### Deprecated Patterns (Not Removed, But Improved)

#### Subpath Imports - Still Work, But Not Recommended

Subpath imports from the old package still function but are not recommended in the new package:

**Old pattern (still works):**
```typescript
import FileWithPath from '@stoked-ui/media-selector/FileWithPath';
import MediaFile from '@stoked-ui/media-selector/MediaFile';
import createZip from '@stoked-ui/media-selector/createZip';
```

**New pattern (recommended):**
```typescript
import { FileWithPath } from '@stoked-ui/media';
import { MediaFile } from '@stoked-ui/media';
import { createZip } from '@stoked-ui/media';
```

**Why the change:**
- Main export is cleaner and more discoverable
- IDE autocomplete works better with named imports
- Tree-shaking is more effective
- Aligns with modern TypeScript best practices

**The migration tool automatically updates these** - no action needed from you.

### Version Compatibility

| Aspect | Old Package | New Package | Compatibility |
|---|---|---|---|
| **Runtime** | Node 16+ | Node 16+ | ✓ Compatible |
| **React** | 18+ | 18+ | ✓ Compatible |
| **TypeScript** | 4.8+ | 5.0+ | ✓ Compatible |
| **Module System** | ESM/CommonJS | ESM/CommonJS | ✓ Compatible |
| **Browser Support** | Modern browsers | Modern browsers | ✓ Compatible |

### No API Removals

The new package does NOT remove any APIs from the old package. Even if something seems "deprecated" in documentation, it's still available and functional.

**Example - all of these still work:**
```typescript
import { MediaFile, WebFile, App, Stage, getMediaType, createZip } from '@stoked-ui/media';

// All of these work exactly the same as before
const files = await MediaFile.from(dragEvent);
const type = getMediaType('image/jpeg');
const zip = await createZip(fileList);
const app = new App();
const stage = new Stage();
const webFile = new WebFile(file);
```

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

Now you can optionally use new features like MediaViewer (no requirement):

```typescript
import { MediaViewer, type MediaViewerProps } from '@stoked-ui/media';

export const MyMediaViewer = (props: MediaViewerProps) => {
  return <MediaViewer {...props} />;
};
```

### Scenario 5: Complex File Handler with Error Handling

**Before:**
```typescript
import React from 'react';
import { MediaFile, getMediaType, MediaType } from '@stoked-ui/media-selector';

interface FileWithMetadata {
  file: File;
  mediaType: MediaType;
  preview: string;
}

export const ComplexUploader = () => {
  const [files, setFiles] = React.useState<FileWithMetadata[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  const handleDrop = async (e: React.DragEvent) => {
    try {
      e.preventDefault();

      const mediaFiles = await MediaFile.from(e);
      const filesWithMetadata = mediaFiles.map(file => ({
        file,
        mediaType: getMediaType(file.type),
        preview: URL.createObjectURL(file),
      }));

      setFiles(prev => [...prev, ...filesWithMetadata]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    }
  };

  return (
    <div onDrop={handleDrop} onDragOver={e => e.preventDefault()}>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {files.map((item, i) => (
        <div key={i}>
          <img src={item.preview} alt="preview" style={{ maxWidth: '200px' }} />
          <p>{item.file.name} - {item.mediaType}</p>
        </div>
      ))}
    </div>
  );
};
```

**After:**
```typescript
import React from 'react';
import { MediaFile, getMediaType, MediaType } from '@stoked-ui/media';

interface FileWithMetadata {
  file: File;
  mediaType: MediaType;
  preview: string;
}

export const ComplexUploader = () => {
  const [files, setFiles] = React.useState<FileWithMetadata[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  const handleDrop = async (e: React.DragEvent) => {
    try {
      e.preventDefault();

      const mediaFiles = await MediaFile.from(e);
      const filesWithMetadata = mediaFiles.map(file => ({
        file,
        mediaType: getMediaType(file.type),
        preview: URL.createObjectURL(file),
      }));

      setFiles(prev => [...prev, ...filesWithMetadata]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    }
  };

  return (
    <div onDrop={handleDrop} onDragOver={e => e.preventDefault()}>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {files.map((item, i) => (
        <div key={i}>
          <img src={item.preview} alt="preview" style={{ maxWidth: '200px' }} />
          <p>{item.file.name} - {item.mediaType}</p>
        </div>
      ))}
    </div>
  );
};
```

**What changed:** Only the import path from `@stoked-ui/media-selector` to `@stoked-ui/media`. All logic remains identical.

### Scenario 6: Testing with Mocked Media Files

**Before:**
```typescript
import { WebFile, App } from '@stoked-ui/media-selector';

describe('MediaUploader', () => {
  it('should handle file uploads', async () => {
    const blob = new Blob(['test'], { type: 'image/jpeg' });
    const file = new File([blob], 'test.jpg', { type: 'image/jpeg' });

    const webFile = new WebFile(file);
    const app = new App();

    expect(webFile.file).toBe(file);
    expect(app).toBeDefined();
  });
});
```

**After:**
```typescript
import { WebFile, App } from '@stoked-ui/media';

describe('MediaUploader', () => {
  it('should handle file uploads', async () => {
    const blob = new Blob(['test'], { type: 'image/jpeg' });
    const file = new File([blob], 'test.jpg', { type: 'image/jpeg' });

    const webFile = new WebFile(file);
    const app = new App();

    expect(webFile.file).toBe(file);
    expect(app).toBeDefined();
  });
});
```

**What changed:** Only the import. Test logic is identical.

## Migration Checklist

Follow these steps in order. Each step is designed to catch issues early.

### Phase 1: Preparation (5 minutes)

- [ ] **Read the guide** - Understand the migration process (this document)
- [ ] **Review breaking changes** - Verify there are none that affect your code
- [ ] **Check dependencies** - Verify you have Node.js 16+ and npm/yarn/pnpm
- [ ] **Create backup** - Commit current work: `git commit -m "pre-migration backup"`

### Phase 2: Installation (2-3 minutes)

- [ ] **Install new package** - `npm install @stoked-ui/media`
- [ ] **Verify installation** - `npm list @stoked-ui/media`
- [ ] **Keep old package for now** - Don't uninstall yet, we'll do that after validation

### Phase 3: Automated Migration (1 minute)

- [ ] **Preview changes** - Run `npx @stoked-ui/media migrate --dry-run`
- [ ] **Review preview output** - Check which files will be changed
- [ ] **Understand the changes** - Look at before/after comparisons
- [ ] **Run migration** - Execute `npx @stoked-ui/media migrate` (without --dry-run)
- [ ] **Verify backup** - Check that `.migration-backup-*` directory was created

### Phase 4: Validation (2-3 minutes)

- [ ] **Run validation tool** - Execute `npx @stoked-ui/media validate-migration`
- [ ] **Check for errors** - Review validation output carefully
- [ ] **Search for remaining imports** - `grep -r "@stoked-ui/media-selector" src/`
  - Should return **zero results** if migration succeeded
- [ ] **Verify package.json** - Check that only `@stoked-ui/media` is listed
  - `grep "@stoked-ui/media" package.json`

### Phase 5: Testing (3-5 minutes)

- [ ] **Run type check** - `npx tsc --noEmit`
  - TypeScript should report zero errors
- [ ] **Run linter** - `npm run lint` or `yarn lint`
  - Should pass without new errors
- [ ] **Run tests** - `npm test`
  - All tests should pass (especially media-related tests)
- [ ] **Build project** - `npm run build`
  - Build should complete successfully

### Phase 6: Manual Verification (5 minutes)

- [ ] **Start dev server** - `npm run dev` or `npm start`
- [ ] **Test media uploads** - If your app has file upload, test it
- [ ] **Test media display** - Verify media components render correctly
- [ ] **Check console** - No errors about missing imports or types
- [ ] **Test on multiple browsers** - Chrome, Firefox, Safari

### Phase 7: Cleanup (1 minute)

- [ ] **Uninstall old package** - `npm uninstall @stoked-ui/media-selector`
- [ ] **Update package.json** - Verify old package is removed
- [ ] **Install dependencies** - `npm install`
- [ ] **Verify clean state** - `npm list @stoked-ui/media-selector`
  - Should report "not installed"

### Phase 8: Commit & Deploy (2 minutes)

- [ ] **Review changes** - `git diff --stat`
- [ ] **Create commit** - Use message: `docs(media): migrate from media-selector to media`
  - Example: `git commit -m "docs(media): migrate from media-selector to media package"`
- [ ] **Push to branch** - `git push origin <branch-name>`
- [ ] **Create PR** - If using pull requests
- [ ] **Deploy** - Merge and deploy as usual

### Total Time Estimate

| Phase | Time |
|---|---|
| Preparation | 5 min |
| Installation | 2-3 min |
| Automated Migration | 1 min |
| Validation | 2-3 min |
| Testing | 3-5 min |
| Manual Verification | 5 min |
| Cleanup | 1 min |
| Commit & Deploy | 2 min |
| **Total** | **20-25 min** |

### If Something Goes Wrong

**Immediate action:**
1. Don't panic - migration is fully reversible
2. Run: `npx @stoked-ui/media rollback`
3. Restore from git: `git reset --hard HEAD~1`
4. Check troubleshooting section below
5. Create GitHub issue if stuck

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

## Team Migration Strategy

If you're migrating a team project or monorepo, follow this strategy to minimize disruption:

### Single Package Migration

**For standalone projects:**

1. **Assign owner** - One person leads the migration
2. **Create feature branch** - `git checkout -b migrate/media-selector-to-media`
3. **Follow checklist** - Run through the full migration checklist
4. **Create PR** - Submit for code review
5. **Review & merge** - Team reviews and approves
6. **Deploy** - Roll out to production

**Timeline:** 20-30 minutes

### Monorepo Migration

**For monorepos with multiple packages using media-selector:**

#### Option A: Sequential Migration (Recommended)

Migrate one package at a time to catch issues early:

```bash
# 1. Create main migration branch
git checkout -b migrate/media-selector-to-media

# 2. Migrate package 1
cd packages/package-1
npx @stoked-ui/media migrate --dry-run
# Review and fix any issues
npx @stoked-ui/media migrate
npm test && npm run build

# 3. Migrate package 2
cd ../package-2
npx @stoked-ui/media migrate --dry-run
npx @stoked-ui/media migrate
npm test && npm run build

# 4. Migrate remaining packages
# ... repeat for each package

# 5. Test entire monorepo
npm install
npm test
npm run build

# 6. Commit and push
git add .
git commit -m "migrate: media-selector to media package across monorepo"
git push origin migrate/media-selector-to-media
```

**Timeline:** 1-2 hours for typical monorepo

#### Option B: Parallel Migration (Faster, Requires Coordination)

For large teams that can work in parallel:

1. **Divide and assign** - Assign packages to team members
2. **Create branches** - Each person creates branch: `migrate/media-selector-to-media-<package-name>`
3. **Coordinate install** - One person adds `@stoked-ui/media` to root package.json
4. **Migrate packages** - Each person migrates their assigned package(s)
5. **Integration test** - Test full monorepo after all packages migrated
6. **Create combined PR** - Merge all branches into main migration branch, then to main

**Timeline:** 30-45 minutes with good coordination

### Team Communication Template

When starting migration, communicate with your team:

```markdown
## Media Package Migration

We're upgrading from @stoked-ui/media-selector to @stoked-ui/media.

**Key Points:**
- ✓ No breaking changes - backward compatible
- ✓ Automated migration available
- ✓ Process takes ~30 minutes total
- ✓ All tests pass after migration

**Timeline:**
- [Date]: Migration starts
- [Date]: PR created for review
- [Date]: Merged and deployed

**Action Items:**
- Developers: Don't commit media-selector-related changes during migration
- Reviewers: Check migration preview carefully
- QA: Test media functionality after deployment

**Need help?**
- See MIGRATION.md for detailed guide
- Check FAQ section for common issues
- Ask #dev-help Slack channel
```

### Handling Conflicts During Team Migration

If multiple people are working on media-related code during migration:

**Before Migration:**
```bash
# Pull latest from main
git fetch origin
git pull origin main

# Pause media-selector related changes
# - Tell team not to commit media changes until migration done
# - Save any in-progress media work to separate branch
```

**After Migration:**
```bash
# If you have conflicting changes on separate branch:
git fetch origin
git rebase origin/main

# Resolve conflicts:
# - Accept migration changes for imports
# - Keep your logic changes
# - Re-test

# Or start fresh:
git stash  # Save your work
git checkout main
git pull origin main
# Reapply your changes manually if needed
```

### Verification After Team Migration

For team leads reviewing the migration:

```bash
# 1. Verify all imports updated
grep -r "@stoked-ui/media-selector" packages/
# Should return zero results

# 2. Verify new package installed
grep "@stoked-ui/media" package.json

# 3. Run full test suite
npm test

# 4. Run full build
npm run build

# 5. Check for any warnings
npm run lint

# 6. Quick manual test in dev environment
npm run dev
# Click through media functionality
```

### Rollback Strategy for Teams

If migration goes wrong across team:

**Immediate:**
```bash
# Option 1: Revert migration commit
git revert <migration-commit-hash>
git push origin <branch>

# Option 2: Use tool rollback (if not committed yet)
npx @stoked-ui/media rollback
npm install
npm test
```

**Prevention:**
- Always review `--dry-run` output first
- Use feature branches, not main
- Run tests before pushing
- Have one person do initial migration as reference

## Support

For issues, questions, or feedback about this migration guide:

1. **Check existing GitHub issues** - Your question may already be answered
2. **Review FAQ section** - Common questions listed below
3. **Check troubleshooting** - Specific error solutions
4. **Create new GitHub issue** - Include:
   - Error message (full text)
   - Steps to reproduce
   - Output of `npm list @stoked-ui/media`
   - Output of migration tool
   - Your environment (Node version, OS, npm version)
5. **Contact maintainers** - For urgent issues

---

**Last Updated:** January 2026
**Migration Tool Version:** 1.0.0
**Documentation Version:** 2.0.0
