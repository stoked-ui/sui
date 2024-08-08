import * as React from 'react';
import useId from '@mui/utils/useId';
import { FileExplorerPlugin } from '../../models';
import { UseFileExplorerIdSignature } from './useFileExplorerId.types';

export const useFileExplorerId: FileExplorerPlugin<UseFileExplorerIdSignature> = ({ params }) => {
  const fileExplorerId = useId(params.id);

  const getFileIdAttribute = React.useCallback(
    (itemId: string, idAttribute: string | undefined) => idAttribute ?? `${fileExplorerId}-${itemId}`,
    [fileExplorerId],
  );

  return {
    getRootProps: () => ({
      id: fileExplorerId,
    }),
    instance: {
      getFileIdAttribute,
    },
  };
};

useFileExplorerId.params = {
  id: true,
};
useFileExplorerId.code = 'id';
