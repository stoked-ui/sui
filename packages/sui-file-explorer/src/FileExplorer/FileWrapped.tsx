/**
 * FileWrapped component wraps a File component with specified props.
 *
 * @param {Pick<FileExplorerProps<Multiple>, 'slots' | 'slotProps'> & Pick<FileProps, 'children' | 'id'> & { mediaType: MediaType, type: string, size: number, lastModified: number, label: string, last?: boolean, columns: GridColumns }} props - The props for the FileWrapped component.
 * @param {Object} props.slots - Slots for the component.
 * @param {Object} props.slotProps - Slot props for the component.
 * @param {string} props.children - The children of the component.
 * @param {string} props.id - The id of the component.
 * @param {MediaType} props.mediaType - The media type of the file.
 * @param {string} props.type - The type of the file.
 * @param {number} props.size - The size of the file.
 * @param {number} props.lastModified - The last modified timestamp of the file.
 * @param {string} props.label - The label of the file.
 * @param {boolean} props.last - Indicates if the file is the last in the list.
 * @param {GridColumns} props.columns - The grid columns for the file.
 * @returns {JSX.Element} The wrapped File component with specified props.
 */
export function FileWrapped<Multiple extends boolean | undefined>(props: Pick<FileExplorerProps<Multiple>, 'slots' | 'slotProps'> &
  Pick<FileProps, 'children' | 'id'> & { mediaType: MediaType, type: string, size: number, lastModified: number, label: string, last?: boolean, columns: GridColumns }) {
  const {
    slots,
    slotProps,
    label,
    children,
    last,
    id,
    type,
    mediaType,
    size,
    lastModified,
    columns,
    ...other
  } = props;
  const Item = slots?.item ?? File;
  const itemProps = useSlotProps({
    elementType: Item,
    externalSlotProps: slotProps?.item,
    additionalProps: { label, id, last, type, mediaType, size, lastModified, columns, ...other},
    ownerState: { id: id!, label },
  });
  return <Item {...itemProps}>{children}</Item>;
}