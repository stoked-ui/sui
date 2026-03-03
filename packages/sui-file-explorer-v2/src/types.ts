import { TreeViewBaseItem } from '@mui/x-tree-view/models';

export type FileType = 'image' | 'pdf' | 'doc' | 'video' | 'folder' | 'pinned' | 'trash';

export type ExtendedTreeItemProps = {
  fileType?: FileType;
  id: string;
  label: string;
};

export type FileItem = {
  fileType: FileType;
  id: string;
  label: string;
  children?: FileItem[];
};

export interface FileExplorerV2Props {
  items: TreeViewBaseItem<ExtendedTreeItemProps>[];
  defaultExpandedItems?: string[];
  defaultSelectedItems?: string;
  sx?: Record<string, unknown>;
  itemChildrenIndentation?: number;
}
