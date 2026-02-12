import { TreeViewBaseItem } from '@mui/x-tree-view';
import { FileBase } from '../../models';

/**
 * Transforms FileBase[] structure to MUI X TreeViewBaseItem[] format
 * Required for RichTreeView component compatibility
 */
export function transformFilesToTreeItems(
  files: readonly FileBase[],
  getItemId?: (item: FileBase) => string,
  getItemLabel?: (item: FileBase) => string,
): TreeViewBaseItem[] {
  return files.map((file) => transformFileToTreeItem(file, getItemId, getItemLabel));
}

function transformFileToTreeItem(
  file: FileBase,
  getItemId?: (item: FileBase) => string,
  getItemLabel?: (item: FileBase) => string,
): TreeViewBaseItem {
  const item: TreeViewBaseItem = {
    id: getItemId ? getItemId(file) : file.id,
    label: getItemLabel ? getItemLabel(file) : file.name,
    // Preserve full FileBase data for CustomFileTreeItem and grid rendering
    // This enables icon rendering, grid columns, and other file-specific features
    _fileData: file,
  } as any;

  // Recursively transform children if they exist
  if (file.children && file.children.length > 0) {
    item.children = file.children.map((child) => transformFileToTreeItem(child, getItemId, getItemLabel));
  }

  return item;
}
