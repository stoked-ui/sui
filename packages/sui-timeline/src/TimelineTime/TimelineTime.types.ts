import {OnScrollParams} from 'react-virtualized';
import {CommonProps} from '../interface/common_prop';
import * as React from "react";
import type { TimelineState } from "../Timeline";

/** Animation timeline component parameters */
export type TimelineTimeProps = CommonProps & {
  /** Left scroll distance */
  scrollLeft: number;
  /** Scroll callback, used for synchronous scrolling */
  onScroll: (params: OnScrollParams) => void;
  /** Set cursor position */
  setCursor: (param: { left?: number; time?: number }) => void;

  timelineState?: React.RefObject<TimelineState>;
};
