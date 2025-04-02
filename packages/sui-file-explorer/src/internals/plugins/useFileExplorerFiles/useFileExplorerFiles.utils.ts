export const FILE_EXPLORER_VIEW_ROOT_PARENT_ID = '__FILE_EXPLORER_VIEW_ROOT_PARENT_ID__';

export const buildSiblingIndexes = (siblings: string[]) => {
  const siblingsIndexLookup: { [id: string]: number } = {};
  siblings.forEach((childId, index) => {
    siblingsIndexLookup[childId] = index;
  });

  return siblingsIndexLookup;
};

