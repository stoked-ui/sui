import * as React from 'react';
import PropTypes from 'prop-types';
import composeClasses from '@mui/utils/composeClasses';
import {useSlotProps} from '@mui/base/utils';
import {createUseThemeProps, styled} from '../internals/zero-styled';
import {getFileDropzoneUtilityClass} from './fileDropzoneClasses';
import {FileDropzoneProps} from './FileDropzone.types';
import {buildWarning} from '../internals/utils/warning';

const useThemeProps = createUseThemeProps('MuiFileDropzone');

const useUtilityClasses = (
  ownerState: FileDropzoneProps
) => {
  const { classes } = ownerState;

  const slots = {
    root: ['root'],
  };

  return composeClasses(slots, getFileDropzoneUtilityClass, classes);
};

export const FileDropzoneRoot = styled('div', {
  name: 'MuiFileDropzone',
  slot: 'Root',
  overridesResolver: (props, styles) => styles.root,
})<{ ownerState: FileDropzoneProps }>({
  padding: 0,
  margin: 0,
  listStyle: 'none',
  outline: 0,
  position: 'relative',
});

type FileDropzoneComponent = ((
  props: FileDropzoneProps,
) => React.JSX.Element) & { propTypes?: any };

const EMPTY_ITEMS: any[] = [];

const itemsPropWarning = buildWarning([
  'SUI X: The `FileDropzone` component does not support the `items` prop.',
  'If you want to add items, you need to pass them as JSX children.',
  'Check the documentation for more details: https://stoked-ui.github.io/x/react-fileExplorer-view/simple-fileExplorer-view/items/',
]);

/**
 *
 * Demos:
 *
 * - [FileExplorer View](https://stoked-ui.github.io/x/react-fileExplorer-view/)
 *
 * API:
 *
 * - [FileDropzone
 * API](https://stoked-ui.github.io/x/api/fileExplorer-view/simple-fileExplorer-view/)
 */
const FileDropzone = React.forwardRef(function FileDropzone(inProps: FileDropzoneProps, ref: React.Ref<HTMLUListElement>) {
  const props = useThemeProps({ props: inProps, name: 'MuiFileDropzone' });
  const ownerState = props as FileDropzoneProps;

  if (process.env.NODE_ENV !== 'production') {
    if ((props as any).items != null) {
      itemsPropWarning();
    }
  }

  const { slots, slotProps } = props;
  const classes = useUtilityClasses(props);

  const Root = slots?.root ?? FileDropzoneRoot;
  const rootProps = useSlotProps({
    elementType: Root,
    externalSlotProps: slotProps?.root,
    className: classes.root,
    ownerState,
  });

  return (
    <Root {...rootProps} >
      drag and drop files here
    </Root>
  );
}) as FileDropzoneComponent;

FileDropzone.propTypes = {
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
   * The content of the component.
   */
  children: PropTypes.node,
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
  grid: PropTypes.bool,
  gridHeader: PropTypes.bool,
  headers: PropTypes.object,
  /**
   * This prop is used to help implement the accessibility logic.
   * If you don't provide this prop. It falls back to a randomly generated id.
   */
  id: PropTypes.string,
  initializedIndexes: PropTypes.bool,
  /**
   * Horizontal indentation between an item and its children.
   * Examples: 24, "24px", "2rem", "2em".
   * @default 12px
   */
  itemChildrenIndentation: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  /**
   * If `true`, `ctrl` and `shift` will trigger multiselect.
   * @default false
   */
  multiSelect: PropTypes.bool,
  /**
   * Callback fired when fileExplorer items are expanded/collapsed.
   * @param {React.SyntheticEvent} event The event source of the callback.
   * @param {array} itemIds The ids of the expanded items.
   */
  onExpandedItemsChange: PropTypes.func,
  /**
   * Callback fired when a fileExplorer item is expanded or collapsed.
   * @param {React.SyntheticEvent} event The event source of the callback.
   * @param {array} itemId The itemId of the modified item.
   * @param {array} isExpanded `true` if the item has just been expanded, `false` if it has just
   *   been collapsed.
   */
  onItemExpansionToggle: PropTypes.func,
  /**
   * Callback fired when fileExplorer items are focused.
   * @param {React.SyntheticEvent} event The event source of the callback **Warning**: This is a
   *   generic event not a focus event.
   * @param {string} itemId The id of the focused item.
   * @param {string} value of the focused item.
   */
  onItemFocus: PropTypes.func,
  /**
   * Callback fired when a fileExplorer item is selected or deselected.
   * @param {React.SyntheticEvent} event The event source of the callback.
   * @param {array} itemId The itemId of the modified item.
   * @param {array} isSelected `true` if the item has just been selected, `false` if it has just
   *   been deselected.
   */
  onItemSelectionToggle: PropTypes.func,
  /**
   * Callback fired when fileExplorer items are selected/deselected.
   * @param {React.SyntheticEvent} event The event source of the callback
   * @param {string[] | string} itemIds The ids of the selected items.
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
   */
  slotProps: PropTypes.object,
  /**
   * Overridable component slots.
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

export { FileDropzone };
