export const PREFIX = `timeline`;

/** The time where the cursor is at the beginning */
export const START_CURSOR_TIME = 0;
/**Default scale */
export const DEFAULT_SCALE = 1;
/** Default number of scale divisions */
export const DEFAULT_SCALE_SPLIT_COUNT = 10;

export const DEFAULT_SCALE_COUNT = 10;

/** Default scale display width */
export const DEFAULT_SCALE_WIDTH = 100;
/** Default starting distance on the left side of the scale */
export const DEFAULT_START_LEFT = 7;
/** Default minimum pixel movement */
export const DEFAULT_MOVE_GRID = 1;
/** Default adsorption pixel */
export const DEFAULT_ADSORPTION_DISTANCE = 8;
/** Default action track height */
export const DEFAULT_TRACK_HEIGHT = 36;
/** Default mobile action track height */
export const DEFAULT_MOBILE_TRACK_HEIGHT = 60;
/** New action initial duration */
export const NEW_ACTION_DURATION = 2;
/** Minimum number of scales */
export const MIN_SCALE_COUNT = 40;
/** The number of new scales added each time */
export const ADD_SCALE_COUNT = 5;

/** error message */
export const ERROR = {
  START_TIME_LESS_THEN_ZERO: 'Action start time cannot be less than 0!',
  END_TIME_LESS_THEN_START_TIME: 'Action end time cannot be less then start time!',
}
