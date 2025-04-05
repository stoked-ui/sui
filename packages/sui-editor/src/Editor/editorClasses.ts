import generateUtilityClass from '@mui/utils/generateUtilityClass';
import generateUtilityClasses from '@mui/utils/generateUtilityClasses';

/**
 * Defines the EditorClasses interface.
 * @typedef {Object} EditorClasses
 * @property {string} root - Styles applied to the root element.
 * @property {string} editorView - Styles applied to the editor view.
 * @property {string} controls - Styles applied to the controls.
 * @property {string} timeline - Styles applied to the timeline.
 * @property {string} fileExplorerTabs - Styles applied to the file explorer tabs.
 * @property {string} fileExplorer - Styles applied to the file explorer.
 * @property {string} loaded - Styles applied when loaded.
 */
export interface EditorClasses {
  root: string;
  editorView: string;
  controls: string;
  timeline: string;
  fileExplorerTabs: string;
  fileExplorer: string;
  loaded: string;
}

/**
 * Defines the EditorClassKey type.
 * @typedef {keyof EditorClasses} EditorClassKey
 */
export type EditorClassKey = keyof EditorClasses;

/**
 * Returns the utility class for the editor.
 * @param {string} slot - The slot for the utility class.
 * @returns {string} The generated utility class.
 */
export function getEditorUtilityClass(slot: string): string {
  return generateUtilityClass('MuiEditor', slot);
}

/**
 * Utility classes for the editor.
 * @type {EditorClasses}
 */
export const editorClasses: EditorClasses = generateUtilityClasses('MuiEditor', [
  'root',
  'editorView',
  'controls',
  'timeline',
  'fileExplorerTabs',
  'fileExplorer',
  'loaded'
]);