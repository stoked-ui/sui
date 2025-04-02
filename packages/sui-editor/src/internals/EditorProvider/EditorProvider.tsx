import * as React from 'react';
import PropTypes from 'prop-types';
import { EditorProviderProps } from './EditorProvider.types';
import { EditorContext } from './EditorContext';
import { EditorAnyPluginSignature } from '../models';

/**
 * Sets up the contexts for the underlying File components.
 *
 * @ignore - do not document.
 */
function EditorProvider<TSignatures extends readonly EditorAnyPluginSignature[]>(
  props: EditorProviderProps<TSignatures>,
) {
  const { value, children } = props;

  return (
    <EditorContext.Provider value={value}>{value.wrapRoot({ children })}</EditorContext.Provider>
  );
}

EditorProvider.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  children: PropTypes.node,
  value: PropTypes.any.isRequired,
} as any;

export { EditorProvider };

