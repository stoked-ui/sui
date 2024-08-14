import { EditData } from "../Timeline/Timeline.type";

/** Component public parameters */
export interface CommonProp extends EditData {
  /** Number of scales */
  scaleCount: number;
  /** Set the number of scales */
  setScaleCount: (scaleCount: number) => void;
  /** Cursor time */
  cursorTime: number;
  /** Current timeline width */
  timelineWidth: number;
}
