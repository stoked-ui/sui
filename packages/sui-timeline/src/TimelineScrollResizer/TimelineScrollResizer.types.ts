import * as React from 'react';

export interface TimelineScrollResizerProps {
  type?: 'horizontal' | 'vertical';
  element: React.MutableRefObject<HTMLDivElement>
  adjustScale?: (value: number) => boolean;
}
