/**
 * HeaderCell component
 *
 * The HeaderCell component is a React forward reference component that renders a column header.
 * It uses the useFileExplorerGridColumnHeader hook to get props for the component.
 *
 * @param {Object} inProps - Props for the component.
 * @param {string} inProps.columnName - Name of the column.
 * @param {string} inProps.id - ID of the column.
 * @param {GridColumn} inProps.column - GridColumn object.
 * @param {React.Ref<HTMLDivElement>} ref - Reference to the DOM element.
 *
 * @returns {JSX.Element} The rendered component.
 */
export const HeaderCell = React.forwardRef(
  function HeaderCell(inProps: { columnName: string, id: string,  column: GridColumn } & React.HTMLAttributes<HTMLDivElement> & React.HTMLProps<HTMLDivElement>, ref: React.Ref<HTMLDivElement>) {
    /**
     * Gets props for the component using the useFileExplorerGridColumnHeader hook.
     */
    const {getColumnProps, getIconContainerProps, getLabelProps, status, instance} = useFileExplorerGridColumnHeader<UseFileMinimalPlugins>({
      columnName: inProps.columnName,
      id: inProps.id,
      ref,
    });

    /**
     * Gets the column props for the component.
     */
    const columnProps = getColumnProps();

    /**
     * Gets the label props for the component.
     */
    const labelProps = getLabelProps();

    /**
     * State variable to store the width of the column.
     */
    const [width, setWidth] = React.useState<number>(inProps.column.width);

    /**
     * Effect hook that processes columns when the width changes.
     */
    React.useEffect(() => {
      instance.processColumns();
    }, [inProps.column.width])
    return (
      <FileLabel {...columnProps} labelProps={labelProps} status={status} iconProps={getIconContainerProps()} />
    );
  }
);