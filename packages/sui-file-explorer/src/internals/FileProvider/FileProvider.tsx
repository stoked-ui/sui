/**
 * @file Overview of the FileProvider component
 *
 * The FileProvider component is responsible for providing a file explorer context to its children.
 *
 * @category Components
 */

import PropTypes from 'prop-types';
import { FileProviderProps } from './FileProvider.types';
import { useFileExplorerContext } from '../FileExplorerProvider/useFileExplorerContext';

/**
 * @interface FileProviderProps
 *
 * @description The props type for the FileProvider component.
 *
 * @property {React.ReactNode} children - The child elements of the FileProvider component.
 * @property {string} id - The unique identifier for the file explorer context.
 */
function FileProvider(props: FileProviderProps) {
  /**
   * Extracts the children and id props from the FileProvider component.
   *
   * @throws {TypeError} If the props are not provided.
   */
  const { children, id } = props;
  const { wrapItem, instance } = useFileExplorerContext<[]>();

  return wrapItem({ children, id, instance });
}

/**
 * @function FileProvider
 *
 * @description The main function of the FileProvider component.
 *
 * @param {object} props - The props for the FileProvider component.
 * @param {React.ReactNode} props.children - The child elements of the FileProvider component.
 * @param {string} props.id - The unique identifier for the file explorer context.
 *
 * @returns {React.ReactElement} The wrapped item with the provided children and id.
 */
FileProvider.propTypes = {
  /**
   * The child elements of the FileProvider component.
   */
  children: PropTypes.node,

  /**
   * The unique identifier for the file explorer context.
   */
  id: PropTypes.string.isRequired,
} as any;

export { FileProvider };