import { generateUtilityClass, generateUtilityClasses } from '@mui/utils';

/**
 * File classes utility class.
 *
 * This class provides a set of styles and state classes for the file component.
 */
export interface FileClasses {
  /**
   * Styles applied to the root element.
   */
  root: string;

  grid: string;
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
  name: string;
  /**
   * Styles applied to the checkbox element.
   */
  checkbox: string;
}

export type FileClassKey = keyof FileClasses;

/**
 * Gets a utility class for the file component based on the given slot.
 *
 * @param {string} slot - The slot to get the utility class for.
 * @returns {string} The utility class for the file component.
 */
export function getFileUtilityClass(slot: string): string {
  return generateUtilityClass('MuiFile', slot);
}

/**
 * A set of styles and state classes for the file component.
 *
 * This is generated using the `generateUtilityClasses` function from MUI's utilities.
 */
export const fileClasses = generateUtilityClasses('MuiFile', [
  'root',
  'grid',
  'groupTransition',
  'content',
  'expanded',
  'selected',
  'focused',
  'disabled',
  'iconContainer',
  'name',
  'checkbox',
]);