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

This package provides a truly portable solution for using Stoked UI components:

- It includes all Stoked UI editor-related packages as dependencies
- When you publish this package, it automatically resolves workspace references to actual version numbers
- In your projects, you only need to install this one package - no need to install each component separately

This approach offers several key benefits:
- **Simplified dependency management** - install just one package instead of five or more
- **Version consistency** - all components are guaranteed to work together
- **Portability** - make changes in one place, build, publish, and use anywhere
- **Streamlined workflow** - only need to manage one package instead of multiple packages

### Quick Workflow for Updates

When you need to make changes and publish a new version:

1. Make your changes to the component packages
2. Run the build process for the modified packages
3. Update the complete package:
   ```bash
   cd packages/sui-complete
   pnpm build:no-typesafety
   ```
4. Publish the complete package:
   ```bash
   cd build
   npm publish
   ```

This creates a self-contained package that you can easily install in other projects with:

```bash
npm install @stoked-ui/complete
```

## License

MIT 

## Troubleshooting

### React Loading Issues

If you encounter errors like `Cannot read properties of undefined (reading 'ReactCurrentOwner')`, follow these steps:

1. **Make sure React is loaded before importing Stoked UI**: This package requires React to be loaded and initialized before it's used.

   ```js
   // Bad - may cause React loading issues
   import StokedUI from '@stoked-ui/complete';
   import React from 'react';
   
   // Good - React is loaded first
   import React from 'react';
   import ReactDOM from 'react-dom';
   import StokedUI from '@stoked-ui/complete';
   ```

2. **Check for multiple React versions**: Ensure you don't have multiple versions of React in your application.
   
   Run `npm ls react` or `yarn why react` to check if multiple versions exist.

3. **Add error boundary**: Wrap your Stoked UI components in an error boundary for better error handling.

4. **Update to the latest React version**: This package is tested with React 17.x and 18.x.
