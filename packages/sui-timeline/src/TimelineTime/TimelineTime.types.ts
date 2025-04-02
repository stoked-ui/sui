import * as React from 'react';
import {OnScrollParams} from 'react-virtualized';

/** Animation timeline component parameters */
export type TimelineTimeProps = {
  /** Left scroll distance */
  scrollLeft: number;
  /** Scroll callback, used for synchronous scrolling */
  onScroll: (params: OnScrollParams) => void;
  /** Set cursor position */
  getScaleRender?: (scale: number) => React.ReactNode;
  onClickTimeArea?: (time: number, e: React.MouseEvent<HTMLDivElement, MouseEvent>) => boolean | undefined;

};

