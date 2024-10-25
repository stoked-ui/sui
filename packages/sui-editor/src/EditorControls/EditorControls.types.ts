import * as React from 'react';
import {Theme} from '@mui/material/styles';
import {SxProps} from '@mui/system';
import {SlotComponentProps} from '@mui/base/utils';
import {FileBase} from '@stoked-ui/file-explorer/models/items';
import {IEngine, TimelineState, ViewMode} from '@stoked-ui/timeline';
import {EditorControlsClasses} from './editorControlsClasses';
import EditorEngine from "../EditorEngine/EditorEngine";
import { Version } from '../Editor/Editor.types';

export interface EditorControlsSlots {
  /**
   * Element rendered at the root.
   * @default EditorControlsRoot
   */
  root?: React.ElementType;
}

export interface EditorControlsSlotProps {
  root?: SlotComponentProps<'div', {}, EditorControlsProps>;
}

export interface EditorControlsPropsBase extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<EditorControlsClasses>;
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxProps<Theme>;
  /*
  * The scale of the video
  * @default 1
  */
  scale?: number;
  setScaleWidth: (scaleWidth: number) => void;
  /*
  * The width of the scale
  * @default 160
  */
  scaleWidth?: number;
  /*
  * How many ticks to the left of the view at start
  * @default 20
  */
  startLeft?: number;
  timelineState: React.RefObject<TimelineState>;
  engineRef: React.RefObject<EditorEngine>;
  autoScroll: boolean;
  view: 'timeline' | 'files',
  setView: (newView: 'timeline' | 'files') => void;
  versions?: Version[];
  setVersions?: React.Dispatch<React.SetStateAction<Version[]>>;
  mode: ViewMode;
  setMode:  React.Dispatch<React.SetStateAction<ViewMode>>;
  currentVersion?: string | undefined;
  setCurrentVersion?: React.Dispatch<React.SetStateAction<string | undefined>>;

  timeline?: boolean;
  switchView?: boolean;
}

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

export type ControlState = 'paused' | 'playing' | 'recording'

export const VideoVersionFromKey = (key) => {
  const parts = key.split('|');
  return { id: parts[0], version: Number(parts[1]), key} as Version;
}
