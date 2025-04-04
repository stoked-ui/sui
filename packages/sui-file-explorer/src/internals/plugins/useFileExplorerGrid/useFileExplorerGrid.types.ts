/**
 * Grid header type definition.
 * @description The grid header object contains the styles, width, and status of a column header.
 */
export type GridHeader = {
  /**
   * Styles for the column header.
   */
  sx: SystemStyleObject,
  /**
   * The width of the column header.
   */
  width: number,
  /**
   * Status of the column header (e.g. ascending, focused, visible).
   */
  status: UseFileExplorerGridColumnHeaderStatus
};

/**
 * Grid headers type definition.
 * @description An object containing all grid headers with their respective status.
 */
export type GridHeaders = {
  [id: string]: GridHeader;
};

/**
 * Column data for the track of a grid column.
 * @description The track contains the width and waiting status of each cell in the column.
 */
export type GridColumnRowData = {
  [key: string]: {
    /**
     * The width of the cell in the column.
     */
    width: number,
    /**
     * Whether the cell is waiting for data.
     */
    waiting?: boolean
  }
}

/**
 * Interface defining the status of a grid column header.
 * @description The status contains information about the sorting, focusing and visibility of a column header.
 */
export interface UseFileExplorerGridColumnHeaderStatus {
  /**
   * Whether the column header should be sorted in ascending order.
   */
  ascending?: boolean;
  /**
   * Whether the column header is currently focused.
   */
  focused: boolean;
  /**
   * Whether the column header is visible in the grid.
   */
  visible: boolean;
  /**
   * Whether the column header has a sort icon.
   */
  sort: boolean;
}

/**
 * Type definition for a single grid column.
 * @description The grid column object contains styles, render content, evaluator and other properties.
 */
export type GridColumn = {
  /**
   * Styles for the grid column.
   */
  sx: SystemStyleObject,
  /**
   * Function to render the content of the cell in the column.
   */
  renderContent: (content: any) => string,
  /**
   * Optional evaluator function for the column.
   */
  evaluator?: (...args: any) => any,
  /**
   * The width of the grid column.
   */
  width: number,
  /**
   * Track data for the grid column.
   */
  track: GridColumnRowData,
  /**
   * Whether the cell in the column is waiting for data.
   */
  waiting: boolean
  /**
   * Cells rendered in the column.
   */
  cells: React.ReactElement[];
  /**
   * Function to render the children of the grid column.
   */
  children: (cells: React.ReactElement[]) => React.ReactNode;
}

/**
 * Type definition for multiple grid columns.
 * @description An object containing all grid columns with their respective properties.
 */
export type GridColumns = {
  [id: string]: GridColumn;
};

/**
 * Public API of the file explorer grid component.
 * @description This interface contains functions to manage the state and behavior of the grid.
 */
export interface UseFileExplorerGridPublicAPI {
  /**
   * Function to set the visible order of items in the grid.
   * @param value The new order of items.
   */
  setVisibleOrder: (value: FileId[]) => void;
  /**
   * Function to update the columns of the grid.
   * @param value The new column definitions.
   */
  setColumns: (value: GridColumns) => void;
  /**
   * Function to check if the grid is enabled.
   * @returns Whether the grid is enabled.
   */
  gridEnabled: () => boolean;
}

/**
 * Type definition for a file explorer grid plugin.
 * @description This type extends the FileExplorerPlugin interface with specific properties related to the grid.
 */
export type UseFileExplorerGridPlugin = FileExplorerPlugin<UseFileExplorerGridSignature>;

/**
 * Interface defining the state of the file explorer grid component.
 * @description The state contains information about the grid, its columns and other relevant data.
 */
interface UseFileExplorerGridState {
  /**
   * Grid data containing columns, headers and initialized indexes.
   */
  grid: UseFileExplorerGridStateGuts;
  /**
   * Unique identifier for the grid.
   */
  id: string;
}

/**
 * Context value type definition.
 * @description This type extends the useFileExplorerGridParameters interface with additional properties related to the context.
 */
type ContextValue = Pick<UseFileExplorerGridParameters, 'columns' | 'headers' | 'grid' | 'gridHeader'>;

/**
 * Interface defining the context value of the file explorer grid component.
 * @description The context value contains information about the grid and its usage in the application.
 */
interface UseFileExplorerGridContextValue extends ContextValue {
  /**
   * Whether the grid is enabled.
   */
  grid: boolean;
  /**
   * Whether the grid header is enabled.
   */
  gridHeader: boolean;
  /**
   * Unique identifier for the grid.
   */
  id: string;
}

/**
 * Type definition for a file explorer grid signature.
 * @description This type extends the FileExplorerPluginSignature interface with specific properties related to the grid.
 */
export type UseFileExplorerGridSignature = FileExplorerPluginSignature<{
  /**
   * Parameters used by the plugin.
   */
  params: UseFileExplorerGridParameters;
  /**
   * Defaultized parameters for the plugin.
   */
  defaultizedParams: UseFileExplorerGridDefaultizedParameters;
  /**
   * Instance of the file explorer grid component.
   */
  instance: UseFileExplorerGridInstance;
  /**
   * Public API of the file explorer grid component.
   */
  publicAPI: UseFileExplorerGridPublicAPI;
  /**
   * State of the file explorer grid component.
   */
  state: UseFileExplorerGridState;
  /**
   * Context value for the file explorer grid component.
   */
  contextValue: UseFileExplorerGridContextValue;
  /**
   * Dependencies required by the plugin.
   */
  dependencies:  [

  ];
}>;