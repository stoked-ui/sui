---
productId: editor
title: Drag and Drop
---

# Drag and Drop

<p class="description">Add media files and actions to the timeline using drag and drop functionality.</p>

## Overview

The Editor component supports intuitive drag-and-drop interactions for adding media files to the timeline, reordering tracks, and repositioning actions.

## Enabling Drag and Drop

```jsx
<Editor
  enableDragDrop={true}
  fileView={true}  // Required for dragging files
/>
```

## Dragging Files

### From File Explorer

Users can drag files from the built-in file explorer onto the timeline:

```jsx
<Editor
  enableDragDrop={true}
  fileView={true}
  onFileDrop={(file, trackId, time) => {
    console.log('File dropped:', file, 'on track:', trackId, 'at:', time);
  }}
/>
```

### From External Sources

Accept files from outside the editor:

```jsx
<Editor
  enableDragDrop={true}
  acceptExternalFiles={true}
  onExternalFileDrop={(files, trackId, time) => {
    console.log('External files:', files);
    // Process and add files
  }}
/>
```

## Drag Behavior

### Drop Zones

Configure where drops are allowed:

```jsx
<Editor
  enableDragDrop={true}
  dropZones={{
    timeline: true,      // Drop on timeline
    tracks: true,        // Drop on specific tracks
    preview: false,      // Drop on preview area
  }}
  showDropIndicator={true}  // Show visual feedback
/>
```

### Snap to Grid

Align dropped items to grid:

```jsx
<Editor
  enableDragDrop={true}
  snapToGrid={true}
  gridSize={1000}
  onFileDrop={(file, trackId, time) => {
    // Time will be snapped to grid
    console.log('Snapped time:', time);
  }}
/>
```

## Dragging Actions

### Repositioning Actions

Move actions between tracks and times:

```jsx
<Editor
  enableActionDrag={true}
  onActionDragStart={(action) => {
    console.log('Started dragging:', action);
  }}
  onActionDrag={(action, position) => {
    console.log('Dragging to:', position);
  }}
  onActionDragEnd={(action, newPosition) => {
    console.log('Dropped at:', newPosition);
  }}
/>
```

### Constraints

Limit where actions can be dropped:

```jsx
<Editor
  enableActionDrag={true}
  dragConstraints={{
    allowTrackChange: true,    // Can move between tracks
    allowTimeChange: true,      // Can change position in time
    preventOverlap: true,       // Prevent overlapping actions
    boundToTimeline: true,      // Keep within timeline bounds
  }}
/>
```

## Visual Feedback

### Drop Indicators

Customize drop visual feedback:

```jsx
<Editor
  enableDragDrop={true}
  sx={{
    '& .MuiEditor-dropIndicator': {
      borderColor: 'primary.main',
      borderWidth: 2,
      backgroundColor: 'primary.light',
      opacity: 0.3,
    },
  }}
/>
```

### Drag Preview

Show a preview while dragging:

```jsx
<Editor
  enableDragDrop={true}
  showDragPreview={true}
  dragPreviewComponent={(item) => (
    <div style={{ padding: 8, backgroundColor: '#333', color: '#fff' }}>
      {item.name}
    </div>
  )}
/>
```

## Multi-Selection Drag

Drag multiple selected items:

```jsx
<Editor
  enableDragDrop={true}
  enableMultiSelect={true}
  onMultiDragEnd={(actions, newPositions) => {
    console.log('Dropped multiple actions:', actions, newPositions);
  }}
/>
```

## Track Reordering

Drag tracks to reorder them:

```jsx
<Editor
  enableTrackReorder={true}
  onTrackReorder={(trackIds) => {
    console.log('New track order:', trackIds);
  }}
/>
```

## File Type Validation

Restrict accepted file types:

```jsx
<Editor
  enableDragDrop={true}
  acceptedFileTypes={['video/*', 'audio/*', 'image/*']}
  maxFileSize={100 * 1024 * 1024}  // 100MB
  onFileReject={(file, reason) => {
    console.log('File rejected:', file, reason);
    // Show error message
  }}
/>
```

## Auto-Create Tracks

Automatically create tracks when dropping files:

```jsx
<Editor
  enableDragDrop={true}
  autoCreateTrack={true}
  onFileDrop={(file, trackId, time) => {
    if (!trackId) {
      console.log('Created new track for file:', file);
    }
  }}
/>
```

## Clipboard Integration

Support copy/paste between editors:

```jsx
<Editor
  enableDragDrop={true}
  enableClipboard={true}
  onCopy={(actions) => {
    console.log('Copied to clipboard:', actions);
  }}
  onPaste={(actions, time) => {
    console.log('Pasted from clipboard:', actions, time);
  }}
/>
```

## Best Practices

- Provide clear visual feedback during drag operations
- Show drop zones when dragging starts
- Validate file types and sizes before accepting
- Implement undo for drag-and-drop operations
- Consider touch device support
- Show helpful messages for invalid drops
- Auto-scroll timeline when dragging near edges
- Maintain performance with large files

## Accessibility

Support keyboard alternatives to drag-and-drop:

```jsx
<Editor
  enableDragDrop={true}
  keyboardDragMode={true}  // Use keyboard to move items
  onKeyboardMove={(action, direction) => {
    console.log('Keyboard move:', action, direction);
  }}
/>
```

## Events Summary

```jsx
<Editor
  // File drops
  onFileDrop={(file, trackId, time) => {}}
  onExternalFileDrop={(files, trackId, time) => {}}
  onFileReject={(file, reason) => {}}

  // Action dragging
  onActionDragStart={(action) => {}}
  onActionDrag={(action, position) => {}}
  onActionDragEnd={(action, newPosition) => {}}

  // Track reordering
  onTrackReorder={(trackIds) => {}}

  // Multi-selection
  onMultiDragEnd={(actions, positions) => {}}
/>
```
