import * as React from 'react';
import {CommonProps} from "../interface/common_prop";

export type TimelineTimeAreaProps = CommonProps & React.HTMLAttributes<HTMLDivElement> & {
  /** Left scroll distance */
  scrollLeft: number;
  /** Scroll callback, used for synchronous scrolling */
  // onScroll: (params: OnScrollParams) => void;
  /** Set cursor position */
  setCursor: (param: { left?: number; time?: number }) => void;
};

export type TimeAreaState = {

}
