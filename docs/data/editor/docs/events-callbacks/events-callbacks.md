---
productId: editor
title: Events and Callbacks
---

# Events and Callbacks

<p class="description">Handle user interactions and state changes in the Editor component.</p>

## Overview

The Editor component provides a comprehensive set of callbacks to handle user interactions, playback events, and state changes.

## Playback Events

### Basic Playback

```jsx
<Editor
  onPlay={() => console.log('Playback started')}
  onPause={() => console.log('Playback paused')}
  onStop={() => console.log('Playback stopped')}
  onSeek={(time) => console.log('Seeked to:', time)}
/>
```

### Time Updates

```jsx
<Editor
  onTimeUpdate={(currentTime) => {
    console.log('Current time:', currentTime);
  }}
  onDurationChange={(duration) => {
    console.log('Duration changed:', duration);
  }}
/>
```

## Action Events

### Action Management

```jsx
<Editor
  onActionAdd={(action) => {
    console.log('Action added:', action);
    // Return false to prevent default behavior
    // return false;
  }}
  onActionUpdate={(action, changes) => {
    console.log('Action updated:', action, changes);
  }}
  onActionDelete={(actionId) => {
    console.log('Action deleted:', actionId);
  }}
  onActionSelect={(actionId) => {
    console.log('Action selected:', actionId);
  }}
/>
```

### Drag and Drop

```jsx
<Editor
  onActionDragStart={(action) => {
    console.log('Drag started:', action);
  }}
  onActionDrag={(action, position) => {
    console.log('Dragging:', action, position);
  }}
  onActionDragEnd={(action, newPosition) => {
    console.log('Drag ended:', action, newPosition);
  }}
  onActionResize={(action, newDuration) => {
    console.log('Action resized:', action, newDuration);
  }}
/>
```

## Track Events

```jsx
<Editor
  onTrackAdd={(track) => {
    console.log('Track added:', track);
  }}
  onTrackUpdate={(track) => {
    console.log('Track updated:', track);
  }}
  onTrackDelete={(trackId) => {
    console.log('Track deleted:', trackId);
  }}
  onTrackSelect={(trackId) => {
    console.log('Track selected:', trackId);
  }}
  onTrackReorder={(trackIds) => {
    console.log('Tracks reordered:', trackIds);
  }}
/>
```

## File Events

```jsx
<Editor
  onFileAdd={(file) => {
    console.log('File added:', file);
  }}
  onFileSelect={(file) => {
    console.log('File selected:', file);
  }}
  onFileDelete={(fileId) => {
    console.log('File deleted:', fileId);
  }}
  onFileDrop={(files, trackId, time) => {
    console.log('Files dropped:', files, trackId, time);
  }}
/>
```

## Selection Events

```jsx
<Editor
  onSelectionChange={(selectedItems) => {
    console.log('Selection changed:', selectedItems);
  }}
  onMultiSelect={(items) => {
    console.log('Multi-select:', items);
  }}
/>
```

## Edit Events

```jsx
<Editor
  onCut={(action, time) => {
    console.log('Cut action:', action, time);
  }}
  onCopy={(actions) => {
    console.log('Copied actions:', actions);
  }}
  onPaste={(actions, time) => {
    console.log('Pasted actions:', actions, time);
  }}
  onUndo={(state) => {
    console.log('Undo:', state);
  }}
  onRedo={(state) => {
    console.log('Redo:', state);
  }}
/>
```

## View Events

```jsx
<Editor
  onZoom={(scale) => {
    console.log('Zoom level:', scale);
  }}
  onScroll={(position) => {
    console.log('Scroll position:', position);
  }}
  onViewChange={(viewState) => {
    console.log('View changed:', viewState);
  }}
/>
```

## State Change Events

```jsx
<Editor
  onStateChange={(newState) => {
    console.log('Editor state changed:', newState);
  }}
  onChange={(editorData) => {
    console.log('Editor data changed:', editorData);
    // Save to backend, local storage, etc.
  }}
/>
```

## Error Handling

```jsx
<Editor
  onError={(error) => {
    console.error('Editor error:', error);
    // Show error notification to user
  }}
  onWarning={(warning) => {
    console.warn('Editor warning:', warning);
  }}
/>
```

## Event Combination Example

```jsx
function MyEditor() {
  const [editorState, setEditorState] = React.useState({});

  return (
    <Editor
      // Playback
      onPlay={() => console.log('Playing')}
      onPause={() => console.log('Paused')}
      onTimeUpdate={(time) => setEditorState(s => ({ ...s, currentTime: time }))}

      // Actions
      onActionAdd={(action) => {
        console.log('Action added:', action);
        // Save to backend
      }}
      onActionUpdate={(action) => {
        console.log('Action updated:', action);
        // Update backend
      }}

      // State
      onChange={(data) => {
        setEditorState(data);
        // Auto-save
      }}

      // Errors
      onError={(error) => {
        console.error(error);
        // Show notification
      }}
    />
  );
}
```

## Best Practices

- Debounce frequent events like `onTimeUpdate` and `onScroll`
- Use `onChange` for auto-save functionality
- Implement error boundaries for error handling
- Avoid heavy operations in event callbacks
- Consider using state management libraries for complex state
- Validate data before processing events
- Provide user feedback for asynchronous operations
