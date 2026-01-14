---
productId: editor
title: Labels
---

# Labels

<p class="description">Configure and customize track labels in the Editor timeline.</p>

## Overview

Labels in the Editor component help identify different media tracks and make navigation easier. They appear on the left side of the timeline and can display track names, types, or custom information.

## Enabling Labels

Enable labels using the `labels` prop:

```jsx
<Editor labels={true} />
```

## Custom Label Content

You can customize the content displayed in labels through the track configuration:

```jsx
const tracks = [
  {
    id: 'track-1',
    name: 'Video Track',
    type: 'video',
    // ... other track properties
  },
  {
    id: 'track-2',
    name: 'Audio Track',
    type: 'audio',
    // ... other track properties
  },
];

<Editor
  labels={true}
  tracks={tracks}
/>
```

## Label Styling

Labels inherit styling from the Editor theme but can be customized using the `sx` prop or custom theme overrides:

```jsx
<Editor
  labels={true}
  sx={{
    '& .MuiEditor-trackLabel': {
      backgroundColor: 'background.paper',
      borderRight: '1px solid',
      borderColor: 'divider',
    },
  }}
/>
```

## Label Interactions

Labels support click interactions for selecting tracks and can include additional controls like mute/solo buttons or visibility toggles.

```jsx
<Editor
  labels={true}
  onTrackSelect={(trackId) => console.log('Selected track:', trackId)}
/>
```

## Best Practices

- Keep label text concise and descriptive
- Use consistent naming conventions for tracks
- Consider adding icons to indicate track types
- Use color coding to differentiate track categories
