---
productId: file-explorer
title: File Explorer React component
githubLabel: 'component: timeline'
components: TimelineEngine, Timeline, TimelineRow, TimelineAction, TimelineEffect
waiAria: https://www.w3.org/WAI/ARIA/apg/patterns/treeview/
packageName: '@stoked-ui/timeline'
---

# Overview

<p class="description">The File Explorer component lets users navigate hierarchical lists of data with nested levels that can be expanded and collapsed.</p>

{{"component": "modules/components/ComponentLinkHeader"}}

## Available components

The MUI X File Explorer package exposes two different versions of the component:

### File Explorer Basic

```jsx
import { Timeline } from '@stoked-ui/timeline/Timeline';
```

The simple version of the File Explorer component receives its items as JSX children.
This is the recommended version for hardcoded items.

{{"demo": "TimelineEditorDemo.js", "hideToolbar": true, "bg": "inline"}}
