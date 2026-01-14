---
productId: editor
title: Controls
---

# Controls

<p class="description">Manage playback and editing controls in the Editor component.</p>

## Overview

The Editor provides a comprehensive set of controls for media playback, timeline navigation, and editing operations.

## Playback Controls

### Basic Controls

```jsx
<Editor
  controls={{
    play: true,
    pause: true,
    stop: true,
    rewind: true,
    fastForward: true,
  }}
/>
```

### Control Customization

```jsx
<Editor
  controls={{
    play: true,
    pause: true,
    playbackRate: true,  // Speed control
    volume: true,        // Volume slider
    mute: true,          // Mute button
    loop: true,          // Loop toggle
  }}
  defaultPlaybackRate={1.0}
  defaultVolume={1.0}
/>
```

## Timeline Controls

### Navigation

```jsx
<Editor
  controls={{
    seek: true,          // Seek bar
    nextFrame: true,     // Frame-by-frame navigation
    previousFrame: true,
    goToStart: true,     // Jump to beginning
    goToEnd: true,       // Jump to end
  }}
/>
```

### Zoom Controls

```jsx
<Editor
  controls={{
    zoomIn: true,
    zoomOut: true,
    zoomFit: true,      // Fit all content
    zoomSelection: true, // Zoom to selection
  }}
/>
```

## Editing Controls

### Basic Editing

```jsx
<Editor
  controls={{
    cut: true,
    copy: true,
    paste: true,
    delete: true,
    undo: true,
    redo: true,
  }}
/>
```

### Advanced Editing

```jsx
<Editor
  controls={{
    split: true,        // Split action at playhead
    merge: true,        // Merge selected actions
    trim: true,         // Trim action boundaries
    rippleDelete: true, // Delete and close gap
  }}
/>
```

## View Controls

```jsx
<Editor
  controls={{
    toggleFileView: true,   // Show/hide file explorer
    toggleLabels: true,     // Show/hide track labels
    toggleGrid: true,       // Show/hide timeline grid
    fullscreen: true,       // Fullscreen mode
    minimalMode: true,      // Toggle minimal UI
  }}
/>
```

## Custom Controls

### Adding Custom Controls

```jsx
const CustomControls = ({ editor }) => {
  return (
    <div>
      <button onClick={() => editor.play()}>Custom Play</button>
      <button onClick={() => editor.pause()}>Custom Pause</button>
    </div>
  );
};

<Editor
  customControls={<CustomControls />}
  controlsPosition="bottom" // or "top"
/>
```

### Control Toolbar

```jsx
<Editor
  toolbar={{
    left: ['play', 'pause', 'stop'],
    center: ['seek', 'timecode'],
    right: ['volume', 'settings', 'fullscreen'],
  }}
/>
```

## Keyboard Shortcuts

The Editor supports keyboard shortcuts for common controls:

| Shortcut | Action |
|----------|--------|
| `Space` | Play/Pause |
| `K` | Play/Pause |
| `J` | Rewind |
| `L` | Fast Forward |
| `Home` | Go to start |
| `End` | Go to end |
| `←` | Previous frame |
| `→` | Next frame |
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Shift + Z` | Redo |
| `Ctrl/Cmd + X` | Cut |
| `Ctrl/Cmd + C` | Copy |
| `Ctrl/Cmd + V` | Paste |
| `Delete/Backspace` | Delete selection |
| `Ctrl/Cmd + +` | Zoom in |
| `Ctrl/Cmd + -` | Zoom out |
| `F` | Fullscreen |

### Customizing Shortcuts

```jsx
<Editor
  keyboardShortcuts={{
    play: 'Space',
    pause: 'Space',
    undo: 'Ctrl+Z',
    redo: 'Ctrl+Shift+Z',
    // ... custom shortcuts
  }}
  disableDefaultShortcuts={false}
/>
```

## Control States

### Disabled Controls

```jsx
<Editor
  controls={{
    play: true,
    pause: true,
  }}
  disabledControls={['cut', 'paste']} // Disable specific controls
/>
```

### Conditional Controls

```jsx
function ConditionalEditor() {
  const [hasSelection, setHasSelection] = React.useState(false);

  return (
    <Editor
      onSelectionChange={(selection) => {
        setHasSelection(selection.length > 0);
      }}
      disabledControls={
        hasSelection ? [] : ['cut', 'copy', 'delete']
      }
    />
  );
}
```

## Control Events

```jsx
<Editor
  onControlClick={(controlName) => {
    console.log('Control clicked:', controlName);
  }}
  onPlaybackRateChange={(rate) => {
    console.log('Playback rate:', rate);
  }}
  onVolumeChange={(volume) => {
    console.log('Volume:', volume);
  }}
/>
```

## Best Practices

- Provide visual feedback for control state changes
- Disable unavailable controls instead of hiding them
- Group related controls together
- Use tooltips to explain control functions
- Support both mouse and keyboard interaction
- Maintain consistent control styling
- Consider mobile touch targets for controls
- Provide keyboard shortcut hints in tooltips
