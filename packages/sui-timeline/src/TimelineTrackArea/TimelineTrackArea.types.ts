import * as React from "react";
import { CommonProps } from "../interface/common_prop";

export type TimelineTrackAreaProps = React.HTMLAttributes<HTMLDivElement> & CommonProps & {
  scrollSyncNode: React.RefObject<HTMLElement>
};

/** edit area ref data */
export interface TimelineTrackAreaState {
  domRef: React.MutableRefObject<HTMLDivElement>;
}
