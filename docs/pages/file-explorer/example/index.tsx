import * as React from "react";
import { NoSsr } from "@mui/material";
import {FileBase, FileExplorer} from "@stoked-ui/file-explorer";
import BrandingCssVarsProvider from "../../../src/BrandingCssVarsProvider";
import {getDynamicFiles} from "../../../src/components/fileExplorer/data";

function evaluateDuration(item: FileBase) {
  if (!item || !item.mediaType || !['video', 'audio'].includes(item.mediaType)) {
    return undefined;
  }
  return item?.media?.duration || 0;
}

function formatMilliseconds(duration?: number) {
  if (duration === undefined) {
    return '';
  }
  const seconds = Math.floor(duration / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedHours = hours > 0 ? `${hours.toString().padStart(2, '0')}:` : '';
  const formattedMinutes = `${minutes.toString().padStart(2, '0')}:`;
  const formattedSeconds = remainingSeconds.toString().padStart(2, '0');

  return `${formattedHours}${formattedMinutes}${formattedSeconds}`;
}


export default function Index() {
  return (
    <BrandingCssVarsProvider>
      <NoSsr>
        <FileExplorer
          items={getDynamicFiles()}
          defaultExpandedItems={['1', '1.1']}
          defaultSelectedItems="1.1"
          id={'file-explorer-hero'}
          alternatingRows
          dndInternal
          dndExternal
          dndTrash
          grid
          gridColumns={{
            duration: { renderer: formatMilliseconds, evaluator: evaluateDuration },
            type: { evaluator: (item: FileBase) => item?.mediaType || ''},
          }}
        />
      </NoSsr>
    </BrandingCssVarsProvider>
  )
}
