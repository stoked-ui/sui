import * as React from "react";
import {type ITimelineTrack} from "../TimelineTrack";
import {TimelineContextType, type TimelineState, type TimelineStateAction} from "./TimelineProvider.types";
import {ITimelineAction, type ITimelineFileAction} from "../TimelineAction";
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
  const { settings: {startLeft, scale, scaleWidth}, components, engine } = state;
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
    engine.reRender();
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
  console.log('setScaleCount', newScaleCount);
  dispatch({ type: 'SET_SETTING', payload: { key: 'scaleCount', value: newScaleCount } });
}

export const fitScaleData = (context: TimelineContextType, detailMode: boolean, newWidth?: number, from?: string)  => {
  const { state, dispatch } = context;
  const { settings, engine, flags } = state;
  const { startLeft, minScaleCount, scaleSplitCount, scale } = settings;

  if (detailMode && !flags.detailMode) {
    console.info('fitScaleData', from, 'detailMode early exit', detailMode, flags.detailMode);
    return null;
  } else {
    console.info('fitScaleData', from, minScaleCount, newWidth);
  }

  if (!newWidth) {
    throw new Error('fitScaleData')

    const timelineGrid = document.getElementById('timeline-grid');
    newWidth = timelineGrid.clientWidth;
  }

  const tracks = state.file?.tracks;
  if (!newWidth || !tracks?.length) {
    console.info('fitScaleData', '!newWidth || !tracks?.length');
    return null;
  }

  const getScale = () => {
    const scaleWidth = (newWidth - (startLeft * 2)) / engine.maxDuration;
    if (scaleWidth < 40) {
      const multiplier = Math.ceil(60 / scaleWidth);
      const newScale = (multiplier - 1) * 5;
      return { scaleWidth: scaleWidth * newScale, scaleSplitCount: 5, scale: newScale };
    }
    return { scaleWidth, scaleSplitCount, scale };
  }
  const scaleRes = getScale();
  if (scaleRes.scaleWidth === Infinity) {
    scaleRes.scaleWidth = DEFAULT_SCALE_WIDTH;
  }
  const maxScaleCount = getScaleCountByRows(tracks || [], { scale });

  const scaleData = {
    scaleSplitCount,
    maxScaleCount,
    ...scaleRes,
  }
  console.info('scaleData', scaleData);
  dispatch({type: 'SET_SETTING', payload: {value: {...scaleData}}});
  return scaleData;
}

export type TrackHeightScaleData = {
  shrinkScale: number,
  growScale: number,
  growUnselectedScale: number,
  growContainerScale: number
}

export const getHeightScaleData = (state: TimelineState): TrackHeightScaleData => {
  const { file, settings: { trackHeight, shrinkScalar, growScalar, growContainerScalar } } = state;
  const shrinkScale = (1 - (shrinkScalar / ((file?.tracks?.length ?? 2) - 1))) * trackHeight
  const growScale =  (growScalar * trackHeight) + trackHeight;
  const growContainerScale =  (growScalar * trackHeight) + trackHeight;
  const growUnselectedScale = (1 - (growScalar / ((file?.tracks?.length ?? 2) - 1))) * trackHeight
  return {
    shrinkScale,
    growScale,
    growUnselectedScale,
    growContainerScale
  }
}

export const getTrackHeight = (track: ITimelineTrack, state: TimelineState): number => {
  const { flags: { detailMode }, selectedTrack, settings } = state;
  const scaleData = settings.getHeightScaleData(state);
  if (!detailMode) {
    return settings.trackHeight;
  }
  return track.id === selectedTrack?.id ? scaleData.growScale : scaleData.growUnselectedScale;
}

export const getActionHeight = (action: ITimelineAction, state: TimelineState): number => {
  const { flags: { detailMode}, selectedAction, settings} = state;
  const scaleData = settings.getHeightScaleData(state);
  const selected = action.id === selectedAction?.id;
  if (!detailMode) {
    return selected ? settings.trackHeight : scaleData.shrinkScale;
  }
  return selected ? scaleData.growScale : scaleData.growUnselectedScale;
}

const isActionDim = (action: ITimelineAction, track: ITimelineTrack, state: TimelineState) => {
  const { flags,  selectedTrack, selectedAction } = state;

  // action is disabled
  if (action.disabled || track.dim) {
    return true;
  }

  // in detail mode
  if (flags.detailMode) {

    // an action is selected
    if (selectedAction) {

      // this action is selected
      if (selectedAction.id !== action.id) {
        return true;
      }

      // action unselected
      return false;
    }

    // a track is selected
    if (selectedTrack) {

      // this track is selected
      if (selectedTrack.id !== track.id) {
        return true;
      }

      // track unselected
      return false;
    }
  }

  return false;
}

export const refreshActionState = (action: ITimelineAction, track: ITimelineTrack, state: TimelineState) => {
  action.dim = isActionDim(action, track, state);
  return action;
}

const isTrackDim = (track: ITimelineTrack, state: TimelineState) => {
  const { flags, selectedTrack } = state;

  // in detail mode
  if (flags.detailMode) {

    // a track is selected
    if (selectedTrack) {

      // this track is selected
      if (selectedTrack.id !== track.id) {
        return true;
      }

      // track unselected
      return false;
    }
  }

  return false;
}

export const refreshTrackState = (track: ITimelineTrack, state: TimelineState) => {
  track.dim = isTrackDim(track, state);
  return track;
}
