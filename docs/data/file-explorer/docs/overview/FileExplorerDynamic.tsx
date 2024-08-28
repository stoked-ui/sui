import * as React from 'react';
import Box from '@mui/material/Box';
import { FileExplorer } from '@stoked-ui/file-explorer/FileExplorer';
import { FileBase } from "@stoked-ui/file-explorer";
import { getDynamicFiles } from "docs/src/components/fileExplorer/data";

export default function FileExplorerDynamic() {
  const [files, setFiles] = React.useState<null | FileBase[]>(null )

  React.useEffect(() => {
    setFiles(getDynamicFiles());
  }, [])

  if (!files){
    return <React.Fragment />
  }
  return (
    <Box sx={{ minHeight: 352, minWidth: 250, width: '100%' }}>
      <FileExplorer
        items={files}
        grid
        multiSelect
        dndInternal
        dndExternal
        dndTrash
        defaultExpandedItems={["Document"]}
        alternatingRows
      />
    </Box>
  );
}
