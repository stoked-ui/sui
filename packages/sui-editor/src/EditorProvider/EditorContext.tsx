/**
 * Custom hook to access the EditorContext.
 *
 * @returns The current EditorContext.
 */
export function useEditorContext(): EditorContextType {
  const context = React.useContext(TimelineContext);
  if (!context) {
    throw new Error("useEditorContext must be used within an EditorProvider");
  }
  return context as EditorContextType;
}