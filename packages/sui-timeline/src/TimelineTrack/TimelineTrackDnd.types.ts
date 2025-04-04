/**
 * Type representing the data for a drag event.
 */
type EventData = {
  /**
   * The last left position of the element.
   */
  lastLeft: number;
  /**
   * The current left position of the element.
   */
  left: number;
  /**
   * The last width of the element.
   */
  lastWidth: number;
  /**
   * The current width of the element.
   */
  width: number;
};

/**
 * Type representing a callback function for when drag starts.
 */
export type RndDragStartCallback = () => void;

/**
 * Type representing a callback function for when drag occurs.
 * @param data The data associated with the drag event.
 * @param scrollDelta The amount of scrolling that occurred during the drag.
 * @returns A boolean indicating whether the drag should be allowed to continue, or null/void if not.
 */
export type RndDragCallback = (
  data: EventData,
  scrollDelta?: number,
) => boolean | void;

/**
 * Type representing a callback function for when drag ends.
 * @param data The data associated with the drag event, limited to 'left' and 'width'.
 */
export type RndDragEndCallback = (data: Pick<EventData, 'left' | 'width'>) => void;

/**
 * Type representing the direction of a resize operation.
 */
export type Direction = "left" | "right";

/**
 * Type representing a callback function for when a resize starts.
 * @param dir The direction of the resize operation.
 */
export type RndResizeStartCallback = (dir: Direction) => void;

/**
 * Type representing a callback function for when a resize occurs.
 * @param dir The direction of the resize operation.
 * @param data The data associated with the resize event.
 * @returns A boolean indicating whether the resize should be allowed to continue, or null/void if not.
 */
export type RndResizeCallback = (
  dir: Direction,
  data: EventData
) => boolean | void;

/**
 * Type representing a callback function for when a resize ends.
 * @param dir The direction of the resize operation.
 * @param data The data associated with the resize event, limited to 'left' and 'width'.
 */
export type RndResizeEndCallback = (
  dir: Direction,
  data: Pick<EventData, 'left' | 'width'>
) => void;

/**
 * Interface representing the API for a row in a rounded drag and drop component.
 */
export interface RowRndApi {
  /**
   * Updates the width of the element.
   * @param size The new width of the element.
   */
  updateWidth: (size: number) => void;
  
  /**
   * Updates the left position of the element.
   * @param left The new left position of the element.
   */
  updateLeft: (left: number) => void;
  
  /**
   * Gets the current left position of the element.
   * @returns The current left position of the element.
   */
  getLeft: () => number;
  
  /**
   * Gets the current width of the element.
   * @returns The current width of the element.
   */
  getWidth: () => number;
}

/**
 * Interface representing the props for a row in a rounded drag and drop component.
 */
export interface RowRndProps {
  /**
   * The initial width of the element.
   */
  width?: number;
  
  /**
   * The initial left position of the element.
   */
  left?: number;
  
  /**
   * The grid size.
   */
  grid?: number;
  
  /**
   * The start position of the drag operation.
   */
  start?: number;
  
  /**
   * The bounds of the element, in pixels.
   */
  bounds?: { left: number; right: number };
  
  /**
   * The edges of the element, either 'left' or 'right'.
   */
  edges?: {left: boolean | string, right: boolean | string};
  
  /**
   * Callback function for when a resize operation starts.
   */
  onResizeStart?: RndResizeStartCallback;
  
  /**
   * Callback function for when a resize operation occurs.
   */
  onResize?: RndResizeCallback;
  
  /**
   * Callback function for when a resize operation ends.
   */
  onResizeEnd?: RndResizeEndCallback;
  
  /**
   * The parent element, or null if none is specified.
   */
  parentRef?: React.MutableRefObject<HTMLDivElement>;
  
  /**
   * A callback function that handles the scrolling delta.
   */
  // Automatic scrolling will be started when parentRef and deltaScrollLeft are passed in at the same time.
  deltaScrollLeft?: (delta: number) => void;
  
  /**
   * The child elements to render inside the rounded drag and drop component.
   */
  children?: React.ReactNode;
  
  /**
   * Whether resizing is enabled or not.
   */
  enableResizing?: boolean;
  
  /**
   * Whether dragging is enabled or not.
   */
  enableDragging?: boolean;
  
  /**
   * The positions of the adsorption points, relative to the left edge of the element.
   */
  adsorptionPositions?: number[];
  
  /**
   * The distance from the left edge of the element where the first adsorption point should be placed.
   */
  adsorptionDistance?: number;
}