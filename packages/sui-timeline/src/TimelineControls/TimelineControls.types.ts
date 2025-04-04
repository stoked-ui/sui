import * as React from 'react';
import {Theme} from '@mui/material/styles';
import {SxProps} from '@mui/system';
import {SlotComponentProps} from '@mui/base/utils';
import {Version} from '../Engine/Engine.types';
import {TimelineControlsClasses} from './timelineControlsClasses';

/**
 * @module TimelineControls
 *
 * A component for controlling the timeline view.
 */

export interface TimelineControlsSlots {
  /**
   * Element rendered at the root.
   * @default EditorControlsRoot
   */
  root?: React.ElementType;
}

export interface TimelineControlsSlotProps {
  /**
   * Props used for each component slot.
   */
  root?: SlotComponentProps<'div', {}, TimelineControlsSlots>;
}

/**
 * Base props for the TimelineControls component.
 *
 * @extends React.HTMLAttributes<HTMLDivElement>
 */
export interface TimelineControlsPropsBase extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Override or extend the styles applied to the component.
   */
  className?: string;
  classes?: Partial<TimelineControlsClasses>;
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxProps<Theme>;
  /**
   * The scale of the video
   * @default 1
   */
  scale?: number;
  setScaleWidth: (scaleWidth: number) => void;
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
  autoScroll: boolean;
  /**
   * The type of view to display.
   * @default 'timeline'
   */
  view: 'timeline' | 'files';
  setView: (newView: 'timeline' | 'files') => void;
  /**
   * The versions of the video.
   */
  versions?: Version[];
  setVersions?: React.Dispatch<React.SetStateAction<Version[]>>;
  currentVersion?: string | undefined;
  setCurrentVersion?: React.Dispatch<React.SetStateAction<string | undefined>>;
  timeline?: boolean;
  switchView?: boolean;
  disabled?: boolean;
}

/**
 * Props for the TimelineControls component.
 *
 * @extends TimelineControlsPropsBase
 */
export interface TimelineControlsProps
  extends TimelineControlsPropsBase {
  /**
   * Overridable component slots.
   * @default {}
   */
  slots?: TimelineControlsSlots;
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps?: TimelineControlsSlotProps;
}

/**
 * The possible states of the control.
 *
 * @enum {string}
 */
export type ControlState = 'pause' | 'play' | 'rewind' | 'fastForward';

/**
 * Converts a video version key to an object.
 *
 * @param {string} key - The key in the format "id|version".
 * @returns {Version} The converted Version object.
 */
export const VideoVersionFromKey = (key) => {
  const parts = key.split('|');
  return { id: parts[0], version: Number(parts[1]), key } as Version;