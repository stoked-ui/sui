/**
 * Exporting the main Editor component and related utilities.
 */

import Editor from './Editor';
import StokedUiEditorApp from './StokedUiEditorApp';

/**
 * Main Editor export
 */
export default Editor;

/**
 * Secondary export of StokedUiEditorApp for compatibility purposes.
 */
export { StokedUiEditorApp };

/**
 * Exporting all editor classes for global access.
 */
export * from './editorClasses';

/**
 * Exporting editor types for type checking and auto-completion.
 */
export * from './Editor.types';