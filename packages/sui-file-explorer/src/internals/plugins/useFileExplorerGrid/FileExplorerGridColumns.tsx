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

export function FileExplorerGridColumns({ item }: { item: any}) {
  const {
    grid,
    columns: gridColumns,
  }: { grid?: boolean, columns?: GridColumns } = useFileExplorerContext<[UseFileExplorerDndSignature, UseFileExplorerFilesSignature, UseFileExplorerExpansionSignature, UseFileExplorerGridSignature], readonly []>();

  if (!grid || !gridColumns)  {
    return <React.Fragment/>
  }

  const columnsEntries = Object.entries(gridColumns).filter(([columnName]) => columnName !== 'name');
  const columns =  columnsEntries.map(([columnName, columnData], index) => {
    const columnWidthAndHasBeenSet = columnData.track[`grid-${item.id}-row`] !== null && columnData.width !== -1;
    const customSx: any = {width: columnWidthAndHasBeenSet  ? `${columnData.width}px` : undefined};
    let content = columnData.getContent ? columnData.getContent(item) : item[columnName];
    if (!content && columnData.evaluator) {
      content = columnData.evaluator({...item}, columnName);
    }

    const cell = <FileExplorerGridCell
      key={`key-${index}`}
      sx={{...columnData.sx, ...customSx}}
      last={index === columnsEntries.length - 1}
      id={`${item.id}-${columnName}`}
      columnName={columnName}
      content={columnData.renderContent(content)}
      selected={item.selected}
    />;
    columnData.cells.push(cell)
    return cell;
  });
  return (
    <React.Fragment>
      {columns}
    </React.Fragment>
  )
}
