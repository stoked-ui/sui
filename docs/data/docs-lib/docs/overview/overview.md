---
productId: docs-lib
title: Stoked UI Docs Library
githubLabel: 'component: docs'
packageName: '@stoked-ui/docs-lib'
---

# Overview

<p class="description">The Stoked UI Docs Library lets its users build easy to use, easy to maintain documentation for their own libraries just like this one.</p>

{{"component": "modules/components/ComponentLinkHeader"}}

The Stoked UI Docs Library which was entirely created from @mui/docs and the entire @mui/material toolchain exposes a range of components as well as some libraries that are intended to allow it's users to focus on building components and make the documentation building / managing process as automatic and trivial as possible. The React Components provided in this library:  

 - FileExplorerBasic
 - FileExplorer

### File Explorer Basic

```jsx
import { FileExplorerBasic } from '@stoked-ui/file-explorer/FileExplorerBasic';
```

The simple version of the File Explorer component receives its items as JSX children.
This is the recommended version for hardcoded items.

{{"demo": "FileExplorerBasic.js"}}

### File Explorer

```jsx
import { FileExplorer } from '@stoked-ui/file-explorer/FileExplorer';
```

The rich version of the File Explorer component receives its items dynamically from an external data source.
This is the recommended version for larger trees, as well as those that require more advanced features like editing and virtualization.

{{"demo": "FileExplorerDynamic.js"}}

:::info
At the moment, the Simple and File Explorers are similar in terms of feature support. But as the component grows, you can expect to see the more advanced ones appear primarily on the File Explorer.
:::

### File Explorer components

The `@stoked-ui/file-explorer` package exposes two different components to define your tree items:

- `FileElement`
- `File`

#### `FileElement`

This is a traditional node like markup based component that is associated with node tree component.

When using `FileExplorerBasic`,
you can import it from `@stoked-ui/file-explorer/FileElement` and use it as a child of the `FileExplorerBasic` component:

```tsx
import { FileExplorerBasic } from '@stoked-ui/file-explorer/FileExplorerBasic';
import { FileElement } from '@stoked-ui/file-explorer/FileElement';

export default function App() {
  return (
    <FileExplorerBasic>
      <FileElement itemId="1" label="Item 1" />
      <FileElement itemId="2" label="Item 2" />
    </FileExplorerBasic>
  );
}
```

When using `FileExplorer`,
you don't have to import anything; it's the default component used to render the items:

```tsx
import { FileExplorer } from '@stoked-ui/file-explorer/FileExplorer';

export default function App() {
  return <FileExplorer items={ITEMS} />;
}
```

#### `File`

This is a new component that provides a more powerful customization API, and used in cases that are more complicated and dynamic than `FileElement`.

When using `FileExplorerBasic`,
you can import it from `@stoked-ui/file-explorer/File` and use it as a child of the `FileExplorerBasic` component:

```tsx
import { FileExplorerBasic } from '@stoked-ui/file-explorer/FileExplorerBasic';
import { File } from '@stoked-ui/file-explorer/File';

export default function App() {
  return (
    <FileExplorerBasic>
      <File name="File 1" />
      <File name="File 2" />
    </FileExplorerBasic>
  );
}
```

When using `FileExplorer`,
you can import it from `@stoked-ui/file-explorer/File` and pass it as a slot of the `FileExplorer` component:

```tsx
import { FileExplorer } from '@stoked-ui/file-explorer/FileExplorer';
import { File } from '@stoked-ui/file-explorer/File';
import { ITEMS } from './items';

export default function App() {
  return <FileExplorer items={ITEMS} slots={{ item: File }} />;
}
```
