import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { useSlotProps } from '@mui/base/utils';
import unsupportedProp from '@mui/utils/unsupportedProp';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import FolderRounded from '@mui/icons-material/FolderRounded';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ArticleIcon from '@mui/icons-material/Article';
import VideoFile from '@mui/icons-material/VideoFile';
import AudioFile from '@mui/icons-material/AudioFile';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import DeleteIcon from '@mui/icons-material/Delete';
import StokedUiFile from './StokedUIFile'
import Box from '@mui/material/Box';
import { namedId} from '@stoked-ui/common';
import { MediaType } from '@stoked-ui/media-selector';
import LottieIcon from '../icons/LottieIcon';
import { FileLabel } from './FileLabel';
import { createUseThemeProps } from '../internals/zero-styled';
import { FileProvider } from '../internals/FileProvider';
import { FileComponent, FileOwnerState, FileProps } from './File.types';
import { useFile } from '../useFile';
import { FileExplorerGridColumns } from '../internals/plugins/useFileExplorerGrid/FileExplorerGridColumns';
import { FileExplorerDndItemContext } from '../internals/plugins/useFileExplorerDnd/FileExplorerDndItemContext';

import {
  FileCheckbox,
  FileContent,
  FileRoot,
  TransitionComponent,
  useUtilityClasses,
} from './FileExtras';

const useThemeProps = createUseThemeProps('MuiFile');

/**
 *
 * Demos:
 *
 * - [File](https://stoked-ui.github.io/x/react-file-list-view/)
 *
 * API:
 *
 * - [File API](https://stoked-ui.github.io/x/api/file-list-view/file-element-2/)
 */
export const File = React.forwardRef(function File(
  inProps: FileProps & any,
  forwardedRef: React.Ref<HTMLLIElement>,
) {
  const props = useThemeProps({ props: inProps, name: 'MuiFile' });
  const newProps = () => {
    const id = namedId({ id: 'file', length: 6 });
    return { id, name: 'file', disabled: false, children: null };
  };
  const {
    id,
    name,
    disabled,
    children,
    slots = {},
    slotProps = {},
    type,
    mediaType,
    size,
    lastModified,
    sx,
    ...other
  } = props ?? newProps();

  const item = {
    id,
    name,
    disabled,
    children,
    slots,
    slotProps,
    type,
    mediaType,
    size,
    lastModified,
    sx,
  };

  const {
    getRootProps,
    getContentProps,
    getCheckboxProps,
    getLabelProps,
    getGroupTransitionProps,
    status,
  } = useFile(props);

  const { DropIndicator } = React.useContext(FileExplorerDndItemContext);

  const ownerState: FileOwnerState = {
    ...props,
    ...status,
  };

  const classes = useUtilityClasses(ownerState);

  const Content: React.ElementType = slots.content ?? FileContent;

  const classNames: any = {
    [classes.expanded]: status.expanded,
    [classes.selected]: status.selected,
    [classes.focused]: status.focused,
    [classes.disabled]: status.disabled,
    [`row-${status.visibleIndex}`]: status.visibleIndex !== -1,
  };

  const oddEven = status.visibleIndex % 2 === 0 ? 'Mui-even' : 'Mui-odd';
  classNames[oddEven] = oddEven;

  const contentProps = useSlotProps({
    elementType: Content,
    getSlotProps: getContentProps,
    externalSlotProps: slotProps.content,
    ownerState: {},
    className: clsx(classes.content, classNames),
  });

  const Root: React.ElementType = slots.root ?? FileRoot;
  const rootProps = useSlotProps({
    elementType: Root,
    getSlotProps: getRootProps,
    externalForwardedProps: other,
    externalSlotProps: slotProps.root,
    additionalProps: {
      ref: forwardedRef,
    },
    ownerState: {},
    className: classes.root,
  });

  const getIconFromFileType = (fileType: MediaType | string) => {
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

  let icon;
  if (status.expandable) {
    icon = item.mediaType === 'project' ? StokedUiFile : FolderRounded;
  } else if (item.mediaType) {
    icon = getIconFromFileType(item.id === 'trash' ? 'trash' : item.mediaType);
  }

  const contentMetaProps = {
    first: (status.visibleIndex === 0 ? true : undefined) as true | undefined,
  };

  if (status.dndState !== 'idle') {
    // console.log('status', status.dndState);
  } // const iconProps = getIconContainerProps();
  const InnerContent: React.ReactNode = (
    <div className={'target-label'} style={{ overflow: 'hidden', width: '100%' }}>
      {status.dndInstruction ? <DropIndicator instruction={status.dndInstruction} /> : null}

      <FileCheckbox {...getCheckboxProps()} />
      <FileLabel
        {...getLabelProps({ icon, expandable: status.expandable })}
        grid={status.grid}
        status={status}
        showIcon={!status.grid && status.expandable}
        id={`${item.id}-preview`}
      />
    </div>
  );

  let itemContent = (
    <FileContent {...contentProps} grid={false}>
      {InnerContent}
    </FileContent>
  );

  const fileContent = itemContent;
  if (status.grid) {
    itemContent = (
      <FileContent {...contentProps} {...contentMetaProps} id={`grid-${item.id}-row`}>
        <Box
          sx={(theme) => ({
            display: 'flex',
            flexGrow: 1,
            padding: theme.spacing(0.5),
            paddingLeft: theme.spacing(1),
          })}
          className={'cell column-file'}
          id={`${item.id}-primary`}
        >
          {InnerContent}
        </Box>
        <FileExplorerGridColumns item={{ ...props, selected: status.selected }} />
      </FileContent>
    );
  }

  const { visibleIndex, defaultExpandedItems, defaultSelectedItems, expanded, ...rootPropsAllowed } = rootProps;
  return (
    <FileProvider id={item.id}>
      <FileRoot {...rootPropsAllowed}>
        {itemContent}
        {children && <TransitionComponent {...getGroupTransitionProps()} />}
      </FileRoot>
      {status.dndState === 'preview' && status.dndContainer
        ? ReactDOM.createPortal(fileContent, status.dndContainer)
        : null}
    </FileProvider>
  );
}) as FileComponent;

File.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  /**
   * The content of the component.
   */
  children: PropTypes.node,
  /**
   * Override or extend the styles applied to the component.
   */
  classes: PropTypes.object,
  className: PropTypes.string,
  /**
   * If `true`, the item is disabled.
   * @default false
   */
  disabled: PropTypes.bool,
  /**
   * The id attribute of the item. If not provided, it will be generated.
   */
  /**
   * The id of the item.
   * Must be unique.
   */
  id: PropTypes.string,

  lastModified: PropTypes.number,
  mediaType: PropTypes.oneOf([
    'audio',
    'doc',
    'file',
    'folder',
    'image',
    'lottie',
    'pdf',
    'trash',
    'video',
    PropTypes.string
  ]),
  name: PropTypes.string,
  /**
   * Callback fired when the item root is blurred.
   */
  onBlur: PropTypes.func,
  /**
   * This prop isn't supported.
   * Use the `onItemFocus` callback on the tree if you need to monitor an item's focus.
   */
  onFocus: unsupportedProp,
  /**
   * Callback fired when a key is pressed on the keyboard and the tree is in focus.
   */
  onKeyDown: PropTypes.func,
  size: PropTypes.number,
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps: PropTypes.object,
  /**
   * Overridable component slots.
   * @default {}
   */
  slots: PropTypes.object,
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
  type: PropTypes.string,
};
