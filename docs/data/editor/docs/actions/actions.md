---
productId: editor
title: Actions
---

# Actions

<p class="description">Create and manage timeline actions in the Editor component.</p>

## Overview

Actions are the building blocks of media editing. They represent operations applied to media files, such as cuts, transitions, effects, and transformations.

## Action Types

The Editor supports various action types:

- **Cut**: Trim media to a specific duration
- **Transition**: Blend between media clips
- **Effect**: Apply visual or audio effects
- **Transform**: Scale, rotate, or position media
- **Audio**: Volume adjustments, fades, filters

## Creating Actions

### Basic Action

```jsx
const action = {
  id: 'action-1',
  type: 'cut',
  start: 0,
  end: 5000,  // 5 seconds
  trackId: 'track-1',
};

<Editor
  actions={[action]}
/>
```

### Multiple Actions

```jsx
const actions = [
  {
    id: 'action-1',
    type: 'cut',
    start: 0,
    end: 5000,
    trackId: 'track-1',
  },
  {
    id: 'action-2',
    type: 'transition',
    start: 4500,
    end: 5500,
    trackId: 'track-1',
    params: { type: 'fade' },
  },
];

<Editor actions={actions} />
```

## Action Properties

All actions support these core properties:

| Property | Type | Description |
|----------|------|-------------|
| `id` | string | Unique identifier |
| `type` | string | Action type |
| `start` | number | Start time in milliseconds |
| `end` | number | End time in milliseconds |
| `trackId` | string | Associated track ID |
| `params` | object | Type-specific parameters |

## Action Callbacks

Handle action events:

```jsx
<Editor
  onActionAdd={(action) => console.log('Action added:', action)}
  onActionUpdate={(action) => console.log('Action updated:', action)}
  onActionDelete={(actionId) => console.log('Action deleted:', actionId)}
  onActionSelect={(actionId) => console.log('Action selected:', actionId)}
/>
```

## Drag and Drop Actions

Users can create actions by dragging media files onto the timeline:

```jsx
<Editor
  enableDragDrop={true}
  onActionAdd={(action) => {
    // Handle newly created action
  }}
/>
```

## Action Constraints

Set constraints on action placement:

```jsx
<Editor
  snapToGrid={true}
  gridSize={100}  // Snap to 100ms intervals
  allowOverlap={false}  // Prevent overlapping actions
/>
```

## Best Practices

- Use meaningful IDs for actions
- Validate action timing (start < end)
- Provide visual feedback during action manipulation
- Implement undo/redo for action operations
- Consider performance with large numbers of actions
