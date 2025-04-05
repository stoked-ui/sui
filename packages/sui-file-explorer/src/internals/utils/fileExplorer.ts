import { FileExplorerInstance } from '../models';
import type {
  UseFileExplorerExpansionSignature,
  UseFileExplorerFilesSignature,
} from '../plugins/useFileExplorerExpansion/useFileExplorerExpansion.types';

/**
 * Finds the last navigable item in an array of items.
 *
 * @param {FileExplorerInstance<[UseFileExplorerFilesSignature]>} instance - The file explorer instance.
 * @param {string[]} items - The array of items to search.
 * @returns {string | undefined} The last navigable item or undefined if none found.
 */
const getLastNavigableItemInArray = (
  instance: FileExplorerInstance<[UseFileExplorerFilesSignature]>,
  items: string[],
) => {
  let itemIndex = items.length - 1;
  while (itemIndex >= 0 && !instance.isItemNavigable(items[itemIndex])) {
    itemIndex -= 1;
  }

  if (itemIndex === -1) {
    return undefined;
  }

  return items[itemIndex];
};

/**
 * Gets the previous navigable item in the file explorer.
 *
 * @param {FileExplorerInstance<[UseFileExplorerFilesSignature, UseFileExplorerExpansionSignature]>} instance - The file explorer instance.
 * @param {string} id - The id of the current item.
 * @returns {string | null} The previous navigable item id or null if none found.
 */
export const getPreviousNavigableItem = (
  instance: FileExplorerInstance<[UseFileExplorerFilesSignature, UseFileExplorerExpansionSignature]>,
  id: string,
): string | null => {
  const itemMeta = instance.getItemMeta(id);
  const siblings = instance.getItemOrderedChildrenIds(itemMeta.parentId);
  const itemIndex = instance.getItemIndex(id);

  if (itemIndex === 0) {
    return itemMeta.parentId;
  }

  let previousNavigableSiblingIndex = itemIndex - 1;
  while (
    !instance.isItemNavigable(siblings[previousNavigableSiblingIndex]) &&
    previousNavigableSiblingIndex >= 0
  ) {
    previousNavigableSiblingIndex -= 1;
  }

  if (previousNavigableSiblingIndex === -1) {
    if (itemMeta.parentId == null) {
      return null;
    }

    return getPreviousNavigableItem(instance, itemMeta.parentId);
  }

  let currentItemId: string = siblings[previousNavigableSiblingIndex];
  let lastNavigableChild = getLastNavigableItemInArray(
    instance,
    instance.getItemOrderedChildrenIds(currentItemId),
  );
  while (instance.isItemExpanded(currentItemId) && lastNavigableChild != null) {
    currentItemId = lastNavigableChild;
    lastNavigableChild = instance
      .getItemOrderedChildrenIds(currentItemId)
      .find(instance.isItemNavigable);
  }

  return currentItemId;
};

/**
 * Gets the next navigable item in the file explorer.
 *
 * @param {FileExplorerInstance<[UseFileExplorerExpansionSignature, UseFileExplorerFilesSignature]>} instance - The file explorer instance.
 * @param {string} id - The id of the current item.
 * @returns {string | null} The next navigable item id or null if none found.
 */
export const getNextNavigableItem = (
  instance: FileExplorerInstance<[UseFileExplorerExpansionSignature, UseFileExplorerFilesSignature]>,
  id: string,
) => {
  if (instance.isItemExpanded(id)) {
    const firstNavigableChild = instance
      .getItemOrderedChildrenIds(id)
      .find(instance.isItemNavigable);
    if (firstNavigableChild != null) {
      return firstNavigableChild;
    }
  }

  let itemMeta = instance.getItemMeta(id);
  while (itemMeta != null) {
    const siblings = instance.getItemOrderedChildrenIds(itemMeta.parentId);
    const currentItemIndex = instance.getItemIndex(itemMeta.id);

    if (currentItemIndex < siblings.length - 1) {
      let nextItemIndex = currentItemIndex + 1;
      while (
        !instance.isItemNavigable(siblings[nextItemIndex]) &&
        nextItemIndex < siblings.length - 1
      ) {
        nextItemIndex += 1;
      }

      if (instance.isItemNavigable(siblings[nextItemIndex])) {
        return siblings[nextItemIndex];
      }
    }

    itemMeta = instance.getItemMeta(itemMeta.parentId!);
  }

  return null;
};

/**
 * Gets the last navigable item in the file explorer.
 *
 * @param {FileExplorerInstance<[UseFileExplorerExpansionSignature, UseFileExplorerFilesSignature]>} instance - The file explorer instance.
 * @returns {string} The last navigable item id.
 */
export const getLastNavigableItem = (
  instance: FileExplorerInstance<[UseFileExplorerExpansionSignature, UseFileExplorerFilesSignature]>,
) => {
  let id: string | null = null;
  while (id == null || instance.isItemExpanded(id)) {
    const children = instance.getItemOrderedChildrenIds(id);
    const lastNavigableChild = getLastNavigableItemInArray(instance, children);

    if (lastNavigableChild == null) {
      return id!;
    }

    id = lastNavigableChild;
  }

  return id!;
};

/**
 * Gets the first navigable item in the file explorer.
 *
 * @param {FileExplorerInstance<[UseFileExplorerFilesSignature]>} instance - The file explorer instance.
 * @returns {string} The first navigable item id.
 */
