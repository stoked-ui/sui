/**
 * Sets up the contexts for the underlying File components.
 *
 * @param {FileExplorerProviderProps} props - The props for the FileExplorerProvider component.
 * @param {React.ReactNode} props.children - The children nodes to be wrapped by the provider.
 * @param {any} props.value - The value to be provided by the context.
 * 
 * @returns {JSX.Element} The JSX element representing the FileExplorerProvider component.
 */
function FileExplorerProvider(props) {
  const { value, children } = props;

  return (
    <FileExplorerContext.Provider value={value}>
      {value.wrapRoot({ children })}
    </FileExplorerContext.Provider>
  );
}

FileExplorerProvider.propTypes = {
  children: PropTypes.node,
  value: PropTypes.any.isRequired,
} as any;

export { FileExplorerProvider };
