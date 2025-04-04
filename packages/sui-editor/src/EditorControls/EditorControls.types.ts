import * as React from 'react';
import { Version, ControlState } from '@stoked-ui/timeline';
import {Theme} from '@mui/material/styles';
import {SxProps} from '@mui/system';
import {SlotComponentProps} from '@mui/base/utils';
import {EditorControlsClasses} from './editorControlsClasses';

/**
 * Interface for the editor controls slots.
 *
 * @description
 * Defines the properties of the root element.
 */
export interface EditorControlsSlots {
  /**
   * Element rendered at the root.
   * @default EditorControlsRoot
   */
  root?: React.ElementType;
}

export interface EditorControlsSlotProps {
  /**
   * The props used for each component slot.
   * @default {}
   */
  root?: SlotComponentProps<'div', {}, EditorControlsProps>;
}

/**
 * Interface for the editor controls props base.
 *
 * @description
 * Defines the properties of the editor controls component.
 */
export interface EditorControlsPropsBase extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Override or extend the styles applied to the component.
   */
  className?: string;
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxProps<Theme>;
  /**
   * The scale of the video
   * @default 1
   */
  scale?: number;
  /**
   * The width of the scale
   * @default 160
   */
  scaleWidth?: number;
  /**
   * How many ticks to the left of the view at start
   * @default 20
   */
  startLeft?: number;
  /**
   * Versions of the video.
   */
  versions?: Version[];
  /**
   * Update function for the versions.
   */
  setVersions?: React.Dispatch<React.SetStateAction<Version[]>>;
  /**
   * The current version of the video.
   */
  currentVersion?: string | undefined;
  /**
   * Update function for the current version.
   */
  setCurrentVersion?: React.Dispatch<React.SetStateAction<string | undefined>>;
  /**
   * Whether to display a timeline.
   */
  timeline?: boolean;
  /**
   * Switch view.
   */
  switchView?: boolean;
  /**
   * Whether to disable the component.
   */
  disabled?: boolean;
}

/**
 * Interface for the editor controls props.
 *
 * @description
 * Extends the base props with overridable components slots.
 */
export interface EditorControlsProps
  extends EditorControlsPropsBase {
  /**
   * Overridable component slots.
   * @default {}
   */
  slots?: EditorControlsSlots;
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps?: EditorControlsSlotProps
}

/**
 * Type alias for the editor control state.
 *
 * @description
 * Defines the possible states of the editor control (ControlState or 'record').
 */
export type EditorControlState = ControlState | 'record';

/**
 * Function to create a video version from a key.
 *
 * @param {string} key - The key to create a version from.
 * @returns {Version} The created video version.
 */
export const VideoVersionFromKey = (key) => {
  const parts = key.split('|');
  return { id: parts[0], version: Number(parts[1]), key} as Version;
};