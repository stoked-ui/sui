---
productId: file-explorer
title: File Explorer - Getting started
components: FileExplorerBasic, FileExplorer, FileElement, FileExplorer
packageName: '@stoked-ui/file-explorer'
githubLabel: 'component: file explorer'
waiAria: https://www.w3.org/WAI/ARIA/apg/patterns/treeview/
---

# Getting Started

<p class="description">Get started with the File Explorer. Install the package, configure your application and start using the components.</p>

## Installation

Using your favorite package manager, install `@stoked-ui/file-explorer`:

<!-- #default-branch-switch -->

<codeblock storageKey="package-manager">
```bash npm
npm install @stoked-ui/file-explorer
```

```bash yarn
yarn add @stoked-ui/file-explorer
```

```bash pnpm
pnpm add @stoked-ui/file-explorer
```

</codeblock>

The File Explorer package has a peer dependency on `@mui/material`.
If you are not already using it in your project, you can install it with:

<codeblock storageKey="package-manager">
```bash npm
npm install @stoked-ui/file-explorer @mui/material @emotion/react @emotion/styled
```
```bash yarn
yarn add @stoked-ui/file-explorer @mui/material @emotion/react @emotion/styled
```
```bash pnpm
pnpm add @stoked-ui/file-explorer @mui/material @emotion/react @emotion/styled
```
</codeblock>

<!-- #react-peer-version -->

Please note that [react](https://www.npmjs.com/package/react) and [react-dom](https://www.npmjs.com/package/react-dom) are peer dependencies too:

```json
"peerDependencies": {
  "react": "^17.0.0 || ^18.0.0",
  "react-dom": "^17.0.0 || ^18.0.0"
},
```

### Style engine

Material UI is using [Emotion](https://emotion.sh/docs/introduction) as a styling engine by default. If you want to use [`styled-components`](https://styled-components.com/) instead, run:

<codeblock storageKey="package-manager">
```bash npm
npm install @stoked-ui/file-explorer @mui/material @mui/styled-engine-sc styled-components
```

```bash yarn
yarn add@stoked-ui/file-explorer @mui/material @mui/styled-engine-sc styled-components
```

```bash pnpm
pnpm add @stoked-ui/file-explorer @mui/material @mui/styled-engine-sc styled-components
```

</codeblock>

Take a look at the [Styled engine guide](/material-ui/integrations/styled-components/) for more information about how to configure `styled-components` as the style engine.

## Render your first component

To make sure that everything is set up correctly, try rendering a `FileExplorerBasic` component:

{{"demo": "FirstComponent.js"}}

## Accessibility

(WAI-ARIA: https://www.w3.org/WAI/ARIA/apg/patterns/treeview/)

The component follows the WAI-ARIA authoring practices.

To have an accessible file explorer you must use `aria-labelledby`
or `aria-label` to reference or provide a label on the FileExplorer,
otherwise, screen readers will announce it as "tree", making it hard to understand the context of a specific tree item.

## TypeScript

In order to benefit from the [CSS overrides](/material-ui/customization/theme-components/#theme-style-overrides) and [default prop customization](/material-ui/customization/theme-components/#theme-default-props) with the theme, TypeScript users need to import the following types.
Internally, it uses module augmentation to extend the default theme structure.

```tsx
// When using TypeScript 4.x and above
import type {} from '@stoked-ui/file-explorer/themeAugmentation';
// When using TypeScript 3.x and below
import '@stoked-ui/file-explorer/themeAugmentation';

const theme = createTheme({
  components: {
    MuiFileExplorer: {
      styleOverrides: {
        root: {
          backgroundColor: 'red',
        },
      },
    },
  },
});
```
