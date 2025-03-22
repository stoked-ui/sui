---
productId: editor
title: Editor React component
components: Editor
githubLabel: 'component: editor'
packageName: '@stoked-ui/sui-editor'
---

# Editor

<p class="description">The Editor component is a powerful media editing interface that combines a timeline, file explorer, and preview area to provide a complete video and media editing experience.</p>

{{"component": "modules/components/ComponentLinkHeader"}}

## Introduction

The Editor component is the core of the Stoked UI media editing system. It provides a comprehensive interface for working with video, audio, and other media files. The Editor integrates several complex components:

- **Timeline**: For manipulating time-based media and actions
- **File Explorer**: For organizing and selecting media files
- **Preview Area**: For viewing and playback of media content
- **Controls**: For playback, editing operations, and other actions

{{"demo": "EditorUsage.js", "bg": true}}

## Basics

```jsx
import { Editor } from '@stoked-ui/sui-editor';
import { EditorFile } from '@stoked-ui/sui-editor';
```

### Basic Editor

A simple editor with default settings provides the foundation for media editing.

{{"demo": "BasicEditor.js", "bg": true}}

### File View

Use the `fileView` prop to show the file explorer panel, which allows for easy file navigation and selection.

{{"demo": "EditorWithFileView.js", "bg": true}}

### Labels

Use the `labels` prop to display track labels in the timeline, making it easier to identify different media tracks.

{{"demo": "EditorWithLabels.js", "bg": true}}

### Pre-loaded Content

The Editor can be initialized with pre-loaded content using the `EditorFile` object.

{{"demo": "EditorWithContent.js", "bg": true}}

## Customization

### Minimal Mode

Use the `minimal` prop to enable a simplified version of the editor with fewer controls.

{{"demo": "MinimalEditor.js", "bg": true}}

### Fullscreen Mode

Use the `fullscreen` prop to display the editor in fullscreen mode for an immersive editing experience.

{{"demo": "FullscreenEditor.js", "bg": true}}

### Editor Modes

The Editor component supports different operational modes through the `mode` prop: 'project', 'track', or 'action'.

{{"demo": "EditorModes.js", "bg": true}}

## Performance

The Editor component is designed to handle complex media projects efficiently. However, for larger projects with many tracks and actions, you might want to consider:

- Using the `minimal` mode when full editing capabilities aren't needed
- Ensuring that only necessary panels are visible (for example, hiding the file explorer when not needed)
- Implementing pagination or virtualization for large file lists

```jsx
<Editor 
  minimal={true}
  fileView={false}
  // other performance-focused props
/>
```

## Accessibility

The Editor component is built with accessibility in mind, following ARIA guidelines for complex user interfaces. Key accessibility features include:

- Keyboard navigation for all controls
- ARIA labels for interactive elements
- Focus management across the interface

```jsx
<Editor 
  // Ensure labels for better screen reader experience
  labels={true}
  // Other accessibility-focused props
/>
```

## Anatomy

The Editor component consists of several key parts:

<div class="MuiEditor-root">
  <div class="MuiEditor-editorView">
    <!-- Preview area goes here -->
  </div>
  <div class="MuiEditor-controls">
    <!-- Controls bar goes here -->
  </div>
  <div class="MuiEditor-timeline">
    <!-- Timeline with tracks and actions goes here -->
  </div>
  <div class="MuiEditor-fileExplorer">
    <!-- File explorer goes here -->
  </div>
</div> 