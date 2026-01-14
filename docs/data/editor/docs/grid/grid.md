---
productId: editor
title: Grid
---

# Grid

<p class="description">Configure the timeline grid for precise action placement and alignment.</p>

## Overview

The grid system in the Editor provides visual guides and snapping behavior to help users align actions precisely on the timeline.

## Enabling Grid

Enable the grid display:

```jsx
<Editor
  showGrid={true}
  gridSize={1000}  // Grid lines every 1 second (1000ms)
/>
```

## Grid Configuration

### Grid Size

Set the interval between grid lines:

```jsx
<Editor
  showGrid={true}
  gridSize={100}   // 100ms intervals (fine grid)
/>

<Editor
  showGrid={true}
  gridSize={1000}  // 1 second intervals (coarse grid)
/>
```

### Snapping Behavior

Enable snapping to grid lines:

```jsx
<Editor
  snapToGrid={true}
  gridSize={1000}
  snapThreshold={50}  // Snap when within 50ms of grid line
/>
```

## Visual Styling

Customize grid appearance:

```jsx
<Editor
  showGrid={true}
  gridSize={1000}
  sx={{
    '& .MuiEditor-gridLine': {
      stroke: '#404040',
      strokeWidth: 1,
      opacity: 0.5,
    },
    '& .MuiEditor-gridLine-major': {
      stroke: '#606060',
      strokeWidth: 2,
      opacity: 0.7,
    },
  }}
/>
```

## Multi-Level Grids

Display major and minor grid lines:

```jsx
<Editor
  showGrid={true}
  gridSize={100}          // Minor grid at 100ms
  majorGridSize={1000}    // Major grid at 1 second
  majorGridMultiplier={10} // Major line every 10 minor lines
/>
```

## Time Units

Configure grid based on different time units:

```jsx
// Frame-based grid (24fps)
<Editor
  showGrid={true}
  gridSize={41.67}  // ~24 frames per second
  gridUnit="frames"
/>

// Second-based grid
<Editor
  showGrid={true}
  gridSize={1000}
  gridUnit="seconds"
/>

// Timecode-based grid
<Editor
  showGrid={true}
  gridSize={1000}
  gridUnit="timecode"
  timecodeFps={30}
/>
```

## Dynamic Grid Scaling

Adjust grid density based on zoom level:

```jsx
<Editor
  showGrid={true}
  adaptiveGrid={true}
  minGridSize={100}   // Finest grid resolution
  maxGridSize={10000} // Coarsest grid resolution
  onScaleChange={(scale) => {
    // Grid automatically adjusts
  }}
/>
```

## Grid Events

Handle grid-related events:

```jsx
<Editor
  snapToGrid={true}
  onGridSnap={(time) => {
    console.log('Snapped to time:', time);
  }}
/>
```

## Best Practices

- Use appropriate grid sizes for the project timescale
- Enable snapping for precise editing
- Provide visual feedback when snapping occurs
- Allow users to toggle grid visibility
- Adjust grid density based on zoom level
- Use major/minor grids for better visual hierarchy

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `G` | Toggle grid visibility |
| `Ctrl/Cmd + Shift + G` | Toggle snap to grid |
| `[` | Decrease grid size |
| `]` | Increase grid size |
