import * as React from 'react';
import {Theme, styled} from '@mui/material/styles';
import {shouldForwardProp, SxProps} from '@mui/system';
import { MediaFile } from '@stoked-ui/media-selector';
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import {SlotComponentProps} from '@mui/base/utils';
import { type IController } from '../Controller/Controller.types';
import {TimelineClasses} from './timelineClasses';
import {type ITimelineTrack} from "../TimelineTrack/TimelineTrack.types";
import {type TimelineLabelsProps} from "../TimelineLabels/TimelineLabels.types";
import {type TimelineState} from "./TimelineState";
import TimelineControl, {TimelineControlProps} from "../TimelineControl";
import {ITimelineAction} from "../TimelineAction";

export type TimelineComponent = ((
  props: TimelineProps & React.RefAttributes<HTMLDivElement>,
) => React.JSX.Element) & { propTypes?: any };

export interface TimelineSlots {
  /**
   * Element rendered at the root.
   * @default TimelineRoot
   */
  root?: React.ElementType;
  labels?: React.ElementType;
  control?: React.ElementType;
}

export interface TimelineSlotProps {
  root?: SlotComponentProps<'div', {}, TimelineProps>;
  labels?: SlotComponentProps<'div', {}, TimelineLabelsProps>;
  control?: SlotComponentProps<typeof TimelineControl, {}, TimelineControlProps>;
}

export interface TimelineProps
  extends React.HTMLAttributes<HTMLDivElement> {
  detailMode?: boolean,

  children?: React.ReactNode;
  /**
   * Overridable component slots.
   * @default {}
   */
  slots?: TimelineSlots;
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps?: TimelineSlotProps;
  className?: string;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<TimelineClasses>;
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxProps<Theme>;
  labelsSx?: SxProps<Theme>;
  labelSx?: SxProps<Theme>;
  controlSx?: SxProps<Theme>;
  trackSx?: SxProps<Theme>;

  controllers?: Record<string, IController>;
  timelineState?: React.RefObject<TimelineState>;
  viewSelector?: string;
  labels?: boolean;

  scaleWidth?: number;
  setScaleWidth?: (scaleWidth: number) => void;

  detailRenderer?: boolean;
  locked?: boolean;

  disabled?: boolean;

  onAddFiles?: (mediaFiles: MediaFile[]) => void;

  /**
   * @description Right-click track callback
   */
  onContextMenuTrack?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    param: {
      track: ITimelineTrack;
      time: number;
    },
  ) => void;
  /**
   * @description Right-click action callback
   */
  onContextMenuAction?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    param: {
      action: ITimelineAction;
      track: ITimelineTrack;
      time: number;
    },
  ) => void;
}

export function ToggleButtonGroupSx(theme: Theme, width: number = 38, height: number = 40) {
  return {
    backgroundColor: theme.palette.mode === 'light' ? '#FFF' : '#000', '& .MuiButtonBase-root': {
      backgroundColor: 'transparent',
      color: theme.palette.text.primary,
      border: `1px solid ${theme.palette.text.primary}`,
      height: `${height}px`,
      width: `${width}px`,
      '&:hover': {
        color: theme.palette.primary.main,
        backgroundColor: theme.palette.background.default,
        border: `2px solid ${theme.palette.primary[500]}`,
        zIndex: 30,
        height: `${height}px`,
        width: `${width}px`,
      }
    }, '& .MuiButtonBase-root.Mui-selected': {
      backgroundColor: 'transparent',
      color: `${theme.palette.primary[theme.palette.mode]}!important`,
      border: `2px solid ${theme.palette.primary[theme.palette.mode === 'dark' ? 'light' : 'dark']}!important`,
      zIndex: 20,
      height: `${height}px`,
      width: `${width}px`,
      '&:hover': {
        backgroundColor: theme.palette.background.default,
        border: `2px solid ${theme.palette.primary[theme.palette.mode]}!important`,
        zIndex: 20,
        height: `${height}px`,
        width: `${width}px`,
      }
    }
  }
}
