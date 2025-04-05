/**
 * @ignore - internal component.
 */
export const EditorContext = React.createContext<EditorContextValue<any, []> | null>(null);

if (process.env.NODE_ENV !== 'production') {
  EditorContext.displayName = 'EditorContext';
}
*/