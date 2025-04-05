/**
 * React component representing a header cell in a file explorer grid.
 * @description Displays the label and icon for a specific column in the grid.
 * @param {string} inProps.columnName - The name of the column.
 * @param {string} inProps.id - The unique identifier for the column.
 * @param {GridColumn} inProps.column - The configuration object for the column.
 * @param {React.Ref<HTMLDivElement>} ref - Reference to the HTML div element.
 * @returns {JSX.Element} The header cell component.
 * @example
 * <HeaderCell columnName="Name" id="nameColumn" column={nameColumnConfig} />
 * @fires FileLabel
 * @see useFileExplorerGridColumnHeader, FileLabel, GridColumn
 */
export const HeaderCell = React.forwardRef(
  function HeaderCell(inProps: { columnName: string, id: string, column: GridColumn } & React.HTMLAttributes<HTMLDivElement> & React.HTMLProps<HTMLDivElement>, ref: React.Ref<HTMLDivElement>) {

    // const HeaderCell = (inProps: { columnName: string } & React.HTMLAttributes<HTMLDivElement> & React.HTMLProps<HTMLDivElement>) => {
    const {getColumnProps, getIconContainerProps, getLabelProps, status, instance} = useFileExplorerGridColumnHeader<UseFileMinimalPlugins>({
      columnName: inProps.columnName,
      id: inProps.id,
      ref,
    });
    const columnProps = getColumnProps();
    const labelProps = getLabelProps();
    const [width, setWidth] = React.useState<number>(inProps.column.width);
    React.useEffect(() => {
      instance.processColumns();
    }, [inProps.column.width])
    return (
      <FileLabel {...columnProps} labelProps={labelProps} status={status} iconProps={getIconContainerProps()} />
    )
  });