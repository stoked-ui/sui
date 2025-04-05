/**
 * Data structure for event related data
 * @typedef {Object} EventData
 * @property {number} lastLeft - The previous left position
 * @property {number} left - The current left position
 * @property {number} lastWidth - The previous width
 * @property {number} width - The current width
 */

/**
 * Callback function for the start of dragging
 * @typedef {Function} RndDragStartCallback
 * @returns {void}
 */

/**
 * Callback function for dragging
 * @typedef {Function} RndDragCallback
 * @param {EventData} data - The event data
 * @param {number} [scrollDelta] - Optional scroll delta value
 * @returns {boolean|void}
 */

/**
 * Callback function for the end of dragging
 * @typedef {Function} RndDragEndCallback
 * @param {Object} data - The data object with left and width properties
 */

/**
 * Represents the direction - left or right
 * @typedef {"left"|"right"} Direction
 */

/**
 * Callback function for the start of resizing
 * @typedef {Function} RndResizeStartCallback
 * @param {Direction} dir - The direction of resizing
 * @returns {void}
 */

/**
 * Callback function for resizing
 * @typedef {Function} RndResizeCallback
 * @param {Direction} dir - The direction of resizing
 * @param {EventData} data - The event data
 * @returns {boolean|void}
 */

/**
 * Callback function for the end of resizing
 * @typedef {Function} RndResizeEndCallback
 * @param {Direction} dir - The direction of resizing
 * @param {Object} data - The data object with left and width properties
 */

/**
 * Interface for RowRndApi
 * @interface RowRndApi
 */
export interface RowRndApi {
  /**
   * Updates the width of the row
   * @param {number} size - The new width value
   */
  updateWidth: (size: number) => void;
  /**
   * Updates the left position of the row
   * @param {number} left - The new left position value
   */
  updateLeft: (left: number) => void;
  /**
   * Retrieves the current left position of the row
   * @returns {number} - The current left position value
   */
  getLeft: () => number;
  /**
   * Retrieves the current width of the row
   * @returns {number} - The current width value
   */
  getWidth: () => number;
}

/**
 * Props interface for RowRnd component
 * @interface RowRndProps
 */
export interface RowRndProps {
  width?: number;
  left?: number;
  grid?: number;
  start?: number;
  bounds?: { left: number; right: number };
  edges?: {left: boolean | string, right: boolean | string};

  onResizeStart?: RndResizeStartCallback;
  onResize?: RndResizeCallback;
  onResizeEnd?: RndResizeEndCallback;
  onDragStart?: RndDragStartCallback;
  onDrag?: RndDragCallback;
  onDragEnd?: RndDragEndCallback;
  
  /**
   * Reference to the parent element for automatic scrolling
   */
  parentRef?: React.MutableRefObject<HTMLDivElement>;
  /**
   * Function to handle delta scroll left
   * @param {number} delta - The delta scroll value
   */
  deltaScrollLeft?: (delta: number) => void;

  children?: React.ReactNode;

  enableResizing?: boolean;
  enableDragging?: boolean;
  adsorptionPositions?: number[];
  adsorptionDistance?: number;
}