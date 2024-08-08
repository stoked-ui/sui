---
productId: file-explorer
title: File Explorer - Items
components: FileExplorer, FileElement
packageName: '@stoked-ui/file-explorer'
githubLabel: 'component: file explorer'
waiAria: https://www.w3.org/WAI/ARIA/apg/patterns/treeview/
---

# File Explorer - Items

<p class="description">Pass data to your File Explorer.</p>

## Basic usage

The items can be defined with the `items` prop, which expects an array of objects.

:::warning
The `items` prop should keep the same reference between two renders except if you want to apply new items.
Otherwise, the File Explorer will re-generate its entire structure.
:::

{{"demo": "FileExplorerEx.js"}}

## Item identifier

Each item must have a unique identifier.

This identifier is used internally to identify the item in the various models and to track the item across updates.

By default, the `FileExplorer` component looks for a property named `id` in the data set to get that identifier:

```tsx
const ITEMS = [{ id: 'file-explorer-community' }];

<FileExplorer items={ITEMS} />;
```

If the item's identifier is not called `id`, then you need to use the `getItemId` prop to tell the `FileExplorer` component where it is located.

The following demo shows how to use `getItemId` to grab the unique identifier from a property named `internalId`:

```tsx
const ITEMS = [{ internalId: 'file-explorer-community' }];

function getItemId(item) {
  return item.internalId;
}

<FileExplorer items={ITEMS} getItemId={getItemId} />;
```

{{"demo": "GetItemId.js", "defaultCodeOpen": false}}

:::warning
Just like the `items` prop, the `getItemId` function should keep the same JavaScript reference between two renders.
Otherwise, the File Explorer will re-generate its entire structure.

It could be achieved by either defining the prop outside the component scope or by memoizing using the `React.useCallback` hook if the function reuses something from the component scope.
:::

## Item label

Each item must have a label which does not need to be unique.

By default, the `FileExplorer` component looks for a property named `label` in the data set to get that label:

```tsx
const ITEMS = [{ label: '@stoked-ui/file-explorer' }];

<FileExplorer items={ITEMS} />;
```

If the item's label is not called `label`, then you need to use the `getItemLabel` prop to tell the `FileExplorer` component where it's located:

The following demo shows how to use `getItemLabel` to grab the unique identifier from a property named `name`:

```tsx
const ITEMS = [{ name: '@stoked-ui/file-explorer' }];

function getItemLabel(item) {
  return item.name;
}

<FileExplorer items={ITEMS} getItemLabel={getItemLabel} />;
```

{{"demo": "GetItemLabel.js", "defaultCodeOpen": false}}

:::warning
Just like the `items` prop, the `getItemLabel` function should keep the same JavaScript reference between two renders.
Otherwise, the File Explorer will re-generate its entire structure.

It could be achieved by either defining the prop outside the component scope or by memoizing using the `React.useCallback` hook if the function reuses something from the component scope.
:::

:::warning
Unlike the `FileExplorerBasic` component, the `FileExplorer` component only supports string labels, you cannot pass React nodes to it.
:::

## Disabled items

Use the `isItemDisabled` prop on the File Explorer to disable interaction and focus on a Tree Item:

```tsx
function isItemDisabled(item) {
  return item.disabled ?? false;
}

<FileExplorer isItemDisabled={isItemDisabled} />;
```

{{"demo": "DisabledPropItem.js", "defaultCodeOpen": false}}

:::warning
Just like the `items` prop, the `isItemDisabled` function should keep the same JavaScript reference between two renders.
Otherwise, the File Explorer will re-generate its entire structure.

This can be achieved by either defining the prop outside the component scope or by memoizing using the `React.useCallback` hook if the function reuses something from the component scope.
:::

### Focus disabled items

Use the `disabledItemsFocusable` prop to control if disabled Tree Items can be focused.

When this prop is set to false:

- Navigating with keyboard arrow keys will not focus the disabled items, and the next non-disabled item will be focused instead.
- Typing the first character of a disabled item's label will not move the focus to it.
- Mouse or keyboard interaction will not expand/collapse disabled items.
- Mouse or keyboard interaction will not select disabled items.
- <kbd class="key">Shift</kbd> + arrow keys will skip disabled items, and the next non-disabled item will be selected instead.
- Programmatic focus will not focus disabled items.

When it's set to true:

- Navigating with keyboard arrow keys will focus disabled items.
- Typing the first character of a disabled item's label will move focus to it.
- Mouse or keyboard interaction will not expand/collapse disabled items.
- Mouse or keyboard interaction will not select disabled items.
- <kbd class="key">Shift</kbd> + arrow keys will not skip disabled items, but the disabled item will not be selected.
- Programmatic focus will focus disabled items.

{{"demo": "DisabledItemsFocusable.js", "defaultCodeOpen": false}}

## Imperative API

### Get an item by ID

Use the `getItem` API method to get an item by its ID.

```ts
const item = apiRef.current.getItem(
  // The id of the item to retrieve
  itemId,
);
```

{{"demo": "ApiMethodGetItem.js", "defaultCodeOpen": false}}

### Get an item's DOM element by ID

Use the `getItemDOMElement` API method to get an item's DOM element by its ID.

```ts
const itemElement = apiRef.current.getItemDOMElement(
  // The id of the item to get the DOM element of
  itemId,
);
```

{{"demo": "ApiMethodGetItemDOMElement.js", "defaultCodeOpen": false}}

### Get the current item tree

Use the `getItemTree` API method to get the current item tree.

```ts
const itemTree = apiRef.current.getItemTree();
```

{{"demo": "ApiMethodGetItemTree.js", "defaultCodeOpen": false}}

### Get an item's children by ID

Use the `getItemOrderedChildrenIds` API method to get an item's children by its ID.

```ts
const childrenIds = apiRef.current.getItemOrderedChildrenIds(
  // The id of the item to retrieve the children from
  itemId,
);
```

{{"demo": "ApiMethodGetItemOrderedChildrenIds.js", "defaultCodeOpen": false}}
