import PropTypes from 'prop-types';
import { FileProviderProps } from './FileProvider.types';
import { useFileExplorerContext } from '../FileExplorerProvider/useFileExplorerContext';

function FileProvider(props: FileProviderProps) {
  const { children, id } = props;
  const { wrapItem, instance } = useFileExplorerContext<[]>();

  return wrapItem({ children, id, instance });
}

FileProvider.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  children: PropTypes.node,
  id: PropTypes.string.isRequired,
} as any;

export { FileProvider };
