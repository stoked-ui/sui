/**
 * Custom hook to access the editor context values.
 * @returns {EditorContextType} The editor context values.
 */
export function useEditorContext(): EditorContextType {
  const context = React.useContext(TimelineContext);
  if (!context) {
    throw new Error("useEditorContext must be used within an EditorProvider");
  }
  return context as EditorContextType;
}