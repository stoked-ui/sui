/**
 * Exports the EditorView class and its related modules.
 *
 * @module editorView
 */

import EditorView from './EditorView';
import EditorViewActions from './EditorViewActions';

/**
 * The main EditorView export, providing access to the view's functionality.
 */
export default EditorView;

/**
 * Exports the actions module for the EditorView class.
 */
export { EditorViewActions };

/**
 * Re-exports all classes related to the editor view.
 */
export * from './editorViewClasses';

/**
 * Re-exports all types related to the editor view.
 */
export * from './EditorView.types';