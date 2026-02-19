---
title: Announcing the Stoked UI File Explorer
description: A deep dive into the File Explorer component — a fully featured, tree-based file browser for React applications built for media-centric workflows.
date: 2026-02-19T00:00:00.000Z
authors: ['brianstoker']
tags: ['Stoked UI', 'File Explorer', 'Announcement', 'Product']
manualCard: false
---

Building a reliable, accessible, and highly customizable file browser for React has historically required stitching together multiple libraries or writing significant amounts of custom code. The `@stoked-ui/file-explorer` package changes that by providing a production-ready tree-based file explorer component designed from the ground up for the demands of media-centric applications. Whether you're managing a library of video assets, organizing project files in a digital audio workstation, or building a developer-facing file picker, the Stoked UI File Explorer gives you a solid foundation without locking you into a rigid structure.

## What the File Explorer Provides

The File Explorer is a virtualized, tree-structured component that renders hierarchical file and folder data with full support for nested directories of arbitrary depth. At its most basic, you provide an array of item descriptors and the component takes care of the rest — rendering collapse/expand controls, handling keyboard navigation, and maintaining selection state. But the component is designed to grow with your requirements. As your use case becomes more complex, the File Explorer exposes a rich set of APIs and slots that let you customize nearly every aspect of its behavior and appearance.

Key features include:

- **Multi-select and range select** — Users can select individual items, hold Shift to select a contiguous range, or use Ctrl/Cmd to build a discontinuous selection. The selection model is fully controlled, so your application always has authoritative knowledge of what is selected.
- **Drag-and-drop reorganization** — Items and subtrees can be dragged within the tree to restructure the hierarchy. Drag events fire at every meaningful stage — drag start, drag over, and drop — giving you full control over whether a proposed reorganization is permitted and how it is committed to your data model.
- **Inline renaming** — Double-clicking an item or pressing F2 puts it into an inline edit mode. The rename event fires with the item ID and the new label value, letting you validate and persist changes however suits your backend.
- **Rich keyboard support** — The File Explorer is fully navigable without a mouse. Arrow keys traverse the tree, Enter toggles expansion, and the Space bar toggles selection. All interactions meet WCAG 2.1 AA accessibility requirements.
- **Icon and renderer customization** — Every visual element can be swapped out via the slots API. Replace the default folder and file icons with your own SVGs, inject custom item content renderers, or slot in a context menu component that fires on right-click.

## Integrating the File Explorer

Getting started requires only a few lines of code. Install the package and its peer dependencies:

```bash
npm install @stoked-ui/file-explorer @mui/material @emotion/react @emotion/styled
```

Then drop the component into your application:

```tsx
import * as React from 'react';
import { FileExplorer, FileElement } from '@stoked-ui/file-explorer';

const items: FileElement[] = [
  {
    id: 'root',
    label: 'My Project',
    children: [
      { id: 'src', label: 'src', children: [
        { id: 'app', label: 'App.tsx' },
        { id: 'index', label: 'index.tsx' },
      ]},
      { id: 'assets', label: 'assets', children: [
        { id: 'logo', label: 'logo.svg' },
        { id: 'banner', label: 'banner.mp4' },
      ]},
    ],
  },
];

export default function ProjectBrowser() {
  const [selected, setSelected] = React.useState<string[]>([]);

  return (
    <FileExplorer
      items={items}
      selectedItems={selected}
      onSelectedItemsChange={(_, ids) => setSelected(ids)}
      multiSelect
    />
  );
}
```

The `items` prop accepts a flat or nested array of `FileElement` objects. Each element requires only an `id` and a `label`; the optional `children` array makes it a folder node. The `selectedItems` and `onSelectedItemsChange` props give you full control over the selection state from outside the component, which is essential when you need to synchronize the selection with other parts of your UI — for example, previewing the selected file in an adjacent panel.

## Customization and Theming

The File Explorer is built on MUI's component system and honors the active MUI theme. Spacing, typography, and color values all pull from the theme tokens, so the component will fit naturally into any MUI-based application without additional style overrides. For more targeted customization the component accepts a `sx` prop at the root level and exposes a `slotProps` API for passing `sx` values down to internal elements like the item label, the expand icon, and the drag-over highlight.

For teams that need even deeper control, the component can be composed from its lower-level parts. The `FileExplorerItem` sub-component can be rendered standalone and wired up manually, making it straightforward to build a custom tree that uses your own layout while still benefiting from the File Explorer's built-in keyboard navigation and accessibility logic.

## What's Next

The File Explorer is already in production use as the asset panel inside the Stoked UI Editor, but we have a rich roadmap planned. Upcoming releases will add virtual scrolling for trees with tens of thousands of nodes, a built-in search and filter bar, file type detection with automatic icon selection, and a clipboard model for cut, copy, and paste operations. We're also planning integration helpers that make it easy to wire the File Explorer to popular backend APIs, including S3-compatible object storage and REST-based file systems.

If you run into a bug, have a feature request, or want to contribute, head over to the [GitHub repository](https://github.com/stoked-ui/sui). We welcome all forms of contribution and are committed to building this component in the open.
