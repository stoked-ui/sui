/**
 * Function that provides icons for a file explorer component.
 * @param {Object} props - The props object.
 * @param {Object} props.slots - The slots object containing different icons.
 * @param {Object} props.slotProps - The slotProps object containing props for each icon slot.
 * @returns {Object} The contextValue object with icons and slotProps.
 */
export const useFileExplorerIcons = ({
  slots,
  slotProps,
}) => {
  return {
    contextValue: {
      icons: {
        slots: {
          collapseIcon: slots.collapseIcon,
          expandIcon: slots.expandIcon,
          endIcon: slots.endIcon,
        },
        slotProps: {
          collapseIcon: slotProps.collapseIcon,
          expandIcon: slotProps.expandIcon,
          endIcon: slotProps.endIcon,
        },
      },
    },
  };
};

/**
 * Parameters for useFileExplorerIcons function.
 */
useFileExplorerIcons.params = {};