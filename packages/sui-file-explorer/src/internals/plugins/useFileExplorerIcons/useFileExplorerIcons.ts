/**
 * File Explorer Plugin for React
 * 
 * This plugin provides a set of icons and props for use in a file explorer component.
 * It is designed to be used as a React hook, allowing developers to easily add file explorer functionality to their components.
 */
export const useFileExplorerIcons: FileExplorerPlugin<UseFileExplorerIconsSignature> = ({
  /**
   * The slots object, which contains the collapse icon, expand icon, and end icon.
   * 
   * @type {Object}
   */
  slots,
  /**
   * The slot props object, which contains the collapse icon, expand icon, and end icon props.
   * 
   * @type {Object}
   */
  slotProps,
}) => {
  return {
    /**
     * The context value object, which contains the icons and slot props.
     * 
     * @type {Object}
     */
    contextValue: {
      /**
       * The icons object, which contains the collapse icon, expand icon, and end icon.
       * 
       * @type {Object}
       */
      icons: {
        /**
         * The slots object, which contains the collapse icon, expand icon, and end icon.
         * 
         * @type {Object}
         */
        slots: {
          /**
           * The collapse icon value from the slots object.
           * 
           * @type {*}
           */
          collapseIcon: slots.collapseIcon,
          /**
           * The expand icon value from the slots object.
           * 
           * @type {*}
           */
          expandIcon: slots.expandIcon,
          /**
           * The end icon value from the slots object.
           * 
           * @type {*}
           */
          endIcon: slots.endIcon,
        },
        /**
         * The slot props object, which contains the collapse icon, expand icon, and end icon props.
         * 
         * @type {Object}
         */
        slotProps: {
          /**
           * The collapse icon prop value from the slot props object.
           * 
           * @type {*}
           */
          collapseIcon: slotProps.collapseIcon,
          /**
           * The expand icon prop value from the slot props object.
           * 
           * @type {*}
           */
          expandIcon: slotProps.expandIcon,
          /**
           * The end icon prop value from the slot props object.
           * 
           * @type {*}
           */
          endIcon: slotProps.endIcon,
        },
      },
    },
  };
};

/**
 * Parameters for the useFileExplorerIcons hook
 * 
 * Currently, this object is empty and does not contain any parameters.
 */
useFileExplorerIcons.params = {};