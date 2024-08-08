import * as React from "react";
import { useFileExplorerGridColumnHeader } from "./useFileExplorerGridColumnHeader";
import { UseFileMinimalPlugins } from "../../models";
import { FileLabel } from "../../../File/FileLabel";

export const HeaderCell = React.forwardRef(
  function HeaderCell(inProps: { columnName: string, id: string } & React.HTMLAttributes<HTMLDivElement> & React.HTMLProps<HTMLDivElement>, ref: React.Ref<HTMLDivElement>) {

    // const HeaderCell = (inProps: { columnName: string } & React.HTMLAttributes<HTMLDivElement> & React.HTMLProps<HTMLDivElement>) => {
    const {getColumnProps, getIconContainerProps, getLabelProps, status} = useFileExplorerGridColumnHeader<UseFileMinimalPlugins>({
      columnName: inProps.columnName,
      id: inProps.id,
      ref
    });
    const columnProps = getColumnProps();
    return (
      <FileLabel {...columnProps} labelProps={getLabelProps()} status={status} iconProps={getIconContainerProps()} />
    )
  });
