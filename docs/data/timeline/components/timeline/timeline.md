---
productId: timeline
title: Timeline React component
components: Timeline
githubLabel: 'component: timeline'
packageName: '@stoked-ui/sui-timeline'
---

# Timeline

<p class="description">The Timeline component displays a series of events in chronological order.</p>

{{"component": "modules/components/ComponentLinkHeader"}}

## Introduction

The Timeline component is a powerful tool for visualizing time-based events. It allows users to create a sequence of events, each represented by an action on a track, with customizable content and appearance. Timelines are useful for displaying histories, progress tracking, planning, and organizing time-based information.

{{"demo": "TimelineUsage.js", "bg": true}}

## Basics

```jsx
import { Timeline } from '@stoked-ui/sui-timeline';
```

### Basic Timeline

A simple timeline with a single track and multiple actions.

{{"demo": "BasicTimeline.js", "bg": true}}

### Labels

Use the `labels` prop to display track labels, making it easier to identify different tracks.

{{"demo": "TimelineWithLabels.js", "bg": true}}

### Current Time

The `currentTime` prop controls the time cursor position, which is useful for playback and navigation.

{{"demo": "TimelineWithCursor.js", "bg": true}}

### Multiple Tracks

The Timeline component can handle multiple tracks, each with its own set of actions.

{{"demo": "MultiTrackTimeline.js", "bg": true}}

## Customization

### Custom Colors

Use the `colors` prop to assign different colors to track types.

{{"demo": "ColoredTimeline.js", "bg": true}}

### Custom Controls

The Timeline can be integrated with external controls for playback and navigation.

{{"demo": "CustomControlsTimeline.js", "bg": true}}

### Collapsed Tracks

Implementation of track visibility toggling allows for a cleaner interface when working with many tracks.

{{"demo": "CollapsedTimeline.js", "bg": true}}

## Performance

The Timeline component is optimized for displaying many tracks and actions. However, for very large timelines:

- Consider using track collapsing to reduce the number of visible elements
- Implement virtualization for tracks when dealing with hundreds of items
- Use appropriate time ranges and zoom levels to focus on relevant data

```jsx
<Timeline 
  // Limit the number of tracks or implement virtualization for large datasets
  tracks={visibleTracks}
/>
```

## Accessibility

The Timeline component follows accessibility best practices:

- Keyboard navigation through actions and tracks
- ARIA attributes for interactive elements
- Color contrast for visibility

```jsx
<Timeline 
  // Ensure labels for better screen reader experience
  labels={true}
  // High contrast colors for better visibility
  backgroundColor="#f5f5f5"
  colors={{
    video: '#d32f2f',
    audio: '#388e3c',
    text: '#1976d2'
  }}
/>
```

## Anatomy

The Timeline component consists of several key parts:

<div class="MuiTimeline-root">
  <div class="MuiTimeline-labels">
    <!-- Track labels go here -->
  </div>
  <div class="MuiTimeline-tracks">
    <!-- Tracks go here -->
    <div class="MuiTimeline-track">
      <!-- Actions go here -->
      <div class="MuiTimeline-action">
        <!-- Action content goes here -->
      </div>
    </div>
  </div>
  <div class="MuiTimeline-cursor">
    <!-- Time cursor goes here -->
  </div>
</div> 