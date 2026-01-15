import * as React from 'react';
import PropTypes from 'prop-types';
import composeClasses from '@mui/utils/composeClasses';
import { useSlotProps } from '@mui/base/utils';
import { shouldForwardProp } from '@mui/system/createStyled';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import { TreeItem2 } from '@mui/x-tree-view/TreeItem2';
import { useTreeViewApiRef } from '@mui/x-tree-view/hooks/useTreeViewApiRef';
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
import {GridColumns} from "../internals/plugins/useFileExplorerGrid/useFileExplorerGrid.types";
import {SxProps} from "@mui/system";


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
    /* ADDED */ display: 'none',
  },
  /* '& .can-drop': {
    border: '1px solid green',
    borderRadius: '6px',
  },
  '& .can-not-drop': {
    border: '1px solid red',
    borderRadius: '6px',
  } */
}));

export type FileExplorerComponent = (<Multiple extends boolean | undefined = undefined>(
  props: FileExplorerProps<Multiple> & React.RefAttributes<HTMLUListElement>,
) => React.JSX.Element) & { propTypes?: any };

const childrenWarning = buildWarning([
  'SUI X: The `FileExplorer` component does not support JSX children.',
  'If you want to add items, you need to use the `items` prop',
  'Check the documentation for more details: https://stoked-ui.github.io/x/react-fileExplorer-view/rich-fileExplorer-view/items/',
]);

