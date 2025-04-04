/**
 * FileWrapped component
 *
 * A wrapper component for the File component, which includes additional properties and functionality.
 *
 * @param {FileExplorerProps<Multiple>} props - The component props.
 * @returns {JSX.Element} The rendered file explorer component.
 */
export function FileWrapped<Multiple extends boolean | undefined>(props: Pick<FileExplorerProps<Multiple>, 'slots' | 'slotProps'> &
  Pick<FileProps, 'children' | 'id'> & { mediaType: MediaType, type: string, size: number, lastModified: number, label: string, last?: boolean, columns: GridColumns }) {
  /**
   * Destructure the component props.
   */
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

  /**
   * Determine the Item component to use based on whether a slot is provided.
   */
  const Item = slots?.item ?? File;

  /**
   * Use the useSlotProps hook to merge the slot props with other props and set the owner state.
   *
   * @see https://mui.com/api/use-slot-props/
   */
  const itemProps = useSlotProps({
    elementType: Item,
    externalSlotProps: slotProps?.item,
    additionalProps: { label, id, last, type, mediaType, size, lastModified, columns, ...other},
    ownerState: { id: id!, label },
  });

  /**
   * Render the File component with the item props and children.
   */
  return <Item {...itemProps}>{children}</Item>;
}