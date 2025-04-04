import * as React from 'react';
import { OnScrollParams } from 'react-virtualized';

/**
 * Animation timeline component parameters.
 *
 * This type defines the props that can be passed to the TimelineTime component.
 */
export type TimelineTimeProps = {
  /**
   * The left scroll distance.
   */
  scrollLeft: number;

  /**
   * A callback function used for synchronous scrolling.
   * @param params The OnScrollParams object containing information about the scroll event.
   */
  onScroll: (params: OnScrollParams) => void;

  /**
   * An optional callback function that returns a React node to set the cursor position.
   * @param scale The scale value.
   * @returns A React node to set the cursor position.
   */
  getScaleRender?: (scale: number) => React.ReactNode;

  /**
   * An optional callback function that handles click events on time areas.
   * @param time The current time.
   * @param e The mouse event object.
   * @returns A boolean value indicating whether to allow the event to proceed or cancel it.
   */
  onClickTimeArea?: (time: number, e: React.MouseEvent<HTMLDivElement, MouseEvent>) => boolean | undefined;
};