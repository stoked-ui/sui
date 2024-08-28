import * as React from "react";
import {CommonProps} from "../interface/common_prop";
import {EditData, TimelineTrack} from "../TimelineControl/TimelineControl.types";
import {DragLineData} from "../DragLines/DragLines.types";

export type TimelineTrackRowProps = CommonProps & EditData & {
  areaRef: React.MutableRefObject<HTMLDivElement>;
  rowData?: TimelineTrack;
  style?: React.CSSProperties;
  dragLineData: DragLineData;
  setEditorData: (tracks: TimelineTrack[]) => void;
  /** scroll distance from left */
  scrollLeft: number;
  /** setUp scroll left */
  deltaScrollLeft: (scrollLeft: number) => void;
};
