# @stoked-ui/file-explorer

Plugin-driven React file tree components for Stoked UI, built on MUI conventions with drag-and-drop, grid columns, feature flags, and file-domain item models.

## Installation

```bash
pnpm add @stoked-ui/file-explorer @stoked-ui/common @stoked-ui/media react react-dom
```

Peer dependencies:

- `@stoked-ui/common`
- `@stoked-ui/media`
- `@mui/material`, `@mui/icons-material`, Emotion, React, and React DOM

The package also uses `@mui/x-tree-view`, `@mui/base`, Atlaskit pragmatic drag-and-drop packages, `@react-spring/web`, `clsx`, `memoize-one`, and related utilities.

## Quick Start

```tsx
import { FileExplorer, type FileBase } from '@stoked-ui/file-explorer';

const files: FileBase[] = [
  {
    id: 'root',
    name: 'Project',
    type: 'folder',
    mediaType: 'folder',
    children: [
      { id: 'clip-1', name: 'clip.mp4', type: 'file', mediaType: 'video', url: '/clip.mp4' },
    ],
  },
];

export function FilesPanel() {
  return (
    <FileExplorer
      items={files}
      defaultExpandedItems={['root']}
      onItemDoubleClick={(item) => console.log(item.name)}
    />
  );
}
```

Use an imperative API ref:

```tsx
import { FileExplorer, useFileExplorerApiRef } from '@stoked-ui/file-explorer';

const apiRef = useFileExplorerApiRef();

<FileExplorer apiRef={apiRef} items={files} />;
apiRef.current?.focusItem(null, 'clip-1');
```

## Primary Exports

- Components: `FileExplorer`, `FileExplorerLegacy`, `FileExplorerWithFlags`, `FileExplorerBasic`, `FileExplorerTabs`, `File`, `FileElement`, and `FileDropzone`.
- Hooks: `useFile`, `useFileExplorerApiRef`, and file utility hooks.
- Models: `FileBase`, `FileBaseInput`, and `FileId`.
- Plugin internals re-exported for advanced customization: expansion, selection, focus, keyboard navigation, icons, JSX items, grid, and drag-and-drop signatures.
- Feature flags: `FeatureFlag`, `FeatureFlagProvider`, `useFeatureFlag`, `useFeatureFlags`, `DEFAULT_FEATURE_FLAGS`, and environment configs.
- Icons and slot/class utilities used by the component family.

## Integration Notes

- `FileBase` requires `id`, `name`, `type`, and `mediaType`. Use `children` for nested folders.
- `FileExplorer` is data-prop driven. `FileExplorerBasic` is for JSX children. `FileExplorerTabs` is the multi-panel container used by the editor.
- Drag-and-drop behavior is implemented through the Atlaskit pragmatic DnD packages.
- `FeatureFlag.USE_MUI_X_RENDERING` controls the newer MUI X rendering path; the legacy recursive renderer remains available.
- `@stoked-ui/editor` consumes `FileExplorerTabs` for project and track-file panels.

## Local Development

```bash
pnpm --filter @stoked-ui/file-explorer build
pnpm --filter @stoked-ui/file-explorer typescript
pnpm --filter @stoked-ui/file-explorer dev
```

## Related Docs

- Product docs: `https://stoked-ui.com/products/file-explorer/docs`
- Source: `packages/sui-file-explorer/src`

## License

MIT
