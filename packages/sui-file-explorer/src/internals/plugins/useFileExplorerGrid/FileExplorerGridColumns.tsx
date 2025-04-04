/**
 * @file FileExplorerGridCell.js
 * @description A reusable grid cell component for the file explorer.
 */

import * as React from 'react';
import {SystemStyleObject, Theme, useTheme} from "@mui/system";
import {useFileExplorerContext} from "../../FileExplorerProvider/useFileExplorerContext";
import type {
  UseFileExplorerFilesSignature
} from "../useFileExplorerFiles/useFileExplorerFiles.types";
import type {
  UseFileExplorerExpansionSignature
} from "../useFileExplorerExpansion/useFileExplorerExpansion.types";
import type {GridColumns, UseFileExplorerGridSignature} from "./useFileExplorerGrid.types";
import {UseFileExplorerDndSignature} from '../useFileExplorerDnd/useFileExplorerDnd.types';
import {FileLabel} from "../../../File/FileLabel";
import {SxProps, styled} from "@mui/material/styles";
import {shouldForwardProp} from "@mui/system/createStyled";
import {UseFileStatus} from "../../models/UseFileStatus";

/**
 * @class FileExplorerGridCell
 * @description A reusable grid cell component for the file explorer.
 * 
 * @param {Object} props - The props object.
 * @param {SystemStyleObject<Theme>} props sx - The CSS styles for the cell.
 * @param {boolean} props.last - Whether this is the last cell in the row.
 * @param {string} props.id - The ID of the cell.
 * @param {string} props.columnName - The name of the column.
 * @param {*} props.content - The content to display in the cell.
 * @param {boolean} props.grow - Whether this cell should grow to fill the row.
 * @param {boolean} props.selected - Whether this cell is selected.
 */
function FileExplorerGridCell({
  sx, last, id, columnName, content, grow, selected
}: {
  last?: boolean, sx: SystemStyleObject<Theme>, id: string, columnName: string, content: any,
  grow?: boolean, selected?: boolean
}) {
  const theme = useTheme();
  return (
    <FileLabel
      className={`cell column-${columnName}`}
      sx={ [{  justifyContent: 'start'}, sx]}
      last={last}
      meta
      id={id}
      grow={grow}
      selected={selected}
      cell
      columnName={columnName}
    >
      {id !== 'trash' ? content : null}
    </FileLabel>
  )
}

/**
 * @class FileExplorerGridCellStyled
 * @description A styled version of the FileExplorerGridCell component.
 * 
 * @param {Object} props - The props object.
 * @param {number} props.width - The width of the cell.
 */
const FileExplorerGridCellStyled = styled(FileExplorerGridCell, {
  name: 'MuiFileExplorerGridCell',
  slot: 'Cell',
  shouldForwardProp: (prop) => shouldForwardProp(prop) && prop !== 'last' && prop !== 'width',
  overridesResolver: (props, styles) => styles.root
})<{width: number}>(({  width }) => {
  return {
    width: width !== -1 ? `${width}px!important` : undefined,
  }
});

/**
 * @class FileExplorerGridColumns
 * @description A component that handles the columns for the file explorer.
 * 
 * @param {Object} props - The props object.
 * @param {any} props.item - The item to display in the grid.
 */
export function FileExplorerGridColumns({ item }: { item: any}) {
  const {
    columns: gridColumns = {},
  }: { columns?: GridColumns } = useFileExplorerContext<[UseFileExplorerDndSignature, UseFileExplorerFilesSignature, UseFileExplorerExpansionSignature, UseFileExplorerGridSignature], readonly []>();

  const columnsEntries = Object.entries(gridColumns).filter(([columnName]) => columnName !== 'name');
  const columnContent = columnsEntries.map(([columnName, columnData]) => {
    let content = item[columnName];
    if (!content && columnData.evaluator) {
      content = columnData.evaluator({...item}, columnName);
    }
    return columnData.renderContent(content);
  })
  
  /**
   * @function getColumns
   * @description A function that returns an array of React elements representing the columns.
   * 
   * @returns {React.ReactElement[]} An array of React elements.
   */
  const getColumns = () => {
    return columnsEntries.map(([columnName, columnData], index) => {
      const columnWidthAndHasBeenSet = columnData.track[`grid-${item.id}-row`] !== null && columnData.width !== -1;
      const customSx: SxProps = { width: `${columnData.width}px` };
      
      return (
        <React.Fragment key={columnName}>
          <FileExplorerGridCell
            sx={customSx}
            last={index === columnsEntries.length - 1}
            id={columnName}
            columnName={columnName}
            content={columnContent[columnName]}
            grow={columnData.grow}
            selected={columnData.selected}
          />
        </React.Fragment>
      )
    });
  }

  /**
   * @function useColumns
   * @description A hook that updates the columns when the column content changes.
   */
  const useColumns = React.useCallback(() => {
    return getColumns();
  }, [columnContent])

  /**
   * @var {React.ReactElement[]} columns - The array of React elements representing the columns.
   */
  const [columns, setColumns] = React.useState(useColumns());

  /**
   * @function handleColumnUpdate
   * @description A function that updates the columns when they change.
   */
  React.useEffect(() => {
    setColumns(getColumns());
  },[columnContent])

  return (
    <React.Fragment>
      {columns}
    </React.Fragment>
  )
}