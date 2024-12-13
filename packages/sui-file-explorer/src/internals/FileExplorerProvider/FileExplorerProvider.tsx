import * as React from 'react';
import PropTypes from 'prop-types';
import { FileExplorerProviderProps } from './FileExplorerProvider.types';
import { FileExplorerContext } from './FileExplorerContext';
import { FileExplorerAnyPluginSignature } from '../models';

/**
 * Sets up the contexts for the underlying File components.
 *
 * @ignore - do not document.
 */
function FileExplorerProvider<TSignatures extends readonly FileExplorerAnyPluginSignature[]>(
  props: FileExplorerProviderProps<TSignatures>,
) {
  const { value, children } = props;

  return (
    <FileExplorerContext.Provider value={value}>
      {value.wrapRoot({ children })}
    </FileExplorerContext.Provider>
  );
}

FileExplorerProvider.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  children: PropTypes.node,
  value: PropTypes.any.isRequired,
} as any;

export { FileExplorerProvider };
