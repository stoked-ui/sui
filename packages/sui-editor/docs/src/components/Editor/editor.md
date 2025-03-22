# Editor

<p class="description">The Editor component is a powerful media editing interface that combines a timeline, file explorer, and preview area to provide a complete video and media editing experience.</p>

## Introduction

The Editor component is the core of the Stoked UI media editing system. It provides a comprehensive interface for working with video, audio, and other media files. The Editor integrates several complex components:

- **Timeline**: For manipulating time-based media and actions
- **File Explorer**: For organizing and selecting media files
- **Preview Area**: For viewing and playback of media content
- **Controls**: For playback, editing operations, and other actions

## Basic Usage

```jsx
import * as React from 'react';
import { Editor } from '@stoked-ui/sui-editor';

export default function BasicEditor() {
  return (
    <Editor 
      fileView={true}
      labels={true}
    />
  );
}
```

## Examples

### Basic Editor

A simple editor with default settings.

```jsx
import * as React from 'react';
import { Editor } from '@stoked-ui/sui-editor';
import Box from '@mui/material/Box';

export default function BasicEditor() {
  return (
    <Box sx={{ height: '600px', width: '100%' }}>
      <Editor 
        fileView={true}
        labels={true}
      />
    </Box>
  );
}
```

### Editor with Pre-loaded Content

An editor with pre-loaded media content.

```jsx
import * as React from 'react';
import { Editor } from '@stoked-ui/sui-editor';
import { EditorFile } from '@stoked-ui/sui-editor';
import Box from '@mui/material/Box';

export default function EditorWithContent() {
  const [file, setFile] = React.useState(null);
  
  React.useEffect(() => {
    // Create a new editor file with sample content
    const editorFile = new EditorFile({
      tracks: [
        {
          id: 'video-track',
          name: 'Video Track',
          type: 'video',
          actions: [
            { 
              id: 'video-clip-1', 
              start: 0, 
              duration: 10, 
              name: 'Intro Clip',
              // other video properties
            }
          ]
        },
        {
          id: 'audio-track',
          name: 'Audio Track',
          type: 'audio',
          actions: [
            { 
              id: 'audio-clip-1', 
              start: 2, 
              duration: 8, 
              name: 'Background Music',
              // other audio properties
            }
          ]
        }
      ]
    });
    
    setFile(editorFile);
  }, []);
  
  return (
    <Box sx={{ height: '600px', width: '100%' }}>
      <Editor 
        file={file}
        fileView={true}
        labels={true}
      />
    </Box>
  );
}
```

### Editor with Custom Configuration

An editor with custom configuration for different use cases.

```jsx
import * as React from 'react';
import { Editor } from '@stoked-ui/sui-editor';
import Box from '@mui/material/Box';

export default function CustomEditor() {
  // Different editor configurations
  const [editorConfig, setEditorConfig] = React.useState({
    minimal: false,
    fullscreen: false,
    detailMode: false,
    mode: 'project',
  });
  
  const handleConfigChange = (config) => {
    setEditorConfig((prev) => ({
      ...prev,
      ...config
    }));
  };
  
  return (
    <Box sx={{ height: '600px', width: '100%' }}>
      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <Button 
          variant={editorConfig.minimal ? 'contained' : 'outlined'} 
          onClick={() => handleConfigChange({ minimal: !editorConfig.minimal })}
        >
          {editorConfig.minimal ? 'Minimal Mode' : 'Standard Mode'}
        </Button>
        
        <Button 
          variant={editorConfig.fullscreen ? 'contained' : 'outlined'} 
          onClick={() => handleConfigChange({ fullscreen: !editorConfig.fullscreen })}
        >
          {editorConfig.fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </Button>
        
        <Select
          value={editorConfig.mode}
          onChange={(e) => handleConfigChange({ mode: e.target.value })}
          sx={{ minWidth: 120 }}
        >
          <MenuItem value="project">Project Mode</MenuItem>
          <MenuItem value="track">Track Mode</MenuItem>
          <MenuItem value="action">Action Mode</MenuItem>
        </Select>
      </Box>
      
      <Editor 
        minimal={editorConfig.minimal}
        fullscreen={editorConfig.fullscreen}
        detailMode={editorConfig.detailMode}
        mode={editorConfig.mode}
        fileView={true}
        labels={true}
      />
    </Box>
  );
}
```

## API

### Import

```jsx
import { Editor } from '@stoked-ui/sui-editor';
```

### Properties

