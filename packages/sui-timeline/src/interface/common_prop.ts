import {TimelineControlProps} from "../TimelineControl/TimelineControlProps";

/** Component public parameters */
export interface CommonProps extends TimelineControlProps {
  /** Number of scales */
  scaleCount: number;
  /** Set the number of scales */
  setScaleCount: (scaleCount: number) => void;
  /** Cursor time */
  cursorTime: number;
  /** Current timeline width */
  timelineWidth: number;
}
