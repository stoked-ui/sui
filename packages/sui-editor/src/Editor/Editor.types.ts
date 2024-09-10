import * as React from 'react';
import {Theme} from '@mui/material/styles';
import {SxProps} from '@mui/system';
import {SlotComponentProps} from '@mui/base/utils';
import {ITimelineAction, ITimelineActionInput, ITimelineTrack} from "@stoked-ui/timeline";
import {FileBase} from '@stoked-ui/file-explorer/models/items';
import {EditorPluginParameters, EditorPluginSignatures, EditorPluginSlotProps, EditorPluginSlots} from './Editor.plugins';
import {EditorClasses} from './editorClasses';
import {EditorExperimentalFeatures, EditorPublicAPI,} from '../internals/models';

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
  videoControls?: React.ElementType;
  /**
   * Element that renders the view space for the editor
   * @default Timeline
   */
  timeline?: React.ElementType;
  /**
   * Bottom left ui component
   * @default FileExplorer
   */
  bottomLeft?: React.ElementType;
  /**
   * Bottom right ui component
   * @default FileExplorer
   */
  bottomRight?: React.ElementType;

}

export interface EditorSlotProps<R extends FileBase, Multiple extends boolean | undefined>
  extends EditorPluginSlotProps {
  root?: SlotComponentProps<'div', {}, EditorProps<R, Multiple>>;
  editorView?: SlotComponentProps<'div', {}, {}>;
  videoControls?: SlotComponentProps<'div', {}, {}>;
  timeline?: SlotComponentProps<'div', {}, {}>;
  bottomLeft?: SlotComponentProps<'div', {}, {}>;
  bottomRight?: SlotComponentProps<'div', {}, {}>;
}


export type EditorApiRef = React.MutableRefObject<
  EditorPublicAPI<EditorPluginSignatures> | undefined
>;

export interface EditorPropsBase extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<EditorClasses>;
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxProps<Theme>;

  // project?: VideoProject<R>;
  actionData?: ITimelineActionInput[];

  actions?: ITimelineAction[];

}

export interface EditorProps<R extends FileBase = FileBase, Multiple extends boolean | undefined = true>
  extends Omit<EditorPluginParameters, 'actions'>,
    EditorPropsBase {
  /**
   * Overridable component slots.
   * @default {}
   */
  slots?: EditorSlots;
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps?: EditorSlotProps<R, Multiple>;
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
}
