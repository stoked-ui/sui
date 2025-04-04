import * as React from 'react';
import {EditorAnyPluginSignature} from '../models';
import {EditorContext} from './EditorContext';
import {EditorContextValue} from './EditorProvider.types';

/**
 * Provides a custom hook for accessing the Editor Context.
 *
 * @template TSignatures - The type of signatures expected in the context
 * @template TOptionalSignatures - The type of optional signatures expected in the context
 * @returns A function that returns the Editor Context value
 */
export const useTimeline<TSignatures extends readonly EditorAnyPluginSignature[], TOptionalSignatures extends readonly EditorAnyPluginSignature[] = []>() {
  /**
   * Retrieves the Editor Context.
   *
   * @throws An error if the Editor View context cannot be found.
   */
  const context = React.useContext(EditorContext) as EditorContextValue<TSignatures, TOptionalSignatures>;
  if (context == null) {
    throw new Error([
      'SUI X: Could not find the Editor View context.',
      'It looks like you rendered your component outside of a EditorBasic or Editor parent component.',
      'This can also happen if you are bundling multiple versions of the Editor View.',
    ].join('\n'));
  }

  return context;
};