/**
 * Demos:
 *
 * - [FileExplorer View](https://stoked-ui.github.io/x/react-fileExplorer-view/)
 *
 * API:
 *
 * - [FileExplorerBasic API](https://stoked-ui.github.io/x/api/fileExplorer-view/simple-fileExplorer-view/)
 */

import * as React from 'react';
import PropTypes from 'prop-types';
import composeClasses from '@mui/utils/composeClasses';
import { useSlotProps } from '@mui/base/utils';
import { createUseThemeProps, styled } from '../internals/zero-styled';
import { getFileExplorerBasicUtilityClass } from './fileExplorerBasicClasses';
import { FileExplorerBasicProps } from './FileExplorerBasic.types';
import { useFileExplorer } from '../internals/useFileExplorer/useFileExplorer';
import { FileExplorerProvider } from '../internals/FileExplorerProvider';
import {
  FileExplorerBasicPluginSignatures,
  SIMPLE_FILE_EXPLORER_VIEW_PLUGINS,
} from './FileExplorerBasic.plugins';
import { buildWarning } from '../internals/utils/warning';

const useThemeProps = createUseThemeProps('MuiFileExplorerBasic');

const useUtilityClasses = <Multiple extends boolean | undefined>(
  ownerState: FileExplorerBasicProps<Multiple>,
) => {
  const { classes } = ownerState;

  const slots = {
    root: ['root'],
  };

  return composeClasses(slots, getFileExplorerBasicUtilityClass, classes);
};

/**
 * Represents the root element of the FileExplorerBasic component.
 */
export const FileExplorerBasicRoot = styled('ul', {
  name: 'MuiFileExplorerBasic',
  slot: 'Root',
  overridesResolver: (props, styles) => styles.root,
})<{ ownerState: FileExplorerBasicProps<any> }>({
  padding: 0,
  margin: 0,
  listStyle: 'none',
  outline: 0,
  position: 'relative',
});

/**
 * Type definition for the FileExplorerBasic component.
 */
type FileExplorerBasicComponent = (<Multiple extends boolean | undefined = undefined>(
  props: FileExplorerBasicProps<Multiple> & React.RefAttributes<HTMLUListElement>,
) => React.JSX.Element) & { propTypes?: any };

const EMPTY_ITEMS: any[] = [];

const itemsPropWarning = buildWarning([
  'SUI X: The `FileExplorerBasic` component does not support the `items` prop.',
  'If you want to add items, you need to pass them as JSX children.',
  'Check the documentation for more details: https://stoked-ui.github.io/x/react-fileExplorer-view/simple-fileExplorer-view/items/',
]);

/**
 * FileExplorerBasic component.
 * @returns {JSX.Element}
 */
const FileExplorerBasic = React.forwardRef(function FileExplorerBasic<
  Multiple extends boolean | undefined = undefined,
>(inProps: FileExplorerBasicProps<Multiple>, ref: React.Ref<HTMLUListElement>) {
  const props = useThemeProps({ props: inProps, name: 'MuiFileExplorerBasic' });
  const ownerState = props as FileExplorerBasicProps<any>;

  if (process.env.NODE_ENV !== 'production') {
    if ((props as any).items != null) {
      itemsPropWarning();
    }
  }

  const { getRootProps, contextValue } = useFileExplorer<
    FileExplorerBasicPluginSignatures,
    typeof props & { items: any[] }
  >({
    plugins: SIMPLE_FILE_EXPLORER_VIEW_PLUGINS,
    rootRef: ref,
    props: { ...props, items: EMPTY_ITEMS },
  });

  const { slots, slotProps } = props;
  const classes = useUtilityClasses(props);

  const Root = slots?.root ?? FileExplorerBasicRoot;
  const rootProps = useSlotProps({
    elementType: Root,
    externalSlotProps: slotProps?.root,
    className: classes.root,
    getSlotProps: getRootProps,
    ownerState,
  });

  return (
    <FileExplorerProvider value={contextValue}>
      <Root {...rootProps} />
    </FileExplorerProvider>
  );
}) as FileExplorerBasicComponent;

FileExplorerBasic.propTypes = {
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
   * The ref object that allows FileExplorer View manipulation. Can be instantiated with `useFileExplorerApiRef()`.
   * @property {React.MutableRefObject<object>} apiRef - The ref object.
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
   * If `true`, the fileExplorer view renders a checkbox at the left of its label that allows selecting it.
   */
  checkboxSelection: PropTypes.bool,
  /**
   * The content of the component.
   */
  children: PropTypes.node,
  /**
   * Override or extend the styles applied to the component.
   */
  classes: PropTypes.object,
  /**
   * Additional CSS class for the component.
   */
  className: PropTypes.string,
  columns: PropTypes.object,
  /**
   * Expanded item ids.
   */
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
  expandedItems: PropTypes.arrayOf(PropTypes.string),
  expansionTrigger: PropTypes.oneOf(['content', 'iconContainer']),
  experimentalFeatures: PropTypes.shape({
    indentationAtItemLevel: PropTypes.bool,
  }),
  grid: PropTypes.bool,
  gridColumns: PropTypes.object,
  gridHeader: PropTypes.bool,
  headers: PropTypes.object,
  id: PropTypes.string,
  initializedIndexes: PropTypes.bool,
  itemChildrenIndentation: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  multiSelect: PropTypes.bool,
  onAddFiles: PropTypes.func,
  onExpandedItemsChange: PropTypes.func,
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

export { FileExplorerBasic };
