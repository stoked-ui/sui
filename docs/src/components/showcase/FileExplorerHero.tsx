import * as React from 'react';
import { FileExplorer } from '@stoked-ui/file-explorer/FileExplorer';
import {
  File,
} from '@stoked-ui/file-explorer';
import { namedId } from '@stoked-ui/common';
import { SxProps } from "@mui/system";
import { getDynamicFiles } from '../fileExplorer/data';

export default function FileExplorerHero(props: { id: string, sx?: SxProps, grid?: boolean, alternatingRows?: boolean, trash?: boolean, defaultData?: boolean}) {
  const baseSx: SxProps = {
    height: 'fit-content',
    flexGrow: 1,
    width: '100%',
    overflowY: 'auto',
    ...props.sx
  };

  return (
    <FileExplorer
      items={getDynamicFiles()}
      defaultExpandedItems={['1', '1.1']}
      defaultSelectedItems="1.2"
      sx={baseSx}
      slots={{ item: File }}
      {...props}
      id={props.id}
      alternatingRows
      dndInternal
      dndTrash
      dndExternal
      getItemId={() => {
        return namedId({id: 'file', length: 24 });
      }}
    />
  )
}
