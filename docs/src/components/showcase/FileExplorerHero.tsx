import * as React from 'react';
import { FileExplorer } from '@stoked-ui/file-explorer/FileExplorer';
import {
  File,
} from '@stoked-ui/file-explorer/File';
import { namedId } from '@stoked-ui/media-selector';
import { SxProps } from "@mui/system";
import { getDynamicFiles } from '../fileExplorer/data';

export default function FileExplorerHero(props: { id: string, sx?: SxProps, grid?: boolean, alternatingRows?: boolean, trash?: boolean, defaultData?: boolean}) {
  const sx: SxProps = { height: 'fit-content', flexGrow: 1, width: '100%', overflowY: 'auto', ...props.sx };
  const files = props.defaultData ? getDynamicFiles() : [];
  return (
    <FileExplorer
      items={files}
      defaultExpandedItems={['1', '1.1']}
      defaultSelectedItems="1.1"
      sx={sx}
      slots={{ item: File }}
      {...props}
      id={props.id}
      alternatingRows
      dndInternal
      dndTrash
      getItemId={() => {
        return namedId({id: 'file', length: 24 });
      }}
    />
  )
}
