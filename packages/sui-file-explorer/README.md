# File Explorer Component

A versatile and customizable file explorer component for React applications, built with Material-UI.

## Features

- Hierarchical display of files and folders
- Expandable/collapsible folders
- File selection with click and double-click handling
- Drag and drop functionality
- Custom icon and name rendering
- Integration with Material-UI's styling system

## Installation

```bash
npm install @stoked-ui/file-explorer
# or
yarn add @stoked-ui/file-explorer
```

## Basic Usage

```jsx
import { FileExplorer, MediaType } from '@stoked-ui/file-explorer';

function MyComponent() {
  const items = [
    {
      id: 'folder-1',
      name: 'Documents',
      type: 'folder',
      mediaType: MediaType.FOLDER,
      children: [
        { 
          id: 'file-1', 
          name: 'Resume.pdf', 
          type: 'file',
          mediaType: MediaType.PDF,
        },
        { 
          id: 'file-2', 
          name: 'Report.docx', 
          type: 'file',
          mediaType: MediaType.DOCUMENT,
        }
      ]
    }
  ];

  return (
    <FileExplorer 
      items={items}
      defaultExpandedItems={['folder-1']}
      onClickItem={(id) => console.log(`Clicked item: ${id}`)}
    />
  );
}
```

## Advanced Usage

For more advanced usage examples, including state management, file details display, and file operations, see the [documentation](./docs/src/components/FileExplorer/fileexplorer.md).

## Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `FileBase[]` | `[]` | Array of file and folder items to display |
| `defaultExpandedItems` | `string[]` | `[]` | Array of item IDs that should be expanded by default |
| `onClickItem` | `(id: string) => void` | - | Callback when an item is clicked |
| `onDoubleClickItem` | `(id: string) => void` | - | Callback when an item is double-clicked |
| `onExpandItem` | `(ids: string[]) => void` | - | Callback when an item is expanded or collapsed |
| `onMoveItem` | `(dragId: string, dropId: string) => void` | - | Callback when an item is moved (drag and drop) |
| `renderIcon` | `(item: FileBase) => React.ReactNode` | - | Custom renderer for item icons |
| `renderName` | `(item: FileBase) => React.ReactNode` | - | Custom renderer for item names |
| `iconSx` | `SxProps` | - | Style overrides for the icon container |
| `sx` | `SxProps` | - | Style overrides for the component |

## License

MIT
