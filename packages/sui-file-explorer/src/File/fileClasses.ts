/**
 * Interface for defining classes related to a file component.
 * @typedef {Object} FileClasses
 * @property {string} root - Styles applied to the root element.
 * @property {string} grid - Styles applied to the grid element.
 * @property {string} groupTransition - Styles applied to the transition component.
 * @property {string} content - Styles applied to the content element.
 * @property {string} expanded - State class applied to the content element when expanded.
 * @property {string} selected - State class applied to the content element when selected.
 * @property {string} focused - State class applied to the content element when focused.
 * @property {string} disabled - State class applied to the element when disabled.
 * @property {string} iconContainer - Styles applied to the tree item icon.
 * @property {string} name - Styles applied to the label element.
 * @property {string} checkbox - Styles applied to the checkbox element.
 */

/**
 * Type representing the keys of FileClasses.
 * @typedef {keyof FileClasses} FileClassKey
 */

/**
 * Generates a utility class name for the file component.
 * @param {string} slot - The slot to generate the utility class for.
 * @returns {string} The generated utility class name.
 */
export function getFileUtilityClass(slot: string): string {
  return generateUtilityClass('MuiFile', slot);
}

/**
 * Object containing utility classes for the file component.
 * @type {FileClasses}
 */
export const fileClasses: FileClasses = generateUtilityClasses('MuiFile', [
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
