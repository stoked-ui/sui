---
productId: file-explorer
title: File Explorer Basic - Expansion
components: FileExplorerBasic, FileElement
packageName: '@stoked-ui/file-explorer'
githubLabel: 'component: file explorer'
waiAria: https://www.w3.org/WAI/ARIA/apg/patterns/treeview/
---

# File Explorer Basic - Expansion

<p class="description">Learn how to handle expanding and collapsing File Explorer items.</p>

## Controlled expansion

Use the `expandedItems` prop to control the expanded items.
You can also use the `onExpandedItemsChange` prop to listen to changes in the expanded items and update the prop accordingly.

{{"demo": "ControlledExpansion.js"}}

:::info

- The expansion is **controlled** when its parent manages it by providing a `expandedItems` prop.
- The expansion is **uncontrolled** when it is managed by the component's own internal state. This state can be initialized using the `defaultExpandedItems` prop.

Learn more about the _Controlled and uncontrolled_ pattern in the [React documentation](https://react.dev/learn/sharing-state-between-components#controlled-and-uncontrolled-components).
:::

## Track item expansion change

Use the `onItemExpansionToggle` prop to trigger an action upon an item being expanded.

{{"demo": "TrackItemExpansionToggle.js"}}

## Limit expansion to icon container

You can use the `expansionTrigger` prop to decide if the expansion interaction should be triggered by clicking on the icon container instead of the whole Tree Item content.

{{"demo": "IconExpansionFileExplorer.js"}}

## Imperative API

:::success
To use the `apiRef` object, you need to initialize it using the `useFileExplorerApiRef` hook as follows:

```tsx
const apiRef = useFileExplorerApiRef();

return <FileExplorerBasic apiRef={apiRef}>{children}</FileExplorerBasic>;
```

When your component first renders, `apiRef` will be `undefined`.
After this initial render, `apiRef` holds methods to interact imperatively with the File Explorer.
:::

### Change an item expansion

Use the `setItemExpansion` API method to change the expansion of an item.

```ts
apiRef.current.setItemExpansion(
  // The DOM event that triggered the change
  event,
  // The id of the item to expand or collapse
  itemId,
  // If `true` the item will be expanded
  // If `false` the item will be collapsed
  isExpanded,
);
```

{{"demo": "ApiMethodSetItemExpansion.js"}}
