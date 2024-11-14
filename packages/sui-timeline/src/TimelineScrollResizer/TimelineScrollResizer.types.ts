import * as React from 'react';
import { ScrollSync } from 'react-virtualized';

export interface TimelineScrollResizerProps {
  type?: 'horizontal' | 'vertical';
  scrollSync: React.RefObject<ScrollSync>
  adjustScale?: (value: number) => boolean;
}
