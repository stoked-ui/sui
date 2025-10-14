/**
 * Interface for styling classes of a file element.
 * @typedef {Object} FileElementClasses
 * @property {string} root - Styles applied to the root element.
 * @property {string} groupTransition - Styles applied to the transition component.
 * @property {string} content - Styles applied to the content element.
 * @property {string} expanded - State class applied to the content element when expanded.
 * @property {string} selected - State class applied to the content element when selected.
 * @property {string} focused - State class applied to the content element when focused.
 * @property {string} disabled - State class applied to the element when disabled.
 * @property {string} iconContainer - Styles applied to the tree item icon.
 * @property {string} label - Styles applied to the label element.
 * @property {string} checkbox - Styles applied to the checkbox element.
 */

/**
 * Key of classes for a file element.
 * @typedef {keyof FileElementClasses} FileElementClassKey
 */

/**
 * Generates a utility class name for a file element.
 * @param {string} slot - The slot to generate the utility class for.
 * @returns {string} The generated utility class name.
 */
export function getFileElementUtilityClass(slot: string): string {
  return generateUtilityClass('MuiFileElement', slot);
}

/**
 * Object containing the generated utility classes for file elements.
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
