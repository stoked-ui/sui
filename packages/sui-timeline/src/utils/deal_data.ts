import { TimelineAction, TimelineTrack } from "../interface/action";
import { ADD_SCALE_COUNT } from "../interface/const";

/** time to pixel */
export function parserTimeToPixel(
  data: number,
  param: {
    startLeft: number;
    scale: number;
    scaleWidth: number;
  }
) {
  const { startLeft, scale, scaleWidth } = param;
  return startLeft + (data / scale) * scaleWidth;
}

/** pixel to time */
export function parserPixelToTime(
  data: number,
  param: {
    startLeft: number;
    scale: number;
    scaleWidth: number;
  }
) {
  const { startLeft, scale, scaleWidth } = param;
  return ((data - startLeft) / scaleWidth) * scale;
}

/** position width turn start end */
export function parserTransformToTime(
  data: {
    left: number;
    width: number;
  },
  param: {
    startLeft: number;
    scale: number;
    scaleWidth: number;
  }
) {
  const { left, width } = data;
  const start = parserPixelToTime(left, param);
  const end = parserPixelToTime(left + width, param);
  return {
    start,
    end,
  };
}

/** start end to position width */
export function parserTimeToTransform(
  data: {
    start: number;
    end: number;
  },
  param: {
    startLeft: number;
    scale: number;
    scaleWidth: number;
  }
) {
  const { start, end } = data;
  const left = parserTimeToPixel(start, param);
  const width = parserTimeToPixel(end, param) - left;
  return {
    left,
    width,
  };
}
/** Get the number of scales based on data */
export function getScaleCountByRows(tracks: TimelineTrack[], param: { scale: number }) {
  let max = 0;
  tracks.forEach((track) => {
    track.actions.forEach((action) => {
      max = Math.max(max, action.end);
    });
  });
  const count = Math.ceil(max / param.scale);
  return count + ADD_SCALE_COUNT;
}

/** Get the current tick number based on time */
export function getScaleCountByPixel(
  data: number,
  param: {
    startLeft: number;
    scaleWidth: number;
    scaleCount: number;
  }
) {
  const { startLeft, scaleWidth } = param;
  const count = Math.ceil((data - startLeft) / scaleWidth);
  return Math.max(count + ADD_SCALE_COUNT, param.scaleCount);
}

/** Get the position collection of the entire time of the action */
export function parserActionsToPositions(
  actions: TimelineAction[],
  param: {
    startLeft: number;
    scale: number;
    scaleWidth: number;
  }
) {
  const positions: number[] = [];
  actions.forEach((item) => {
    positions.push(parserTimeToPixel(item.start, param));
    positions.push(parserTimeToPixel(item.end, param));
  });
  return positions;
}
