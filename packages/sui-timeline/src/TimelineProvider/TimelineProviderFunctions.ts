import * as React from "react";
import {type ITimelineTrack} from "../TimelineTrack";
import {TimelineContextType, type TimelineState, type TimelineStateAction} from "./TimelineProvider.types";
import { type ITimelineFileAction} from "../TimelineAction";
import {DEFAULT_SCALE_WIDTH, NEW_ACTION_DURATION} from "../interface/const";
import {getScaleCountByRows, parserPixelToTime, parserTimeToPixel} from "../utils";

export const createActionEvent = (e: React.MouseEvent<HTMLElement, MouseEvent>, track: ITimelineTrack, state: TimelineState, dispatch: React.Dispatch<TimelineStateAction>) =>  {
  if (!track || track.locked) {
    return;
  }
  const { engine } = state;
  const name = `${track.name} - ${track.actions.length}`;
  const newAction: ITimelineFileAction = {
    name,
    start: engine.time,
    end: engine.time + NEW_ACTION_DURATION,
  };
  dispatch({ type: 'CREATE_ACTION', payload: { action: newAction, track } })
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
  const { state, dispatch } = context;
  const { settings: {startLeft, scale, scaleWidth}, components, flags, engine } = state;
  const scrollSync = components.scrollSync as React.PureComponent & { state: Readonly<any>};

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
    setHorizontalScroll(left - (scrollSync.state.clientWidth * .5), state);
  }

  let result = true;
  if (updateTime) {
    result = engine.setTime(time);
    if (flags.autoReRender) {
      engine.reRender();
    }
  }

  if (result) {
    dispatch({ type: 'SET_SETTING', payload: { key: 'cursorTime', value: time } });
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
  const { state, dispatch } = context;
  const { settings: { maxScaleCount, minScaleCount } } = state;
  const newScaleCount = Math.min(maxScaleCount, Math.max(minScaleCount, value));
  dispatch({ type: 'SET_SETTING', payload: { key: 'scaleCount', value: newScaleCount } });
}

export const  fitScaleData = (context: TimelineContextType, newWidth?: number)  => {
  const { state, dispatch } = context;
  const { settings, engine } = state;
  if (!newWidth) {
    const timelineGrid = document.getElementById('timeline-grid');
    newWidth = timelineGrid.clientWidth;
  }
  const tracks = state.file?.tracks;
  if (!newWidth || !tracks?.length) {
    return null;
  }
  const { startLeft, maxScaleCount, minScaleCount } = settings;

  const getScale = () => {
    const scaleWidth = (newWidth - (startLeft * 2)) / engine.maxDuration;
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
  const scaleData = {
    scaleWidth,
    scaleCount,
    minScaleCount: Math.min(maxScaleCount, Math.max(minScaleCount, scaleCount)),
    maxScaleCount: Math.max(maxScaleCount, Math.min(scaleCount, minScaleCount)),
    scale,
  }
  dispatch({type: 'SET_SETTING', payload: {value: {...scaleData}}});
  return scaleData;
}

const selectedScale = 1.6;
export const getTrackHeight = (track: ITimelineTrack, state: TimelineState): number => {
  const { flags: { detailMode }, file, selectedTrack, settings: { trackHeight,  } } = state;

  if (!detailMode) {
    return trackHeight;
  }
  const trackHeightDetailSelected =  selectedScale * trackHeight;
  const trackHeightDetailUnselected = (1 - ((selectedScale - 1) / ((file?.tracks?.length ?? 2) - 1))) * trackHeight
  return track.id === selectedTrack?.id ? trackHeightDetailSelected : trackHeightDetailUnselected;
}
