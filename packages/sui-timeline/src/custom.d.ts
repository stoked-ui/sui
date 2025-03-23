// Type definitions for react-window
declare module 'react-window' {
  import * as React from 'react';

  export interface ListChildComponentProps {
    index: number;
    style: React.CSSProperties;
  }

  export interface GridChildComponentProps {
    columnIndex: number;
    rowIndex: number;
    style: React.CSSProperties;
  }

  export interface ListProps {
    children: React.ComponentType<ListChildComponentProps>;
    className?: string;
    height: number;
    width: number;
    itemCount: number;
    itemSize: number | ((index: number) => number);
    overscanCount?: number;
    style?: React.CSSProperties;
    onScroll?: (info: { scrollOffset: number; scrollDirection: 'forward' | 'backward' }) => void;
    scrollTo?: (scrollOffset: number) => void;
    resetAfterIndex?: (index: number, shouldForceUpdate?: boolean) => void;
    id?: string;
  }

  export interface GridProps {
    children: React.ComponentType<GridChildComponentProps>;
    className?: string;
    columnCount: number;
    columnWidth: number | ((index: number) => number);
    height: number;
    width: number;
    rowCount: number;
    rowHeight: number | ((index: number) => number);
    style?: React.CSSProperties;
    overscanRowCount?: number;
    overscanColumnCount?: number;
    estimatedColumnWidth?: number;
    estimatedRowHeight?: number;
    onScroll?: (info: { scrollLeft: number; scrollTop: number }) => void;
    scrollLeft?: number;
    id?: string;
  }

  export class VariableSizeList extends React.Component<ListProps> {
    scrollTo(offset: number): void;
    resetAfterIndex(index: number, shouldForceUpdate?: boolean): void;
  }

  export class VariableSizeGrid extends React.Component<GridProps> {
    resetAfterColumnIndex(index: number, shouldForceUpdate?: boolean): void;
    resetAfterRowIndex(index: number, shouldForceUpdate?: boolean): void;
    scrollTo({ scrollLeft, scrollTop }: { scrollLeft: number; scrollTop: number }): void;
  }
}

// Type definitions for react-resize-detector
declare module 'react-resize-detector' {
  import * as React from 'react';

  export interface UseResizeDetectorOptions {
    skipOnMount?: boolean;
    refreshMode?: 'debounce' | 'throttle';
    refreshRate?: number;
    refreshOptions?: {
      leading?: boolean;
      trailing?: boolean;
    };
    handleWidth?: boolean;
    handleHeight?: boolean;
    observerOptions?: ResizeObserverOptions;
  }

  export interface UseResizeDetectorReturn {
    width?: number;
    height?: number;
    ref: (element: HTMLElement | null) => void;
  }

  export function useResizeDetector<T extends HTMLElement = HTMLElement>(
    options?: UseResizeDetectorOptions
  ): UseResizeDetectorReturn;
}

// TypeScript interface for OnScrollParams used in TimelineTrackArea.tsx
interface OnScrollParams {
  scrollTop: number;
  scrollLeft: number;
  clientHeight: number;
  clientWidth: number;
  scrollHeight: number;
  scrollWidth: number;
} 