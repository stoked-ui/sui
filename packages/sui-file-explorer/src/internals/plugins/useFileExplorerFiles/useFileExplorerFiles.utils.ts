/**
 * Constant representing the parent ID of the root element in the file explorer view.
 */
export const FILE_EXPLORER_VIEW_ROOT_PARENT_ID = '__FILE_EXPLORER_VIEW_ROOT_PARENT_ID__';

/**
 * Builds an index lookup object for sibling elements.
 * @param {string[]} siblings - Array of sibling element IDs.
 * @returns {Object.<string, number>} - Object mapping each sibling ID to its index.
 */
export const buildSiblingIndexes = (siblings: string[]) => {
  const siblingsIndexLookup: { [id: string]: number } = {};
  siblings.forEach((childId, index) => {
    siblingsIndexLookup[childId] = index;
  });

  return siblingsIndexLookup;
};