# @stoked-ui/editor

Non-linear video composition editor for Stoked UI. It combines the media file layer, file explorer, timeline engine, canvas preview, controllers, project persistence, detail editing, and optional WASM preview rendering.

## Installation

```bash
pnpm add @stoked-ui/editor @stoked-ui/common @stoked-ui/media @stoked-ui/file-explorer @stoked-ui/timeline react react-dom
```

Peer dependencies:

- `@stoked-ui/common`
- `@stoked-ui/media`
- `@stoked-ui/file-explorer`
- `@stoked-ui/timeline`
- `@mui/material`, `@mui/icons-material`, Emotion, React, and React DOM

Optional dependency:

- `@stoked-ui/video-renderer-wasm` for the generated Rust/WASM preview renderer.

## Quick Start

```tsx
import { Editor, EditorProvider, createEditorFile } from '@stoked-ui/editor';

const file = createEditorFile({
  id: 'project-1',
  name: 'Demo project',
  version: 1,
  width: 1920,
  height: 1080,
  tracks: [],
});

export function EditorScreen() {
  return (
    <EditorProvider file={file}>
      <Editor file={file} allControls detailMode />
    </EditorProvider>
  );
}
```

Use the imperative API ref when embedding the editor in a larger app:

```tsx
import { Editor, useEditorApiRef } from '@stoked-ui/editor';

const apiRef = useEditorApiRef();

<Editor apiRef={apiRef} file={file} />;
```

## Primary Exports

- Default component and named component: `Editor`.
- Context/runtime: `EditorProvider`, `EditorEngine`, `EditorView`, and `Controllers`.
- Project model: `EditorFile`, `IEditorFile`, `IEditorFileProps`, and `createEditorFile`.
- Timeline extensions: editor action, track, file, reducer, state, and detail types.
- UI surfaces: `EditorControls`, `EditorView`, slots, props, classes, and model exports.
- Hooks: `useEditorApiRef` and editor plugin hooks exported from `src/hooks`.
- Helpers: `EditorVideoExampleProps` and `EditorExample`.

## Integration Notes

- `EditorProvider` wraps `TimelineProvider` with an `EditorEngine` and editor-specific reducer state.
- `EditorView` exposes a renderer canvas, screener video, and stage container that `EditorEngine` discovers by role.
- `Controllers` maps media controller keys such as `video`, `audio`, `image`, and `compositor` to timeline controller implementations.
- `EditorFile` extends `TimelineFile` and adds composition metadata such as width, height, background color, blend mode, and fit.
- Project persistence uses browser storage through `@stoked-ui/common` `LocalDb`.
- The WASM renderer is optional. The editor falls back to the JavaScript canvas path when the package is absent or fails to load.

## Local Development

```bash
pnpm --filter @stoked-ui/editor build
pnpm --filter @stoked-ui/editor typescript
pnpm --filter @stoked-ui/editor dev
```

## Related Docs

- Product docs: `https://stoked-ui.com/products/editor/docs`
- WASM renderer package: `@stoked-ui/video-renderer-wasm`
- Source: `packages/sui-editor/src`

## License

MIT
