import {FileExplorerPlugin} from '../../models';
import {UseFileExplorerIconsSignature} from './useFileExplorerIcons.types';

export const useFileExplorerIcons: FileExplorerPlugin<UseFileExplorerIconsSignature> = ({
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

useFileExplorerIcons.params = {};
