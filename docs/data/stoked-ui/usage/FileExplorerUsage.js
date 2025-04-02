import * as React from 'react';
import { FileExplorer } from '@stoked-ui/file-explorer/FileExplorer';
import { NestedFiles } from '../../../src/components/fileExplorer/data';

export default function FileExplorerUsage() {
  return (
    <FileExplorer sx={{ width: '100%' }} items={NestedFiles} grid alternatingRows />
  );
}

