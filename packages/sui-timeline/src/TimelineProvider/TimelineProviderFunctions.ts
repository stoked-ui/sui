import * as React from "react";
import {ITimelineTrack} from "../TimelineTrack";
import {TimelineContextType, TimelineState} from "./TimelineProvider.types";
import {ITimelineFileAction} from "../TimelineAction";
import {DEFAULT_SCALE_WIDTH, NEW_ACTION_DURATION} from "../interface/const";
import {getScaleCountByRows, parserPixelToTime, parserTimeToPixel} from "../utils";

export const createAction = (e: React.MouseEvent<HTMLElement, MouseEvent>, track: ITimelineTrack, context: TimelineContextType) =>  {
  if (!track || track.locked) {
    return;
  }
  const name = `${track.name} - ${track.actions.length}`;
  const newAction: ITimelineFileAction = {
    name,
    start: context.engine.time,
    end: context.engine.time + NEW_ACTION_DURATION,
  };
  context.dispatch({ type: 'CREATE_ACTION', payload: { action: newAction, track } })
}

export const  setHorizontalScroll = (left: number, state: TimelineState) =>  {
  const { components } = state;
  const scrollSync = components.scrollSync as React.PureComponent & { state: Readonly<any>; };
  const scrollLeft =  Math.max(left, 0);
  scrollSync.setState({ scrollLeft });
}

/** handleCursor */
export const setCursor = (param: { left?: number; time?: number; updateTime?: boolean, move?: boolean }, context: TimelineContextType) => {
  let { left, time } = param;
  const { updateTime = true } = param;
  const { startLeft, scale, scaleWidth } = context.settings;
  const scrollSync = context.components.scrollSync as React.PureComponent & { state: Readonly<any>};

  if (typeof left === 'undefined' && typeof time === 'undefined') {
    return undefined;
  }

  if (typeof left === 'undefined') {
    left = parserTimeToPixel(time, { startLeft, scale, scaleWidth });
  }

  if (typeof time === 'undefined') {
    time = parserPixelToTime(left, { startLeft, scale, scaleWidth });
  }

  if ((typeof time !== 'undefined' || typeof time === 'undefined') && param.move && scrollSync) {
    setHorizontalScroll(left - (scrollSync.state.clientWidth * .5), context);
  }

  let result = true;
  if (updateTime) {
    result = context.engine.setTime(time);
    if (context.flags.autoReRender) {
      context.engine.reRender();
    }
  }

  if (result) {
    context.dispatch({ type: 'SET_SETTING', payload: { key: 'cursorTime', value: time } });
  }

  return result;
}


/** setUp scrollLeft */
export const deltaScrollLeft = (delta: number, state: TimelineState)  => {
  const { settings: s } = state;
  const scrollSync = state.components.scrollSync as React.PureComponent & { state: Readonly<any> };
  if (!scrollSync) {
    return
  }

  // Disable automatic scrolling when the maximum distance is exceeded
  const dataScrollLeft = scrollSync.state.scrollLeft + delta;
  if (dataScrollLeft > s.scaleCount * (s.scaleWidth - 1) + s.startLeft - s.timelineWidth) {
    return;
  }

  state.settings.setHorizontalScroll(scrollSync.state.scrollLeft + delta);
}

/** dynamicSettings scale count */
export const setScaleCount = (value: number, context: TimelineContextType) =>  {
  const { settings: { maxScaleCount, minScaleCount } } = context;
  const newScaleCount = Math.min(maxScaleCount, Math.max(minScaleCount, value));
  context.dispatch({ type: 'SET_SETTING', payload: { key: 'scaleCount', value: newScaleCount } });
}

export const  fitScaleData = (context: TimelineContextType, newWidth: number, tracks?: ITimelineTrack[])  => {
  tracks = tracks || context.file?.tracks;
  if (!newWidth || !tracks?.length) {
    return undefined;
  }
  const { settings } = context;
  const { startLeft, maxScaleCount, minScaleCount } = settings;

  const getScale = () => {
    const scaleWidth = (newWidth - (startLeft * 2)) / context.engine.maxDuration;
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
  return {
    scaleWidth,
    scaleCount,
    minScaleCount: Math.min(maxScaleCount, Math.max(minScaleCount, scaleCount)),
    maxScaleCount: Math.max(maxScaleCount, Math.min(scaleCount, minScaleCount)),
    scale,
  }
}
