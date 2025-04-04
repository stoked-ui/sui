import { generateUtilityClass, generateUtilityClasses } from '@mui/utils';

/**
 * @interface EditorClasses
 * @description Styles applied to the root element of the editor component.
 */
export interface EditorClasses {
  /** Styles applied to the root element. */
  root: string;
  /**
   * Styles for the editor view.
   */
  editorView: string;
  /**
   * Styles for the controls.
   */
  controls: string;
  /**
   * Styles for the timeline.
   */
  timeline: string;
  /**
   * Styles for the file explorer tabs.
   */
  fileExplorerTabs: string;
  /**
   * Styles for the file explorer.
   */
  fileExplorer: string;
  /**
   * A flag indicating if the editor is loaded.
   */
  loaded: string;
}

/**
 * @typedef {string} EditorClassKey
 * @description The key of an editor class.
 */

export type EditorClassKey = keyof EditorClasses;

/**
 * @function getEditorUtilityClass
 * @description Returns a utility class based on the given slot.
 * @param {string} slot - The slot to get the utility class for.
 * @returns {string} The utility class for the given slot.
 */
export function getEditorUtilityClass(slot: string): string {
  return generateUtilityClass('MuiEditor', slot);
}

/**
 * @const EditorClasses
 * @description An object containing all editor classes.
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