/**
 * @fileoverview Provides an interface for the ExplorerPanel props.
 */

export interface ExplorerPanelProps {
  /**
   * The name of the panel.
   */
  name: string;

  /**
   * An array of FileBase items.
   */
  items: readonly FileBase[];

  /**
   * Optional grid columns configuration.
   */
  gridColumns?: { [p: string]: (item: any) => string } | undefined;

  /**
   * Optional function to be called when an item is double-clicked.
   */
  onItemDoubleClick?: (item: FileBase) => void;

  /**
   * Optional ID of the selected item.
   */
  selectedId?: string;

  /**
   * Optional array of expanded items.
   */
  expandedItems?: string[];
}

/**
 * @fileoverview Provides an interface for the FileExplorerTabsSlots props.
 */

export interface FileExplorerTabsSlots {
  /**
   * The element type for the root.
   * 
   * @default FileExplorerRoot
   */
  root?: React.ElementType;

  /**
   * Custom component for the label.
   * 
   * @default CCV F ileExplorerItem
   */
  label?: React.ElementType;

  /**
   * Custom component for the folder.
   * 
   * @default typeof FileExplorer
   */
  folder?: typeof FileExplorer;
}

/**
 * @fileoverview Provides an interface for the FileExplorerTabsSlotProps props.
 */

export interface FileExplorerTabsSlotProps {
  /**
   * The slot props for the root.
   */
  root?: SlotComponentProps<'div', {}, {}>;

  /**
   * The slot props for the label.
   */
  label?: SlotComponentProps<'div', {}, {}>;

  /**
   * The slot props for the folder.
   */
  folder?: SlotComponentPropsFromProps<typeof FileExplorer,{}, FileExplorerProps<any>>;
}

/**
 * @fileoverview Provides an interface for the FileExplorerTabsPropsBase props.
 */

export interface FileExplorerTabsPropsBase extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The class name of the component.
   */
  className?: string;

  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<FileExplorerTabsClasses>;

  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxProps<Theme>;

  /**
   * The styles for the current tab.
   */
  tabSx?: SxProps<Theme>;

  /**
   * The data for each tab.
   */
  tabData: Record<string, ExplorerPanelProps>;

  /**
   * Function to set the name of a tab.
   */
  setTabName: (tabName: string) => void;

  /**
   * An array of tab names.
   */
  tabNames: string[];

  /**
   * Function to open the drawer.
   */
  drawerOpen: () => void;

  /**
   * The variant of the component.
   */
  variant?: 'standard' | 'drawer';

  /**
   * Optional function to be called when an item is double-clicked.
   */
  onItemDoubleClick?: (item: FileBase) => void;
}

/**
 * @fileoverview Provides an interface for the FileExplorerTabsProps props.
 */

export interface FileExplorerTabsProps
  extends FileExplorerTabsPropsBase {
  /**
   * The slots to be used in the component.
   * 
   * @default {}
   */
  slots?: FileExplorerTabsSlots;

  /**
   * The props used for each component slot.
   * 
   * @default {}
   */
  slotProps?: FileExplorerTabsSlotProps;
}

/**
 * @fileoverview Provides an interface for the FileExplorerTabProps props.
 */

export interface FileExplorerTabProps {
  /**
   * The children of the tab.
   */
  children?: React.ReactNode;

  /**
   * The name of the tab.
   */
  name?: string;

  /**
   * An array of files in the tab.
   */
  files?: readonly FileBase[];

  /**
   * Optional styles for the tab.
   */
  sx?: SxProps<Theme>;

  /**
   * The index of the tab.
   */
  index: number;

  /**
   * The value of the tab.
   */
  value: number;
}