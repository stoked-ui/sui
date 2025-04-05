/**
 * Grid Header object type.
 * @typedef {Object} GridHeader
 * @property {SystemStyleObject} sx - Style object for the grid header.
 * @property {number} width - Width of the grid header.
 * @property {UseFileExplorerGridColumnHeaderStatus} status - Status of the grid header.
 */

/**
 * Object type for multiple grid headers.
 * @typedef {Object.<string, GridHeader>} GridHeaders
 */

/**
 * Row data object for grid columns.
 * @typedef {Object.<string, { width: number, waiting?: boolean }>} GridColumnRowData
 */

/**
 * Status interface for grid column headers.
 * @interface UseFileExplorerGridColumnHeaderStatus
 * @property {boolean} [ascending] - Flag for ascending order.
 * @property {boolean} focused - Flag for focus state.
 * @property {boolean} visible - Flag for visibility state.
 * @property {boolean} sort - Flag for sorting state.
 */

/**
 * Grid Column object type.
 * @typedef {Object} GridColumn
 * @property {SystemStyleObject} sx - Style object for the grid column.
 * @property {(content: any) => string} renderContent - Function to render column content.
 * @property {(...args: any) => any} [evaluator] - Function to evaluate column data.
 * @property {number} width - Width of the grid column.
 * @property {GridColumnRowData} track - Row data for the column.
 * @property {boolean} waiting - Flag for waiting state.
 * @property {React.ReactElement[]} cells - Array of React elements for cells.
 * @property {(cells: React.ReactElement[]) => React.ReactNode} children - Function to render children.
 */

/**
 * Object type for multiple grid columns.
 * @typedef {Object.<string, GridColumn>} GridColumns
 */

/**
 * Public API for File Explorer Grid.
 * @interface UseFileExplorerGridPublicAPI
 * @property {(value: FileId[]) => void} setVisibleOrder - Function to set visible order.
 * @property {(value: GridColumns) => void} setColumns - Function to set columns.
 * @property {() => boolean} gridEnabled - Function to check grid enabled status.
 */

/**
 * Plugin type for File Explorer Grid.
 * @typedef {FileExplorerPlugin<UseFileExplorerGridSignature>} UseFileExplorerGridPlugin
 */

/**
 * Instance interface for File Explorer Grid.
 * @interface UseFileExplorerGridInstance
 * @extends {UseFileExplorerGridPublicAPI}
 * @property {(id: FileId, children: React.ReactNode) => UseFileStatus} getItemStatus - Function to get item status.
 * @property {(id: FileId) => string} getAltRowClass - Function to get alternate row class.
 * @property {() => GridColumns} getColumns - Function to get columns.
 * @property {() => GridHeaders} getHeaders - Function to get headers.
 * @property {(event: React.FocusEvent | React.MouseEvent | null, columnName: string) => void} focusHeader - Function to focus on header.
 * @property {(event: React.FocusEvent | null, columnName: string) => void} blurHeader - Function to blur header.
 * @property {(columnName: string) => boolean | null} isColumnAscending - Function to check if column is ascending.
 * @property {(columnName: string) => boolean | null} isColumnFocused - Function to check if column is focused.
 * @property {(columnName: string) => boolean | null} isColumnVisible - Function to check if column is visible.
 * @property {(columnName: string) => boolean | null} isSortColumn - Function to check if column is for sorting.
 * @property {(columnName: string) => UseFileExplorerGridColumnHeaderStatus} getHeaderStatus - Function to get header status.
 * @property {(columnName: string, evaluator?: (item: any, columnName: string) => any) => boolean | null} toggleColumnSort - Function to toggle column sorting.
 * @property {(columnName: string) => boolean | null} toggleColumnVisible - Function to toggle column visibility.
 * @property {() => boolean} gridEnabled - Function to check grid enabled status.
 * @property {(item: any) => ItemMode} getItemMode - Function to get item mode.
 * @property {() => void} processColumns - Function to process columns.
 */

/**
 * Functions object type for grid columns.
 * @typedef {Object.<string, ({ renderer?: (item: any) => string, evaluator?: (...args: any) => any } & Partial<FileBase>) | ((item: any) => any)} GridColumnFuncs
 */

/**
 * Parameters interface for File Explorer Grid.
 * @interface UseFileExplorerGridParameters
 * @property {boolean} [grid] - Flag for grid.
 * @property {boolean} [gridHeader] - Flag for grid header.
 * @property {GridColumns} [columns] - Columns for the grid.
 * @property {GridHeaders} [headers] - Headers for the grid.
 * @property {boolean} [initializedIndexes] - Flag for initialized indexes.
 * @property {GridColumns} [defaultGridColumns] - Default columns for the grid.
 * @property {GridHeaders} [defaultGridHeaders] - Default headers for the grid.
 * @property {GridColumnFuncs} [gridColumns] - Functions for grid columns.
 */

/**
 * Defaultized parameters interface for File Explorer Grid.
 * @interface UseFileExplorerGridDefaultizedParameters
 * @extends {DefaultizedProps<UseFileExplorerGridParameters, 'defaultGridColumns' | 'defaultGridHeaders'>}
 */

/**
 * State guts interface for File Explorer Grid.
 * @interface UseFileExplorerGridStateGuts
 * @property {GridColumns} columns - Columns for the grid.
 * @property {GridHeaders} headers - Headers for the grid.
 * @property {boolean} initializedIndexes - Flag for initialized indexes.
 */

/**
 * State interface for File Explorer Grid.
 * @interface UseFileExplorerGridState
 * @property {UseFileExplorerGridStateGuts} grid - Grid state guts.
 * @property {string} id - ID for the grid.
 */

/**
 * Context value interface for File Explorer Grid.
 * @typedef {Object} ContextValue
 * @property {GridColumns} columns - Columns for the grid.
 * @property {GridHeaders} headers - Headers for the grid.
 * @property {boolean} grid - Flag for grid.
 * @property {boolean} gridHeader - Flag for grid header.
 */

/**
 * Context value interface for File Explorer Grid.
 * @interface UseFileExplorerGridContextValue
 * @extends {ContextValue}
 * @property {boolean} grid - Flag for grid.
 * @property {boolean} gridHeader - Flag for grid header.
 * @property {string} id - ID for the grid.
 */

/**
 * Signature for File Explorer Grid plugin.
 * @typedef {FileExplorerPluginSignature<{
 *   params: UseFileExplorerGridParameters;
 *   defaultizedParams: UseFileExplorerGridDefaultizedParameters;
 *   instance: UseFileExplorerGridInstance;
 *   publicAPI: UseFileExplorerGridPublicAPI;
 *   state: UseFileExplorerGridState;
 *   contextValue: UseFileExplorerGridContextValue;
 *   dependencies: [];
 * }>} UseFileExplorerGridSignature
 */