---
productId: file-explorer
title: File Explorer Basic - Items
components: FileExplorerBasic, FileElement
packageName: '@stoked-ui/file-explorer'
githubLabel: 'component: file explorer'
waiAria: https://www.w3.org/WAI/ARIA/apg/patterns/treeview/
---

# File Explorer Basic - Items

<p class="description">Learn how to add simple data to the File Explorer component.</p>

## Basics

```jsx
import { FileExplorerBasic } from '@stoked-ui/file-explorer/FileExplorerBasic';
import { FileElement } from '@stoked-ui/file-explorer/FileElement';
```

The File Explorer Basic component receives its items directly as JSX children.

{{"demo": "BasicSimpleFileExplorer.js"}}

### Item identifier

Each Tree Item must have a unique `itemId`.
This is used internally to identify the item in the various models, and to track it across updates.

```tsx
<FileExplorerBasic>
  <FileElement itemId="item-unique-id" {...otherItemProps} />
</FileExplorerBasic>
```

### Item label

You must pass a `label` prop to each Tree Item component, as shown below:

```tsx
<FileExplorerBasic>
  <FileElement label="Item label" {...otherItemProps} />
</FileExplorerBasic>
```

### Disabled items

Use the `disabled` prop on the Tree Item component to disable interaction and focus:

{{"demo": "DisabledJSXItem.js", "defaultCodeOpen": false}}

#### The disabledItemsFocusable prop

Note that the demo above also includes a switch.
This toggles the `disabledItemsFocusable` prop, which controls whether or not a disabled Tree Item can be focused.

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

### Get an item's DOM element by ID

Use the `getItemDOMElement` API method to get an item's DOM element by its ID.

```ts
const itemElement = apiRef.current.getItemDOMElement(
  // The id of the item to get the DOM element of
  itemId,
);
```

{{"demo": "ApiMethodGetItemDOMElement.js", "defaultCodeOpen": false}}
