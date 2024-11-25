import * as React from 'react';

export interface TimelineScrollResizerProps {
  type?: 'horizontal' | 'vertical';
  elementRef: React.MutableRefObject<HTMLDivElement>;
  adjustScale?: (value: number) => boolean;
}
