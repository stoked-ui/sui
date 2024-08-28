---
productId: file-explorer
title: File Explorer - Customization
components: FileExplorer, FileElement, File
packageName: '@stoked-ui/file-explorer'
githubLabel: 'component: file explorer'
waiAria: https://www.w3.org/WAI/ARIA/apg/patterns/treeview/
---

# File Explorer - Drag and Drop

<p class="description">Learn how to use the drag and drop features of the File Explorer.</p>

## Drag and drop properties

The `@stoked-ui/file-explorer` package exposes four different properties to manage drag and drop functionality:

- `dndInternal`
- `dndExternal`
- `dndFileTypes`
- `dndTrash`

### Internal 

Set the `dndInternal` prop on the FileExplorer component to `true` to enable drag and drop within the same tree.

The demo below shows how to enable drag and drop within the same tree:

{{"demo": "DragAndDropInternal.js", "defaultCodeOpen": false}}

### External

Set the `dndExternal` prop on the FileExplorer component to `true` to enable drag and drop within the same tree.

The demo below shows how to enable drag and drop files onto the tree:

{{"demo": "DragAndDropExternal.js", "defaultCodeOpen": false}}

### Trash

Set the `dndTrash` prop on the FileExplorer component to `true` to enable the drag and drop trash feature. The trash feature consists of a trash icon at the bottom of the list that allows you to remove list items by dropping them on it.

The demo below shows how to enable the drag and drop trash feature:

{{"demo": "DragAndDropTrash.js", "defaultCodeOpen": false}}

### File Types

Set the `dndFileTypes` prop on the FileExplorer component to `[...file-type,]`. This allows you to configure which file types can be accepted by the dndExternal feature. The file types are defined by their MIME type.

The demo below shows how to configure the file types accepted by the dndExternal feature:

{{"demo": "DragAndDropTrash.js", "defaultCodeOpen": false}}
