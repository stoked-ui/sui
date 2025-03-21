# @stoked-ui/complete

This package provides a complete bundle of all the Stoked UI editor-related packages, making it easier to use the full editor stack in your projects.

## Installation

```bash
npm install @stoked-ui/complete
# or
yarn add @stoked-ui/complete
# or
pnpm add @stoked-ui/complete
```

## Usage

```jsx
import * as React from 'react';
import { Editor, MediaSelector, FileExplorer, Timeline } from '@stoked-ui/complete';

function App() {
  return (
    <div>
      <Editor />
    </div>
  );
}
```

## Included Packages

This package includes and re-exports:

- `@stoked-ui/editor` - Main editor component
- `@stoked-ui/file-explorer` - File explorer component
- `@stoked-ui/media-selector` - Media selector component
- `@stoked-ui/timeline` - Timeline component
- `@stoked-ui/common` - Common utilities and components

## Namespace Exports

To avoid naming conflicts, the packages are exported as namespaces:

```jsx
import { Editor } from '@stoked-ui/complete'; // Direct export from editor
import { FileExplorer, MediaSelector, Timeline, Common } from '@stoked-ui/complete';

// Use components from namespaces
<FileExplorer.FileExplorerComponent />
<MediaSelector.MediaSelectorComponent />
<Timeline.TimelineComponent />
```

## Types

Common types are also exported directly:

```typescript
import { EditorState, MediaFile, FileBase, TimelineProps } from '@stoked-ui/complete';
```

## Build Instructions

To rebuild this package from scratch:

1. **Setup Package Directory**
   ```bash
   mkdir -p packages/sui-complete/src packages/sui-complete/scripts
   ```

2. **Create Configuration Files**
   - `package.json`: Package configuration with dependencies and scripts
   - `tsconfig.json`: Base TypeScript configuration
   - `tsconfig.build.json`: Build-specific TypeScript configuration
   - `src/index.ts`: Main entry point that re-exports all components

3. **Create Build Scripts**
   - `scripts/build.mjs`: Handles transpilation using esbuild for different targets
   - `scripts/customCopyFiles.mjs`: Copies necessary files to the build directory

4. **Make Scripts Executable**
   ```bash
   chmod +x scripts/build.mjs scripts/customCopyFiles.mjs
   ```

5. **Run Build**
   ```bash
   # Build all versions (modern, node, stable)
   node scripts/build.mjs modern
   node scripts/build.mjs node
   node scripts/build.mjs stable
   
   # Copy files and create package.json for distribution
   node scripts/customCopyFiles.mjs
   ```

6. **Verify Build**
   ```bash
   ls -la build
   ```

The build directory will contain all the necessary files for distribution, including transpiled JavaScript files, type declarations, and package metadata.

### Quick Rebuild Workflow

If you've made changes to this package or any of its dependencies and need to quickly rebuild:

```bash
# From the workspace root (stoked-ui)
pnpm -F @stoked-ui/complete build:no-typesafety
```

This command will:
1. Build all JavaScript versions (modern, node, stable)
2. Copy necessary files to the build directory
3. Skip type checking to make the build process faster

This is useful during development when you need to quickly test changes without waiting for TypeScript validation.

### Bundle Approach

The package is structured as a "unified access point" for all Stoked UI components:

- It re-exports components from all underlying packages (`@stoked-ui/editor`, `@stoked-ui/file-explorer`, etc.)
- The build process creates a bundled re-export file that preserves the original package references
- Consuming projects still need to install the peer dependencies, but only need to import from this one package

This approach has several benefits:
- Simplified imports (one import location instead of many)
- Consistent versioning (all components come from the same package version)
- Flexibility (allows you to use just the components you need without unnecessary code)
- Compatibility (maintains the same structure as the original packages)

For a true single-file bundle without external dependencies (except React), you would need a more complex build setup that:
1. Resolves all dependencies correctly
2. Handles different module formats and paths
3. Properly bundles CSS and other assets

### Installation in Projects

When using this package in your projects, make sure to install all peer dependencies:

```bash
# Install the complete package
pnpm add @stoked-ui/complete

# Install peer dependencies
pnpm add @stoked-ui/common @stoked-ui/editor @stoked-ui/file-explorer @stoked-ui/media-selector @stoked-ui/timeline
```

## License

MIT 
