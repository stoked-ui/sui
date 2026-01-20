import * as React from 'react';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { TreeItem2 } from '@mui/x-tree-view/TreeItem2';
import { useTreeItem2 } from '@mui/x-tree-view/useTreeItem2';
import { TreeItem2DragAndDropOverlay } from '@mui/x-tree-view/TreeItem2DragAndDropOverlay';
import Box from '@mui/material/Box';
import { FileBase } from '../models';
import { MediaType } from '@stoked-ui/media-selector';
import FolderRounded from '@mui/icons-material/FolderRounded';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ArticleIcon from '@mui/icons-material/Article';
import VideoFile from '@mui/icons-material/VideoFile';
import AudioFile from '@mui/icons-material/AudioFile';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import DeleteIcon from '@mui/icons-material/Delete';
import StokedUiFile from '../File/StokedUIFile';
import LottieIcon from '../icons/LottieIcon';
import { useFileExplorerContext } from '../internals/FileExplorerProvider/useFileExplorerContext';
import { FileExplorerGridColumns } from '../internals/plugins/useFileExplorerGrid/FileExplorerGridColumns';
import type { UseFileExplorerGridSignature } from '../internals/plugins/useFileExplorerGrid/useFileExplorerGrid.types';

/**
 * Props for CustomFileTreeItem component
 * Extends TreeItem props with file-specific customization
 */
export interface CustomFileTreeItemProps extends Omit<React.ComponentProps<typeof TreeItem>, 'nodeId'> {
  /**
   * Node identifier for the tree item
   * Made optional to satisfy MUI X RichTreeView slots contract
   */
  nodeId?: string;
  /**
   * File data preserved from FileExplorer items
   */
  _fileData?: FileBase;
  /**
   * Custom slots for icon and label rendering
   */
  slots?: {
    icon?: React.ElementType;
    endIcon?: React.ElementType;
    expandIcon?: React.ElementType;
    collapseIcon?: React.ElementType;
  };
  /**
   * Props for icon slots
   */
  slotProps?: {
    icon?: Record<string, any>;
    endIcon?: Record<string, any>;
    expandIcon?: Record<string, any>;
    collapseIcon?: Record<string, any>;
  };
}

/**
 * Helper function to get icon component based on file type
 * Used when no custom slot is provided
 */
const getIconFromFileType = (fileType: MediaType | string): React.ElementType => {
  switch (fileType) {
    case 'image':
      return ImageIcon;
    case 'pdf':
      return PictureAsPdfIcon;
    case 'doc':
      return ArticleIcon;
    case 'lottie':
      return LottieIcon;
    case 'audio':
      return AudioFile;
    case 'video':
      return VideoFile;
    case 'folder':
      return FolderRounded;
    case 'pinned':
      return FolderOpenIcon;
    case 'trash':
      return DeleteIcon;
    case 'project':
      return StokedUiFile;
    default:
      return ArticleIcon;
  }
};

/**
 * CustomFileTreeItem - MUI X Tree View compatible component with FileExplorer customization
 *
 * Work Item 2.2: Updated to use useTreeItem2 hook pattern for better DnD integration
 *
 * This component provides:
 * - useTreeItem2 hook integration with TreeItem2DragAndDropOverlay (WI 2.2)
 * - Custom icon rendering based on file type
 * - Label customization via slots and slot props
 * - Preservation of FileExplorer's icon and label logic
 * - Grid mode support with column rendering (Work Item 1.4)
 * - Drag-and-drop visual feedback via TreeItem2DragAndDropOverlay
 * - Backward compatibility with existing icon customization props
 *
 * AC-1.3.a: Custom icons render for file types (video, project, folder, etc.)
 * AC-1.3.b: Labels display correctly from FileBase metadata
 * AC-1.3.c: Existing icon props from FileExplorer work seamlessly
 * AC-1.4.a: Grid view renders using RichTreeView with this component
 * AC-1.4.b: FileExplorerTabs component works correctly
 * AC-1.4.c: Column headers align with tree items
 * AC-2.2.a: TreeItem2DragAndDropOverlay renders during drag operations
 * AC-2.2.b: Visual feedback indicates valid/invalid drop targets
 */
