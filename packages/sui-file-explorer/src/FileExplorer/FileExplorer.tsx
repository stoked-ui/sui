/**
 *
 * Demos:
 *
 * - [FileExplorer View](https://stoked-ui.github.io/file-explorer/docs/)
 *
 * API:
 *
 * - [FileExplorer API](https://stoked-ui.github.io/file-explorer/api/)
 */

import * as React from 'react';
import PropTypes from 'prop-types';
import composeClasses from '@mui/utils/composeClasses';
import { useSlotProps } from '@mui/base/utils';
import { shouldForwardProp } from '@mui/system/createStyled';
import { FileBase } from '../models';
import { getFileExplorerUtilityClass } from './fileExplorerClasses';
import { FileExplorerProps } from './FileExplorer.types';
import { createUseThemeProps, styled } from '../internals/zero-styled';
import { useFileExplorer } from '../internals/useFileExplorer/useFileExplorer';
import { FileExplorerProvider } from '../internals/FileExplorerProvider';
import { FILE_EXPLORER_PLUGINS, FileExplorerPluginSignatures } from './FileExplorer.plugins';
import { buildWarning } from '../internals/utils/warning';
import { FileExplorerGridHeaders } from '../internals/plugins/useFileExplorerGrid/FileExplorerGridHeaders';
import { FileWrapped } from './FileWrapped';
import { FileExplorerDndContext } from '../internals/plugins/useFileExplorerDnd/FileExplorerDndContext';
import { FileDropzone } from '../FileDropzone';
import { GridColumns } from "../internals/plugins/useFileExplorerGrid/useFileExplorerGrid.types";
import { SxProps } from "@mui/system";

/**
 * Utility function to obtain theme props for the FileExplorer component.
 */
const useThemeProps = createUseThemeProps('MuiFileExplorer');

/**
 * Utility function to obtain utility classes for the FileExplorer component.
 *
 * @param {FileExplorerProps<Multiple>} ownerState - The owner state of the FileExplorer component.
 * @returns {Record<string, string[]>} - The utility classes for the FileExplorer component.
 */
const useUtilityClasses = <Multiple extends boolean | undefined>(
  ownerState: FileExplorerProps<Multiple>,
) => {
  const { classes } = ownerState;

  const slots = {
    root: ['root'],
  };

  return composeClasses(slots, getFileExplorerUtilityClass, classes);
};

/**
 * Root component for the FileExplorer view.
 * 
 * @param {object} props - The props for the FileExplorer component.
 * @param {boolean} props.grow - If true, the FileExplorer component should grow.
 * @param {boolean} props.header - If true, the FileExplorer component is a header.
 * @param {boolean} props.cell - If true, the FileExplorer component is a cell.
 * @param {boolean} props.last - If true, the FileExplorer component is the last item.
 * @returns {JSX.Element} - The rendered FileExplorer root component.
 */
export const FileExplorerRoot = styled('ul', {
  name: 'MuiFileExplorer',
  slot: 'Root',
  overridesResolver: (props, styles) => styles.root,
  shouldForwardProp: (prop) =>
    shouldForwardProp(prop) &&
    prop !== 'grow' &&
    prop !== 'cell' &&
    prop !== 'last' &&
    prop !== 'header' &&
    prop !== 'onItemDoubleClick' &&
    prop !== 'first',
})<{ grow?: boolean; header?: boolean; cell?: boolean; last?: boolean }>(({ theme }) => ({
  padding: 0,
  margin: 0,
  listStyle: 'none',
  outline: 0,
  position: 'relative',
  '& .header, .cell': {
    minWidth: '100px',
  },
  '& .header:after': {
    content: '""',
    position: 'absolute',
    width: '1px',
    height: '80%',
    backgroundColor: theme.palette.divider,
    alignSelf: 'center',
    right: 0,
  },
  '& .header:last-child:after': {
    display: 'none',
  },
}));

/**
 * The FileExplorerComponent type definition.
 */
