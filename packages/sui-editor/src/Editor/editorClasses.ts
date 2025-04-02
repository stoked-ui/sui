import generateUtilityClass from '@mui/utils/generateUtilityClass';
import generateUtilityClasses from '@mui/utils/generateUtilityClasses';

export interface EditorClasses {
  /** Styles applied to the root element. */
  root: string;
  editorView: string;
  controls: string;
  timeline: string;
  fileExplorerTabs: string;
  fileExplorer: string;
  loaded: string;
}

export type EditorClassKey = keyof EditorClasses;

export function getEditorUtilityClass(slot: string): string {
  return generateUtilityClass('MuiEditor', slot);
}

export const editorClasses: EditorClasses = generateUtilityClasses('MuiEditor', [
  'root',
  'editorView',
  'controls',
  'timeline',
  'fileExplorerTabs',
  'fileExplorer',
  'loaded'
]);

