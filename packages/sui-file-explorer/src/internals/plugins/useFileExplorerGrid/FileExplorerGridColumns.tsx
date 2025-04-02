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
  const getColumns = () => {
    return columnsEntries.map(([columnName, columnData], index) => {
      const columnWidthAndHasBeenSet = columnData.track[`grid-${item.id}-row`] !== null && columnData.width !== -1;
      const customSx: any = {width: columnWidthAndHasBeenSet  ? `${columnData.width}px` : undefined};

      const cell = <FileExplorerGridCellStyled
        key={`key-${index}`}
        sx={{...columnData.sx, ...customSx}}
        last={index === columnsEntries.length - 1}
        id={`${item.id}-${columnName}`}
        columnName={columnName}
        content={columnContent[index]}
        selected={item.selected}
        width={columnData.width}
      />;
      columnData.cells.push(cell)
      return cell;
    });
  }
  const [columns, setColumns] = React.useState<React.ReactElement[]>(getColumns());
  React.useCallback(() => {
    setColumns(getColumns);
  },[columnContent])

  return (
    <React.Fragment>
      {columns}
    </React.Fragment>
  )
}

