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
import VideoCameraBackIcon from '@mui/icons-material/VideoCameraBack';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import DeleteIcon from '@mui/icons-material/Delete';
import Box from '@mui/material/Box';
import { IdGenerator } from '@stoked-ui/media-selector';
import { FileLabel } from './FileLabel';
import { createUseThemeProps } from '../internals/zero-styled';
import { FileProvider } from '../internals/FileProvider';
import { FileComponent, FileOwnerState, FileProps } from './File.types';
import { useFile } from '../useFile';
import { FileExplorerGridColumns } from '../internals/plugins/useFileExplorerGrid/FileExplorerGridColumns';
import { FileExplorerDndItemContext } from '../internals/plugins/useFileExplorerDnd/FileExplorerDndItemContext';
import { FileType } from '../models';
import {
  useUtilityClasses,
  FileContent,
  FileRoot,
  FileCheckbox,
  TransitionComponent,
} from './FileExtras';

const useThemeProps = createUseThemeProps('MuiFile');

/**
 *
 * Demos:
 *
 * - [File List View](https://stokedui.com/x/react-file-list-view/)
 *
 * API:
 *
 * - [File API](https://stokedui.com/x/api/file-list-view/file-element-2/)
 */
export const File = React.forwardRef(function File(
  inProps: FileProps & any,
  forwardedRef: React.Ref<HTMLLIElement>,
) {
  const props = useThemeProps({ props: inProps, name: 'MuiFile' });
  const newProps = () => {
    const idGenerator = IdGenerator();
    const id = idGenerator.fileId();
    return { id, itemId: id, label: '', disabled: false, children: null };
  };
  const {
    id,
    itemId,
    label,
    disabled,
    children,
    slots = {},
    slotProps = {},
    type,
    size,
    modified,
    sx,
    ...other
  } = props ?? newProps();

  const item = {
    id,
    itemId,
    label,
    disabled,
    children,
    slots,
    slotProps,
    type,
    size,
    modified,
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

  // eslint-disable-next-line no-console -- debug information
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

  const getIconFromFileType = (fileType: FileType | string) => {
    switch (fileType) {
      case 'image':
        return ImageIcon;
      case 'pdf':
        return PictureAsPdfIcon;
      case 'doc':
        return ArticleIcon;
      case 'video':
        return VideoCameraBackIcon;
      case 'folder':
        return FolderRounded;
      case 'pinned':
        return FolderOpenIcon;
      case 'trash':
        return DeleteIcon;
      default:
        return ArticleIcon;
    }
  };

  let icon;
  if (status.expandable) {
    icon = FolderRounded;
  } else if (item.type) {
    icon = getIconFromFileType(item.itemId === 'trash' ? 'trash' : item.type);
  }

  const contentMetaProps = {
    first: (status.visibleIndex === 0 ? true : undefined) as true | undefined,
  };

  if (status.dndState !== 'idle') {
    // console.log('status', status.dndState);
  } // const iconProps = getIconContainerProps();
  const InnerContent: React.ReactNode = (
    <React.Fragment>
      {status.dndInstruction ? <DropIndicator instruction={status.dndInstruction} /> : null}

      <FileCheckbox {...getCheckboxProps()} />
      <FileLabel
        {...getLabelProps({ icon, expandable: status.expandable && status.expanded })}
        grid={status.grid}
        status={status}
        showIcon={item.type === 'folder'}
        id={`${item.itemId}-preview`}
      />
    </React.Fragment>
  );

  let itemContent = (
    <FileContent {...contentProps} grid={false}>
      {InnerContent}
    </FileContent>
  );

  const fileContent = itemContent;
  if (status.grid) {
    itemContent = (
      <FileContent {...contentProps} {...contentMetaProps} id={`grid-${item.itemId}-row`}>
        <Box
          sx={(theme) => ({
            display: 'flex',
            flexGrow: 1,
            padding: theme.spacing(0.5),
            paddingLeft: theme.spacing(1),
          })}
          className={'cell column-file'}
          id={`${item.itemId}-primary`}
        >
          {InnerContent}
        </Box>
        <FileExplorerGridColumns item={{ ...props, selected: status.selected }} />
      </FileContent>
    );
  }

  const { visibledefaultExpandedItems, defaultSelectedItems, expanded, ...rootPropsAllowed } =
    rootProps;
  return (
    <FileProvider itemId={item.itemId}>
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
  id: PropTypes.string,
  /**
   * The id of the item.
   * Must be unique.
   */
  itemId: PropTypes.string,
  /**
   * The label of the item.
   */
  label: PropTypes.node,
  modified: PropTypes.number,
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
  type: PropTypes.oneOf(['doc', 'file', 'folder', 'image', 'pdf', 'trash', 'video']),
} as any;
