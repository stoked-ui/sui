import * as React from 'react';
import {Theme, styled} from '@mui/material/styles';
import {shouldForwardProp, SxProps} from '@mui/system';
import { MediaFile, namedId } from '@stoked-ui/media-selector';
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

  onAddFiles?: () => void;

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

  onLabelClick?: (track: ITimelineTrack) => void;

  collapsed?: boolean;
}

export interface ToggleButtonGroupSxProps {
  maxWidth: number,
  maxHeight: number,
  minWidth: number,
  minHeight: number
}

export function ToggleButtonGroupSx(id: string = namedId('toggle-button-sx'), { maxWidth = 38, maxHeight = 40, minWidth = 22, minHeight = 22 }: ToggleButtonGroupSxProps) {
  document.getElementById(id)
  return (theme: Theme) => ({
    height: `${maxHeight}px`,
    width: 'calc(100% + 1px)',
    backgroundColor: theme.palette.mode === 'light' ? '#FFF' : '#000', '& .MuiButtonBase-root': {
      backgroundColor: 'transparent',
      color: theme.palette.text.primary,
      border: `1px solid ${theme.palette.text.primary}`,
      width: `${maxWidth}px`,
      minHeight: `${minHeight}px`,
      maxHeight: `${maxWidth}px`,
      minWidth: `${minWidth}px`,
      maxWidth: `${maxHeight}px`,
      '&:hover': {
        minHeight: `${minHeight}px`,
        maxHeight: `${maxWidth}px`,
        minWidth: `${minWidth}px`,
        maxWidth: `${maxHeight}px`,
        color: theme.palette.primary[theme.palette.mode === 'light' ? 'dark' : 'light'],
        backgroundColor: theme.palette.background.default,
        border: `2px solid ${theme.palette.primary[theme.palette.mode]}`,
        outline: '1px solid black',
        zIndex: 30,
      }
    },
    '& .MuiButtonBase-root.Mui-selected': {
      backgroundColor: 'transparent',
      color: `${theme.palette.primary.main}!important`,
      border: `2px solid ${theme.palette.primary[theme.palette.mode === 'dark' ? 'light' : 'dark']}!important`,
      zIndex: 20,
      '&:hover': {
        minHeight: `${minHeight}px`,
        maxHeight: `${maxWidth}px`,
        minWidth: `${minWidth}px`,
        maxWidth: `${maxHeight}px`,
        backgroundColor: theme.palette.background.default,
        border: `2px solid ${theme.palette.primary.main}!important`,
        zIndex: 20,
      }
    },
    '& .MuiButtonBase-root.Mui-focusVisible': {
      minHeight: `${minHeight}px`,
      maxHeight: `${maxWidth}px`,
      minWidth: `${minWidth}px`,
      maxWidth: `${maxHeight}px`,
      color: `${theme.palette.primary[theme.palette.mode]}!important`,
      backgroundColor: theme.palette.background.default,
      border: `2px solid ${theme.palette.primary[theme.palette.mode]}!important`,
      zIndex: 30,
      outline: 'none',
      outlineOffset: 'none',
    }
  });
}
