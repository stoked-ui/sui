/**
 * FileExplorerGridCell component for displaying a cell in the file explorer grid.
 * @param {boolean} [last] - Indicates if it is the last cell in the row.
 * @param {SystemStyleObject<Theme>} sx - System style object for styling the cell.
 * @param {string} id - Unique identifier for the cell.
 * @param {string} columnName - Name of the column the cell belongs to.
 * @param {any} content - Content to display in the cell.
 * @param {boolean} [grow] - Indicates if the cell should grow.
 * @param {boolean} [selected] - Indicates if the cell is selected.
 * @returns {JSX.Element} - Rendered cell component.
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
 * Styled component for FileExplorerGridCell with additional styling options.
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
 * FileExplorerGridColumns component for displaying columns in the file explorer grid.
 * @param {any} item - Item to display in the columns.
 * @returns {JSX.Element} - Rendered columns component.
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