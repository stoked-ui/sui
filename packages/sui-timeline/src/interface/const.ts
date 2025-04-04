/**
 * Timeline prefix
 *
 * @constant {string}
 */
export const PREFIX = `timeline`;

/**
 * The time where the cursor is at the beginning
 *
 * @constant {number}
 */
export const START_CURSOR_TIME = 0;

/**
 * Default scale
 *
 * @constant {number}
 * @description The default scale value.
 */
export const DEFAULT_SCALE = 1;

/**
 * Default number of scale divisions
 *
 * @constant {number}
 * @description The default number of scale divisions.
 */
export const DEFAULT_SCALE_SPLIT_COUNT = 10;

/**
 * Default scale count
 *
 * @constant {number}
 * @description The default number of scales.
 */
export const DEFAULT_SCALE_COUNT = 10;

/**
 * Default scale display width
 *
 * @constant {number}
 * @description The default width of the scale display.
 */
export const DEFAULT_SCALE_WIDTH = 100;

/**
 * Default starting distance on the left side of the scale
 *
 * @constant {number}
 * @description The default distance from the start of the timeline to the left side.
 */
export const DEFAULT_START_LEFT = 7;

/**
 * Default minimum pixel movement
 *
 * @constant {number}
 * @description The minimum amount of movement allowed in pixels.
 */
export const DEFAULT_MOVE_GRID = 1;

/**
 * Default adsorption pixel
 *
 * @constant {number}
 * @description The default number of pixels to absorb before applying a scale change.
 */
export const DEFAULT_ADSORPTION_DISTANCE = 8;

/**
 * Default action track height
 *
 * @constant {number}
 * @description The default height of the action track.
 */
export const DEFAULT_TRACK_HEIGHT = 36;

/**
 * Default mobile action track height
 *
 * @constant {number}
 * @description The default height of the mobile action track.
 */
export const DEFAULT_MOBILE_TRACK_HEIGHT = 60;

/**
 * New action initial duration
 *
 * @constant {number}
 * @description The duration of a new action from start to end.
 */
export const NEW_ACTION_DURATION = 2;

/**
 * Minimum number of scales
 *
 * @constant {number}
 * @description The minimum number of scales required for a valid timeline.
 */
export const MIN_SCALE_COUNT = 40;

/**
 * The number of new scales added each time
 *
 * @constant {number}
 * @description The number of new scales to add at a single time.
 */
export const ADD_SCALE_COUNT = 5;

/**
 * Error messages
 *
 * @enum {string}
 */
export const ERROR = {
  /**
   * Action start time cannot be less than 0!
   *
   * @constant {string}
   */
  START_TIME_LESS_THEN_ZERO: 'Action start time cannot be less than 0!',

  /**
   * Action end time cannot be less then start time!
   *
   * @constant {string}
   */
  END_TIME_LESS_THAN_START_TIME: 'Action end time cannot be less than start time!',
};