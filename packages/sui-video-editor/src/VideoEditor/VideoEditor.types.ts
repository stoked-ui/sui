import * as React from 'react';
import { Theme } from '@mui/material/styles';
import { SxProps } from '@mui/system';
import { SlotComponentProps } from '@mui/base/utils';
import { FileBase } from '@stoked-ui/file-explorer/models/items';
import {
  VideoEditorPluginParameters,
  VideoEditorPluginSignatures,
  VideoEditorPluginSlotProps,
  VideoEditorPluginSlots,
} from './VideoEditor.plugins';
import { VideoEditorClasses } from './videoEditorClasses';
import {
  VideoEditorExperimentalFeatures,
  VideoEditorPublicAPI,
} from '../internals/models';


export interface VideoEditorSlots extends VideoEditorPluginSlots {
  /**
   * Element rendered at the root.
   * @default VideoEditorRoot
   */
  root?: React.ElementType;
  /**
   * Element that renders the view space for the editor
   * @default VideoEditorViewSpace
   */
  viewSpace?: React.ElementType;
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

export interface VideoEditorSlotProps<R extends FileBase, Multiple extends boolean | undefined>
  extends VideoEditorPluginSlotProps {
  root?: SlotComponentProps<'div', {}, VideoEditorProps<R, Multiple>>;
  viewSpace?: SlotComponentProps<'div', {}, {}>;
  videoControls?: SlotComponentProps<'div', {}, {}>;
  timeline?: SlotComponentProps<'div', {}, {}>;
  bottomLeft?: SlotComponentProps<'div', {}, {}>;
  bottomRight?: SlotComponentProps<'div', {}, {}>;
}


export type VideoEditorApiRef = React.MutableRefObject<
  VideoEditorPublicAPI<VideoEditorPluginSignatures> | undefined
>;

export interface VideoEditorPropsBase<R extends FileBase> extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<VideoEditorClasses>;
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxProps<Theme>;

  // project?: VideoProject<R>;
}

export interface VideoEditorProps<R extends FileBase, Multiple extends boolean | undefined>
  extends VideoEditorPluginParameters<Multiple>,
    VideoEditorPropsBase<R> {
  /**
   * Overridable component slots.
   * @default {}
   */
  slots?: VideoEditorSlots;
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps?: VideoEditorSlotProps<R, Multiple>;
  /**
   * The ref object that allows VideoEditor View manipulation. Can be instantiated with `useVideoEditorApiRef()`.
   */
  apiRef?: VideoEditorApiRef;
  /**
   * Unstable features, breaking changes might be introduced.
   * For each feature, if the flag is not explicitly set to `true`,
   * the feature will be fully disabled and any property / method call will not have any effect.
   */
  experimentalFeatures?: VideoEditorExperimentalFeatures<VideoEditorPluginSignatures>;
}
