import * as React from "react";
import { IMediaFile } from '@stoked-ui/media-selector';
import {alpha, darken, lighten} from "@mui/material/styles";
import { compositeColors } from "@stoked-ui/common";
import { type ITimelineAction, type ITimelineFileAction, ITimelineActionHandlers } from '../TimelineAction/TimelineAction.types';
import { type IController } from "../Controller/Controller.types";
import { DragLineData } from "../TimelineTrackArea/TimelineTrackAreaDragLines";
import {TimelineControlPropsBase} from "../Timeline/TimelineControl.types";

export type TimelineTrackProps<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> =
  ITimelineActionHandlers<TrackType, ActionType> &
  TimelineControlPropsBase<TrackType, ActionType>
  & ITimelineTrackHandlers<TrackType>
  & {
  areaRef?: React.MutableRefObject<HTMLDivElement>;
  track?: TrackType;
  style?: React.CSSProperties;
  dragLineData: DragLineData;
  /** scroll distance from left */
  scrollLeft: number;
  /** setUp scroll left */
  deltaScrollLeft: (scrollLeft: number) => void;
  actionTrackMap?: Record<string, TrackType>
  trackRef?: React.RefObject<HTMLDivElement>;
  onAddFiles?: () => void;
  trackActions?: React.ElementType
};

export const TrackColorAlpha = {
  dark: {
    hoverSelect: {
      action: .9,
      row: .42,
      label: .85,
    },
    selected: {
      action: .82,
      row: .36,
      label: .63,
    },
    hover: {
      action: .62,
      row: .30,
      label: .8,
    },
    normal: {
      action: .48,
      row: .24,
      label: .82,
    }
  },
  light: {
    hoverSelect: {
      action: .85,
      row: .53,
      label: .4,
    },
    selected: {
      action: .8,
      row:  .47,
      label:.35,
    },
    hover: {
      action: .62,
      row: .42,
      label: .25,
    },
    normal: {
      action: .52,
      row:  .32,
      label: .12,
    }
  }
}

const getState = (selected?: boolean, hover?: boolean) => {
  if (selected && hover) {
    return 'hoverSelect';
  }
  if (selected) {
    return 'selected';
  }
  if (hover) {
    return 'hover';
  }
  return 'normal';
}

export interface ITimelineTrackHandlers<
  TrackType extends ITimelineTrack = ITimelineTrack,
>{
  /**
   * @description Click track callback
   */
  onClickTrack?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    param: {
      track: TrackType;
      time: number;
    },
  ) => void;
  /**
   * @description Double-click track callback
   */
  onDoubleClickTrack?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    param: {
      track: TrackType;
      time: number;
    },
  ) => void;
  /**
   * @description Right-click track callback
   */
  onContextMenuTrack?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    param: {
      track: TrackType;
      time: number;
    },
  ) => void;
}

export const getTrackBackgroundColor = (color: string, mode: 'dark' | 'light', selected?: boolean, hover?: boolean, disabled?: boolean, dim?: boolean) => {
  const state = getState(selected, hover);
  const modeState = TrackColorAlpha[mode][state];
  const modeMod = (scalar: number) => mode === 'light' ? scalar : scalar;
  const firstAlpha = (scalar: number) => mode === 'light' ? scalar * 2 : scalar;
  const endAlpha = (scalar: number) => mode === 'light' ? scalar : scalar;
  let baseColor = mode === 'light' ? '#fff' : '#000';
  if (disabled) {
    baseColor = mode === 'light' ? '#f5f5f5' : '#424242';
  }
  const dimMultiplier = dim ? 0.5 : 1
  let firstColor = compositeColors(baseColor, alpha(color, Math.max(0, Math.min(1, firstAlpha(modeMod(modeState.label))))));
  const endColor = compositeColors(baseColor, alpha(color, Math.max(0, Math.min(1, endAlpha(modeMod(modeState.row))))));
  let opacity = 1;
  if (state === 'normal') {
    opacity = .95;
  }
  if (mode === 'dark') {
    firstColor = lighten(firstColor, .4)
  } else {
    firstColor = darken(firstColor, .2)
  }
  return {
    label: {
      background: `linear-gradient(to right,${firstColor}, 80%, ${endColor})`,
      opacity: `${dimMultiplier}!important`
    },
    row: {
      background: endColor,
      opacity: `${dimMultiplier}!important`
    },
    action: {
      background: alpha(color, modeMod(modeState.action)),
      opacity: `${dimMultiplier}!important`
    }
  };
}
export const getTrackBackgroundColorDetail = (color: string, mode: 'dark' | 'light', selected?: boolean, hover?: boolean, disabled?: boolean, dim?: boolean) => {
  const state = getState(selected, hover);
  const modeState = TrackColorAlpha[mode][state];
  const modeMod = (scalar: number) => mode === 'light' ? scalar : scalar;
  const firstAlpha = (scalar: number) => mode === 'light' ? scalar * 8 : scalar;
  const endAlpha = (scalar: number) => mode === 'light' ? scalar : scalar;
  const baseColor = mode === 'light' ? '#fff' : '#000';
  if (disabled) {
    color = compositeColors(color, alpha(baseColor, .75));
  }
  const dimMultiplier = dim ? .5 : 1
  let firstColor = compositeColors(baseColor, alpha(color, firstAlpha(modeMod(modeState.label)) * dimMultiplier));
  const endColor = compositeColors(baseColor, alpha(color, endAlpha(modeMod(modeState.row)) * dimMultiplier));
  // let opacity = 1;

  if (mode === 'dark') {
    firstColor = lighten(firstColor, .4)
  } else {
    firstColor = darken(firstColor, .2)
  }
  return {
    label: {
      background: `linear-gradient(to right,${firstColor}, 80%, ${endColor})`,
      // opacity: `${opacity}!important`
    },
    row: {
      background: endColor,
      // opacity: `${opacity}!important`
    },
    action: {
      background: alpha(color, modeMod(modeState.action) * dimMultiplier),
      // opacity: `${opacity}!important`
    }
  };
}
/**
 *Basic parameters of action lines
 * @export
 * @interface ITimelineTrack
 */
export interface ITimelineTrack<
  ActionType extends ITimelineAction = ITimelineAction,
> {
  /** Action track id */
  id: string;

  name: string;
  /** Row action list */
  actions: ActionType[];
  /** Extended class name of track */
  classNames?: string[];
  /** Whether the track is movable */
  muted?: boolean;
  /** Whether the track is movable */
  locked?: boolean;

  file?: any;

  fileId?: string;

  url?: string;

  image?: string;

  controllerName?: string;

  disabled?: boolean;

  controller: IController;

  dim?: boolean;
}

export type ITimelineTrackData<TrackType extends ITimelineTrack = ITimelineTrack> = Omit<TrackType, 'file' | 'controller'> & {}

export interface ITimelineFileTrack extends Omit<ITimelineTrack, 'id' | 'controller' | 'actions'> {
  /** Action track id */
  id?: string;

  name: string;
  /** Row action list */
  actions: ITimelineFileAction[];

  image?: string;

  controllerName?: string;

  controller?: IController;
}

export interface ITimelineTrackNew<
  ActionType extends ITimelineAction = ITimelineAction,
>
  extends Omit<ITimelineTrack<ActionType>, 'id' | 'file'> {

  id: 'newTrack';

  file: null;
}


