import * as React from "react";
import { IMediaFile } from '@stoked-ui/media-selector';
import { alpha } from "@mui/material/styles";
import { type ITimelineAction, type ITimelineFileAction } from '../TimelineAction/TimelineAction.types';
import { type IController } from "../Controller/Controller.types";
import { CommonProps } from "../interface/common_prop";
import type { TimelineControlPropsBase } from "../TimelineControl";
import { DragLineData } from "../TimelineTrackArea/TimelineTrackAreaDragLines";
import { getScaleCountByRows } from "../utils";
import { DEFAULT_SCALE_WIDTH } from "../interface/const";

export type TimelineTrackProps<
  ActionType extends ITimelineAction = ITimelineAction,
  TrackType extends ITimelineTrack = ITimelineTrack,
> = CommonProps & TimelineControlPropsBase<TrackType, ActionType> & {
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
  useProvider?: () => any
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

export const getTrackBackgroundColor = (color: string, mode: 'dark' | 'light', selected?: boolean, hover?: boolean, track?: boolean) => {
  const state = getState(selected, hover);
  const modeState = TrackColorAlpha[mode][state];
  const modeMod = (scalar: number) => mode === 'light' ? scalar : scalar;
  const firstColor = alpha(color, modeMod(modeState.label));
  const endColor = alpha(color, modeMod(modeState.row))
  let opacity = 1;
  if (state === 'normal') {
    opacity = .95;
  }
  return {
    label: {
      background: `linear-gradient(to right,${firstColor}, 80%, ${endColor})`,
      opacity: `${opacity}!important`
    },
    row: {
      background: endColor,
      opacity: `${opacity}!important`
    },
    action: {
      background: alpha(color, modeMod(modeState.action)),
      opacity: `${opacity}!important`
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
  /** Whether the action is hidden */
  hidden?: boolean;
  /** Whether the action is hidden */
  lock?: boolean;

  file?: IMediaFile;

  image?: string;

  controllerName?: string;

  controller: IController;
}

export type ITimelineTrackMetadata<TrackType extends ITimelineTrack = ITimelineTrack> = Omit<TrackType, 'file' | 'controller'> & {
  fileIndex?: number;
}

export interface ITimelineFileTrack extends Omit<ITimelineTrack, 'id' | 'controller' | 'actions' | 'file'> {
  /** Action track id */
  id?: string;

  name: string;
  /** Row action list */
  actions: ITimelineFileAction[];

  url?: string;

  image?: string;

  file?: IMediaFile;

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

export function fitScaleData(tracks: ITimelineTrack[], minScaleCount: number, maxScaleCount: number, startLeft: number, duration: number, width: number) {
  const getScale = () => {
    const scaleWidth = (width - startLeft) / duration;
    if (scaleWidth < 40) {
      const multiplier = Math.ceil(40 / scaleWidth);
      return { scaleWidth: multiplier * scaleWidth, scale: multiplier };
    }
    return { scaleWidth, scale: 1 };
  }
  const scaleRes = getScale();
  if (scaleRes.scaleWidth === Infinity) {
    scaleRes.scaleWidth = DEFAULT_SCALE_WIDTH;
  }
  const { scaleWidth, scale } = scaleRes;
  const scaleCount = getScaleCountByRows(tracks || [], { scale })
  maxScaleCount = Math.max(maxScaleCount, Math.min(scaleCount, minScaleCount));
  minScaleCount = Math.min(maxScaleCount, Math.max(minScaleCount, scaleCount));
  return {
    scaleWidth,
    scaleCount,
    minScaleCount,
    maxScaleCount,
    scale,
  }
}