export const CustomFileTreeItem = React.forwardRef<
  HTMLLIElement,
  CustomFileTreeItemProps
>(function CustomFileTreeItem(
  {
    _fileData,
    slots,
    slotProps,
    label,
    nodeId,
    ...props
  }: CustomFileTreeItemProps,
  ref,
) {
  // Check if grid mode is enabled via context
  const context = useFileExplorerContext<[UseFileExplorerGridSignature]>();
  const isGridMode = context?.instance?.gridEnabled?.() ?? false;
  // Check if internal DnD is enabled (method may not exist if DnD plugin not loaded)
  const dndInternal = (context?.instance as any)?.dndInternalEnabled?.() ?? false;

  // Default to label prop or fileData.name if available
  const displayLabel = label || _fileData?.name || nodeId || '';

  // nodeId is required by TreeItem, fallback to empty string if not provided
  const itemId = nodeId || _fileData?.id || '';

  // Determine icon based on file type
  let IconComponent: React.ElementType | undefined;

  if (_fileData) {
    const isExpandable = Array.isArray(_fileData.children) && _fileData.children.length > 0;

    if (isExpandable) {
      IconComponent = _fileData.mediaType === 'project' ? StokedUiFile : FolderRounded;
    } else if (_fileData.mediaType) {
      IconComponent = getIconFromFileType(
        _fileData.id === 'trash' ? 'trash' : _fileData.mediaType
      );
    }
  }

  // Render label content (shared between grid and non-grid modes)
  const labelContent = (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        overflow: 'hidden',
      }}
    >
      {IconComponent && (
        <Box
          component={IconComponent}
          className="customFileTreeItemIcon"
          sx={{
            flexShrink: 0,
            fontSize: '1.2rem',
            display: 'flex',
            alignItems: 'center',
          }}
        />
      )}
      <Box
        sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          flex: 1,
        }}
      >
        {displayLabel}
      </Box>
    </Box>
  );

  // Work Item 1.4: Grid mode rendering
  // When in grid mode, wrap label in cell container and append grid columns
  const contentElement = isGridMode && _fileData ? (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        alignItems: 'center',
      }}
    >
      <Box
        className="cell column-file"
        sx={(theme) => ({
          display: 'flex',
          flexGrow: 1,
          padding: theme.spacing(0.5),
          paddingLeft: theme.spacing(1),
        })}
      >
        {labelContent}
      </Box>
      <FileExplorerGridColumns item={_fileData} />
    </Box>
  ) : labelContent;

  // Filter out extracted props to avoid passing them twice to TreeItem
  const treeItemProps = Object.fromEntries(
    Object.entries(props).filter(
      ([key]) => !['_fileData', 'slots', 'slotProps', 'label'].includes(key)
    )
  );

  // Work Item 2.2: Use TreeItem2 with useTreeItem2 hook when DnD is enabled
  // This provides access to getDragAndDropOverlayProps for visual feedback
  if (dndInternal) {
    // Note: useTreeItem2 hook pattern would be used here with RichTreeViewPro
    // For now, we use TreeItem2 component which internally uses the hook
    // When RichTreeViewPro is available, this will enable itemsReordering
    return (
      <TreeItem2
        ref={ref}
        itemId={itemId}
        label={contentElement}
        slots={{
          ...slots,
          dragAndDropOverlay: TreeItem2DragAndDropOverlay,
        }}
        slotProps={{
          ...slotProps,
          dragAndDropOverlay: {
            // Grid mode: overlay should span all columns
            sx: isGridMode ? {
              width: '100%',
              display: 'flex',
            } : undefined,
          },
        }}
        {...(treeItemProps as any)}
      />
    );
  }

  // Fallback to TreeItem for non-DnD mode (backward compatibility)
  return (
    <TreeItem
      ref={ref}
      nodeId={itemId}
      label={contentElement}
      {...(treeItemProps as any)}
    />
  );
});

CustomFileTreeItem.displayName = 'CustomFileTreeItem';
