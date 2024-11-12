import * as React from 'react';
import {Theme} from '@mui/material/styles';
import {SxProps} from '@mui/system';
import {SlotComponentProps} from '@mui/base/utils';
import {IMediaFile} from '@stoked-ui/media-selector';
import {EditorPluginParameters, EditorPluginSignatures, EditorPluginSlotProps, EditorPluginSlots} from './Editor.plugins';
import {EditorClasses} from './editorClasses';
import { EditorExperimentalFeatures, EditorPublicAPI } from '../internals/models';
import { IEditorFileAction } from "../EditorAction";
import { IEditorFile } from "./EditorFile";


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
  timeline?: SlotComponentProps<'div', {}, {}>;
  fileExplorer?: SlotComponentProps<'ul', {}, {}>;
}


export type EditorApiRef = React.MutableRefObject<
  EditorPublicAPI<EditorPluginSignatures> | undefined
>;

export interface EditorPropsBase extends React.HTMLAttributes<HTMLDivElement> {
  actions?: IEditorFileAction[];
  className?: string;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<EditorClasses>;
  file?: IEditorFile;

  fileUrl?: string,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxProps<Theme>;
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

