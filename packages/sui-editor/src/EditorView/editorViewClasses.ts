import generateUtilityClass from '@mui/utils/generateUtilityClass';
import generateUtilityClasses from '@mui/utils/generateUtilityClasses';

export interface EditorViewClasses {
  /** Styles applied to the root element. */
  root: string;
  renderer?: string;
  preview?: string;
}

export type EditorViewClassKey = keyof EditorViewClasses;

export function getEditorViewUtilityClass(slot: string): string {
  return generateUtilityClass('MuiEditorView', slot);
}

export const editorViewClasses: EditorViewClasses = generateUtilityClasses('MuiEditorView', [
  'root',
  'renderer',
  'preview'
]);
