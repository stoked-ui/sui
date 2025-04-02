import * as React from "react";
import {useFileExplorerGridColumnHeader} from "./useFileExplorerGridColumnHeader";
import {UseFileMinimalPlugins} from "../../models";
import {FileLabel} from "../../../File/FileLabel";
import {GridColumn} from "./useFileExplorerGrid.types";

export const HeaderCell = React.forwardRef(
  function HeaderCell(inProps: { columnName: string, id: string,  column: GridColumn } & React.HTMLAttributes<HTMLDivElement> & React.HTMLProps<HTMLDivElement>, ref: React.Ref<HTMLDivElement>) {

    // const HeaderCell = (inProps: { columnName: string } & React.HTMLAttributes<HTMLDivElement> & React.HTMLProps<HTMLDivElement>) => {
    const {getColumnProps, getIconContainerProps, getLabelProps, status, instance} = useFileExplorerGridColumnHeader<UseFileMinimalPlugins>({
      columnName: inProps.columnName,
      id: inProps.id,
      ref,
    });
    const columnProps = getColumnProps();
    const labelProps = getLabelProps();
    const [ width, setWidth] = React.useState<number>(inProps.column.width);
    React.useEffect(() => {
      instance.processColumns();
    }, [inProps.column.width])
    return (
      <FileLabel {...columnProps} labelProps={labelProps} status={status} iconProps={getIconContainerProps()} />
    )
  });

