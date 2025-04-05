/**
 * Transform the `selectedItems` model to be an array if it was a string or null.
 * @param {string[] | string | null} model The raw model.
 * @returns {string[]} The converted model.
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
 * Creates a lookup object from an array of strings.
 * @param {string[]} array The array of strings.
 * @returns {{ [id: string]: boolean }} The lookup object.
 */
export const getLookupFromArray = (array: string[]) => {
  const lookup: { [id: string]: boolean } = {};
  array.forEach((id) => {
    lookup[id] = true;
  });
  return lookup;
};