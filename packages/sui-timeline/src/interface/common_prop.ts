import * as React from 'react';
import { TimelineBaseProps } from "../Timeline/Timeline.types";

/** Component public parameters */
export interface CommonProps extends TimelineBaseProps {
  /** Number of scales */
  scaleCount: number;
  /** Set the number of scales */
  setScaleCount: (scaleCount: number) => void;
  /** Cursor time */
  cursorTime: number;
  /** Current timeline width */
  timelineWidth: number;
  /** root item to sync to */
}
