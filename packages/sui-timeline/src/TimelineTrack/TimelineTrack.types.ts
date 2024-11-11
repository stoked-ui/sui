import * as React from "react";
import { IMediaFile } from '@stoked-ui/media-selector';
import { alpha } from "@mui/material/styles";
import { type ITimelineAction, type ITimelineFileAction } from '../TimelineAction/TimelineAction.types';
import { type IController } from "../Controller/Controller.types";
import { CommonProps } from "../interface/common_prop";
import type { TimelineControlPropsBase } from "../TimelineControl";
import { DragLineData } from "../TimelineTrackArea/TimelineTrackAreaDragLines";
import { getScaleCountByRows } from "../utils";
import { DEFAULT_SCALE_WIDTH } from "../../build/modern";

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
};

export const TrackColorAlpha = {
  dark: {
    hoverSelect: {
      row: .6,
      label: .85,
    },
    selected: {
      row: .75,
      label: .8,
    },
    hover: {
      row: .95,
      label: 63,
    },
    normal: {
      row:
        .48,
      label: .82,
    }
  },
  light: {
    hoverSelect: {
      row: .6,
      label: .9,
    },
    selected: {
      row: .4,
      label: .7,
    },
    hover: {
      row: .25,
      label: .6,
    },
    normal: {
      row: .12,
      label: .52,
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

export const getTrackBackgroundColor = (color: string, mode: 'dark' | 'light', selected?: boolean, hover?: boolean) => {
  const state = getState(selected, hover);
  const modeState = TrackColorAlpha[mode][state];
  const firstColor = alpha(color, modeState.label);
  const endColor = alpha(color, modeState.row)
  let opacity = 1;
  if (state === 'normal') {
    opacity = .95;
  }
  return {
    label: {
      background: `linear-gradient(to right,${firstColor}, 70%, ${endColor})`,
      opacity: `${opacity}!important`
    },
    row: {
      background: endColor,
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
