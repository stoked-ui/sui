import * as React from 'react';
import { VideoEditorProviderProps } from './VideoEditorProvider.types';
import { VideoEditorContext } from './VideoEditorContext';
import { VideoEditorAnyPluginSignature } from '../models';

/**
 * Sets up the contexts for the underlying File components.
 *
 * @ignore - do not document.
 */
export function VideoEditorProvider<TSignatures extends readonly VideoEditorAnyPluginSignature[]>(
  props: VideoEditorProviderProps<TSignatures>,
) {
  const { value, children } = props;

  return (
    <VideoEditorContext.Provider value={value}>
      {value.wrapRoot({ children })}
    </VideoEditorContext.Provider>
  );
}
