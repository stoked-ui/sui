/**
 * Represents a file icon component that displays different icons based on the file status.
 * @param {FileIconProps} props - The props for the FileIcon component.
 * @returns {JSX.Element | undefined} - The rendered FileIcon component.
 * @fires {React.MouseEvent} onClick - Event fired when the file icon is clicked.
 * @see FileIconProps
 * @see useFileExplorerContext
 * @see UseFileExplorerIconsSignature
 */
function FileIcon(props: FileIconProps): React.JSX.Element | undefined {
  const { slots, slotProps, status } = props;
  let { iconName } = props;

  const context = useFileExplorerContext<[UseFileExplorerIconsSignature]>();

  const contextIcons = {
    ...context.icons.slots,
    expandIcon: context.icons.slots.expandIcon ?? FileExplorerExpandIcon,
    collapseIcon: context.icons.slots.collapseIcon ?? FileExplorerCollapseIcon,
  };

  const contextIconProps = context.icons.slotProps;

  if (!iconName) {
    if (slots?.icon) {
      iconName = 'icon';
    } else if (status.expandable) {
      if (status.expanded) {
        iconName = 'collapseIcon';
      } else {
        iconName = 'expandIcon';
      }
    } else {
      iconName = 'endIcon';
    }
  }

  const Icon = slots?.[iconName] ?? contextIcons[iconName as keyof typeof contextIcons];
  const { ...iconProps} = useSlotProps({
    elementType: Icon,
    externalSlotProps: () => ({
      ...resolveComponentProps(
        contextIconProps[iconName as keyof typeof contextIconProps],
        props,
      ),
      ...resolveComponentProps(slotProps?.[iconName], props),
    }),
    // TODO: Add proper ownerState
    ownerState: props,
  });

  if (!Icon) {
    return undefined;
  }
  return <Icon ownerState={iconProps.ownerState} />;
}