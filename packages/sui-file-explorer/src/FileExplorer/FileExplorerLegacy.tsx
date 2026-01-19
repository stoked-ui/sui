import * as React from 'react';
import PropTypes from 'prop-types';
import composeClasses from '@mui/utils/composeClasses';
import { useSlotProps } from '@mui/base/utils';
import { FileBase } from '../models';
import { getFileExplorerUtilityClass } from './fileExplorerClasses';
import { FileExplorerProps } from './FileExplorer.types';
import { createUseThemeProps } from '../internals/zero-styled';
import { useFileExplorer } from '../internals/useFileExplorer/useFileExplorer';
import { FileExplorerProvider } from '../internals/FileExplorerProvider';
import { FILE_EXPLORER_PLUGINS, FileExplorerPluginSignatures } from './FileExplorer.plugins';
import { buildWarning } from '../internals/utils/warning';
import { FileExplorerGridHeaders } from '../internals/plugins/useFileExplorerGrid/FileExplorerGridHeaders';
import { FileWrapped } from './FileWrapped';
import { FileExplorerDndContext } from '../internals/plugins/useFileExplorerDnd/FileExplorerDndContext';
import { FileDropzone } from '../FileDropzone';
import { GridColumns } from '../internals/plugins/useFileExplorerGrid/useFileExplorerGrid.types';
import { SxProps } from '@mui/system';
import { FileExplorerRoot } from './FileExplorer';

/**
 * Legacy FileExplorer Component
 *
 * This component provides the pre-MUI X rendering implementation for rollback capability.
 * It uses the traditional recursive rendering approach with FileWrapped components.
 *
 * **Usage:**
 * This component is automatically used when the useMuiXRendering feature flag is disabled.
 * Users should not need to import this component directly.
 *
 * **Rollback Capability:**
 * - AC-4.4.c: When useMuiXRendering=false, this component provides legacy rendering
 * - Preserves all existing functionality (selection, expansion, focus, DnD)
 * - Uses FileWrapped for rendering instead of RichTreeView
 * - Maintains backward compatibility with all plugins
 *
 * @internal
 */

const useThemeProps = createUseThemeProps('MuiFileExplorer');

const useUtilityClasses = <Multiple extends boolean | undefined>(
  ownerState: FileExplorerProps<Multiple>,
) => {
  const { classes } = ownerState;

  const slots = {
    root: ['root'],
  };

  return composeClasses(slots, getFileExplorerUtilityClass, classes);
};

export type FileExplorerLegacyComponent = (<Multiple extends boolean | undefined = undefined>(
  props: FileExplorerProps<Multiple> & React.RefAttributes<HTMLUListElement>,
) => React.JSX.Element) & { propTypes?: any };

const childrenWarning = buildWarning([
  'SUI X: The `FileExplorer` component does not support JSX children.',
  'If you want to add items, you need to use the `items` prop',
  'Check the documentation for more details: https://stoked-ui.github.io/x/react-fileExplorer-view/rich-fileExplorer-view/items/',
]);

/**
 * Legacy FileExplorer Implementation
 *
 * Uses traditional recursive rendering with FileWrapped components.
 * This provides rollback capability when MUI X rendering is disabled.
 */
export const FileExplorerLegacy = React.forwardRef(function FileExplorerLegacy<
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

  const getHeaderWidths = (widthColumns: GridColumns) =>
    Object.entries(widthColumns).reduce((acc, [id, column]: any) => {
      acc[`& .column-${id}`] = { width: column.width };
      acc[`& .header-${id}`] = { width: column.width };
      return acc;
    }, {});

  const [columnWidths, setColumnWidths] = React.useState<SxProps>(getHeaderWidths(columns));
  React.useEffect(() => {
    setColumnWidths(getHeaderWidths(instance.getColumns()));
  }, [sizes]);

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

  // Legacy recursive rendering approach
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
      // Legacy non-grid rendering
      return (
        <Root {...rootProps} sx={props.sx}>
          {itemsToRender.map(renderItem)}
        </Root>
      );
    }

    // Legacy grid rendering
    return (
      <Root {...rootProps} sx={[props.sx, columnWidths]}>
        <FileExplorerGridHeaders id={'file-explorer-headers'} />
        {itemsToRender.map(renderItem)}
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
}) as FileExplorerLegacyComponent;

FileExplorerLegacy.propTypes = {
  // Same PropTypes as FileExplorer
  // (Reusing existing PropTypes definition for consistency)
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
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
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
