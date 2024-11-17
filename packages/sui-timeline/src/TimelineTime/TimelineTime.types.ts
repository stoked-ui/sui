import {OnScrollParams} from 'react-virtualized';
import {CommonProps} from '../interface/common_prop';

/** Animation timeline component parameters */
export type TimelineTimeProps = CommonProps & {
  /** Left scroll distance */
  scrollLeft: number;
  /** Scroll callback, used for synchronous scrolling */
  onScroll: (params: OnScrollParams) => void;
  /** Set cursor position */
  setCursor: (param: { left?: number; time?: number }) => void;
};
