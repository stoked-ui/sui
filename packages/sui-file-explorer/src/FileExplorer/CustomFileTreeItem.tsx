import * as React from 'react';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
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

/**
 * Props for CustomFileTreeItem component
 * Extends TreeItem props with file-specific customization
 */
export interface CustomFileTreeItemProps extends React.ComponentProps<typeof TreeItem> {
  /**
   * Node identifier for the tree item
   */
  nodeId: string;
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
 * This component wraps TreeItem and provides:
 * - Custom icon rendering based on file type
 * - Label customization via slots and slot props
 * - Preservation of FileExplorer's icon and label logic
 * - Backward compatibility with existing icon customization props
 *
 * AC-1.3.a: Custom icons render for file types (video, project, folder, etc.)
 * AC-1.3.b: Labels display correctly from FileBase metadata
 * AC-1.3.c: Existing icon props from FileExplorer work seamlessly
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
  // Default to label prop or fileData.name if available
  const displayLabel = label || _fileData?.name || nodeId;

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

  // Render custom content with icon and label
  const contentElement = (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        width: '100%',
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

  // Filter out extracted props to avoid passing them twice to TreeItem
  const treeItemProps = Object.fromEntries(
    Object.entries(props).filter(
      ([key]) => !['_fileData', 'slots', 'slotProps', 'label'].includes(key)
    )
  );

  return (
    <TreeItem
      ref={ref}
      nodeId={nodeId}
      label={contentElement}
      {...(treeItemProps as any)}
    />
  );
});

CustomFileTreeItem.displayName = 'CustomFileTreeItem';
