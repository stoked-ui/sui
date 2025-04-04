/**
 * Converts the `selectedItems` model to be an array if it was a string or null.
 * 
 * @param {string[] | string | null} model The raw model. Can be an array, a string, or null.
 * @returns {string[]} The converted model. Returns an empty array if `model` is undefined or null.
 */
export const convertSelectedItemsToArray = (model: string[] | string | null): string[] => {
  if (Array.isArray(model)) {
    return model;
  }

  if (model != null) {
    return [model];
  }

  return [];
};

/**
 * Creates a lookup object from the provided array of item IDs.
 * 
 * @param {string[]} array The array of item IDs.
 * @returns {{ [itemId: string]: boolean }} A lookup object with item IDs as keys and boolean values indicating presence in the original array.
 */
export const getLookupFromArray = (array: string[]): { [itemId: string]: boolean } => {
  const lookup: { [itemId: string]: boolean } = {};
  array.forEach((itemId) => {
    lookup[itemId] = true;
  });
  return lookup;
};