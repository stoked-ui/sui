/**
 * Interface for defining the classes used in FileExplorerGridHeaders component.
 * @typedef {object} FileExplorerGridHeadersClasses
 * @property {string} root - Styles applied to the root element.
 * @property {string} column - Styles applied to the column element.
 * @property {string} groupTransition - Styles applied to the transition component.
 * @property {string} iconContainer - Styles applied to the content element.
 * @property {string} name - Styles applied to the label element.
 */

/**
 * Key of FileExplorerGridHeadersClasses.
 * @typedef {string} FileExplorerGridHeadersClassKey
 */

/**
 * Returns a utility class based on the slot provided.
 * @param {string} slot - Slot value for utility class generation.
 * @returns {string} The generated utility class.
 */
export function getFileUtilityClass(slot: string): string {
  return generateUtilityClass('MuiFileExplorerGridHeaders', slot);
}

/**
 * Utility classes for FileExplorerGridHeaders component.
 * @type {FileExplorerGridHeadersClasses}
 */
export const fileExplorerViewGridHeadersClasses: FileExplorerGridHeadersClasses = generateUtilityClasses('MuiFileExplorerGridHeaders', [
  'root',
  'column',
  'groupTransition',
  'iconContainer',
  'name',
]);