export type FileExplorerComponent = (<Multiple extends boolean | undefined = undefined>(
  props: FileExplorerProps<Multiple> & React.RefAttributes<HTMLUListElement>,
) => React.JSX.Element) & { propTypes?: any };

/**
 * Warning message for using JSX children with the FileExplorer component.
 */
const childrenWarning = buildWarning([
  'SUI X: The `FileExplorer` component does not support JSX children.',
  'If you want to add items, you need to use the `items` prop',
  'Check the documentation for more details: https://stoked-ui.github.io/x/react-fileExplorer-view/rich-fileExplorer-view/items/',
]);

/**
 * Main FileExplorer component providing a file explorer view.
 * 
 * @param {object} inProps - The props for the FileExplorer component.
 * @param {FileExplorerProps<Multiple>} inProps - The props for the FileExplorer component.
 * @param {React.Ref<HTMLUListElement>} ref - The reference object for FileExplorer manipulation.
 * @returns {JSX.Element} - The rendered FileExplorer component.
 */
const FileExplorer = React.forwardRef(function FileExplorer<
  Multiple extends boolean | undefined = undefined,
>(inProps: FileExplorerProps<Multiple>, ref: React.Ref<HTMLUListElement>) {
  const props = useThemeProps({ props: inProps, name: 'MuiFileExplorer' });
  if (process.env.NODE_ENV !== 'production') {
    if ((props as any).children != null) {
      childrenWarning();
    }
  }

  const { items, ...otherProps } = props;
  const [stateItems, setStateItems] = React.useState<readonly FileBase[]>(items);
  React.useEffect(() => {
    setStateItems(items);
  }, [items]);
  const richProps: FileExplorerProps<Multiple> & { id?: string } = {
    ...otherProps,
    items: stateItems,
    id: props.id,
  };
  const { getRootProps, contextValue, instance } = useFileExplorer<
    FileExplorerPluginSignatures,
    typeof richProps
  >({
    plugins: FILE_EXPLORER_PLUGINS,
    rootRef: ref,
    props: richProps,
  });

  const columns = instance.getColumns();
  const sizes = Object.values(columns).map((column) => column.width);

  const getHeaderWidths = (widthColumns: GridColumns) => Object.entries(widthColumns).reduce(
    (acc, [id, column]: any) => {
      acc[`& .column-${id}`] = { width: column.width };
      acc[`& .header-${id}`] = { width: column.width };
      return acc;
    },
    {}
  );

  const [columnWidths, setColumnWidths] = React.useState<SxProps>(getHeaderWidths(columns));
  React.useEffect(() => {
    setColumnWidths(getHeaderWidths(instance.getColumns()));
  }, [sizes])

  const { slots, slotProps } = props;
  const classes = useUtilityClasses(props);

  const Root = slots?.root ?? FileExplorerRoot;
  const rootProps = useSlotProps({
    elementType: Root,
    externalSlotProps: slotProps?.root,
    className: classes.root,
    getSlotProps: getRootProps,
    ownerState: props as FileExplorerProps<any>,
  });

  const itemsToRender = instance.getItemsToRender();

  const renderItem = (item: ReturnType<typeof instance.getItemsToRender>[number]) => {
    const currItem = instance.getItem(item.id);

    return (
      <FileWrapped
        onDoubleClick={() => {
          inProps.onItemDoubleClick?.(currItem);
        }}
        {...currItem}
        {...item}
        slots={slots}
        key={item.id}
        sx={props.sx}
      >
        {item.children?.map(renderItem)}
      </FileWrapped>
    );
  };
  if (!stateItems?.length && props.dropzone) {
    return <FileDropzone />;
  }
  const getContent = () => {
    if (!props.grid) {
      return (
        <Root {...rootProps} sx={props.sx}>
          {itemsToRender.map(renderItem)}
        </Root>
      );
    }
    return (
      <Root {...rootProps} sx={[props.sx, columnWidths]}>
        <FileExplorerGridHeaders id={'file-explorer-headers'} />
        <div>{itemsToRender.map(renderItem)}</div>
      </Root>
    );
  };
  return (
    <FileExplorerProvider value={contextValue}>
      <FileExplorerDndContext.Provider value={instance.getDndContext}>
        {getContent()}
      </FileExplorerDndContext.Provider>
    </FileExplorerProvider>
  );
}) as FileExplorerComponent;

