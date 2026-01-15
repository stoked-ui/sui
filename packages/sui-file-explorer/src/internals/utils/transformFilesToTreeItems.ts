import { TreeViewBaseItem } from '@mui/x-tree-view';
import { FileBase } from '../../models';

/**
 * Transforms FileBase[] structure to MUI X TreeViewBaseItem[] format
 * Required for RichTreeView component compatibility
 */
export function transformFilesToTreeItems(files: readonly FileBase[]): TreeViewBaseItem[] {
  return files.map((file) => transformFileToTreeItem(file));
}

function transformFileToTreeItem(file: FileBase): TreeViewBaseItem {
  const item: TreeViewBaseItem = {
    id: file.id,
    label: file.name,
  };

  // Recursively transform children if they exist
  if (file.children && file.children.length > 0) {
    item.children = file.children.map((child) => transformFileToTreeItem(child));
  }

  return item;
}
