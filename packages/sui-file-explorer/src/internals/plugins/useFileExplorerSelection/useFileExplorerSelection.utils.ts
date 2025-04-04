/**
 * Converts the `selectedItems` model to be an array if it was a string or null.
 * 
 * @param {string[] | string | null} model The raw model.
 * @returns {string[]} The converted model.
 */
export const convertSelectedItemsToArray = (model: string[] | string | null): string[] => {
  /**
   * If the `model` is an array, return it as is.
   */
  if (Array.isArray(model)) {
    return model;
  }

  /**
   * If the `model` is not null, convert it to an array by wrapping it in square brackets.
   */
  if (model != null) {
    return [model];
  }

  /**
   * If the `model` is null or undefined, return an empty array.
   */
  return [];
};

/**
 * Creates a lookup object from the given array of strings.
 * 
 * @param {string[]} array The array of IDs to look up.
 * @returns {{ [id: string]: boolean }} A lookup object with ID as key and `true` as value.
 */
export const getLookupFromArray = (array: string[]) => {
  /**
   * Initialize an empty object to store the lookup data.
   */
  const lookup: { [id: string]: boolean } = {};

  /**
   * Iterate over each ID in the array and add it to the lookup object with `true` as its value.
   */
  array.forEach((id) => {
    lookup[id] = true;
  });

  /**
   * Return the populated lookup object.
   */
  return lookup;
};