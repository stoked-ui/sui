import {ITimelineTrack} from "../TimelineTrack/TimelineTrack.types";
import {type ITimelineAction} from "../TimelineAction/TimelineAction.types";
import {ADD_SCALE_COUNT} from "../interface/const";
import { IController } from "../Controller";

/**
 * Calculates the time to pixel based on the data and parameter.
 * @param data - The data to convert to pixel
 * @param param - An object containing startLeft, scale, and scaleWidth properties
 * @returns The calculated pixel value
 */
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

/**
 * Calculates the pixel to time based on the data and parameter.
 * @param data - The data to convert to time
 * @param param - An object containing startLeft, scale, and scaleWidth properties
 * @returns The calculated time value
 */
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

/**
 * Calculates the position width turn start end based on the data and parameter.
 * @param data - An object containing left and width properties
 * @param param - An object containing startLeft, scale, and scaleWidth properties
 * @returns An object containing the start and end time values
 */
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

/**
 * Calculates the start end to position width based on the data and parameter.
 * @param data - An object containing start and end properties
 * @param param - An object containing startLeft, scale, and scaleWidth properties
 * @returns An object containing the left and width values
 */
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

/**
 * Gets the number of scales based on the data and parameter.
 * @param tracks - An array of timeline track objects
 * @param param - An object containing scale property
 * @returns The calculated scale count
 */
export function getScaleCountByRows<
  ActionType extends ITimelineAction = ITimelineAction,
>(tracks: ITimelineTrack<ActionType>[], param: { scale: number }) {
  let max = 0;
  tracks?.forEach((track) => {
    track?.actions.forEach((action) => {
      max = Math.max(max, action.end);
    });
  });
  const count = Math.ceil(max / param.scale);
  return count + 2;
}

/**
 * Gets the current tick number based on time.
 * @param data - The pixel value to convert
 * @param param - An object containing startLeft, scaleWidth, and scaleCount properties
 * @returns The calculated tick number
 */
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

/**
 * Gets the position collection of the entire time of the action.
 * @param actions - An array of timeline action objects
 * @param param - An object containing startLeft, scale, and scaleWidth properties
 * @returns An array of position values
 */
export function parserActionsToPositions<
  ActionType extends ITimelineAction = ITimelineAction,
>(
  actions: ActionType[],
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