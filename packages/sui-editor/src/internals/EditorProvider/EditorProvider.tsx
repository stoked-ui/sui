/**
 * Sets up the contexts for the underlying File components.
 *
 * @param {EditorProviderProps<TSignatures>} props - The props for the EditorProvider component.
 * @returns {JSX.Element} The EditorProvider component.
 *
 * @property {PropTypes.node} children - The children nodes to be rendered within EditorProvider.
 * @property {PropTypes.any} value - The value required for EditorProvider functionality.
 *
 * @example
 * <EditorProvider value={editorValue}>
 *    <ChildComponent />
 * </EditorProvider>
 *
 * @fires EditorContext.Provider
 * @see EditorContext
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
  children: PropTypes.node,
  value: PropTypes.any.isRequired,
} as any;

export { EditorProvider };