export const getFirstNavigableItem = (
  instance: FileExplorerInstance<[UseFileExplorerFilesSignature]>,
) => instance.getItemOrderedChildrenIds(null).find(instance.isItemNavigable)!;

/**
 * Finds the common ancestor and order of two items in a file explorer.
 *
 * @param {FileExplorerInstance<[UseFileExplorerFilesSignature]>} instance - The file explorer instance.
 * @param {string} itemAId - The id of the first item.
 * @param {string} itemBId - The id of the second item.
 * @returns {string[]} An array containing the ordered ids of the two items.
 */
export const findOrderInTremauxFileExplorer = (
  instance: FileExplorerInstance<[UseFileExplorerFilesSignature]>,
  itemAId: string,
  itemBId: string,
) => {
  if (itemAId === itemBId) {
    return [itemAId, itemBId];
  }

  const itemMetaA = instance.getItemMeta(itemAId);
  const itemMetaB = instance.getItemMeta(itemBId);

  if (itemMetaA.parentId === itemMetaB.id || itemMetaB.parentId === itemMetaA.id) {
    return itemMetaB.parentId === itemMetaA.id
      ? [itemMetaA.id, itemMetaB.id]
      : [itemMetaB.id, itemMetaA.id];
  }

  const aFamily: (string | null)[] = [itemMetaA.id];
  const bFamily: (string | null)[] = [itemMetaB.id];

  let aAncestor = itemMetaA.parentId;
  let bAncestor = itemMetaB.parentId;

  let aAncestorIsCommon = bFamily.indexOf(aAncestor) !== -1;
  let bAncestorIsCommon = aFamily.indexOf(bAncestor) !== -1;

  let continueA = true;
  let continueB = true;

  while (!bAncestorIsCommon && !aAncestorIsCommon) {
    if (continueA) {
      aFamily.push(aAncestor);
      aAncestorIsCommon = bFamily.indexOf(aAncestor) !== -1;
      continueA = aAncestor !== null;
      if (!aAncestorIsCommon && continueA) {
        aAncestor = instance.getItemMeta(aAncestor!).parentId;
      }
    }

    if (continueB && !aAncestorIsCommon) {
      bFamily.push(bAncestor);
      bAncestorIsCommon = aFamily.indexOf(bAncestor) !== -1;
      continueB = bAncestor !== null;
      if (!bAncestorIsCommon && continueB) {
        bAncestor = instance.getItemMeta(bAncestor!).parentId;
      }
    }
  }

  const commonAncestor = aAncestorIsCommon ? aAncestor : bAncestor;
  const ancestorFamily = instance.getItemOrderedChildrenIds(commonAncestor);

  const aSide = aFamily[aFamily.indexOf(commonAncestor) - 1];
  const bSide = bFamily[bFamily.indexOf(commonAncestor) - 1];

  return ancestorFamily.indexOf(aSide!) < ancestorFamily.indexOf(bSide!)
    ? [itemAId, itemBId]
    : [itemBId, itemAId];
};

/**
 * Gets the non-disabled items in a range between two items in the file explorer.
 *
 * @param {FileExplorerInstance<[UseFileExplorerFilesSignature, UseFileExplorerExpansionSignature]>} instance - The file explorer instance.
 * @param {string} itemAId - The id of the first item in the range.
 * @param {string} itemBId - The id of the last item in the range.
 * @returns {string[]} An array of non-disabled item ids in the range.
 */
export const getNonDisabledItemsInRange = (
  instance: FileExplorerInstance<[UseFileExplorerFilesSignature, UseFileExplorerExpansionSignature]>,
  itemAId: string,
  itemBId: string,
) => {
  const getNextItem = (id: string) => {
    if (instance.isItemExpandable(id) && instance.isItemExpanded(id)) {
      return instance.getItemOrderedChildrenIds(id)[0];
    }

    let itemMeta = instance.getItemMeta(id);
    while (itemMeta != null) {
      const siblings = instance.getItemOrderedChildrenIds(itemMeta.parentId);
      const currentItemIndex = instance.getItemIndex(itemMeta.id);

      if (currentItemIndex < siblings.length - 1) {
        return siblings[currentItemIndex + 1];
      }

      itemMeta = instance.getItemMeta(itemMeta.parentId!);
    }

    throw new Error('Invalid range');
  };

  const [first, last] = findOrderInTremauxFileExplorer(instance, itemAId, itemBId);
  const items = [first];
  let current = first;

  while (current !== last) {
    current = getNextItem(current);
    if (!instance.isItemDisabled(current)) {
      items.push(current);
    }
  }

  return items;
};

/**
 * Gets all navigable items in the file explorer.
 *
 * @param {FileExplorerInstance<[UseFileExplorerFilesSignature, UseFileExplorerExpansionSignature]>} instance - The file explorer instance.
 * @returns {string[]} An array of all navigable item ids.
 */
export const getAllNavigableItems = (
  instance: FileExplorerInstance<[UseFileExplorerFilesSignature, UseFileExplorerExpansionSignature]>,
) => {
  let item: string | null = getFirstNavigableItem(instance);
  const navigableItems: string[] = [];
  while (item != null) {
    navigableItems.push(item);
    item = getNextNavigableItem(instance, item);
  }

  return navigableItems;
};