/**
 * Sets up the contexts for the underlying File components.
 *
 * @ignore - do not document.
 */
function EditorProvider<TSignatures extends readonly EditorAnyPluginSignature[]>(
  /**
   * Props required to set up the contexts for the underlying File components.
   * @see {EditorProviderProps}
   */
  props: EditorProviderProps<TSignatures>,
) {
  const { 
    /**
     * The value to be passed to the context.
     * This value is wrapped around a root element by the wrapRoot method.
     * @type {any}
     */
    value, 
    /**
     * Children elements that will be nested within the wrapped root element.
     * @type {React.ReactNode}
     */
    children
  } = props;

  return (
    <EditorContext.Provider value={value}>{value.wrapRoot({ children })}</EditorContext.Provider>
  );
}

/**
 * PropTypes validation for the EditorProvider component.
 *
 * @see {EditorProviderProps}
 */
EditorProvider.propTypes = {
  /**
   * Children elements that will be nested within the wrapped root element.
   * @type {React.ReactNode}
   */
  children: PropTypes.node,
  /**
   * The value to be passed to the context.
   * This value is required and must conform to the EditorAnyPluginSignature type.
   * @type {any}
   */
  value: PropTypes.any.isRequired,
} as any;