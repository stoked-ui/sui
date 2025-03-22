---
productId: editor
title: Editor API
components: Editor
githubLabel: 'component: editor'
packageName: '@stoked-ui/sui-editor'
---

# Editor API

<p class="description">The API documentation of the Editor React component. Learn about the available props and the CSS customization points.</p>

## Import

```jsx
import { Editor } from '@stoked-ui/sui-editor';
```

## Component name

The `MuiEditor` name can be used for providing default props or style overrides at the theme level.

## Props

### Editor Props

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

The `ref` is forwarded to the root element.

Any other props supplied will be provided to the root element.

## CSS

### Global classes

| Rule name | Global class | Description |
|:---------|:-------------|:------------|
| root | .MuiEditor-root | Styles applied to the root element. |
| editorView | .MuiEditor-editorView | Styles applied to the editor view area. |
| controls | .MuiEditor-controls | Styles applied to the controls section. |
| timeline | .MuiEditor-timeline | Styles applied to the timeline component. |
| fileExplorerTabs | .MuiEditor-fileExplorerTabs | Styles applied to the file explorer tabs. |
| fileExplorer | .MuiEditor-fileExplorer | Styles applied to the file explorer. |
| loaded | .MuiEditor-loaded | Styles applied when the editor is fully loaded. |

## Slots

The Editor component uses a slot system that allows overriding different parts of the UI:

| Name | Default | Description |
|:-----|:--------|:------------|
| root | EditorRoot | The component used for the root node. |
| editorView | EditorView | The component used for the main editor view area. |
| controls | div | The component used for the editor controls. |
| timeline | Timeline | The component used for the timeline. |
| fileExplorerTabs | FileExplorerTabs | The component used for file explorer tabs. |
| fileExplorer | FileExplorer | The component used for the file explorer. |

## Demos

- [Editor](/material-ui/react-editor/) 