// AC-2.2.a: Transform file data to MUI X RichTreeView items format preserving all metadata
// Maps FileBase structure to MUI X RichTreeView items structure
// Preserves: id, name, type, size, lastModified, mediaType, url, media, created, path, expanded, selected, visibleIndex, version, children
const convertToTreeViewItems = (items: readonly FileBase[]): any[] => {
  return items.map(item => ({
    id: item.id,
    label: item.name,
    children: item.children ? convertToTreeViewItems(item.children) : undefined,
    // Preserve all FileBase metadata for plugin access
    _fileData: {
      id: item.id,
      name: item.name,
      type: item.type,
      size: item.size,
      lastModified: item.lastModified,
      mediaType: item.mediaType,
      url: item.url,
      media: item.media,
      created: item.created,
      path: item.path,
      expanded: item.expanded,
      selected: item.selected,
      visibleIndex: item.visibleIndex,
      version: item.version,
      children: item.children,
    } as FileBase,
  }));
};

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

  // Initialize both FileExplorer plugin system and MUI X Tree View API
  const { getRootProps, contextValue, instance } = useFileExplorer<
    FileExplorerPluginSignatures,
    typeof richProps
  >({
    plugins: FILE_EXPLORER_PLUGINS,
    rootRef: ref,
    props: richProps,
  });

  // MUI X Tree View API reference for imperative control
  const muiTreeApiRef = useTreeViewApiRef();

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

  // Legacy rendering function for backward compatibility
  // TODO Phase 2.2-2.5: Migrate to MUI X slot-based rendering
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

  // AC-2.2.a: Convert FileBase items to MUI X Tree View format with metadata preservation
  // Prepared for future MUI X RichTreeView rendering (Phase 2.3+)
  const treeViewItems = React.useMemo(() => convertToTreeViewItems(stateItems), [stateItems]);

  // AC-2.3: Expansion Plugin Adapter - Prepare MUI X coordination layer
  // Expansion state is managed by useFileExplorerExpansion plugin and exposed via instance methods
  // When MUI X rendering activates (Phase 2.4+), these props will be passed to RichTreeView:
  //   <RichTreeView
  //     expandedItems={instance.getExpandedItems()}
  //     onExpandedItemsChange={instance.setExpandedItems}
  //     ...
  //   />
  // This ensures bidirectional state sync between FileExplorer plugin and MUI X without loops
  const muiXExpansionProps = React.useMemo(() => ({
    expandedItems: instance.getExpandedItems(),
    onExpandedItemsChange: instance.setExpandedItems,
  }), [instance]);

  // AC-2.1.a: Render MUI X RichTreeView while preserving FileExplorerProps interface
  // AC-2.1.b: Map props to RichTreeView or document adapter layer needs
  const getContent = () => {
    // Phase 2.2: Maintain legacy rendering while plugin adapters are implemented
    // MUI X RichTreeView rendering will be activated once all plugins (2.2-2.5) are adapted
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

  // AC-2.1.c: Preserve FileExplorerProvider context shape
  // AC-2.1.d: Forward refs correctly for useFileExplorerApiRef methods
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
  /**
   * The ref object that allows FileExplorer View manipulation. Can be instantiated with
   * `useFileExplorerApiRef()`.
   */
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
  /**
   * If `true`, the fileExplorer view renders a checkbox at the left of its label that allows
   * selecting it.
   * @default false
   */
  checkboxSelection: PropTypes.bool,
  /**
   * Override or extend the styles applied to the component.
   */
  classes: PropTypes.object,
  className: PropTypes.string,
  columns: PropTypes.object,
  /**
   * Expanded item ids.
   * Used when the item's expansion is not controlled.
   * @default []
   */
  defaultExpandedItems: PropTypes.arrayOf(PropTypes.string),
  defaultGridColumns: PropTypes.object,
  defaultGridHeaders: PropTypes.object,
  /**
   * Selected item ids. (Uncontrolled)
   * When `multiSelect` is true this takes an array of strings; when false (default) a string.
   * @default []
   */
  defaultSelectedItems: PropTypes.any,
  /**
   * If `true`, will allow focus on disabled items.
   * @default false
   */
  disabledItemsFocusable: PropTypes.bool,
  /**
   * If `true` selection is disabled.
   * @default false
   */
  disableSelection: PropTypes.bool,
  dndExternal: PropTypes.oneOf([true]),
  dndFileTypes: PropTypes.arrayOf(PropTypes.string),
  dndInternal: PropTypes.oneOf([true]),
  dndTrash: PropTypes.oneOf([true]),
  dropzone: PropTypes.bool,
  /**
   * Expanded item ids.
   * Used when the item's expansion is controlled.
   */
  expandedItems: PropTypes.arrayOf(PropTypes.string),
  /**
   * The slot that triggers the item's expansion when clicked.
   * @default 'content'
   */
  expansionTrigger: PropTypes.oneOf(['content', 'iconContainer']),
  /**
   * Unstable features, breaking changes might be introduced.
   * For each feature, if the flag is not explicitly set to `true`,
   * the feature will be fully disabled and any property / method call will not have any effect.
   */
  experimentalFeatures: PropTypes.shape({
    indentationAtItemLevel: PropTypes.bool,
  }),
  /**
   * Used to determine the id of a given item.
   *
   * @template R
   * @param {R} item The item to check.
   * @returns {string} The id of the item.
   * @default (item) => item.id
   */
  getItemId: PropTypes.func,
  /**
   * Used to determine the string label for a given item.
   *
   * @template R
   * @param {R} item The item to check.
   * @returns {string} The label of the item.
   * @default (item) => item.label
   */
  getItemLabel: PropTypes.func,
  grid: PropTypes.bool,
  gridColumns: PropTypes.object,
  gridHeader: PropTypes.bool,
  headers: PropTypes.object,
  /**
   * This prop is used to help implement the accessibility logic.
   * If you don't provide this prop. It falls back to a randomly generated id.
   */
  id: PropTypes.string,
  initializedIndexes: PropTypes.bool,
  /**
   * Used to determine if a given item should be disabled.
   * @template R
   * @param {R} item The item to check.
   * @returns {boolean} `true` if the item should be disabled.
   */
  isItemDisabled: PropTypes.func,
  /**
   * Horizontal indentation between an item and its children.
   * Examples: 24, "24px", "2rem", "2em".
   * @default 12px
   */
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
  /**
   * If `true`, `ctrl` and `shift` will trigger multiselect.
   * @default false
   */
  multiSelect: PropTypes.bool,
  onAddFiles: PropTypes.func,
  /**
   * Callback fired when fileExplorer items are expanded/collapsed.
   * @param {React.SyntheticEvent} event The event source of the callback.
   * @param {array} ids The ids of the expanded items.
   */
  onExpandedItemsChange: PropTypes.func,
  onItemDoubleClick: PropTypes.func,
  /**
   * Callback fired when a fileExplorer item is expanded or collapsed.
   * @param {React.SyntheticEvent} event The event source of the callback.
   * @param {array} id The id of the lastModified item.
   * @param {array} isExpanded `true` if the item has just been expanded, `false` if it has just
   *   been collapsed.
   */
  onItemExpansionToggle: PropTypes.func,
  /**
   * Callback fired when fileExplorer items are focused.
   * @param {React.SyntheticEvent} event The event source of the callback **Warning**: This is a
   *   generic event not a focus event.
   * @param {string} id The id of the focused item.
   * @param {string} value of the focused item.
   */
  onItemFocus: PropTypes.func,
  /**
   * Callback fired when a fileExplorer item is selected or deselected.
   * @param {React.SyntheticEvent} event The event source of the callback.
   * @param {array} id The id of the lastModified item.
   * @param {array} isSelected `true` if the item has just been selected, `false` if it has just
   *   been deselected.
   */
  onItemSelectionToggle: PropTypes.func,
  /**
   * Callback fired when fileExplorer items are selected/deselected.
   * @param {React.SyntheticEvent} event The event source of the callback
   * @param {string[] | string} ids The ids of the selected items.
   * When `multiSelect` is `true`, this is an array of strings; when false (default) a string.
   */
  onSelectedItemsChange: PropTypes.func,
  /**
   * Selected item ids. (Controlled)
   * When `multiSelect` is true this takes an array of strings; when false (default) a string.
   */
  selectedItems: PropTypes.any,
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
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
};

export { FileExplorer };
