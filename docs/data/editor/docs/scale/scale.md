---
productId: editor
title: Scale
---

# Scale

<p class="description">Control the timeline scale and zoom levels in the Editor.</p>

## Overview

The scale feature allows users to zoom in and out of the timeline, providing different levels of detail for precise editing or overview of the entire project.

## Default Scale

The Editor starts with a default scale that shows a reasonable time range:

```jsx
<Editor />
```

## Controlling Scale

### Programmatic Control

Set the initial scale programmatically:

```jsx
<Editor
  initialScale={1.0}  // Default scale
  minScale={0.1}      // Maximum zoom out
  maxScale={10.0}     // Maximum zoom in
/>
```

### User Controls

Users can adjust the scale using:
- Mouse wheel scrolling
- Pinch-to-zoom gestures on touch devices
- Scale controls in the toolbar
- Keyboard shortcuts (Ctrl/Cmd + Plus/Minus)

## Scale Events

Listen to scale changes:

```jsx
<Editor
  onScaleChange={(newScale) => {
    console.log('New scale:', newScale);
  }}
/>
```

## Scale Indicators

The Editor displays the current scale level and time range in the timeline header:

```jsx
<Editor
  showScaleIndicator={true}  // Show current zoom level
  showTimeRange={true}       // Show visible time range
/>
```

## Best Practices

- Provide visual feedback during scaling operations
- Maintain a sensible range for min/max scale values
- Remember user's preferred scale level
- Sync scale with playback position for better UX

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + +` | Zoom in |
| `Ctrl/Cmd + -` | Zoom out |
| `Ctrl/Cmd + 0` | Reset to default scale |
| `Ctrl/Cmd + Mouse Wheel` | Zoom in/out |
