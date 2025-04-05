/**
 * Element rendered at the root.
 * @typedef {React.ElementType} root
 * @property {EditorProps} props - EditorProps
 */
/**
 * Element that renders the view space for the editor.
 * @typedef {React.ElementType} editorView
 */
/**
 * Element that renders the controls for the editor.
 * @typedef {React.ElementType} controls
 */
/**
 * Element that renders the timeline for the editor.
 * @typedef {React.ElementType} timeline
 */
/**
 * Element that renders the file explorer tabs.
 * @typedef {React.ElementType} fileExplorerTabs
 */
/**
 * Element that renders the file explorer view.
 * @typedef {React.ElementType} fileExplorer
 */
 */
export interface EditorSlots extends EditorPluginSlots {
  root?: React.ElementType;
  editorView?: React.ElementType;
  controls?: React.ElementType;
  timeline?: React.ElementType;
  fileExplorerTabs?: React.ElementType;
  fileExplorer?: React.ElementType;
}

/**
 * Props for each component slot.
 * @typedef {SlotComponentProps} EditorSlotProps
 * @property {SlotComponentProps} root - SlotComponentProps for root
 * @property {SlotComponentProps} editorView - SlotComponentProps for editorView
 * @property {SlotComponentProps} controls - SlotComponentProps for controls
 * @property {SlotComponentProps} timeline - SlotComponentProps for timeline
 * @property {SlotComponentProps} fileExplorerTabs - SlotComponentProps for fileExplorerTabs
 * @property {SlotComponentProps} fileExplorer - SlotComponentProps for fileExplorer
 */
export interface EditorSlotProps extends EditorPluginSlotProps {
  root?: SlotComponentProps<'div', {}, EditorProps>;
  editorView?: SlotComponentProps<'div', {}, {}>;
  controls?: SlotComponentProps<'div', {}, {}>;
  timeline?: SlotComponentProps<'div', {}, TimelineProps & TimelineControlProps>;
  fileExplorerTabs?: SlotComponentProps<'div', {}, {}>;
  fileExplorer?: SlotComponentProps<'ul', {}, FileExplorerProps>;
}

/**
 * Reference for Editor API.
 * @typedef {React.MutableRefObject} EditorApiRef
 * @property {EditorPublicAPI} current - EditorPublicAPI current value
 */
export type EditorApiRef = React.MutableRefObject<EditorPublicAPI<EditorPluginSignatures> | undefined>;

/**
 * Base props for Editor component.
 * @typedef {React.HTMLAttributes} EditorPropsBase
 * @property {IEditorFileAction[]} actions - Array of editor file actions
 * @property {boolean} allControls - Flag for displaying all controls
 * @property {string} className - Class name for styling
 * @property {Partial<EditorClasses>} classes - Partial styles for the component
 * @property {boolean} detailMode - Flag for detail mode
 * @property {IEditorFile} file - Editor file
 * @property {FileExplorerProps} fileExplorerProps - Props for file explorer
 * @property {FileExplorerTabsProps} fileExplorerTabsProps - Props for file explorer tabs
 * @property {string} fileUrl - File URL
 * @property {boolean} fileView - Flag for file view
 * @property {boolean} fullscreen - Flag for fullscreen mode
 * @property {boolean} labels - Flag for displaying labels
 * @property {boolean} localDb - Flag for local database
 * @property {boolean} minimal - Flag for minimal mode
 * @property {boolean} newTrack - Flag for new track
 * @property {boolean} noLabels - Flag for hiding labels
 * @property {boolean} noResizer - Flag for hiding resizer
 * @property {boolean} noSaveControls - Flag for hiding save controls
 * @property {boolean} noSnapControls - Flag for hiding snap controls
 * @property {boolean} noTrackControls - Flag for hiding track controls
 * @property {boolean} noZoom - Flag for disabling zoom
 * @property {boolean} preview - Flag for preview mode
 * @property {boolean} record - Flag for recording
 * @property {boolean} openSaveControls - Flag for opening save controls
 * @property {SxProps} sx - System prop for additional CSS styles
 * @property {SxProps} timelineSx - System prop for timeline CSS styles
 * @property {SxProps} fileTabsSx - System prop for file tabs CSS styles
 * @property {SxProps} filesSx - System prop for files CSS styles
 */
export interface EditorPropsBase extends React.HTMLAttributes<HTMLDivElement> {
  actions?: IEditorFileAction[];
  allControls?: boolean;
  className?: string;
  classes?: Partial<EditorClasses>;
  detailMode?: boolean;
  file?: IEditorFile;
  fileExplorerProps?: FileExplorerProps;
  fileExplorerTabsProps?: FileExplorerTabsProps;
  fileUrl?: string;
  fileView?: boolean;
  fullscreen?: boolean;
  labels?: boolean;
  localDb?: boolean;
  minimal?: boolean;
  newTrack?: boolean;
  noLabels?: boolean;
  noResizer?: boolean;
  noSaveControls?: boolean;
  noSnapControls?: boolean;
  noTrackControls?: boolean;
  noZoom?: boolean;
  preview?: boolean;
  record?: boolean;
  openSaveControls?: boolean;
  sx?: SxProps<Theme>;
  timelineSx?: SxProps<Theme>;
  fileTabsSx?: SxProps<Theme>;
  filesSx?: SxProps<Theme>;
}

/**
 * Props for Editor component.
 * @typedef {EditorProps} EditorProps
 * @property {EditorApiRef} apiRef - Reference for Editor API
 * @property {EditorExperimentalFeatures} - Experimental features
 * @property {string} mode - Mode for editor
 * @property {boolean} newTrack - Flag for new track
 * @property {function} onClickLabel - Click label callback
 * @property {function} onClickTrack - Click track callback
 * @property {function} onClickAction - Click action callback
 * @property {EditorSlotProps} slotProps - Props for each component slot
 * @property {EditorSlots} slots - Overridable component slots
 * @property {React.ReactNode} children - React children nodes
 * @property {React.ReactElement[]} viewButtons - Array of view buttons
 * @property {number} viewButtonAppear - Appear time for view button
 * @property {number} viewButtonEnter - Enter time for view button
 * @property {number} viewButtonExit - Exit time for view button
 * @property {boolean} loaded - Flag for loaded status
 */
export interface EditorProps<R extends any = any, Multiple extends boolean | undefined = true>
  extends Omit<EditorPluginParameters, 'actions' | 'file'>,
    EditorPropsBase {
  apiRef?: EditorApiRef;
  experimentalFeatures?: EditorExperimentalFeatures<EditorPluginSignatures>;
  mode?: 'project' | 'track' | 'action';
  newTrack?: boolean;
  onClickLabel?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    track: ITimelineTrack,
  ) => void;
  onClickTrack?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    param: {
      track: ITimelineTrack;
      time: number;
    },
  ) => void;
  onClickAction?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    param: {
      action: ITimelineAction;
      track: ITimelineTrack;
      time: number;
    },
  ) => void;
  slotProps?: EditorSlotProps<R, Multiple>;
  slots?: EditorSlots;
  children?: React.ReactNode;
  viewButtons?: React.ReactElement[];
  viewButtonAppear?: number;
  viewButtonEnter?: number;
  viewButtonExit?: number;
  loaded?: boolean;
}