FileExplorer.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------

  alternatingRows: PropTypes.oneOfType([
    PropTypes.oneOf([true]),
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
  apiRef: PropTypes.shape({
    current: PropTypes.shape({
      focusItem: PropTypes.func.isRequired,
      getItem: PropTypes.func.isRequired,
      getItemDOMElement: PropTypes.func.isRequired,
      getItemOrderedChildrenIds: PropTypes.func.isRequired,
      gridEnabled: PropTypes.func.isRequired,
      selectItem: PropTypes.func.isRequired,
      setColumns: PropTypes.func.isRequired,
      setItemExpansion: PropTypes.func.isRequired,
      setVisibleOrder: PropTypes.func.isRequired,
    }),
  }),
  checkboxSelection: PropTypes.bool,
  classes: PropTypes.object,
  className: PropTypes.string,
  columns: PropTypes.object,
  defaultExpandedItems: PropTypes.arrayOf(PropTypes.string),
  defaultGridColumns: PropTypes.object,
  defaultGridHeaders: PropTypes.object,
  defaultSelectedItems: PropTypes.any,
  disabledItemsFocusable: PropTypes.bool,
  disableSelection: PropTypes.bool,
  dndExternal: PropTypes.oneOf([true]),
  dndFileTypes: PropTypes.arrayOf(PropTypes.string),
  dndInternal: PropTypes.oneOf([true]),
  dndTrash: PropTypes.oneOf([true]),
  dropzone: PropTypes.bool,
  expandedItems: PropTypes.arrayOf(PropTypes.string),
  expansionTrigger: PropTypes.oneOf(['content', 'iconContainer']),
  experimentalFeatures: PropTypes.shape({
    indentationAtItemLevel: PropTypes.bool,
  }),
  getItemId: PropTypes.func,
  getItemLabel: PropTypes.func,
  grid: PropTypes.bool,
  gridColumns: PropTypes.object,
  gridHeader: PropTypes.bool,
  headers: PropTypes.object,
  id: PropTypes.string,
  initializedIndexes: PropTypes.bool,
  isItemDisabled: PropTypes.func,
  itemChildrenIndentation: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  items: PropTypes.arrayOf(
    PropTypes.shape({
      children: PropTypes.arrayOf(
        PropTypes.shape({
          children: PropTypes.arrayOf(PropTypes.object),
          created: PropTypes.number,
          expanded: PropTypes.bool,
          id: PropTypes.string.isRequired,
          lastModified: PropTypes.number,
          media: PropTypes.any,
          mediaType: PropTypes.string.isRequired,
          name: PropTypes.string.isRequired,
          path: PropTypes.string,
          selected: PropTypes.bool,
          size: PropTypes.number,
          type: PropTypes.string.isRequired,
          visibleIndex: PropTypes.number,
        }),
      ),
      created: PropTypes.number,
      expanded: PropTypes.bool,
      id: PropTypes.string.isRequired,
      lastModified: PropTypes.number,
      media: PropTypes.any,
      mediaType: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      path: PropTypes.string,
      selected: PropTypes.bool,
      size: PropTypes.number,
      type: PropTypes.string.isRequired,
      visibleIndex: PropTypes.number,
    }),
  ).isRequired,
  multiSelect: PropTypes.bool,
  onAddFiles: PropTypes.func,
  onExpandedItemsChange: PropTypes.func,
  onItemDoubleClick: PropTypes.func,
  onItemExpansionToggle: PropTypes.func,
  onItemFocus: PropTypes.func,
  onItemSelectionToggle: PropTypes.func,
  onSelectedItemsChange: PropTypes.func,
  selectedItems: PropTypes.any,
  slotProps: PropTypes.object,
  slots: PropTypes.object,
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
};

export { FileExplorer };
