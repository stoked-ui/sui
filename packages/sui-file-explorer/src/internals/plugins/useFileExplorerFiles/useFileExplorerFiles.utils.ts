/**
 * Constants
 */
export const FILE_EXPLORER_VIEW_ROOT_PARENT_ID = '__FILE_EXPLORER_VIEW_ROOT_PARENT_ID__';

/**
 * Builds a lookup table of sibling indexes.
 *
 * @param {string[]} siblings - An array of sibling IDs.
 * @returns {{ [id: string]: number }} A lookup table where each key is a child ID and the value is its corresponding index in the original array.
 */
export const buildSiblingIndexes = (siblings: string[]) => {
  const siblingsIndexLookup: { [id: string]: number } = {};
  siblings.forEach((childId, index) => {
    siblingsIndexLookup[childId] = index;
  });

  return siblingsIndexLookup;
};