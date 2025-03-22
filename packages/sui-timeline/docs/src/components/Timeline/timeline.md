# Timeline

<p class="description">The Timeline component displays a series of events in chronological order.</p>

## Introduction

The Timeline component is a powerful tool for visualizing time-based events. It allows users to create a vertical sequence of events, each represented by an action on a track, with customizable content and appearance. Timelines are useful for displaying histories, progress tracking, planning, and organizing time-based information.

## Basic Usage

```jsx
import * as React from 'react';
import { Timeline } from '@stoked-ui/sui-timeline';

export default function BasicTimeline() {
  return (
    <Timeline 
      tracks={[
        {
          id: 'track-1',
          name: 'Track 1',
          actions: [
            { id: 'action-1', start: 0, duration: 10, name: 'Action 1' },
            { id: 'action-2', start: 12, duration: 8, name: 'Action 2' }
          ]
        }
      ]}
    />
  );
}
```

## Examples

### Basic Timeline

A simple timeline with a single track and multiple actions.

```jsx
import * as React from 'react';
import { Timeline } from '@stoked-ui/sui-timeline';
import Box from '@mui/material/Box';

export default function BasicTimeline() {
  const tracks = [
    {
      id: 'track-1',
      name: 'Main Track',
      actions: [
        { id: 'action-1', start: 0, duration: 10, name: 'Introduction' },
        { id: 'action-2', start: 12, duration: 8, name: 'Development' },
        { id: 'action-3', start: 22, duration: 5, name: 'Conclusion' }
      ]
    }
  ];

  return (
    <Box sx={{ height: '200px', width: '100%', border: '1px solid #e0e0e0' }}>
      <Timeline 
        tracks={tracks}
        labels={true}
      />
    </Box>
  );
}
```

### Timeline with Multiple Tracks

A timeline with multiple tracks and customized appearance.

```jsx
import * as React from 'react';
import { Timeline } from '@stoked-ui/sui-timeline';
import Box from '@mui/material/Box';

export default function MultiTrackTimeline() {
  const tracks = [
    {
      id: 'video-track',
      name: 'Video',
      type: 'video',
      actions: [
        { id: 'video-1', start: 0, duration: 15, name: 'Intro Video' },
        { id: 'video-2', start: 16, duration: 20, name: 'Main Segment' }
      ]
    },
    {
      id: 'audio-track',
      name: 'Audio',
      type: 'audio',
      actions: [
        { id: 'audio-1', start: 2, duration: 10, name: 'Background Music' },
        { id: 'audio-2', start: 14, duration: 25, name: 'Narration' }
      ]
    },
    {
      id: 'text-track',
      name: 'Subtitles',
      type: 'text',
      actions: [
        { id: 'text-1', start: 5, duration: 5, name: 'Introduction Text' },
        { id: 'text-2', start: 18, duration: 10, name: 'Main Text' },
        { id: 'text-3', start: 30, duration: 5, name: 'Closing Text' }
      ]
    }
  ];

  return (
    <Box sx={{ height: '300px', width: '100%', border: '1px solid #e0e0e0' }}>
      <Timeline 
        tracks={tracks}
        labels={true}
        colors={{
          video: '#f44336',
          audio: '#4caf50',
          text: '#2196f3'
        }}
      />
    </Box>
  );
}
```

### Timeline with Custom Controls

A timeline with custom controls for playback and navigation.

```jsx
import * as React from 'react';
import { Timeline } from '@stoked-ui/sui-timeline';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';

export default function CustomControlsTimeline() {
  const [currentTime, setCurrentTime] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const totalDuration = 40; // in seconds
  
  const tracks = [
    {
      id: 'track-1',
      name: 'Scene 1',
      actions: [
        { id: 'action-1', start: 0, duration: 10, name: 'Introduction' },
        { id: 'action-2', start: 12, duration: 8, name: 'Development' }
      ]
    },
    {
      id: 'track-2',
      name: 'Scene 2',
      actions: [
        { id: 'action-3', start: 22, duration: 15, name: 'Conclusion' }
      ]
    }
  ];

  // Simulate playback
  React.useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prevTime) => {
          const newTime = prevTime + 0.1;
          if (newTime >= totalDuration) {
            setIsPlaying(false);
            return 0;
          }
          return newTime;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, totalDuration]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (event, newValue) => {
    setCurrentTime(newValue);
  };

  const handleSkipForward = () => {
    // Skip to next action
    const allActions = tracks.flatMap(track => track.actions);
    const sortedActions = allActions.sort((a, b) => a.start - b.start);
    const nextAction = sortedActions.find(action => action.start > currentTime);
    if (nextAction) {
      setCurrentTime(nextAction.start);
    }
  };

  const handleSkipBackward = () => {
    // Skip to previous action
    const allActions = tracks.flatMap(track => track.actions);
    const sortedActions = allActions.sort((a, b) => a.start - b.start);
    const prevActions = sortedActions.filter(action => action.start < currentTime);
    if (prevActions.length > 0) {
      setCurrentTime(prevActions[prevActions.length - 1].start);
    } else {
      setCurrentTime(0);
    }
  };

  return (
    <Box sx={{ width: '100%', border: '1px solid #e0e0e0', p: 2 }}>
      <Box sx={{ height: '200px', mb: 2 }}>
        <Timeline 
          tracks={tracks}
          currentTime={currentTime}
          labels={true}
          onClickAction={(e, data) => {
            setCurrentTime(data.action.start);
          }}
        />
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button onClick={handleSkipBackward}>
          <SkipPreviousIcon />
        </Button>
        <Button onClick={handlePlayPause}>
          {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
        </Button>
        <Button onClick={handleSkipForward}>
          <SkipNextIcon />
        </Button>
        <Slider
          value={currentTime}
          min={0}
          max={totalDuration}
          step={0.1}
          onChange={handleSeek}
          sx={{ flexGrow: 1 }}
        />
        <Box sx={{ minWidth: 50 }}>
          {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')}
        </Box>
      </Box>
    </Box>
  );
}
```

