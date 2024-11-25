import * as React from 'react';
import {Theme} from '@mui/material/styles';
import {SxProps} from '@mui/system';
import {SlotComponentProps} from '@mui/base/utils';
import {IMediaFile} from '@stoked-ui/media-selector';
import {ITimelineAction, ITimelineTrack, TimelineProps, TimelineControlProps} from '@stoked-ui/timeline';
import { FileExplorerProps } from "@stoked-ui/file-explorer";
import {EditorPluginParameters, EditorPluginSignatures, EditorPluginSlotProps, EditorPluginSlots} from './Editor.plugins';
import {EditorClasses} from './editorClasses';
import { EditorExperimentalFeatures, EditorPublicAPI } from '../internals/models';
import {IEditorAction, IEditorFileAction} from "../EditorAction";
import EditorFile, { IEditorFile } from "../EditorFile/EditorFile";
import Controllers from '../Controllers/Controllers';
import {IEditorTrack} from "../EditorTrack";


export interface EditorSlots extends EditorPluginSlots {
  /**
   * Element rendered at the root.
   * @default EditorRoot
   */
  root?: React.ElementType;
  /**
   * Element that renders the view space for the editor
   * @default EditorEditorView
   */
  editorView?: React.ElementType;
  /**
   * Element that renders the view space for the editor
   * @default React.JSXElementConstructor<HTMLDivElement>;
   */
  controls?: React.ElementType;
  /**
   * Element that renders the view space for the editor
   * @default Timeline
   */
  timeline?: React.ElementType;
  /**
   * FileExplorer View
   * @default FileExplorer
   */
  fileExplorer?: React.ElementType;

}

export interface EditorSlotProps<R extends IMediaFile, Multiple extends boolean | undefined>
  extends EditorPluginSlotProps {
  root?: SlotComponentProps<'div', {}, EditorProps<R, Multiple>>;
  editorView?: SlotComponentProps<'div', {}, {}>;
  controls?: SlotComponentProps<'div', {}, {}>;
  timeline?: SlotComponentProps<'div', {}, TimelineProps & TimelineControlProps>;
  fileExplorer?: SlotComponentProps<'ul', {}, FileExplorerProps<R, Multiple>>;
}


export type EditorApiRef = React.MutableRefObject<
  EditorPublicAPI<EditorPluginSignatures> | undefined
>;

export interface EditorPropsBase extends React.HTMLAttributes<HTMLDivElement> {
  actions?: IEditorFileAction[];
  allControls?: boolean;
  className?: string;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<EditorClasses>;
  detailMode?: boolean;
  file?: IEditorFile;

  fileUrl?: string,
  fileView?: boolean;

  localDb?: boolean;

  labels?: boolean;

  minimal?: boolean;
  newTrack?: boolean;
  noResizer?: boolean;

  noLabels?: boolean;

  noSaveControls?: boolean;

  record?: boolean;

  noSnapControls?: boolean;

  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxProps<Theme>;

  timelineSx?: SxProps<Theme>;

  noTrackControls?: boolean;

  noZoom?: boolean;
}

export interface EditorProps<R extends IMediaFile = IMediaFile, Multiple extends boolean | undefined = true>
  extends Omit<EditorPluginParameters, 'actions' | 'file'>,
    EditorPropsBase {
  /**
   * The ref object that allows Editor View manipulation. Can be instantiated with
   * `useEditorApiRef()`.
   */
  apiRef?: EditorApiRef;
  /**
   * Unstable features, breaking changes might be introduced.
   * For each feature, if the flag is not explicitly set to `true`,
   * the feature will be fully disabled and any property / method call will not have any effect.
   */
  experimentalFeatures?: EditorExperimentalFeatures<EditorPluginSignatures>;
  /**
   * Override or extend the styles applied to the component.
   */
  mode?: 'project' | 'track' | 'action';

  newTrack?: boolean;

  /**
   * @description Click label callback
   */
  onClickLabel?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    track: ITimelineTrack,
  ) => void;

  /**
   * @description Click track callback
   */
  onClickTrack?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    param: {
      track: ITimelineTrack;
      time: number;
    },
  ) => void;

  /**
   * @description Click track callback
   */
  onClickAction?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    param: {
      action: ITimelineAction;
      track: ITimelineTrack;
      time: number;
    },
  ) => void;

  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps?: EditorSlotProps<R, Multiple>;
  /**
   * Overridable component slots.
   * @default {}
   */
  slots?: EditorSlots;
}

