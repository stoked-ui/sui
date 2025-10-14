/**
 * Interface for defining classes for File Explorer Tabs component.
 * @typedef {Object} FileExplorerTabsClasses
 * @property {string} root - Styles applied to the root element.
 * @property {string} label - Styles applied to the label element.
 * @property {string} folder - Styles applied to the folder element.
 */

/**
 * Key type for File Explorer Tabs classes.
 * @typedef {keyof FileExplorerTabsClasses} FileExplorerTabsClassKey
 */

/**
 * Generates utility class name for File Explorer Tabs component.
 * @param {string} slot - The slot for which to generate the utility class.
 * @returns {string} The generated utility class name.
 */
export function getFileExplorerTabsUtilityClass(slot: string): string {
  return generateUtilityClass('MuiFileExplorerTabs', slot);
}

/**
 * Classes for File Explorer Tabs component.
 * @type {FileExplorerTabsClasses}
 */
export const fileExplorerTabsClasses: FileExplorerTabsClasses = generateUtilityClasses('MuiFileExplorerTabs', [
  'root',
  'label',
  'folder',
]);
