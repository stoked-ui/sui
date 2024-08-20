/**
 *Basic parameters of the action
 * @export
 * @interface TimelineAction
 */
export interface TimelineAction {
  /** action id */
  id: string;
  /** Action start time */
  start: number;
  /** Action end time */
  end: number;
  /** The effectId corresponding to the action */
  effectId: string;

  /** Whether the action is selected */
  selected?: boolean;
  /** Whether the action is scalable */
  flexible?: boolean;
  /** Whether the action is movable */
  movable?: boolean;
  /** Whether the action is prohibited from running */
  disable?: boolean;

  /** Minimum start time limit for actions */
  minStart?: number;
  /** Maximum end time limit of action */
  maxEnd?: number;

  data?: {
    src: string;
    name: string;
  } | any;
}

/**
 *Basic parameters of action lines
 * @export
 * @interface TimelineTrack
 */
export interface TimelineTrack {
  /** Action track id */
  id: string;
  /** Row action list */
  actions: TimelineAction[];
  /** Customize track height */
  rowHeight?: number;
  /** Whether the track is selected */
  selected?: boolean;
  /** Extended class name of track */
  classNames?: string[];
}
