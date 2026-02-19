---
title: Announcing the Stoked UI Timeline and Editor
description: Introducing the Timeline and Editor components — a frame-accurate multi-track timeline and a fully embeddable browser-based media editor for React.
date: 2026-02-19T00:00:00.000Z
authors: ['brianstoker']
tags: ['Stoked UI', 'Timeline', 'Video Editor', 'Editor', 'Announcement', 'Product']
manualCard: false
---

Two of the most requested capabilities in browser-based creative applications are a professional multi-track timeline and a fully featured media editor — and today we're announcing both as part of the Stoked UI component library. The `@stoked-ui/timeline` and `@stoked-ui/editor` packages bring frame-accurate composition and media editing to the React ecosystem, giving developers a foundation for building everything from simple video trimmers to full non-linear editing environments, all running natively in the browser without any server-side processing.

## The Timeline Component

The Timeline is a frame-accurate, multi-track composition engine rendered entirely in React. It is designed around the mental model familiar from professional video editing software: a horizontal time axis, a stack of labeled tracks, and clips or segments that sit on those tracks and can be trimmed, moved, and layered to produce a final output. Every interaction — drag, resize, scrub — is handled at the millisecond level, so compositions stay frame-accurate even at high frame rates.

Core capabilities of the Timeline include:

- **Multi-track layout** — Add as many tracks as your composition requires. Tracks can be heterogeneous: one track might hold a video clip, another an audio waveform, a third a text overlay or animated graphic. Each track type renders its own clip visualization so users always have a clear picture of what is on the timeline.
- **Drag-and-drop clip placement** — Clips can be dragged from an external asset panel (such as the File Explorer) directly onto any track, or repositioned within the timeline itself. The Timeline enforces configurable snapping behavior so clips align cleanly to frame boundaries or custom snap grids.
- **Trim handles** — Both the in-point and the out-point of every clip can be trimmed non-destructively by dragging the clip edges. Trim events carry the clip ID and the new in/out values, giving your application full control over how trim state is persisted.
- **Playback and scrubbing** — The playhead can be dragged to any point or set programmatically via the Timeline's imperative API. The component fires time update events at a configurable rate during playback, which you can use to drive a preview renderer or synchronize other UI elements to the current playback position.
- **Undo/redo stack** — All timeline mutations are recorded in an internal history stack. Users can undo and redo changes with the standard keyboard shortcuts, and the history API is also exposed programmatically so you can integrate it with an application-level command manager.

## The Editor Component

The Editor takes the Timeline and the File Explorer and combines them with a canvas-based preview renderer into a single, self-contained editing environment. Embedding a full media editor in your application is as simple as importing one component:

```tsx
import * as React from 'react';
import { Editor } from '@stoked-ui/editor';

export default function VideoEditor() {
  return (
    <Editor
      style={{ width: '100%', height: '600px' }}
      onExport={(output) => {
        console.log('Export complete:', output);
      }}
    />
  );
}
```

The Editor renders a three-panel layout by default: a file browser on the left where users drag in source assets, a preview canvas in the center that plays back the current composition in real time, and the multi-track Timeline at the bottom. All three panels are resizable and their widths are persisted in local storage between sessions. If the default layout does not fit your use case, the panel slots can be replaced with your own components or omitted entirely.

### Plugin Architecture

One of the most important design goals for the Editor was extensibility. Rather than building every possible feature into the core component, the Editor exposes a plugin API that lets you inject new capabilities without modifying the library source. A plugin is a plain object that declares:

- **Toolbar items** — Buttons, dropdowns, or custom controls added to the top toolbar.
- **Panel components** — Full side panels or popover panels that can access and mutate the timeline state.
- **Keyboard shortcuts** — New key bindings that integrate cleanly with the existing shortcut map and are surfaced in the built-in keyboard shortcut help dialog.
- **Export handlers** — Custom export targets such as a cloud upload endpoint, an FFmpeg WASM pipeline, or a proprietary format serializer.

The plugin API is intentionally low surface area. Plugins receive a stable editor context object via React context, and all mutations go through the same command model that the built-in tools use, so plugins automatically participate in the undo/redo history.

## Getting Started with the Editor

Install the packages you need:

```bash
npm install @stoked-ui/editor @stoked-ui/timeline @stoked-ui/file-explorer @mui/material @emotion/react @emotion/styled
```

The Editor will work with a bare MUI theme, but for the best appearance we recommend configuring the dark palette — the Editor's default visual design is optimized for dark mode, following the conventions of professional creative software:

```tsx
import * as React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Editor } from '@stoked-ui/editor';

const darkTheme = createTheme({ palette: { mode: 'dark' } });

export default function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <Editor style={{ width: '100%', height: '700px' }} />
    </ThemeProvider>
  );
}
```

## What's on the Roadmap

The first stable release of the Timeline and Editor focuses on the core editing workflow. Upcoming releases will expand the capabilities significantly. On the timeline side, we are working on audio waveform visualization (rendered via Web Audio API analysis), keyframe animation curves, and nested sequence support for compositions within compositions. For the Editor, the next major milestone is a WebCodecs-based export pipeline that can render compositions to MP4, WebM, or GIF directly in the browser at near-native speed without requiring a server round-trip.

We're also planning integrations with the Stoked UI Media API for teams that need cloud-backed asset libraries, and with the Nostr protocol for creators who want to publish their work to decentralized social platforms directly from the editor. Follow the project on [GitHub](https://github.com/stoked-ui/sui) or check [stokedconsulting.com](https://stokedconsulting.com) for updates as these features land.
