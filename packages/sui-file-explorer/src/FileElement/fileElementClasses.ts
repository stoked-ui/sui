import { generateUtilityClass, generateUtilityClasses } from '@mui/utils';

/**
 * FileElementClasses defines the utility classes for the MuiFileElement component.
 *
 * @interface FileElementClasses
 */
export interface FileElementClasses {
  /**
   * Styles applied to the root element.
   */
  root: string;
  /**
   * Styles applied to the transition component.
   */
  groupTransition: string;
  /**
   * Styles applied to the content element.
   */
  content: string;
  /**
   * State class applied to the content element when expanded.
   */
  expanded: string;
  /**
   * State class applied to the content element when selected.
   */
  selected: string;
  /**
   * State class applied to the content element when focused.
   */
  focused: string;
  /**
   * State class applied to the element when disabled.
   */
  disabled: string;
  /**
   * Styles applied to the tree item icon.
   */
  iconContainer: string;
  /**
   * Styles applied to the label element.
   */
  label: string;
  /**
   * Styles applied to the checkbox element.
   */
  checkbox: string;
}

/**
 * FileElementClassKey is a type alias for the key of the FileElementClasses object.
 *
 * @typedef {string} FileElementClassKey
 */
export type FileElementClassKey = keyof FileElementClasses;

/**
 * getFileElementUtilityClass generates the utility class for the MuiFileElement component based on the provided slot.
 *
 * @param {string} slot The slot of the component.
 * @returns {string} The utility class for the component.
 * @accessibility Note: This function is accessible from JSDoc comments to ensure that it can be used with JSDoc comments.
 */
export function getFileElementUtilityClass(slot: string): string {
  return generateUtilityClass('MuiFileElement', slot);
}

/**
 * fileElementClasses generates the utility classes for the MuiFileElement component.
 *
 * @constant
 * @type {FileElementClasses}
 */
export const fileElementClasses: FileElementClasses = generateUtilityClasses('MuiFileElement', [
  'root',
  'groupTransition',
  'content',
  'expanded',
  'selected',
  'focused',
  'disabled',
  'iconContainer',
  'label',
  'checkbox',
]);