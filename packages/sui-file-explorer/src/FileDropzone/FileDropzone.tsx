/**
 * @typedef {Object} FileDropzoneProps
 * @property {boolean} alternatingRows - Specifies if alternating rows are enabled.
 * @property {object} apiRef - The ref object that allows FileExplorer View manipulation.
 * @property {boolean} checkboxSelection - Indicates if checkbox selection is enabled.
 * @property {React.ReactNode} children - The content of the component.
 * @property {object} classes - Styles to override or extend.
 * @property {string} className - The CSS class name.
 * @property {object} columns - Column configuration.
 * @property {string[]} defaultExpandedItems - Initially expanded item ids.
 * @property {object} defaultGridColumns - Default grid columns configuration.
 * @property {object} defaultGridHeaders - Default grid headers configuration.
 * @property {any} defaultSelectedItems - Initially selected item ids.
 * @property {boolean} disabledItemsFocusable - Indicates if disabled items are focusable.
 * @property {boolean} disableSelection - Indicates if selection is disabled.
 * @property {boolean} dndExternal - Specifies external drag and drop support.
 * @property {string[]} dndFileTypes - Array of supported file types for drag and drop.
 * @property {boolean} dndInternal - Specifies internal drag and drop support.
 * @property {boolean} dndTrash - Indicates if trash functionality is enabled.
 * @property {string[]} expandedItems - Expanded item ids.
 * @property {'content' | 'iconContainer'} expansionTrigger - The slot that triggers item expansion.
 * @property {Object.<string, boolean>} experimentalFeatures - Experimental features configuration.
 * @property {boolean} grid - Indicates if grid view is enabled.
 * @property {boolean} gridHeader - Indicates if grid headers are enabled.
 * @property {object} headers - Header configuration.
 * @property {string} id - The unique identifier for accessibility logic.
 * @property {number | string} itemChildrenIndentation - Horizontal indentation between an item and its children.
 * @property {boolean} multiSelect - Indicates if multi-select is enabled.
 * @property {function} onExpandedItemsChange - Callback for expanded items change.
 * @property {function} onItemExpansionToggle - Callback for item expansion toggle.
 * @property {function} onItemFocus - Callback for item focus change.
 * @property {function} onItemSelectionToggle - Callback for item selection toggle.
 * @property {function} onSelectedItemsChange - Callback for selected items change.
 * @property {any} selectedItems - Selected item ids.
 * @property {object} slotProps - Component slot props.
 * @property {object} slots - Overridable component slots.
 * @property {Array.<function | object | boolean>} sx - System prop for styling.
 */

/**
 * @description FileDropzone component for handling file uploads.
 * @param {Object} props - Component props.
 * @param {FileDropzoneProps} props - Props for the FileDropzone component.
 * @param {React.Ref<HTMLUListElement>} ref - Reference to the component.
 * @returns {JSX.Element} - The rendered FileDropzone component.
 * @fires {React.SyntheticEvent} onExpandedItemsChange - When expanded items change.
 * @fires {React.SyntheticEvent} onItemExpansionToggle - When item expansion toggles.
 * @fires {React.SyntheticEvent} onItemFocus - When item focus changes.
 * @fires {React.SyntheticEvent} onItemSelectionToggle - When item selection toggles.
 * @fires {React.SyntheticEvent} onSelectedItemsChange - When selected items change.
 * @see {@link https://stoked-ui.github.io/x/react-fileExplorer-view/ FileExplorer View Demos}
 */
const FileDropzone = React.forwardRef(function FileDropzone(inProps, ref) {
  const props = useThemeProps({ props: inProps, name: 'MuiFileDropzone' });
  const ownerState = props;

  if (process.env.NODE_ENV !== 'production') {
    if (props.items != null) {
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
});

/**
 * @property {any} propTypes - Component prop types.
 */
FileDropzone.propTypes = {
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
      gridEnabled: PropTypes.func.isRequired,
      selectItem: PropTypes.func.isRequired,
      setColumns: PropTypes.func.isRequired,
      setItemExpansion: PropTypes.func.isRequired,
      setVisibleOrder: PropTypes.func.isRequired,
    }),
  }),
  checkboxSelection: PropTypes.bool,
  children: PropTypes.node,
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
  expandedItems: PropTypes.arrayOf(PropTypes.string),
  expansionTrigger: PropTypes.oneOf(['content', 'iconContainer']),
  experimentalFeatures: PropTypes.shape({
    indentationAtItemLevel: PropTypes.bool,
  }),
  grid: PropTypes.bool,
  gridHeader: PropTypes.bool,
  headers: PropTypes.object,
  id: PropTypes.string,
  initializedIndexes: PropTypes.bool,
  itemChildrenIndentation: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  multiSelect: PropTypes.bool,
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

export { FileDropzone };
