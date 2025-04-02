import * as React from 'react';
import { FileExplorer } from '@stoked-ui/file-explorer/FileExplorer';
import { NestedFiles } from 'docs/src/components/fileExplorer/data';

export default function FileExplorerCustomizer() {
  return (
    <FileExplorer
      items={NestedFiles}
      defaultExpandedItems={['1', '1.1']}
      defaultSelectedItems="1.1"
      sx={{ height: 'fit-content', flexGrow: 1, overflowY: 'auto' }}
      grid
      alternatingRows
      dndInternal
      dndExternal
      dndTrash
    />
  );
}

