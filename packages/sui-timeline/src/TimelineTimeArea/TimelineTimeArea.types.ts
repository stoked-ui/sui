import {CommonProps} from "../interface/common_prop";
import {OnScrollParams} from "react-virtualized";

export type TimelineTimeAreaProps = CommonProps & {
  /** Left scroll distance */
  scrollLeft: number;
  /** Scroll callback, used for synchronous scrolling */
  onScroll: (params: OnScrollParams) => void;
  /** Set cursor position */
  setCursor: (param: { left?: number; time?: number }) => void;
};
