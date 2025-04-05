import * as React from 'react';
import { Version, ControlState } from '@stoked-ui/timeline';
import {Theme} from '@mui/material/styles';
import {SxProps} from '@mui/system';
import {SlotComponentProps} from '@mui/base/utils';
import {EditorControlsClasses} from './editorControlsClasses';

/**
 * Interface for EditorControlsSlots that defines the element rendered at the root.
 */
export interface EditorControlsSlots {
  root?: React.ElementType;
}

/**
 * Interface for EditorControlsSlotProps that defines the props for the root element.
 */
export interface EditorControlsSlotProps {
  root?: SlotComponentProps<'div', {}, EditorControlsProps>;
}

/**
 * Base interface for EditorControlsProps that extends React.HTMLAttributes<HTMLDivElement>.
 */
export interface EditorControlsPropsBase extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  classes?: Partial<EditorControlsClasses>;
  sx?: SxProps<Theme>;
  scale?: number; // The scale of the video. Default value is 1.
  scaleWidth?: number; // The width of the scale. Default value is 160.
  startLeft?: number; // How many ticks to the left of the view at start. Default value is 20.
  versions?: Version[];
  setVersions?: React.Dispatch<React.SetStateAction<Version[]>>;
  currentVersion?: string | undefined;
  setCurrentVersion?: React.Dispatch<React.SetStateAction<string | undefined>>;
  timeline?: boolean;
  switchView?: boolean;
  disabled?: boolean;
}

/**
 * Interface for EditorControlsProps that includes slots and slotProps.
 */
export interface EditorControlsProps extends EditorControlsPropsBase {
  slots?: EditorControlsSlots; // Overridable component slots. Default value is {}.
  slotProps?: EditorControlsSlotProps; // The props used for each component slot. Default value is {}.
}

/**
 * Type for EditorControlState that represents ControlState or 'record'.
 */
export type EditorControlState = ControlState | 'record';

/**
 * Function that extracts VideoVersion from a key.
 * @param {string} key - The key to extract the video version from.
 * @returns {Version} - The extracted video version.
 */
export const VideoVersionFromKey = (key: string): Version => {
  const parts = key.split('|');
  return { id: parts[0], version: Number(parts[1]), key} as Version;
}