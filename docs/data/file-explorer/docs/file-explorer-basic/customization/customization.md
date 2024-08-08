---
productId: file-explorer
title: File Explorer Basic - Customization
components: FileExplorerBasic, FileElement, File
packageName: '@stoked-ui/file-explorer'
githubLabel: 'component: file explorer'
waiAria: https://www.w3.org/WAI/ARIA/apg/patterns/treeview/
---

# File Explorer Basic - Customization

<p class="description">Learn how to customize the File Explorer Basic component.</p>

## Basics

### Custom icons

Use the `collapseIcon` slot, the `expandIcon` slot and the `defaultEndIcon` prop to customize the File Explorer icons.
The demo below shows how to add icons using both an existing icon library, such as [Material Icons](/material-ui/material-icons/), and creating an icon from scratch using Material UI's [SVG Icon component](/material-ui/icons/#svgicon).

{{"demo": "CustomIcons.js", "defaultCodeOpen": false}}

### Custom toggle animations

Use the `groupTransition` slot on the `FileElement` to pass a component that handles your animation.

The demo below is animated using Material UI's [Collapse](/material-ui/transitions/#collapse) component together with the [react-spring](https://www.react-spring.dev/) library.

{{"demo": "CustomAnimation.js", "defaultCodeOpen": false}}

### Custom styling

Use `fileElementClasses` to target internal elements of the Tree Item component and change their styles.

{{"demo": "CustomStyling.js"}}

### Custom label

:::warning
This example is built using the new `File` component
which adds several slots to modify the content of the Tree Item or change its behavior.

You can learn more about this new component in the [Overview page](/x/react-file-explorer/#file-element-components).
:::

Use the `label` slot to customize the Tree Item label or to replace it with a custom component.

The `slotProps` prop allows you to pass props to the label component.
The demo below shows how to pass an `id` attribute to the Tree Item label:

{{"demo": "LabelSlotProps.js", "defaultCodeOpen": false }}

The `slots` prop allows you to replace the default label with your own component:
The demo below shows how to add a tooltip on the Tree Item label:

{{"demo": "LabelSlots.js", "defaultCodeOpen": false}}

### Headless API

Use the `useFile` hook to create your own component.
The demo below shows how to add an avatar and custom typography elements.

{{"demo": "HeadlessAPI.js", "defaultCodeOpen": false}}

## Common examples

### Connection border

Target the `fileElementClasses.groupTransition` class to add connection borders between the File Explorer items.

{{"demo": "BorderedFileExplorer.js", "defaultCodeOpen": false}}

### Gmail clone

:::warning
This example is built using the new `File` component
which adds several slots to modify the content of the Tree Item or change its behavior.

You can learn more about this new component in the [Overview page](/x/react-file-explorer/#file-element-components).
:::

Google's Gmail side nav is potentially one of the web's most famous file explorer components.
The demo below shows how to replicate it.

The Gmail sidebar is one of the most well known examples of a tree view.
The demo below shows how to recreate it with the File Explorer component:

{{"demo": "GmailFileExplorer.js"}}
