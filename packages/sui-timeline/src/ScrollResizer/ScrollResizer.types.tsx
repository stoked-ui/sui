import * as React from "react";

export interface ScrollResizerProps {
  parentRef: React.RefObject<HTMLElement>;
  selector: string;
  minScale?: number;
  maxScale?: number;
  scale?: number;
  setScale?: (value: number) => void;
  setHorizontalScroll?: (value: number) => void;
  setScrollThumbPosition: (thumbPos: number) => void;
  scrollThumbPosition: number;
}
