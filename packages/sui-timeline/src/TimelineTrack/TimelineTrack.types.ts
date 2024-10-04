import { type ITimelineAction } from '../TimelineAction/TimelineAction.types';

/**
 *Basic parameters of action lines
 * @export
 * @interface ITimelineTrack
 */
export interface ITimelineTrack {
  /** Action track id */
  id: string;

  name?: string;
  /** Row action list */
  actions: ITimelineAction[];
  /** Customize track height */
  rowHeight?: number;
  /** Whether the track is selected */
  selected?: boolean;
  /** Extended class name of track */
  classNames?: string[];
  /** Whether the action is hidden */
  hidden?: boolean;
  /** Whether the action is hidden */
  lock?: boolean;

  actionRef: ITimelineAction;
}
