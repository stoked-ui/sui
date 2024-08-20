import generateUtilityClass from '@mui/utils/generateUtilityClass';
import generateUtilityClasses from '@mui/utils/generateUtilityClasses';

export interface EditorLabelsClasses {
  root: string;
  label: string;
}

export type EditorLabelsClassKey = keyof EditorLabelsClasses;

export function getEditorLabelsUtilityClass(slot: string): string {
  return generateUtilityClass('MuiEditorLabels', slot);
}

export const editorLabelsClasses: EditorLabelsClasses = generateUtilityClasses('MuiEditorLabels', [
  'root',
  'label'
]);
