/**
 * Component that provides file-related functionality to its children.
 * @description This component wraps the children with file-related context.
 * @param {Object} props - The props for the FileProvider component.
 * @property {React.ReactNode} props.children - The children components to be wrapped.
 * @property {string} props.id - The unique identifier for the file.
 * @returns {JSX.Element} The wrapped children with file-related context.
 * @example
 * <FileProvider id="123">
 *    <FileExplorer />
 * </FileProvider>
 * @fires {wrapItem} Emits the wrapped children with file-related context.
 * @see useFileExplorerContext
 */
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