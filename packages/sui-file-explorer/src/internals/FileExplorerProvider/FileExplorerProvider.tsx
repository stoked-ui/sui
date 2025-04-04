import * as React from 'react';
import PropTypes from 'prop-types';
import { FileExplorerProviderProps } from './FileExplorerProvider.types';
import { FileExplorerContext } from './FileExplorerContext';
import { FileExplorerAnyPluginSignature } from '../models';

/**
 * @interface FileExplorerProvider
 * Sets up the contexts for the underlying File components.
 *
 * @property {FileExplorerProviderProps} props - The properties passed to this provider.
 * @property {any} value - The value provided by the parent component.
 * @returns {JSX.Element} The JSX element representing the File Explorer Provider.
 */
function FileExplorerProvider<TSignatures extends readonly FileExplorerAnyPluginSignature[]>(
  /**
   * @param {FileExplorerProviderProps<TSignatures>} props
   * @description Props for the File Explorer Provider.
   *
   * @property {any} value - The value provided by the parent component.
   */
  props: FileExplorerProviderProps<TSignatures>,
) {
  const { value, children } = props;

  /**
   * @returns {JSX.Element}
   */
  return (
    <FileExplorerContext.Provider value={value}>
      {/**
       * Wrap the root element with a context provider.
       *
       * @param {Object} options
       * @description Options for wrapping the root element.
       *
       * @property {React.ReactNode} children - The children to wrap.
       */
      value.wrapRoot({ children })}
    </FileExplorerContext.Provider>
  );
}

/**
 * @interface FileExplorerProviderProps
 * Props for the File Explorer Provider.
 *
 * @property {any} value - The value provided by the parent component.
 * @property {React.ReactNode} children - The children to wrap.
 */
FileExplorerProvider.propTypes = {
  /**
   * @description The children to wrap with a context provider.
   */
  children: PropTypes.node,
  /**
   * @description The value provided by the parent component.
   */
  value: PropTypes.any.isRequired,
} as any;

export { FileExplorerProvider };