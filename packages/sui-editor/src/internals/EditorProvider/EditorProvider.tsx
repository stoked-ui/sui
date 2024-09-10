import * as React from 'react';
import {EditorProviderProps} from './EditorProvider.types';
import {EditorContext} from './EditorContext';
import {EditorAnyPluginSignature} from '../models';

/**
 * Sets up the contexts for the underlying File components.
 *
 * @ignore - do not document.
 */
export function EditorProvider<TSignatures extends readonly EditorAnyPluginSignature[]>(
  props: EditorProviderProps<TSignatures>,
) {
  const { value, children } = props;

  return (
    <EditorContext.Provider value={value}>
      {value.wrapRoot({ children })}
    </EditorContext.Provider>
  );
}