| Name | Type | Default | Description |
|:-----|:-----|:--------|:------------|
| actions | array | [] | Actions to display in the editor's timeline. |
| allControls | boolean | false | If true, displays all available control options. |
| apiRef | EditorApiRef | - | The ref object that allows Editor View manipulation. |
| classes | object | - | Override or extend the styles applied to the component. |
| detailMode | boolean | false | If true, enables detailed view mode. |
| experimentalFeatures | object | - | Enable experimental features that might have breaking changes. |
| file | IEditorFile | - | The editor file containing tracks and actions. |
| fileExplorerProps | object | - | Props passed to the FileExplorer component. |
| fileExplorerTabsProps | object | - | Props passed to the FileExplorerTabs component. |
| fileUrl | string | - | URL to an editor file to load. |
| fileView | boolean | false | If true, shows the file explorer panel. |
| fullscreen | boolean | false | If true, displays the editor in fullscreen mode. |
| labels | boolean | false | If true, shows track labels on the timeline. |
| localDb | boolean | false | If true, enables local database storage for the editor state. |
| minimal | boolean | false | If true, displays a minimal version of the editor with fewer controls. |
| mode | 'project' \| 'track' \| 'action' | 'project' | The editing mode of the editor. |
| newTrack | boolean | false | If true, allows adding new tracks to the timeline. |
| noLabels | boolean | false | If true, hides all track labels. |
| noResizer | boolean | false | If true, hides the timeline resizer control. |
| noSaveControls | boolean | false | If true, hides the save controls. |
| noSnapControls | boolean | false | If true, hides the snap controls. |
| noTrackControls | boolean | false | If true, hides the track controls. |
| noZoom | boolean | false | If true, disables zoom functionality. |
| onClickAction | function | - | Callback fired when an action is clicked. (e, { action, track, time }) => void |
| onClickLabel | function | - | Callback fired when a label is clicked. (e, track) => void |
| onClickTrack | function | - | Callback fired when a track is clicked. (e, { track, time }) => void |
| openSaveControls | boolean | false | If true, the save controls are open by default. |
| preview | boolean | false | If true, enables preview mode. |
| record | boolean | false | If true, enables recording mode. |
| slots | object | - | Overridable component slots. |
| slotProps | object | - | The props used for each component slot. |
| sx | object | - | The system prop that allows defining system overrides as well as additional CSS styles. |
| timelineSx | object | - | System prop specifically for timeline styles. |
| fileTabsSx | object | - | System prop specifically for file tabs styles. |
| filesSx | object | - | System prop specifically for file explorer styles. |
| viewButtons | array | - | Custom buttons to display in the view area. |
| viewButtonAppear | number | - | Animation timing for view button appearance. |
| viewButtonEnter | number | - | Animation timing for view button entrance. |
| viewButtonExit | number | - | Animation timing for view button exit. |
| loaded | boolean | false | If true, indicates that the editor content is fully loaded. |

### Slots

The Editor component uses a slot system that allows overriding different parts of the UI:

| Name | Default | Description |
|:-----|:--------|:------------|
| root | EditorRoot | The component used for the root node. |
| editorView | EditorView | The component used for the main editor view area. |
| controls | div | The component used for the editor controls. |
| timeline | Timeline | The component used for the timeline. |
| fileExplorerTabs | FileExplorerTabs | The component used for file explorer tabs. |
| fileExplorer | FileExplorer | The component used for the file explorer. |

### EditorFile

The Editor component works with EditorFile objects that encapsulate all the media tracks and actions:

```jsx
import { EditorFile } from '@stoked-ui/sui-editor';

// Create a new editor file
const editorFile = new EditorFile({
  tracks: [
    {
      id: 'video-track',
      name: 'Video Track',
      type: 'video',
      actions: [
        { 
          id: 'video-clip-1', 
          start: 0, 
          duration: 10, 
          name: 'Intro Clip',
          // other properties
        }
      ]
    }
  ]
});
```

### CSS

| Rule name | Global class | Description |
|:---------|:-------------|:------------|
| root | .MuiEditor-root | Styles applied to the root element. |
| editorView | .MuiEditor-editorView | Styles applied to the editor view area. |
| controls | .MuiEditor-controls | Styles applied to the controls section. |
| timeline | .MuiEditor-timeline | Styles applied to the timeline component. |
| fileExplorerTabs | .MuiEditor-fileExplorerTabs | Styles applied to the file explorer tabs. |
| fileExplorer | .MuiEditor-fileExplorer | Styles applied to the file explorer. |
| loaded | .MuiEditor-loaded | Styles applied when the editor is fully loaded. | 