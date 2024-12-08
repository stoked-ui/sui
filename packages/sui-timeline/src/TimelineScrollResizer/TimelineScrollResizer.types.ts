import * as React from 'react';

export interface TimelineScrollResizerProps {
  type?: 'horizontal' | 'vertical';
  elementId: string;
  adjustScale?: (value: number) => boolean;
}
