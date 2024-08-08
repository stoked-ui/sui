---
productId: file-explorer
title: File Explorer Basic - Focus
components: FileExplorerBasic, FileElement
packageName: '@stoked-ui/file-explorer'
githubLabel: 'component: file explorer'
waiAria: https://www.w3.org/WAI/ARIA/apg/patterns/treeview/
---

# File Explorer Basic - Focus

<p class="description">Learn how to focus File Explorer items.</p>

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

### Focus a specific item

Use the `focusItem` API method to focus a specific item.

```ts
apiRef.current.focusItem(
  // The DOM event that triggered the change
  event,
  // The id of the item to focus
  itemId,
);
```

:::info
This method only works with items that are currently visible.
Calling `apiRef.focusItem` on an item whose parent is collapsed will do nothing.
:::

{{"demo": "ApiMethodFocusItem.js"}}
