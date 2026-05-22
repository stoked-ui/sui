# @stoked-ui/timeline

Frame-oriented timeline UI and playback engine for Stoked UI editors and media tools.

This package is not a file explorer. It provides the timeline surface, state provider, action/track models, playback engine, and controller contract used by `@stoked-ui/editor` and standalone timeline integrations.

## Installation

```bash
pnpm add @stoked-ui/timeline @stoked-ui/common @stoked-ui/media @stoked-ui/file-explorer react react-dom
```

Peer dependencies:

- `@stoked-ui/common`
- `@stoked-ui/media`
- `@stoked-ui/file-explorer`
- `@mui/material`, `@mui/icons-material`, Emotion, React, and React DOM

Runtime dependencies include `interactjs`, `@interactjs/*`, `react-virtualized`, `sorted-btree`, `react-device-detect`, `framework-utils`, and MUI system utilities.

## Quick Start

```tsx
import Timeline, { TimelineFile, TimelineProvider } from '@stoked-ui/timeline';

const file = new TimelineFile({
  id: 'timeline-1',
  name: 'Demo timeline',
  version: 1,
  tracks: [],
});

export function TimelinePanel() {
  return (
    <TimelineProvider file={file}>
      <Timeline file={file} labels />
    </TimelineProvider>
  );
}
```

Register custom controllers when actions need media-specific behavior:

```tsx
import { Controller, TimelineProvider, type IController } from '@stoked-ui/timeline';

class ImageController extends Controller implements IController {
  constructor() {
    super({
      id: 'image',
      name: 'Image',
      color: '#1976d2',
      colorSecondary: '#90caf9',
    });
  }

  enter() {}
  leave() {}
  update() {}
  start() {}
  stop() {}
  async preload(params) {
    return params.action;
  }
  getItem() {
    return null;
  }
}

<TimelineProvider file={file} controllers={{ image: new ImageController() }} />;
```

## Primary Exports

- Default component: `Timeline`.
- Timeline UI components: `TimelineCursor`, `TimelineLabels`, `TimelinePlayer`, `TimelineScrollResizer`, `TimelineTime`, `TimelineTrack`, and `TimelineTrackArea`.
- Runtime classes: `TimelineFile`, `Engine`, and `Controller`.
- State system: `TimelineProvider`, `TimelineContext`, `useTimeline`, `TimelineReducer`, and `createTimelineState`.
- Types and models: `IEngine`, `IController`, `ITimelineFile`, `ITimelineTrack`, `ITimelineAction`, `ITimelineFileAction`, `TimelineState`, `TimelineStateAction`, `PlaybackMode`, `EngineState`, event types, detail data, and selection types.
- Constants and utilities from `interface/const` and `utils`.

## Integration Notes

- `Engine` owns playback time, play/pause state, play rate, and the active action set.
- Controllers are keyed by id in the provider and referenced by track/action data. Each controller handles `enter`, `update`, `leave`, `start`, `stop`, `preload`, and `getItem`.
- `TimelineProvider` owns file state, selected project/track/action state, settings, flags, and undo/redo command history.
- Track rows use virtualization and action drag/resize behavior uses `interactjs`.
- `@stoked-ui/editor` extends the engine, file, action, and track types to add canvas compositing and recording.

## Local Development

```bash
pnpm --filter @stoked-ui/timeline build
pnpm --filter @stoked-ui/timeline typescript
pnpm --filter @stoked-ui/timeline dev
pnpm --filter @stoked-ui/timeline start
pnpm --filter @stoked-ui/timeline docs:build
```

## Related Docs

- Product docs: `https://sui.stokd.cloud/products/timeline/docs`
- Editor integration: `@stoked-ui/editor`
- Source: `packages/sui-timeline/src`

## License

MIT
