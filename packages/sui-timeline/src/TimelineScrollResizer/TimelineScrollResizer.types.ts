import * as React from 'react';

export interface TimelineScrollResizerProps {
  type?: 'horizontal' | 'vertical';
  elementRef: React.RefObject<HTMLDivElement>;
  adjustScale?: (value: number) => boolean;
}