### Collapsed Timeline

A timeline with collapsible tracks.

```jsx
import * as React from 'react';
import { Timeline } from '@stoked-ui/sui-timeline';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

export default function CollapsedTimeline() {
  const [collapsedTracks, setCollapsedTracks] = React.useState({});
  
  const tracks = [
    {
      id: 'scene-1',
      name: 'Scene 1',
      actions: [
        { id: 'scene1-action1', start: 0, duration: 5, name: 'Opening' },
        { id: 'scene1-action2', start: 6, duration: 10, name: 'Character Introduction' }
      ]
    },
    {
      id: 'scene-2',
      name: 'Scene 2',
      actions: [
        { id: 'scene2-action1', start: 17, duration: 8, name: 'Conflict' }
      ]
    },
    {
      id: 'scene-3',
      name: 'Scene 3',
      actions: [
        { id: 'scene3-action1', start: 26, duration: 7, name: 'Resolution' },
        { id: 'scene3-action2', start: 34, duration: 5, name: 'Ending' }
      ]
    }
  ];

  const toggleTrackCollapse = (trackId) => {
    setCollapsedTracks(prev => ({
      ...prev,
      [trackId]: !prev[trackId]
    }));
  };

  // Filter out collapsed tracks
  const visibleTracks = tracks.filter(track => !collapsedTracks[track.id]);

  return (
    <Box sx={{ width: '100%', border: '1px solid #e0e0e0', p: 2 }}>
      <Box sx={{ mb: 2 }}>
        {tracks.map(track => (
          <Box 
            key={track.id}
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              p: 1,
              borderBottom: '1px solid #e0e0e0'
            }}
          >
            <IconButton 
              size="small" 
              onClick={() => toggleTrackCollapse(track.id)}
            >
              {collapsedTracks[track.id] ? 
                <ChevronRightIcon fontSize="small" /> : 
                <ExpandMoreIcon fontSize="small" />
              }
            </IconButton>
            <Box sx={{ ml: 1 }}>{track.name}</Box>
          </Box>
        ))}
      </Box>
      
      <Box sx={{ height: '200px' }}>
        <Timeline 
          tracks={visibleTracks}
          labels={true}
        />
      </Box>
    </Box>
  );
}
```

## API

### Import

```jsx
import { Timeline } from '@stoked-ui/sui-timeline';
```

### Properties

| Name | Type | Default | Description |
|:-----|:-----|:--------|:------------|
| apiRef | object | - | The ref object that allows Timeline manipulation. |
| backgroundColor | string | '#eee' | Background color of the timeline. |
| classes | object | - | Override or extend the styles applied to the component. |
| colors | object | - | Custom colors for different track types. |
| currentTime | number | 0 | Current time position in the timeline. |
| dragSnapAuto | boolean | false | If true, automatically snaps when dragging. |
| dragSnapDistance | number | 1 | Distance in seconds for drag snapping. |
| labels | boolean | false | If true, shows track labels. |
| maxZoom | number | 10 | Maximum zoom level. |
| minZoom | number | 0.1 | Minimum zoom level. |
| onAdd | function | - | Callback fired when an action is added. |
| onClickAction | function | - | Callback fired when an action is clicked. |
| onClickLabel | function | - | Callback fired when a label is clicked. |
| onClickTrack | function | - | Callback fired when a track is clicked. |
| onDelete | function | - | Callback fired when an action is deleted. |
| onDragAction | function | - | Callback fired when an action is dragged. |
| onDropAction | function | - | Callback fired when an action is dropped. |
| onTimeChange | function | - | Callback fired when the current time changes. |
| onZoomChange | function | - | Callback fired when the zoom level changes. |
| resolution | number | 1 | Time resolution in seconds. |
| snapEnabled | boolean | false | If true, snapping is enabled. |
| snapPoints | array | [] | Custom snap points for actions. |
| slots | object | - | Overridable component slots. |
| slotProps | object | - | The props used for each component slot. |
| sx | object | - | The system prop that allows defining system overrides as well as additional CSS styles. |
| tracks | array | [] | Array of tracks to display in the timeline. |
| zoom | number | 1 | Current zoom level. |

### Track Object

Each track in the `tracks` array should conform to this structure:

```js
{
  id: string,         // Unique identifier for the track
  name: string,       // Name of the track (displayed as label)
  type: string,       // Type of the track (used for coloring)
  actions: [          // Array of actions on this track
    {
      id: string,     // Unique identifier for the action
      start: number,  // Start time in seconds
      duration: number, // Duration in seconds
      name: string,   // Name of the action
      // Additional custom properties
    }
  ]
}
```

### Slots

The Timeline component uses a slot system that allows overriding different parts of the UI:

| Name | Default | Description |
|:-----|:--------|:------------|
| root | div | The component used for the root node. |
| track | div | The component used for each track. |
| action | div | The component used for each action. |
| label | div | The component used for track labels. |
| cursor | div | The component used for the time cursor. |

### CSS

| Rule name | Global class | Description |
|:---------|:-------------|:------------|
| root | .MuiTimeline-root | Styles applied to the root element. |
| track | .MuiTimeline-track | Styles applied to each track element. |
| action | .MuiTimeline-action | Styles applied to each action element. |
| label | .MuiTimeline-label | Styles applied to track label elements. |
| cursor | .MuiTimeline-cursor | Styles applied to the time cursor element. | 