/**
 * EditorViewClasses interface defines the styling classes for EditorView component.
 * @typedef {object} EditorViewClasses
 * @property {string} root - Styles applied to the root element.
 * @property {string} [renderer] - Optional styling for the renderer.
 * @property {string} [preview] - Optional styling for the preview.
 */

/**
 * EditorViewClassKey type represents the keys of EditorViewClasses.
 * @typedef {keyof EditorViewClasses} EditorViewClassKey
 */

/**
 * Returns the utility class for the EditorView component based on the slot provided.
 * @param {string} slot - The slot for which the utility class is generated.
 * @returns {string} The utility class for the EditorView component.
 */
export function getEditorViewUtilityClass(slot: string): string {
  return generateUtilityClass('MuiEditorView', slot);
}

/**
 * editorViewClasses object contains all the utility classes for the EditorView component.
 * @type {EditorViewClasses}
 */
export const editorViewClasses: EditorViewClasses = generateUtilityClasses('MuiEditorView', [
  'root',
  'renderer',
  'preview'
]);
