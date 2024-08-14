---
productId: video-explorer
title: Video Explorer component
githubLabel: 'component: video-editor'
components: VideoEditor, FileExplorer, Timeline, MediaSelector
packageName: '@stoked-ui/video-editor'
---

# Overview

<p class="description">The Video Editor component lets users navigate hierarchical lists of data with nested levels that can be expanded and collapsed.</p>

{{"component": "modules/components/ComponentLinkHeader"}}

## Available components

The MUI X Video Editor package exposes two different versions of the component:

### Video Editor

```jsx
import { VideoEditor } from '@stoked-ui/video-editor/VideoEditor';
```

The simple version of the File Explorer component receives its items as JSX children.
This is the recommended version for hardcoded items.

{{"demo": "VideoEditorDemo.js", "defaultCodeOpen": false, "bg": "noMargin"}}
