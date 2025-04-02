import { FileExplorerContextValue } from '@mui/x-file-explorer/internals/FileExplorerProvider';
import { FileExplorerBasicPluginSignatures } from '@mui/x-file-explorer/FileExplorerBasic/FileExplorerBasic.plugins';
import { GridColumns } from "@mui/x-file-explorer/internals/plugins/useFileExplorerGrid/useFileExplorerGrid.types";

export const getFakeContextValue = (
  features: { checkboxSelection?: boolean } = {},
): FileExplorerContextValue<FileExplorerBasicPluginSignatures> => ({
  instance: {
    isItemExpandable: () => false,
    isItemExpanded: () => false,
    isItemFocused: () => false,
    isItemSelected: () => false,
    isItemDisabled: (itemId: string | null): itemId is string => !!itemId,
    getTreeItemIdAttribute: () => '',
    mapFirstCharFromJSX: () => () => {},
    canItemBeTabbed: () => false,
  } as any,
  publicAPI: {
    focusItem: () => {},
    getItem: () => ({}),
    setItemExpansion: () => {},
    setColumns: () => {},
    setVisibleOrder: () => {}
  },
  runItemPlugins: () => ({
    rootRef: null,
    contentRef: null,
  }),
  wrapItem: ({ children }) => children,
  wrapRoot: ({ children }) => children,
  disabledItemsFocusable: false,
  indentationAtItemLevel: false,
  icons: {
    slots: {},
    slotProps: {},
  },
  selection: {
    multiSelect: false,
    checkboxSelection: features.checkboxSelection ?? false,
    disableSelection: false,
  },
  rootRef: {
    current: null,
  },
  expansion: { expansionTrigger: 'content' },
  grid: true
});

