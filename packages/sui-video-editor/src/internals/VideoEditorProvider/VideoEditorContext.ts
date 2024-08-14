import * as React from 'react';
import { VideoEditorContextValue } from './VideoEditorProvider.types';

/**
 * @ignore - internal component.
 */
export const VideoEditorContext = React.createContext<VideoEditorContextValue<any, []> | null>(null);

if (process.env.NODE_ENV !== 'production') {
  VideoEditorContext.displayName = 'VideoEditorContext';
}
