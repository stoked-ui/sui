import PropTypes from 'prop-types';
import {FileProviderProps} from './FileProvider.types';
import {useFileExplorerContext} from '../FileExplorerProvider/useFileExplorerContext';

function FileProvider(props: FileProviderProps) {
  const { children, itemId } = props;
  const { wrapItem, instance } = useFileExplorerContext<[]>();

  return wrapItem({ children, itemId, instance });
}

FileProvider.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  children: PropTypes.node,
  itemId: PropTypes.string.isRequired,
} as any;

export { FileProvider };
