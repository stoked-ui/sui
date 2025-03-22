# Stoked UI - Docs

This package contains Stoked UI's Docs components.
It's part of [Stoked UI](https://stoked-ui.com/stoked-ui/docs), an open-sourced advanced media component library.

## Installation

Install the package in your project directory with:

```bash
npm install @stoked-ui/docs
```

This component has the following peer dependencies that you will need to install as well.

```json
"peerDependencies": {
"@mui/base": "*",
"@mui/icons-material": "^5.0.0",
"@mui/material": "^5.0.0",
"@mui/system": "^5.0.0",
"@types/react": "^18.3.1",
"next": "^13.5.1 || ^14",
"react": "18.3.1"
},
```

## Documentation

Visit [https://stoked-ui.com/docs-lib/docs](https://stoked-ui.com/docs-lib/docs/) to view the full documentation.

## Documentation Generation

We have created tools to help with generating and maintaining documentation for components across the packages in this repository. The documentation follows the style of the @mui/material documentation site, with comprehensive information about each component, including examples and API details.

### Documentation Status

The following components have detailed documentation created:

1. **Timeline Component** (`packages/sui-timeline`):
   - Documentation: `packages/sui-timeline/docs/src/components/Timeline/timeline.md`
   - Examples: BasicTimeline, MultiTrackTimeline, CustomControlsTimeline, CollapsedTimeline

2. **FileExplorer Component** (`packages/sui-file-explorer`):
   - Documentation: `packages/sui-file-explorer/docs/src/components/FileExplorer/fileexplorer.md`
   - Examples: BasicFileExplorer

3. **Editor Component** (`packages/sui-editor`):
   - Documentation: `packages/sui-editor/docs/src/components/Editor/editor.md`
   - Examples: BasicEditor, EditorWithContent, CustomEditor

### Documentation Tools

For information about the documentation generation tools and how to use them, please refer to:
- [Documentation Generation README](./README-DOCS-GENERATION.md)
- [Component Documentation Template](./templates/component-doc-template.md)

The documentation tools provide utilities to identify components needing documentation and to generate documentation structure for components.

## Documentation Generation Tools

This package also includes tools to generate comprehensive documentation for all components in the Sui packages. These tools help ensure that all components are properly documented with examples, API references, and usage instructions following the Material-UI documentation style.

### Available Tools

1. **Component Documentation Generation** - Automatically generate documentation structure for components
2. **Documentation Status Checker** - Identify which components are missing documentation
3. **Bulk Documentation Generator** - Generate documentation for all components at once

### How to Use

Run the main documentation generation script:

```bash
node packages/sui-docs/run-docs-generation.js
```

This will help you identify components that need documentation and guide you through the documentation generation process.

For more detailed information about the documentation tools and best practices, please see:

- [README-DOCS-GENERATION.md](./README-DOCS-GENERATION.md) - Comprehensive guide to using the documentation tools
- [templates/component-doc-template.md](./templates/component-doc-template.md) - Documentation template for reference
